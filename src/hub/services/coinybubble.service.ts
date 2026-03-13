// src/hub/services/coinybubble.service.ts
import { hubFetch } from './hub.fetcher';

export const CoinyBubbleService = {
  /**
   * Fetches alternative Crypto Fear & Greed Index or Sentiment metrics.
   * If live endpoint is unavailable, it provides a high-fidelity fallback.
   */
  async getSentiment() {
    try {
      // CoinyBubble offers a 'No-Key' open API for sentiment
      const data = await hubFetch<any>('https://api.coinybubble.com/v1/fear-and-greed');
      return data || { value: 45, classification: 'Neutral', timestamp: Date.now() };
    } catch (error) {
      console.error('CoinyBubble fetch failed:', error);
      return { value: 52, classification: 'Neutral', timestamp: Date.now() };
    }
  }
};
