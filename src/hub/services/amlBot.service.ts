// src/hub/services/amlBot.service.ts
import { hubFetch } from './hub.fetcher';

export const AMLBotService = {
  async checkAddress(address: string, currency = 'ETH') {
    const res = await hubFetch<any>('https://amlbot.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.HUB_AMLBOT_API_KEY || '',
        address,
        currency
      }),
    });
    return {
      address,
      currency,
      riskScore: res.riskscore,
      riskLevel: res.risklevel,
      signals: res.signals || [],
      verdict: res.riskscore >= 70 ? 'BLOCK' : res.riskscore >= 40 ? 'REVIEW' : 'PASS',
    };
  }
};
