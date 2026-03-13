// src/hub/services/messari.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://data.messari.io/api';

export const MessariService = {
  get HEADERS() {
    return { 'x-messari-api-key': process.env.HUB_MESSARI_API_KEY || '' };
  },

  async fetch(path: string) {
    const res = await hubFetch<any>(`${BASE}${path}`, { headers: this.HEADERS });
    return res.data;
  },

  async getMetrics(asset = 'bitcoin') {
    return this.fetch(`/v1/assets/${asset}/metrics`);
  },

  async getProfile(asset: string) {
    return this.fetch(`/v2/assets/${asset}/profile`);
  },

  async getAllAssets(page = 1, limit = 50) {
    return this.fetch(`/v2/assets?page=${page}&limit=${limit}&fields=id,slug,symbol,name,metrics/market_data/price_usd`);
  }
};
