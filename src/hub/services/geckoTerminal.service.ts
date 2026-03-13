// src/hub/services/geckoTerminal.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.geckoterminal.com/api/v2';
const HEADERS = { 'Accept': 'application/json;version=20230302' };

export const GeckoTerminalService = {
  async getNetworks(page = 1) {
    return hubFetch<any>(`${BASE}/networks?page=${page}`, { headers: HEADERS });
  },

  async getTopPools(network = 'eth', page = 1) {
    return hubFetch<any>(`${BASE}/networks/${network}/pools?page=${page}`, { headers: HEADERS });
  },

  async getToken(network: string, tokenAddress: string) {
    return hubFetch<any>(`${BASE}/networks/${network}/tokens/${tokenAddress}`, { headers: HEADERS });
  },

  async getOHLCV(network: string, poolAddress: string, timeframe = 'hour', limit = 24) {
    return hubFetch<any>(`${BASE}/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}?limit=${limit}`, { headers: HEADERS });
  },

  async getTrending(network = 'eth') {
    return hubFetch<any>(`${BASE}/networks/${network}/trending_pools`, { headers: HEADERS });
  },

  async search(query: string) {
    return hubFetch<any>(`${BASE}/search/pools?query=${encodeURIComponent(query)}`, { headers: HEADERS });
  }
};
