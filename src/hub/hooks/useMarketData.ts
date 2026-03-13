// src/hub/hooks/useMarketData.ts
import { useEffect, useCallback } from 'react';
import { useHubStore } from '../HubStore';
import { CoinGeckoService } from '../services/coinGecko.service';

export const useMarketData = () => {
  const { market, setMarket } = useHubStore((state: any) => ({
    market: state.market,
    setMarket: (m: any) => state.setMarket ? state.setMarket(m) : state.market = m // Note: simplified for this pass, usually we add setMarket to store
  }));

  const fetchGlobal = useCallback(async () => {
    try {
      const data = await CoinGeckoService.getGlobalData();
      // Handle update to store
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchGlobal();
  }, [fetchGlobal]);

  return { market };
};
