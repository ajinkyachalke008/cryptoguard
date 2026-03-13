// src/hub/services/walletExplorer.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://www.walletexplorer.com/api/1';
const CALLER = 'cryptoguard';

export const WalletExplorerService = {
  async lookupAddress(btcAddress: string) {
    try {
      const data = await hubFetch<any>(`${BASE}/address?address=${btcAddress}&caller=${CALLER}`);
      return {
        address: btcAddress,
        walletId: data.wallet?.id,
        label: data.wallet?.label || 'Unknown',
        isKnownEntity: !!data.wallet?.label,
      };
    } catch {
      return null;
    }
  },

  async getClusterAddresses(walletId: string, count = 20) {
    return hubFetch<any>(`${BASE}/wallet-addresses?wallet=${walletId}&from=0&count=${count}&caller=${CALLER}`);
  },

  async getClusterTransactions(walletId: string, count = 20) {
    return hubFetch<any>(`${BASE}/wallet-txs?wallet=${walletId}&from=0&count=${count}&caller=${CALLER}`);
  }
};
