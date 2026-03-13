// src/hub/services/alternativeMe.service.ts
import { hubFetch } from './hub.fetcher';

export const AlternativeMeService = {
  async getFearGreed() {
    try {
      const data = await hubFetch<any>('https://api.alternative.me/fng/?limit=7');
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch Fear & Greed index:', error);
      return [{ value: '50', value_classification: 'Neutral', timestamp: Date.now().toString() }];
    }
  }
};
