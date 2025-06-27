// Tipo per ethereum
interface Ethereum {
  isMetaMask?: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
}

// Estensione dell'interfaccia Window
declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export {}; 