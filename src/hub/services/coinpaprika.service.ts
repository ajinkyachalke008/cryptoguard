// src/hub/services/coinpaprika.service.ts
import { hubFetch } from './hub.fetcher';

export const CoinPaprikaService = {
  /**
   * Fetches deep protocol metadata and developer scores.
   */
  async getCoinDetails(coinId: string) {
    try {
      return await hubFetch<any>(`https://api.coinpaprika.com/v1/coins/${coinId}`);
    } catch (error) {
      console.error('CoinPaprika fetch failed:', error);
      return null;
    }
  },

  /**
   * Fetches global market data.
   */
  async getGlobalData() {
    try {
      return await hubFetch<any>('https://api.coinpaprika.com/v1/global');
    } catch (error) {
      console.error('CoinPaprika global fetch failed:', error);
      return null;
    }
  }
};
