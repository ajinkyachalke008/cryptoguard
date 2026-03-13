// src/hub/services/transpose.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.transpose.io/sql';

export const TransposeService = {
  get HEADERS() {
    return {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.HUB_TRANSPOSE_API_KEY || ''
    };
  },

  async sql(query: string) {
    const res = await hubFetch<any>(BASE, {
      method: 'POST',
      headers: this.HEADERS,
      body: JSON.stringify({ sql: query })
    });
    return res.results;
  }
};
