// src/hub/HubStore.ts
import { create } from 'zustand';
import { ChainId } from './hub.types';

interface MarketState {
  topAssets: any[];
  globalMetrics: any;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
}

interface WalletState {
  address: string | null;
  chain: ChainId;
  balances: Record<string, number>;
  history: any[];
  isScanning: boolean;
}

interface HubState {
  // Global Hub preferences
  selectedChain: ChainId;
  currency: "USD" | "BTC" | "ETH";
  refreshInterval: number;              // seconds

  // Per-feature state
  market: MarketState;
  wallet: WalletState;
  apiHealth: Record<string, any>;
  
  // Actions
  setChain: (chain: ChainId) => void;
  setCurrency: (c: "USD" | "BTC" | "ETH") => void;
  setMarket: (market: Partial<MarketState>) => void;
  setWallet: (wallet: Partial<WalletState>) => void;
  setAPIHealth: (health: Record<string, any>) => void;
  setWalletAddress: (address: string | null) => void;
  setWalletScanning: (scanning: boolean) => void;
  resetHub: () => void;
}

const initialMarketState: MarketState = {
  topAssets: [],
  globalMetrics: null,
  trend: 'SIDEWAYS',
};

const initialWalletState: WalletState = {
  address: null,
  chain: 'eth',
  balances: {},
  history: [],
  isScanning: false,
};

export const useHubStore = create<HubState>((set) => ({
  selectedChain: "eth",
  currency: "USD",
  refreshInterval: 30,

  market: initialMarketState,
  wallet: initialWalletState,
  apiHealth: {},

  setChain: (chain) => set({ selectedChain: chain }),
  setCurrency: (c) => set({ currency: c }),
  setMarket: (market) => set((state) => ({ market: { ...state.market, ...market } })),
  setWallet: (wallet) => set((state) => ({ wallet: { ...state.wallet, ...wallet } })),
  setAPIHealth: (apiHealth) => set({ apiHealth }),
  setWalletAddress: (address) => set((state) => ({ 
    wallet: { ...state.wallet, address } 
  })),
  setWalletScanning: (scanning) => set((state) => ({
    wallet: { ...state.wallet, isScanning: scanning }
  })),
  
  resetHub: () => set({
    selectedChain: "eth",
    currency: "USD",
    market: initialMarketState,
    wallet: initialWalletState,
  }),
}));
