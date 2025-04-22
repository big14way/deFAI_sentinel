// Global TypeScript declarations
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    selectedAddress?: string;
    isConnected?: () => boolean;
    enable?: () => Promise<string[]>;
    removeAllListeners?: () => void;
    disconnect?: () => Promise<void>;
  };
}

export {}; 