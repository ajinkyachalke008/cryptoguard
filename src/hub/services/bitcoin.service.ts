// src/hub/services/bitcoin.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://blockstream.info/api';

export const BitcoinService = {
  async getAddress(address: string) {
    return hubFetch<any>(`${BASE}/address/${address}`);
  },

  async getTransactions(address: string) {
    return hubFetch<any[]>(`${BASE}/address/${address}/txs`);
  },

  async getTransaction(txid: string) {
    return hubFetch<any>(`${BASE}/tx/${txid}`);
  },

  async getFeeEstimates() {
    const fees = await hubFetch<Record<string, number>>(`${BASE}/fee-estimates`);
    return { fast: fees['1'], medium: fees['6'], slow: fees['144'] };
  },

  getBalanceBTC(addressData: any) {
    const { funded_txo_sum, spent_txo_sum } = addressData.chain_stats;
    return (funded_txo_sum - spent_txo_sum) / 1e8;
  }
};
