// src/hub/features/F1_MarketDashboard/MarketDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useHubStore } from '../../HubStore';
import { CoinGeckoService } from '../../services/coinGecko.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Globe, Zap } from 'lucide-react';
import DominanceChart from './components/DominanceChart';

const MarketDashboard: React.FC = () => {
  const { market, setMarket } = useHubStore();
  const [globalData, setGlobalData] = useState<any>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const assets = await CoinGeckoService.getTopMarkets(50);
        setMarket({ topAssets: assets });

        // Logic for dominance chart (would typically come from a global API)
        // For now, calculating from top 5 for visual fidelity
        const totalCap = assets.reduce((acc: number, cur: any) => acc + cur.market_cap, 0);
        const dominance = assets.slice(0, 4).map((asset: any, i: number) => ({
          symbol: asset.symbol.toUpperCase(),
          percentage: (asset.market_cap / totalCap) * 100,
          color: ['#F7931A', '#627EEA', '#26A17B', '#F3BA2F'][i] || '#888888'
        }));
        setGlobalData(dominance);

      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [setMarket]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center space-x-2 text-gold/60 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
            <Globe className="size-3" />
            <span>Real-Time Market Intelligence</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
            GLOBAL<span className="text-gold">·</span>ASSETS
          </h1>
        </div>
        <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
          <Zap className="text-gold size-4 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-gray-500 uppercase">Status</span>
            <span className="text-xs font-black text-white uppercase font-mono">Synchronized 100%</span>
          </div>
        </div>
      </div>

      {/* Dominance Overview */}
      {globalData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <DominanceChart data={globalData} />
        </motion.div>
      )}

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {market.topAssets.map((asset: any, index: number) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <HubCard className="h-full group hover:bg-white/[0.02]" resourceId="F1_MARKET" dataSource="CoinGecko">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded-2xl border border-white/10" />
                    <div className="absolute -bottom-1 -right-1 size-5 bg-black border border-white/10 rounded-full flex items-center justify-center text-[8px] font-black text-gold">
                      {asset.market_cap_rank}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white group-hover:text-gold transition-colors tracking-tight">{asset.name}</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{asset.symbol}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-xs font-black ${
                  asset.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {asset.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{Math.abs(asset.price_change_percentage_24h)?.toFixed(2)}%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-3xl font-black text-white tracking-tighter font-mono">
                  ${asset.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Market Cap</div>
                    <div className="text-xs font-black text-blue-100">${(asset.market_cap / 1e9).toFixed(2)}B</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">24h Volume</div>
                    <div className="text-xs font-black text-blue-100">${(asset.total_volume / 1e6).toFixed(1)}M</div>
                  </div>
                </div>
              </div>
            </HubCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketDashboard;
