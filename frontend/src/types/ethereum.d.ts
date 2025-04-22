interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface EthereumEvent {
  connect: { chainId: string };
  disconnect: { code: number; message: string };
  accountsChanged: string[];
  chainChanged: string;
  message: { type: string; data: unknown };
}

type EthereumEventCallback<T> = (params: T) => void;

interface Ethereum {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  selectedAddress?: string | null;
  chainId?: string;
  isConnected?: () => boolean;
  request: <T>(args: RequestArguments) => Promise<T>;
  on<K extends keyof EthereumEvent>(
    event: K,
    callback: EthereumEventCallback<EthereumEvent[K]>
  ): void;
  removeListener<K extends keyof EthereumEvent>(
    event: K,
    callback: EthereumEventCallback<EthereumEvent[K]>
  ): void;
  removeAllListeners?: (event: string) => void;
  disconnect?: () => Promise<void>;
  autoRefreshOnNetworkChange?: boolean;
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void;
  send?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void;
  enable?: () => Promise<string[]>;
}

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export {}; 