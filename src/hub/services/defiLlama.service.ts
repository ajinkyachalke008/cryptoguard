// src/hub/services/defiLlama.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.llama.fi';

export const DeFiLlamaService = {
  async getProtocols() {
    return hubFetch<any[]>(`${BASE}/protocols`);
  },

  async getProtocol(slug: string) {
    return hubFetch<any>(`${BASE}/protocol/${slug}`);
  },

  async getChainTVL(chain = 'ethereum') {
    return hubFetch<any[]>(`${BASE}/v2/historicalChainTvl/${chain}`);
  },

  async getYieldPools() {
    return hubFetch<{ data: any[] }>('https://yields.llama.fi/pools');
  },

  async getStablecoins() {
    return hubFetch<any>(`${BASE}/stablecoins`);
  },

  async getBridges() {
    return hubFetch<any>(`${BASE}/bridges`);
  },

  async getDexOverview() {
    return hubFetch<any>(`${BASE}/dexs/overview`);
  }
};
