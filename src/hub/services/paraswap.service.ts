// src/hub/services/paraswap.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://apiv5.paraswap.io';

export const ParaswapService = {
  async getPrice(params: {
    srcToken: string;
    destToken: string;
    amount: string;
    srcDecimals?: number;
    destDecimals?: number;
    network?: number;
    side?: 'SELL' | 'BUY';
  }) {
    const queryParams = new URLSearchParams({
      srcToken: params.srcToken,
      destToken: params.destToken,
      srcDecimals: (params.srcDecimals || 18).toString(),
      destDecimals: (params.destDecimals || 18).toString(),
      amount: params.amount,
      side: params.side || 'SELL',
      network: (params.network || 1).toString(),
    });
    return hubFetch<any>(`${BASE}/prices?${queryParams}`);
  },

  async getTokens(chainId = 1) {
    return hubFetch<any>(`${BASE}/tokens?network=${chainId}`);
  }
};
