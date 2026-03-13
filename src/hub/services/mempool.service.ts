// src/hub/services/mempool.service.ts
import { hubFetch } from './hub.fetcher';

export const MempoolService = {
  /**
   * Gets real-time BTC fee recommendations.
   */
  async getFees() {
    return hubFetch('https://mempool.space/api/v1/fees/recommended');
  },

  /**
   * Gets recent unconfirmed transactions for the threat feed.
   */
  async getRecentTransactions() {
    return hubFetch('https://mempool.space/api/mempool/recent');
  },

  /**
   * Gets current block height.
   */
  async getBlockHeight() {
    return hubFetch('https://mempool.space/api/blocks/tip/height', {}, 3, false);
  },

  /**
   * Gets difficulty adjustment metrics.
   */
  async getDifficulty() {
    return hubFetch('https://mempool.space/api/v1/difficulty-adjustment');
  },

  /**
   * Calculates a heuristic risk score (Heuristic V2) for a transaction.
   */
  calculateRiskScore(tx: any) {
    let score = 0;
    const flags: string[] = [];

    // Value Weight (40%)
    const valueBtc = tx.value / 1e8;
    if (valueBtc > 100) { score += 40; flags.push('WHALE_MOVEMENT'); }
    else if (valueBtc > 10) { score += 20; flags.push('HIGH_VALUE'); }

    // Output Count Weight (25%)
    if (tx.vout && tx.vout.length > 20) { score += 25; flags.push('FAN_OUT_MIXING'); }
    else if (tx.vout && tx.vout.length > 10) { score += 15; flags.push('COMPLEX_DISB'); }

    // Input Count Weight (20%)
    if (tx.vin && tx.vin.length > 10) { score += 20; flags.push('CONSOLIDATION'); }

    // Pattern Matching
    if (tx.vout && tx.vout.length === 2) {
      const v0 = tx.vout[0].value / tx.value;
      const v1 = tx.vout[1].value / tx.value;
      if (v0 < 0.01 || v1 < 0.01) flags.push('PEELING_CHAIN');
    }

    return {
      score: Math.min(score, 100),
      flags,
      level: score >= 70 ? 'CRITICAL' : score >= 40 ? 'HIGH' : score >= 15 ? 'MEDIUM' : 'LOW'
    };
  }
};
