// src/hub/services/blockstream.service.ts
import { hubFetch } from './hub.fetcher';

export const BlockstreamService = {
  /**
   * Fetches latest Bitcoin block height and hash.
   */
  async getLatestBlock() {
    try {
      const height = await hubFetch('https://blockstream.info/api/blocks/tip/height', {}, 3, false);
      const hash = await hubFetch<string>('https://blockstream.info/api/blocks/tip/hash', {}, 3, false);
      return { height, hash };
    } catch (error) {
      console.error('Blockstream fetch failed:', error);
      return { height: 0, hash: '0' };
    }
  },

  /**
   * Fetches mempool stats (count, vsize, total_fee).
   */
  async getMempoolStats() {
    try {
      return await hubFetch<any>('https://blockstream.info/api/mempool');
    } catch (error) {
      console.error('Blockstream mempool fetch failed:', error);
      return { count: 0, vsize: 0, total_fee: 0 };
    }
  }
};
