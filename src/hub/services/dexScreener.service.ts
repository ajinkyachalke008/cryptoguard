// src/hub/services/dexScreener.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.dexscreener.com/latest';

export const DexScreenerService = {
  async search(query: string) {
    const res = await hubFetch<{ pairs: any[] }>(`${BASE}/dex/search?q=${encodeURIComponent(query)}`);
    return res.pairs || [];
  },

  async getTokenPairs(addresses: string | string[]) {
    const addr = Array.isArray(addresses) ? addresses.join(',') : addresses;
    const res = await hubFetch<{ pairs: any[] }>(`${BASE}/dex/tokens/${addr}`);
    return res.pairs || [];
  },

  async getPair(chainId: string, pairAddress: string) {
    const res = await hubFetch<{ pair: any }>(`${BASE}/dex/pairs/${chainId}/${pairAddress}`);
    return res.pair;
  },

  async getLatestTokens() {
    return hubFetch<any>(`${BASE}/dex/tokens/latest`);
  },

  analyzeRisk(pair: any) {
    const sellRatio = pair.txns?.h24?.sells / (pair.txns?.h24?.buys || 1);
    const flags: string[] = [];
    if ((pair.liquidity?.usd || 0) < 10000) flags.push('Low Liquidity');
    if (sellRatio > 3) flags.push('High Sell Pressure');
    if ((pair.priceChange?.h24 || 0) < -30) flags.push('Major Dump');
    if ((pair.volume?.h24 || 0) > (pair.liquidity?.usd || 0) * 10) flags.push('Suspicious Volume');

    return {
      flags,
      lowLiquidity: (pair.liquidity?.usd || 0) < 10000,
      highSellPressure: sellRatio > 3,
      priceDown: (pair.priceChange?.h24 || 0) < 0,
      suspiciousVolume: (pair.volume?.h24 || 0) > (pair.liquidity?.usd || 0) * 10,
    };
  }
};
