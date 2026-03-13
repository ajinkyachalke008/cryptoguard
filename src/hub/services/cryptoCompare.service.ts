// src/hub/services/cryptoCompare.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://min-api.cryptocompare.com/data';

export const CryptoCompareService = {
  get KEY() { return process.env.HUB_CRYPTOCOMPARE_API_KEY || ''; },

  async fetch(path: string) {
    const sep = path.includes('?') ? '&' : '?';
    const data = await hubFetch<any>(`${BASE}${path}${sep}api_key=${this.KEY}`);
    if (data.Response === 'Error') throw new Error(data.Message);
    return data;
  },

  async getDailyOHLCV(fsym: string, tsym = 'USD', limit = 30) {
    return this.fetch(`/v2/histoday?fsym=${fsym}&tsym=${tsym}&limit=${limit.toString()}`);
  },

  async getHourlyOHLCV(fsym: string, tsym = 'USD', limit = 24) {
    return this.fetch(`/v2/histohour?fsym=${fsym}&tsym=${tsym}&limit=${limit.toString()}`);
  },

  async getMultiPrice(fsyms: string[], tsyms = 'USD,BTC,ETH') {
    return this.fetch(`/pricemulti?fsyms=${fsyms.join(',')}&tsyms=${tsyms}`);
  }
};
