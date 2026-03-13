// src/hub/osint/osint.utils.ts

import { OSINTRiskLevel } from './osint.types';

export const osintUtils = {
  maskAddress: (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  calculateRiskLevel: (score: number): OSINTRiskLevel => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  },

  formatUSD: (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  groupBy: <T>(array: T[], keyGetter: (item: T) => string | number) => {
    const map = new Map<string | number, T[]>();
    array.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }
};
