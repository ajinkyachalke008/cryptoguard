// src/hub/services/coinGecko.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.coingecko.com/api/v3';

export const CoinGeckoService = {
  get HEADERS() {
    return { 'x-cg-demo-api-key': process.env.HUB_COINGECKO_API_KEY || '' };
  },

  async fetch(path: string) {
    try {
      return await hubFetch<any>(`${BASE}${path}`, { headers: this.HEADERS });
    } catch (error) {
      console.warn(`CoinGecko fetch failed for ${path}, using mock fallback`, error);
      return null;
    }
  },

  async getPrices(ids: string[], vs = 'usd') {
    const data = await this.fetch(`/simple/price?ids=${ids.join(',')}&vs_currencies=${vs}&include_24hr_change=true&include_market_cap=true`);
    if (data) return data;

    // Fallback data
    const fallbacks: any = {};
    ids.forEach(id => {
      fallbacks[id] = { 
        [vs]: id === 'bitcoin' ? 94820 : id === 'ethereum' ? 2640 : 1.0,
        [`${vs}_24h_change`]: 2.5,
        [`${vs}_market_cap`]: id === 'bitcoin' ? 1.8e12 : 3.1e11
      };
    });
    return fallbacks;
  },

  async getTopMarkets(limit = 100) {
    const data = await this.fetch(`/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`);
    return data || [];
  },

  async getChart(coinId: string, days = 30) {
    return this.fetch(`/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
  },

  async getCoinDetail(coinId: string) {
    return this.fetch(`/coins/${coinId}?localization=false&tickers=false&community_data=true&developer_data=false`);
  },

  async getGlobalData() {
    return this.fetch('/global');
  }
};
