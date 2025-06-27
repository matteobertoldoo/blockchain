// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BetZilla is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Strutture dati
    struct Bet {
        uint256 id;
        address bettor;
        uint256 amount;
        uint256 odds;
        bool isActive;
        bool isWon;
        uint256 timestamp;
    }

    struct Event {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPool;
        bool isActive;
        bool isResolved;
        address winner;
        uint256 betCount;
        bool oddsVisible;
    }

    // Variabili di stato
    Counters.Counter private _betIds;
    Counters.Counter private _eventIds;
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => Bet[]) public eventBets;
    mapping(address => uint256) public userBalances;

    // Early bettor tracking
    uint256 public constant EARLY_BET_THRESHOLD = 20;
    uint256 public platformFee = 50; // 0.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    mapping(uint256 => address[]) public earlyBettorsPerEvent;
    mapping(uint256 => mapping(address => bool)) public hasBetInBlindPhase;

    // Eventi
    event EventCreated(uint256 indexed eventId, string title, uint256 startTime);
    event BetPlaced(uint256 indexed eventId, uint256 indexed betId, address indexed bettor, uint256 amount, bool earlyBonus);
    event EventResolved(uint256 indexed eventId, address indexed winner);
    event BetWon(uint256 indexed eventId, uint256 indexed betId, address indexed bettor, uint256 amount, bool earlyBonus);
    event FeeCollected(uint256 amount);
    event BlindPhaseEnded(uint256 indexed eventId);

    constructor() {}

    // Modificatore anti-Sybil: solo una bet per utente nella blind phase
    modifier oneBetPerBlindPhase(uint256 eventId) {
        Event storage event_ = events[eventId];
        if (event_.betCount < EARLY_BET_THRESHOLD) {
            require(!hasBetInBlindPhase[eventId][msg.sender], "1 bet/address in blind phase");
        }
        _;
    }

    // Funzioni pubbliche
    function createEvent(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        _eventIds.increment();
        uint256 newEventId = _eventIds.current();

        events[newEventId] = Event({
            id: newEventId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            totalPool: 0,
            isActive: true,
            isResolved: false,
            winner: address(0),
            betCount: 0,
            oddsVisible: false
        });

        emit EventCreated(newEventId, _title, _startTime);
        return newEventId;
    }

    function placeBet(uint256 _eventId) external payable nonReentrant oneBetPerBlindPhase(_eventId) {
        Event storage event_ = events[_eventId];
        require(event_.isActive, "Event is not active");
        require(block.timestamp < event_.endTime, "Event has ended");
        require(msg.value > 0, "Bet amount must be greater than 0");

        _betIds.increment();
        uint256 newBetId = _betIds.current();

        // Early bettor logic
        bool earlyBonus = false;
        if (event_.betCount < EARLY_BET_THRESHOLD) {
            earlyBettorsPerEvent[_eventId].push(msg.sender);
            hasBetInBlindPhase[_eventId][msg.sender] = true;
            earlyBonus = true;
        }

        Bet memory newBet = Bet({
            id: newBetId,
            bettor: msg.sender,
            amount: msg.value,
            odds: calculateOdds(_eventId),
            isActive: true,
            isWon: false,
            timestamp: block.timestamp
        });

        eventBets[_eventId].push(newBet);
        event_.totalPool += msg.value;
        event_.betCount++;

        // End blind phase after 20 bets
        if (event_.betCount == EARLY_BET_THRESHOLD) {
            event_.oddsVisible = true;
            emit BlindPhaseEnded(_eventId);
        }

        emit BetPlaced(_eventId, newBetId, msg.sender, msg.value, earlyBonus);
    }

    function resolveEvent(uint256 _eventId, address _winner) external onlyOwner {
        Event storage event_ = events[_eventId];
        require(event_.isActive, "Event is not active");
        require(!event_.isResolved, "Event already resolved");
        require(block.timestamp >= event_.endTime, "Event has not ended");

        event_.isActive = false;
        event_.isResolved = true;
        event_.winner = _winner;

        uint256 totalWinnings = event_.totalPool;
        uint256 feeTotal = 0;
        uint256 remainingPool = totalWinnings;

        // Calcola il totale delle vincite early e non-early
        uint256 totalEarly = 0;
        uint256 totalNormal = 0;
        for (uint256 i = 0; i < eventBets[_eventId].length; i++) {
            Bet storage bet = eventBets[_eventId][i];
            if (bet.bettor == _winner) {
                if (_isEarlyBettor(_eventId, bet.bettor)) {
                    totalEarly += bet.amount;
                } else {
                    totalNormal += bet.amount;
                }
            }
        }
        uint256 totalWinner = totalEarly + totalNormal;

        // Distribuisci le vincite
        for (uint256 i = 0; i < eventBets[_eventId].length; i++) {
            Bet storage bet = eventBets[_eventId][i];
            if (bet.bettor == _winner) {
                bet.isWon = true;
                bool earlyBonus = _isEarlyBettor(_eventId, bet.bettor);
                uint256 fee = earlyBonus ? 0 : (bet.amount * platformFee) / FEE_DENOMINATOR;
                uint256 winnings = bet.amount + ((bet.amount * (totalWinnings - feeTotal)) / totalWinner) - fee;
                userBalances[bet.bettor] += winnings;
                feeTotal += fee;
                emit BetWon(_eventId, bet.id, bet.bettor, winnings, earlyBonus);
            }
        }

        // Raccogli la fee
        userBalances[owner()] += feeTotal;
        emit FeeCollected(feeTotal);
        emit EventResolved(_eventId, _winner);
    }

    function withdraw() external nonReentrant {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        userBalances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }

    // Funzioni di utilità
    function calculateOdds(uint256 _eventId) public view returns (uint256) {
        Event storage event_ = events[_eventId];
        if (event_.totalPool == 0) return 10000; // 1:1 odds
        return (event_.totalPool * 10000) / event_.totalPool;
    }

    function getEventBets(uint256 _eventId) external view returns (Bet[] memory) {
        return eventBets[_eventId];
    }

    function getEvent(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }

    function getUserBalance(address _user) external view returns (uint256) {
        return userBalances[_user];
    }

    // Early bettor check
    function _isEarlyBettor(uint256 eventId, address user) internal view returns (bool) {
        address[] storage earlyBettors = earlyBettorsPerEvent[eventId];
        for (uint256 i = 0; i < earlyBettors.length; i++) {
            if (earlyBettors[i] == user) return true;
        }
        return false;
    }

    // Funzioni di amministrazione
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
}