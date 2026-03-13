// src/hub/services/binance.service.ts
import { hubFetch } from './hub.fetcher';

const BASE = 'https://api.binance.com/api/v3';

export const BinanceService = {
  async getPrice(symbol: string) {
    return hubFetch<any>(`${BASE}/ticker/price?symbol=${symbol.toUpperCase()}`);
  },

  async getAllPrices() {
    const prices = await hubFetch<any[]>(`${BASE}/ticker/price`);
    return Object.fromEntries(prices.map(p => [p.symbol, p.price]));
  },

  async get24hStats(symbol: string) {
    return hubFetch<any>(`${BASE}/ticker/24hr?symbol=${symbol.toUpperCase()}`);
  },

  async getKlines(symbol: string, interval = '1h', limit = 24) {
    const raw = await hubFetch<any[]>(`${BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit.toString()}`);
    return raw.map(k => ({
      openTime: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));
  },

  async getOrderBook(symbol: string, limit = 20) {
    return hubFetch<any>(`${BASE}/depth?symbol=${symbol}&limit=${limit.toString()}`);
  }
};
