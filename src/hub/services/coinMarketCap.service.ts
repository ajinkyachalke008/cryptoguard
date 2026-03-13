// src/hub/services/coinMarketCap.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://pro-api.coinmarketcap.com';

export const CoinMarketCapService = {
  get HEADERS() {
    return {
      'X-CMC_PRO_API_KEY': process.env.HUB_CMC_API_KEY || '',
      'Accept': 'application/json'
    };
  },

  async fetch(path: string, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params);
    const res = await hubFetch<any>(`${BASE}${path}?${query}`, { headers: this.HEADERS });
    if (res.status?.error_code !== 0) throw new Error(res.status?.error_message || 'CMC API Error');
    return res.data;
  },

  async getLatestListings(limit = 100) {
    return this.fetch('/v1/cryptocurrency/listings/latest', { limit: limit.toString(), sort: 'market_cap' });
  },

  async getQuotes(symbols: string | string[]) {
    const sym = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return this.fetch('/v2/cryptocurrency/quotes/latest', { symbol: sym, convert: 'USD' });
  },

  async getGlobalMetrics() {
    return this.fetch('/v1/global-metrics/quotes/latest');
  }
};
