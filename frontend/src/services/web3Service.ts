import { ethers } from 'ethers';

// Definizione dell'ABI per i contratti
// Gli ABI vanno sostituiti con quelli effettivi generati dai tuoi contratti
const BetzTokenABI = [
  // Esempio di ABI semplificato, da sostituire con quello reale
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const BetZillaABI = [
  // Esempio di ABI semplificato, da sostituire con quello reale
  "function placeBet(uint256 matchId, uint8 prediction, uint256 amount) returns (bool)",
  "function getBetsByUser(address user) view returns (tuple(uint256 id, uint256 matchId, uint8 prediction, uint256 amount, uint8 status, uint256 odds)[])",
  "function getMatchDetails(uint256 matchId) view returns (tuple(uint256 id, string homeTeam, string awayTeam, uint256 startTime, uint8 status, uint8 result))"
];

// Indirizzi dei contratti
// Da sostituire con gli indirizzi reali dei contratti deployati
const BetzTokenAddress = import.meta.env.VITE_BETZ_TOKEN_ADDRESS || "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const BetZillaAddress = import.meta.env.VITE_BETZILLA_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface Ethereum extends Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, listener: (...args: any[]) => void) => void;
    removeListener: (eventName: string, listener: (...args: any[]) => void) => void;
  };
}

declare global {
  interface Window extends Ethereum {}
}

class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private betzTokenContract: ethers.Contract | null = null;
  private betZillaContract: ethers.Contract | null = null;

  constructor() {
    this.initialize();
    
    // Setup listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        this.initialize();
      });
    }
  }

  private initialize(): void {
    if (window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      try {
        this.betzTokenContract = new ethers.Contract(
          BetzTokenAddress,
          BetzTokenABI,
          this.signer
        );
        
        this.betZillaContract = new ethers.Contract(
          BetZillaAddress,
          BetZillaABI,
          this.signer
        );
      } catch (error) {
        console.error("Failed to initialize contracts:", error);
      }
    }
  }

  public async connect(): Promise<string | null> {
    if (!window.ethereum) {
      console.error("MetaMask is not installed!");
      return null;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        this.initialize();
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error("User denied account access", error);
      return null;
    }
  }
  
  public async getCurrentAddress(): Promise<string | null> {
    if (!window.ethereum || !this.provider) {
      return null;
    }
    
    try {
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error("Failed to get current address:", error);
      return null;
    }
  }

  public async getTokenBalance(): Promise<string> {
    if (!this.betzTokenContract || !this.signer) {
      return '0';
    }
    
    try {
      const address = await this.signer.getAddress();
      const balance = await this.betzTokenContract.balanceOf(address);
      return ethers.utils.formatUnits(balance, 18); // Assumiamo 18 decimali per il token
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return '0';
    }
  }

  public async placeBet(matchId: number, prediction: 0 | 1 | 2, amount: number): Promise<boolean> {
    if (!this.betZillaContract || !this.betzTokenContract || !this.signer) {
      return false;
    }
    
    try {
      // Prima dobbiamo approvare il trasferimento dei token
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
      const approvalTx = await this.betzTokenContract.approve(BetZillaAddress, amountInWei);
      await approvalTx.wait(); // Attendiamo la conferma della transazione
      
      // Ora possiamo effettuare la scommessa
      const tx = await this.betZillaContract.placeBet(matchId, prediction, amountInWei);
      await tx.wait(); // Attendiamo la conferma della transazione
      
      return true;
    } catch (error) {
      console.error("Failed to place bet:", error);
      return false;
    }
  }

  public async getUserBets(userAddress: string): Promise<any[]> {
    if (!this.betZillaContract) {
      return [];
    }
    
    try {
      const bets = await this.betZillaContract.getBetsByUser(userAddress);
      return bets.map((bet: any) => ({
        id: bet.id.toNumber(),
        matchId: bet.matchId.toNumber(),
        prediction: bet.prediction,
        amount: ethers.utils.formatUnits(bet.amount, 18),
        status: bet.status,
        odds: bet.odds.toNumber() / 100 // Assumiamo che le odds siano memorizzate moltiplicate per 100
      }));
    } catch (error) {
      console.error("Failed to get user bets:", error);
      return [];
    }
  }

  public async getMatchDetails(matchId: number): Promise<any | null> {
    if (!this.betZillaContract) {
      return null;
    }
    
    try {
      const match = await this.betZillaContract.getMatchDetails(matchId);
      return {
        id: match.id.toNumber(),
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        startTime: new Date(match.startTime.toNumber() * 1000),
        status: match.status,
        result: match.result
      };
    } catch (error) {
      console.error("Failed to get match details:", error);
      return null;
    }
  }
}

// Esportiamo un singolo instance del servizio per tutta l'applicazione
export const web3Service = new Web3Service();

// Esportiamo anche il tipo per essere usato in altri file
export type { Web3Service }; 