# **Project: BETZILLA — Decentralized Web3 Sports Betting Platform (Ethereum-based)**

### **Description:**

Create a fully decentralized Web3 sports betting platform named **BETZILLA**, deployed on **Ethereum**, with real-time odds, automatic payouts, oracles for result resolution, and full MetaMask wallet integration. **First 20 bettors** receive **0% commission** on winning bets.

---

## **1. 🌐 Frontend (React.js)**

- Modern, responsive UI built with **React.js**
- **Dark/Light Mode** toggle
- Wallet integration: **MetaMask (Ethereum-compatible)**
- Pages:
    - **Home**: Highlighted matches with "Blind Phase" badges
    - **Matches**: Real-time odds and match listings (show "Early Bettor Bonus" tooltips)
    - **Active Bets**: Bets placed by the user (highlight commission-free bets)
    - **Profile**: Betting history with bonus tracking
- Use **`ethers.js`** or **`wagmi`** for blockchain interaction
- Show **bonus status** during betting:

```jsx
{isBlindPhase && (
  <Badge colorScheme="green">NO COMMISSION FOR FIRST 20 BETTORS</Badge>
)}
```

---

## **2. 🔗 Smart Contract (Solidity on Ethereum)** --> TESTNET LOCALE

### **Key Updates for Early Bettor Bonus:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BETZILLA Betting Pool
 * @dev Contratto principale per la gestione delle scommesse con bonus early adopters
 */
