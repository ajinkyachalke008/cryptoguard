// src/hub/services/tenderly.service.ts
import { hubFetch } from './hub.fetcher';

export const TenderlyService = {
  get BASE() {
    return `https://api.tenderly.co/api/v1/account/${process.env.HUB_TENDERLY_USER}/project/${process.env.HUB_TENDERLY_PROJECT}`;
  },
  get HEADERS() {
    return {
      'Content-Type': 'application/json',
      'X-Access-Key': process.env.HUB_TENDERLY_API_KEY || ''
    };
  },

  async simulate(params: { networkId?: string, from: string, to: string, input?: string, value?: string, save?: boolean }) {
    const res = await hubFetch<any>(`${this.BASE}/simulate`, {
      method: 'POST',
      headers: this.HEADERS,
      body: JSON.stringify({
        network_id: params.networkId || '1',
        from: params.from,
        to: params.to,
        input: params.input || '0x',
        value: params.value || '0',
        save: params.save || false
      }),
    });
    return {
      success: res.transaction?.status,
      gasUsed: res.transaction?.gas_used,
      revertReason: res.transaction?.error_message,
      logs: res.transaction?.logs || [],
    };
  }
};
