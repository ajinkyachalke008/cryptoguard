// src/hub/services/moralis.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://deep-index.moralis.io/api/v2.2';

export const MoralisService = {
  get HEADERS() {
    return {
      'X-API-Key': process.env.HUB_MORALIS_API_KEY || '',
      'accept': 'application/json'
    };
  },

  async get(path: string) {
    return hubFetch<any>(`${BASE}${path}`, { headers: this.HEADERS });
  },

  async getTokenBalances(address: string, chain = 'eth') {
    return this.get(`/${address}/erc20?chain=${chain}`);
  },

  async getNFTs(address: string, chain = 'eth') {
    return this.get(`/${address}/nft?chain=${chain}&format=decimal&media_items=false`);
  },

  async getTransactionHistory(address: string, chain = 'eth') {
    return this.get(`/${address}?chain=${chain}&include_internal_transactions=false`);
  },

  async getWalletNetWorth(address: string) {
    return this.get(`/wallets/${address}/net-worth`);
  }
};
