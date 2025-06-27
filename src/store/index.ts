import create from 'zustand';

interface Bet {
  id: string;
  matchId: string;
  amount: number;
  odds: number;
  outcome: 'home' | 'draw' | 'away';
  status: 'pending' | 'won' | 'lost';
  timestamp: number;
}

interface User {
  address: string;
  chain: 'ethereum' | 'solana';
  totalBets: number;
  totalWon: number;
  referralCode: string;
  referredBy?: string;
}

interface BetZillaStore {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Bets state
  activeBets: Bet[];
  addBet: (bet: Bet) => void;
  updateBetStatus: (betId: string, status: Bet['status']) => void;
  
  // UI state
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const useStore = create<BetZillaStore>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Bets state
  activeBets: [],
  addBet: (bet) =>
    set((state) => ({
      activeBets: [...state.activeBets, bet],
    })),
  updateBetStatus: (betId, status) =>
    set((state) => ({
      activeBets: state.activeBets.map((bet) =>
        bet.id === betId ? { ...bet, status } : bet
      ),
    })),
  
  // UI state
  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => ({
      isDarkMode: !state.isDarkMode,
    })),
  
  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

export default useStore; 