contract BetZilla is ReentrancyGuard, Ownable {
    // ============= STRUCTS =============
    /**
     * @dev Struttura dati per ogni mercato scommesse
     * @param totalPool Somma totale di tutte le puntate
     * @param homePool Puntate sulla squadra di casa
     * @param drawPool Puntate sul pareggio
     * @param awayPool Puntate sulla squadra ospite
     * @param oddsVisible Se le quote sono visibili (dopo 20 scommesse)
     * @param betCount Numero totale di scommesse
     */
    struct Market {
        uint256 totalPool;
        uint256 homePool;
        uint256 drawPool;
        uint256 awayPool;
        bool oddsVisible;
        uint256 betCount;
    }

    // ============= CONSTANTS =============
    /// @dev Commissione platform standard (3%)
    uint256 public constant PLATFORM_FEE = 3;

    /// @dev Soglia per la fase blind (primi 20 scommettitori)
    uint256 public constant EARLY_BET_THRESHOLD = 20;

    // ============= STORAGE =============
    /// @dev Mapping dei mercati per ID partita
    mapping(uint256 => Market) public matches;

    /**
     * @dev Lista degli early bettors per match
     * @notice Indirizzi dei primi 20 scommettitori per matchId
     */
    mapping(uint256 => address[]) public earlyBettorsPerEvent;

    mapping(uint256 => mapping(address => bool)) public hasBetInBlindPhase;

    // ============= FUNCTIONS =============
    /**
     * @dev Calcola le quote dinamiche con eventuale bonus early adopter
     * @param matchId ID della partita
     * @param outcome Esito selezionato (0=home, 1=draw, 2=away)
     * @param bettor Indirizzo dello scommettitore
     * @return odds Quote calcolate (0 se in fase blind)
     */
    function calculateOdds(
        uint256 matchId,
        uint256 outcome,
        address bettor
    ) public view returns (uint256) {
        Market storage market = matches[matchId];

        // Fase blind: quote non visibili
        if (!market.oddsVisible) return 0;

        uint256 outcomePool;
        if (outcome == 0) outcomePool = market.homePool;
        else if (outcome == 1) outcomePool = market.drawPool;
        else outcomePool = market.awayPool;

        // Protezione divisione per zero
        if (outcomePool == 0) return 0;

        // Calcola fee: 0% per early bettors, 3% altrimenti
        uint256 effectiveFee = _isEarlyBettor(bettor, matchId) ? 0 : PLATFORM_FEE;

        // Formula: (TotalPool / OutcomePool) * (1 - Fee)
        return (market.totalPool * (100 - effectiveFee)) / (outcomePool * 100);
    }

    /**
     * @dev Registra una nuova scommessa
     * @notice Durante la fase blind (primi 20), gli utenti non pagano commissioni
     * @param matchId ID della partita
     * @param outcome Esito selezionato (0=home, 1=draw, 2=away)
     */
    function placeBet(uint256 _eventId) external payable nonReentrant oneBetPerBlindPhase(_eventId) {
        require(msg.value > 0, "Importo scommessa non valido");

        Market storage event_ = matches[_eventId];
        event_.totalPool += msg.value;

        // Aggiorna pool specifico in base all'esito
        if (outcome == 0) event_.homePool += msg.value;
        else if (outcome == 1) event_.drawPool += msg.value;
        else event_.awayPool += msg.value;

        // Registra early bettor se nella fase blind
        if (event_.betCount < EARLY_BET_THRESHOLD) {
            earlyBettorsPerEvent[_eventId].push(msg.sender);
            hasBetInBlindPhase[_eventId][msg.sender] = true;
        }

        event_.betCount++;

        // Termina fase blind dopo 20 scommesse
        if (event_.betCount == EARLY_BET_THRESHOLD) {
            event_.oddsVisible = true;
            emit BlindPhaseEnded(_eventId);
        }
    }

    // ============= INTERNAL HELPERS =============
    /**
     * @dev Verifica se un utente è early bettor
     * @param user Indirizzo da verificare
     * @param matchId ID partita
     * @return isEarly True se l'utente è tra i primi 20
     */
    function _isEarlyBettor(
        uint256 eventId,
        address user
    ) internal view returns (bool) {
        address[] storage earlyBettors = earlyBettorsPerEvent[eventId];
        for (uint256 i = 0; i < earlyBettors.length; i++) {
            if (earlyBettors[i] == user) return true;
        }
        return false;
    }

    // ============= EVENTS =============
    /// @dev Emesso quando termina la fase blind
    event BlindPhaseEnded(uint256 indexed matchId);
}
```

---

## **3. 🧠 Backend Oracle (Node.js)**

- Add bonus tracking in MongoDB:

```js
// Log bonus eligibility
const logBonus = (matchId, wallet) => {
  db.collection('bonuses').insertOne({
    matchId,
    wallet,
    timestamp: new Date(),
    commissionSaved: '3%'
  });
};
```

---

## **4. 🏟 Betting Features & Odds Engine**

### **Enhanced Features:**

- **First 20 Bettor Bonus**:
    - 0% commission on winning bets placed during blind phase
    - Visible counter: "12/20 slots filled - 8 left for 0% fee!"
    - Historical record of commission saved in user profile
- Updated odds formula for bonus:

```
Payout = (Stake × TotalPool / OutcomePool) × [1 - (Fee × (1 - EarlyBettorDiscount))]
```

---

## **5. 🔐 Security**

- Add anti-Sybil checks for early bet slots:

```solidity
modifier oneBetPerBlindPhase(uint256 matchId) {
  require(!_hasBetInBlindPhase(msg.sender, matchId), "1 bet/address in blind phase");
  _;
}
```

---

## **7. 🧪 Testing (Ethereum Devnet)**

### **New Test Cases:**

1. **Blind Phase Bonus Simulation**:
    - Place 20 bets → verify 0% fee in payout
    - 21st bet → verify 3% fee applied
2. **Edge Case**:
    - User places bet #20 → gets bonus
    - Same user bets again post-blind phase → pays fee

---

## **8. 📢 Marketing Hook**

Frontend banner:

**"BE AN EARLY ZILLA! 🦍First 20 bets pay ZERO fees on wins -bet smart, save more!"**

---

**Commit Message**:

**`feat: Add 0% commission bonus for first 20 bettors per match`**

**Deployment Steps**:

1. Update **`BettingPool`** contract with early bettor tracking
2. Add bonus UI components to frontend
3. Extend oracle to log commission savings

La feature aggiunge profondità strategica al betting, premiando gli early adopter e creando urgenza nel partecipare alle scommesse iniziali. 🚀
    }

    /**
     * @dev Registra una nuova scommessa
     * @notice Durante la fase blind (primi 20), gli utenti non pagano commissioni
     * @param matchId ID della partita
     * @param outcome Esito selezionato (0=home, 1=draw, 2=away)
     */
    function placeBet(
        uint256 matchId,
        uint8 outcome
    ) external payable {
        require(msg.value > 0, "Importo scommessa non valido");

        Market storage market = matches[matchId];
        market.totalPool += msg.value;

        // Aggiorna pool specifico in base all'esito
        if (outcome == 0) market.homePool += msg.value;
        else if (outcome == 1) market.drawPool += msg.value;
        else market.awayPool += msg.value;

        // Registra early bettor se nella fase blind
        if (market.betCount < EARLY_BET_THRESHOLD) {
            earlyBettorsPerMatch[matchId].push(msg.sender);
        }

        market.betCount++;

        // Termina fase blind dopo 20 scommesse
        if (market.betCount == EARLY_BET_THRESHOLD) {
            market.oddsVisible = true;
            emit BlindPhaseEnded(matchId);
        }
    }

    // ============= INTERNAL HELPERS =============
    /**
     * @dev Verifica se un utente è early bettor
     * @param user Indirizzo da verificare
     * @param matchId ID partita
     * @return isEarly True se l'utente è tra i primi 20
     */
    function _isEarlyBettor(
        address user,
        uint256 matchId
    ) internal view returns (bool) {
        address[] storage earlyBettors = earlyBettorsPerMatch[matchId];
        for (uint256 i = 0; i < earlyBettors.length; i++) {
            if (earlyBettors[i] == user) return true;
        }
        return false;
    }

    // ============= EVENTS =============
    /// @dev Emesso quando termina la fase blind
    event BlindPhaseEnded(uint256 indexed matchId);
}
```

