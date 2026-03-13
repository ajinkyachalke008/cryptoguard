// src/hub/services/santiment.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.santiment.net/graphql';

export const SantimentService = {
  get HEADERS() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Apikey ${process.env.HUB_SANTIMENT_API_KEY || ''}`
    };
  },

  async query(gql: string) {
    const res = await hubFetch<any>(BASE, {
      method: 'POST',
      headers: this.HEADERS,
      body: JSON.stringify({ query: gql })
    });
    if (res.errors) throw new Error(res.errors[0].message);
    return res.data;
  },

  async getSocialVolume(slug: string, from: string, to: string, interval = '1d') {
    return this.query(`{
      getMetric(metric: "social_volume_total") {
        timeseriesData(slug: "${slug}" from: "${from}" to: "${to}" interval: "${interval}") { datetime value }
      }
    }`);
  },

  async getWhaleTransactions(slug: string, from: string, to: string) {
    return this.query(`{
      getMetric(metric: "whale_transaction_count_100k_usd_to_inf") {
        timeseriesData(slug: "${slug}" from: "${from}" to: "${to}" interval: "1d") { datetime value }
      }
    }`);
  }
};
