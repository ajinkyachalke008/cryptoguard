// src/hub/features/F11_ChainAnalysis/ChainAnalysis.tsx
import React, { useEffect, useState } from 'react';
import { BlockchainService, ChainStats } from '../../services/blockchain.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Zap, Activity, ShieldCheck, Cpu, Filter, Search, Globe } from 'lucide-react';
import GasTracker from './components/GasTracker';
import ChainSparkline from './components/ChainSparkline';

const ChainAnalysis: React.FC = () => {
  const [chains, setChains] = useState<ChainStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchChains = async () => {
    setLoading(true);
    try {
      const targets = ['bitcoin', 'ethereum', 'solana', 'litecoin', 'base', 'arbitrum'];
      const results = await Promise.all(targets.map(t => BlockchainService.getChainStats(t)));
      setChains(results);
    } catch (error) {
      console.error('Failed to load chains:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChains();
    const interval = setInterval(fetchChains, 45000);
    return () => clearInterval(interval);
  }, []);

  const filteredChains = chains.filter(c => 
    c.chain.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gold/10 pb-10 relative mb-10">
        <div className="absolute -bottom-px left-0 w-48 h-[2px] bg-gold shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
        <div>
          <div className="flex items-center space-x-3 text-gold/60 text-[10px] font-black uppercase tracking-[0.6em] mb-3">
            <Globe className="size-3 text-gold" />
            <span>Multi-Chain Infrastructure Intelligence</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
            CHAIN<span className="text-gold">·</span>ANALYSIS
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gold/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <input 
              type="text" 
              placeholder="Inject Chain Parameter..."
              className="relative bg-black/60 border border-gold/20 rounded-2xl px-12 py-4 text-[10px] text-white outline-none focus:border-gold/50 transition-all font-black uppercase tracking-[0.2em] w-72 backdrop-blur-3xl"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50 size-5" />
          </div>
          <button 
            onClick={fetchChains}
            className="p-4 bg-gold text-black rounded-2xl hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-95 group"
          >
            <Activity className={`size-5 ${loading ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
          </button>
        </div>
      </div>

      {/* Global Gas Matrix */}
      <GasTracker />

      {/* Chain Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredChains.map((chain, idx) => (
            <motion.div
              key={chain.chain}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <HubCard 
                className="h-full group hover:border-gold/30 transition-all overflow-hidden bg-black/40" 
                resourceId="F11_CHAIN" 
                dataSource="Blockchair Pulse"
                dataSourceUrl="https://blockchair.com"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className={`size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-lg ${
                      chain.healthScore > 80 ? 'text-emerald-400' : 'text-gold'
                    }`}>
                      {chain.chain.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tighter uppercase">{chain.chain}</h3>
                      <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">HEALTH_INDEX: {chain.healthScore}%</div>
                    </div>
                  </div>
                  <HubBadge variant={chain.status === 'OPTIMAL' ? 'green' : 'gold'}>
                    {chain.status}
                  </HubBadge>
                </div>

                <div className="space-y-6">
                  {/* Visual Pulse */}
                  <div className="relative p-4 rounded-2xl bg-white/5 border border-white/5 overflow-hidden group/card">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                          <Zap className="size-2.5 text-gold" /> SYSTOLIC_HEARTBEAT (TPS)
                        </div>
                        <div className="text-3xl font-black text-white font-mono tracking-tighter">
                          {chain.tps.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">Active Wallets</div>
                        <div className="text-sm font-black text-blue-400">{(chain.activeAddresses / 1e3).toFixed(1)}K</div>
                      </div>
                    </div>
                    <ChainSparkline 
                      data={Array.from({length: 20}, () => chain.tps * (0.8 + Math.random() * 0.4))} 
                      color={chain.healthScore > 80 ? '#34d399' : '#fbbf24'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                        <Activity className="size-2 text-blue-400" /> MEDIAN_TX_FEE
                      </div>
                      <div className="text-sm font-black text-white font-mono tracking-tighter">
                        ${chain.gasPrice < 0.01 ? '<0.01' : chain.gasPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-end gap-1">
                        MARKET_CAP <Globe className="size-2 text-gold" />
                      </div>
                      <div className="text-sm font-black text-white font-mono tracking-tighter">
                        ${(chain.marketCap / 1e9).toFixed(1)}B
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[9px] text-gray-500 font-black uppercase tracking-tighter">
                      <Cpu className="size-3" />
                      <span>{chain.difficulty > 0 ? `DIFF: ${Math.floor(chain.difficulty / 1e12)}T` : 'STAKE_OPERATIONAL'}</span>
                    </div>
                    <button className="flex items-center space-x-1 text-[8px] font-black text-gold hover:text-white transition-colors uppercase tracking-widest">
                      <span>Full Scan</span>
                      <ShieldCheck className="size-3" />
                    </button>
                  </div>
                </div>
              </HubCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChainAnalysis;