### **2. Backend Oracle Service (con commenti)**

javascript

Copy

Download

```
/**
 * BETZILLA Oracle Service
 * @notice Servizio per verificare i risultati e aggiornare gli smart contract
 */

const axios = require('axios');
const ethers = require('ethers');

// Configurazione
const CONFIG = {
  FOOTBALL_API_KEY: '021e2a4d3c5d44e2a7451c637a951009',
  CONTRACT_ADDRESS: '0x...', // Indirizzo del contratto
  ORACLE_PRIVATE_KEY: process.env.ORACLE_PRIVATE_KEY, // Key firmata
  ETHEREUM_RPC: process.env.ETHEREUM_RPC || 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID'
};

/**
 * @dev Inizializza la connessione a Ethereum
 */
const provider = new ethers.providers.JsonRpcProvider(CONFIG.ETHEREUM_RPC);
const wallet = new ethers.Wallet(CONFIG.ORACLE_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  CONFIG.CONTRACT_ADDRESS,
  require('./artifacts/contracts/BettingPool.sol/BettingPool.json').abi,
  wallet
);

/**
 * @dev Verifica i risultati e aggiorna la blockchain
 * @notice Eseguito periodicamente via cron job
 */
async function checkAndSubmitResults() {
  try {
    // 1. Recupera le partite da risolvere
    const matchesToResolve = await getFinishedMatches();

    // 2. Per ogni partita completata
    for (const match of matchesToResolve) {
      // 3. Verifica il risultato dall'API
      const apiResult = await fetchMatchResult(match.id);

      // 4. Prepara i dati per la blockchain
      const resultCode = parseResult(apiResult);
      const signature = await signResult(match.id, resultCode);

      // 5. Invia transazione
      const tx = await contract.submitResult(
        match.id,
        resultCode,
        signature
      );

      console.log(`Risultato inviato per match ${match.id}, TX: ${tx.hash}`);
    }
  } catch (error) {
    console.error('Oracle error:', error);
  }
}

/**
 * @dev Helper: Recupera le partite finite dall'API
 */
async function getFinishedMatches() {
  const response = await axios.get(
    'https://api.football-data.org/v4/matches?status=FINISHED',
    { headers: { 'X-Auth-Token': CONFIG.FOOTBALL_API_KEY } }
  );
  return response.data.matches.filter(m => m.competition.id === 2000); // Filtra per competizione
}

/**
 * @dev Helper: Firma il risultato con la chiave privata
 */
async function signResult(matchId, result) {
  const messageHash = ethers.utils.solidityKeccak256(
    ['uint256', 'uint8'],
    [matchId, result]
  );
  return wallet.signMessage(ethers.utils.arrayify(messageHash));
}
```

