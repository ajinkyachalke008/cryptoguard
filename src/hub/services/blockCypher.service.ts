// src/hub/services/blockCypher.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.blockcypher.com/v1';

export const BlockCypherService = {
  get TOKEN() { return process.env.HUB_BLOCKCYPHER_TOKEN || ''; },

  async fetch(path: string) {
    const sep = path.includes('?') ? '&' : '?';
    return hubFetch<any>(`${BASE}${path}${sep}token=${this.TOKEN}`);
  },

  async getAddress(address: string, coin = 'btc') {
    return this.fetch(`/${coin}/main/addrs/${address}?unspentOnly=false`);
  },

  async getTransaction(txhash: string, coin = 'btc') {
    return this.fetch(`/${coin}/main/txs/${txhash}`);
  }
};
