// src/hub/services/nowNodes.service.ts
import { hubFetch } from './hub.fetcher';

export const NOWNodesService = {
  get KEY() { return process.env.HUB_NOWNODES_API_KEY || ''; },
  get HEADERS() { return { 'api-key': this.KEY }; },

  async getBTCAddress(address: string) {
    return hubFetch<any>(`https://btcbook.nownodes.io/api/v2/address/${address}`, { headers: this.HEADERS });
  },

  async getETHAddress(address: string) {
    return hubFetch<any>(`https://ethbook.nownodes.io/api/v2/address/${address}`, { headers: this.HEADERS });
  },

  async getXMRBalance(address: string) {
    return hubFetch<any>(`https://xmrbook.nownodes.io/api/v1/address/${address}`, { headers: this.HEADERS });
  }
};
