// src/hub/services/lunarCrush.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://lunarcrush.com/api4/public';

export const LunarCrushService = {
  get HEADERS() {
    return { 'Authorization': `Bearer ${process.env.HUB_LUNARCRUSH_TOKEN || ''}` };
  },

  async fetch(path: string) {
    return hubFetch<any>(`${BASE}${path}`, { headers: this.HEADERS });
  },

  async getCoinList() {
    return this.fetch('/coins/list/v2');
  },

  async getCoin(coinSlug: string) {
    return this.fetch(`/coins/${coinSlug}/v1`);
  }
};
