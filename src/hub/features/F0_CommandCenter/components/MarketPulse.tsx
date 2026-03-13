// src/hub/features/F0_CommandCenter/components/MarketPulse.tsx
import React, { useEffect, useState } from 'react';
import { CoinGeckoService } from '../../../services/coinGecko.service';
import { AlternativeMeService } from '../../../services/alternativeMe.service';
import { Zap, TrendingUp, TrendingDown, Target, Globe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const MarketPulse: React.FC = () => {
  const [pulse, setPulse] = useState<any>(null);
  const [fearGreed, setFearGreed] = useState<any>(null);

  const fetchData = async () => {
    try {
      const getGlobalSafely = async () => {
        try { return await CoinGeckoService.getGlobalData(); }
        catch (e) { return null; }
      };
      
      const getFgSafely = async () => {
        try { return await AlternativeMeService.getFearGreed(); }
        catch (e) { return [{ value: '50', value_classification: 'Neutral' }]; }
      };

      const [global, fg] = await Promise.all([
        getGlobalSafely(),
        getFgSafely()
      ]);
      
      // Fallback for global data if null
      setPulse(global || {
        total_market_cap: { usd: 3100000000000 },
        total_volume: { usd: 85000000000 },
        market_cap_percentage: { btc: 52.4 },
        market_cap_change_percentage_24h_usd: 1.2
      });
      setFearGreed(fg[0]);
    } catch (error) {
      console.error('Market pulse fetch failed:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!pulse) return <div className="h-20 animate-pulse bg-gold/5 rounded-xl border border-gold/10" />;

  const fgValue = parseInt(fearGreed?.value || '50');
  const fgColor = fgValue > 75 ? 'text-green-400' : fgValue > 55 ? 'text-green-500' : fgValue > 45 ? 'text-gold' : fgValue > 25 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <div className="p-4 rounded-2xl bg-black/40 border border-gold/10 border-l-gold border-l-4">
        <div className="flex items-center space-x-2 mb-1">
          <Globe className="size-3 text-gold" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Mkt Cap</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-lg font-black text-white">
            ${((pulse?.total_market_cap?.usd || 3.1e12) / 1e12).toFixed(2)}T
          </div>
          <div className={`text-[10px] font-bold ${(pulse?.market_cap_change_percentage_24h_usd || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(pulse?.market_cap_change_percentage_24h_usd || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-black/40 border border-gold/10 border-l-blue-500 border-l-4">
        <div className="flex items-center space-x-2 mb-1">
          <Zap className="size-3 text-blue-400" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">24h Vol Total</span>
        </div>
        <div className="text-lg font-black text-white">
          ${((pulse?.total_volume?.usd || 85e9) / 1e9).toFixed(1)}B
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-black/40 border border-gold/10 border-l-orange-500 border-l-4">
        <div className="flex items-center space-x-2 mb-1">
          <Target className="size-3 text-orange-500" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">BTC Dominance</span>
        </div>
        <div className="text-lg font-black text-white">
          {(pulse?.market_cap_percentage?.btc || 52.4).toFixed(1)}%
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-black/40 border border-gold/10 border-l-purple-500 border-l-4">
        <div className="flex items-center space-x-2 mb-1">
          <Activity className="size-3 text-purple-400" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fear & Greed</span>
        </div>
        <div className={`text-lg font-black ${fgColor}`}>
          {fgValue} <span className="text-[8px] uppercase font-bold text-gray-500 ml-1">{fearGreed?.value_classification || 'Neutral'}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketPulse;
