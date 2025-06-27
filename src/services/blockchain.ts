import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useWalletContext } from '../contexts/WalletContext';

// Ethereum contract ABI (to be replaced with actual ABI)
const BETTING_CONTRACT_ABI = [
  'function placeBet(uint256 matchId, uint8 outcome, uint256 amount) public payable',
  'function getMatch(uint256 matchId) public view returns (tuple(uint256 id, string homeTeam, string awayTeam, uint256 startTime, uint256[] odds))',
  'function getBet(uint256 betId) public view returns (tuple(uint256 id, uint256 matchId, uint256 amount, uint256 odds, uint8 outcome, uint8 status, uint256 timestamp))',
];

// Solana program ID (to be replaced with actual program ID)
const SOLANA_PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID');

export class BlockchainService {
  private ethereumProvider: ethers.providers.Web3Provider | null = null;
  private solanaConnection: Connection | null = null;
  private bettingContract: ethers.Contract | null = null;

  constructor() {
    // Initialize Ethereum provider
    if (window.ethereum) {
      this.ethereumProvider = new ethers.providers.Web3Provider(window.ethereum);
    }

    // Initialize Solana connection
    this.solanaConnection = new Connection('https://api.mainnet-beta.solana.com');
  }

  // Ethereum methods
  async placeBetEthereum(matchId: number, outcome: number, amount: string) {
    if (!this.ethereumProvider || !this.bettingContract) {
      throw new Error('Ethereum provider or contract not initialized');
    }

    try {
      const signer = this.ethereumProvider.getSigner();
      const tx = await this.bettingContract
        .connect(signer)
        .placeBet(matchId, outcome, amount, { value: amount });
      return await tx.wait();
    } catch (error) {
      console.error('Error placing bet on Ethereum:', error);
      throw error;
    }
  }

  async getMatchEthereum(matchId: number) {
    if (!this.bettingContract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.bettingContract.getMatch(matchId);
    } catch (error) {
      console.error('Error getting match from Ethereum:', error);
      throw error;
    }
  }

  // Solana methods
  async placeBetSolana(matchId: number, outcome: number, amount: number) {
    if (!this.solanaConnection) {
      throw new Error('Solana connection not initialized');
    }

    try {
      // Create and send transaction
      const transaction = new Transaction();
      // Add your program instructions here
      // transaction.add(createBetInstruction(...));
      
      // Send transaction
      // const signature = await sendAndConfirmTransaction(...);
      // return signature;
    } catch (error) {
      console.error('Error placing bet on Solana:', error);
      throw error;
    }
  }

  async getMatchSolana(matchId: number) {
    if (!this.solanaConnection) {
      throw new Error('Solana connection not initialized');
    }

    try {
      // Fetch match data from Solana program
      // return await fetchMatchData(...);
    } catch (error) {
      console.error('Error getting match from Solana:', error);
      throw error;
    }
  }

  // Initialize contract with address
  initializeContract(contractAddress: string) {
    if (!this.ethereumProvider) {
      throw new Error('Ethereum provider not initialized');
    }

    this.bettingContract = new ethers.Contract(
      contractAddress,
      BETTING_CONTRACT_ABI,
      this.ethereumProvider
    );
  }
}

// Create singleton instance
export const blockchainService = new BlockchainService(); 