### **3. Frontend React Component (con commenti)**

jsx

Copy

Download

```
/**
 * Componente: MatchBettingCard
 * @description Card per visualizzare una partita e piazzare scommesse
 * @props {matchId, homeTeam, awayTeam, currentOdds}
 */

import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

export default function MatchBettingCard({ matchId, homeTeam, awayTeam }) {
  const { account, contract } = useWeb3();
  const [odds, setOdds] = useState({ home: 0, draw: 0, away: 0 });
  const [blindPhase, setBlindPhase] = useState(true);
  const [betsCount, setBetsCount] = useState(0);

  /**
   * @effect Carica i dati iniziali
   */
  useEffect(() => {
    async function loadData() {
      const count = await contract.getBetCount(matchId);
      setBetsCount(count);
      setBlindPhase(count < 20);

      if (count >= 20) {
        const [home, draw, away] = await Promise.all([
          contract.calculateOdds(matchId, 0, account),
          contract.calculateOdds(matchId, 1, account),
          contract.calculateOdds(matchId, 2, account)
        ]);
        setOdds({ home, draw, away });
      }
    }
    loadData();
  }, [matchId, account, contract]);

  /**
   * @handler Gestisce l'invio della scommessa
   * @param outcome Esito selezionato
   */
  const handleBet = async (outcome) => {
    const value = ethers.utils.parseEther(betAmount);
    const tx = await contract.placeBet(matchId, outcome, { value });
    await tx.wait();
    // Aggiorna UI...
  };

  return (
    <div className="match-card">
      <h3>{homeTeam} vs {awayTeam}</h3>

      {/* Banner fase blind */}
      {blindPhase && (
        <div className="blind-phase-banner">
          <strong>EARLY BIRD BONUS!</strong>
          Primi 20 scommettitori: 0% commissioni su vincite!
          <progress value={betsCount} max={20} />
        </div>)}

      {/* Quote */}
      <div className="odds-container">
        <button onClick={() => handleBet(0)} disabled={!account}>
          {blindPhase ? '1 (???)' : `1 (${odds.home}x)`}
        </button>
        <button onClick={() => handleBet(1)} disabled={!account}>
          {blindPhase ? 'X (???)' : `X (${odds.draw}x)`}
        </button>
        <button onClick={() => handleBet(2)} disabled={!account}>
          {blindPhase ? '2 (???)' : `2 (${odds.away}x)`}
        </button>
      </div>

      {/* Tooltip informativo */}
      <div className="info-tooltip">
        ℹ️ Le quote diventano visibili dopo 20 scommesse
      </div>
    </div>);
}
```
API -->
our free API-key for football-data.org
Posta in arrivo

Daniel (football-data.org) <Daniel@football-data.org>
mar 1 apr, 18:56
a me

Hi Matteo Bertoldo,
thanks for registering for an API authentication token. Please modify your client to use a HTTP header named "X-Auth-Token" with the underneath personal token as value.

Your API token: 021e2a4d3c5d44e2a7451c637a951009


### **Best Practices Implementate:**

1. **Commenti NatSDoc**: Standard per documentare funzioni e variabili
2. **Divisione logica**: Separazione chiara tra:
    - Strutture dati
    - Costanti configurazione
    - Funzionalità core
    - Helper functions
3. **Spiegazione formule**: Commenti esplicativi per calcoli complessi
4. **Contesto aziendale**: Note su regole di business (es. bonus primi 20)
5. **Esempi pratici**: Commenti con casi d'uso rilevanti
6. **Gestione errori**: Documentazione dei possibili errori
7. **Manutenibilità**: Note per futuri sviluppatori
