// src/hub/features/F11_ChainAnalysis/components/GasTracker.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Fuel, Timer, Gauge } from 'lucide-react';
import { HubCard } from '../../../shared/HubCard';

import { BlockchainService } from '../../../services/blockchain.service';

const GasTracker: React.FC = () => {
  const [gasData, setGasData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchGas = async () => {
    try {
      const [eth, btc, pol, base, sol, arb] = await Promise.all([
        BlockchainService.getEvmGas('eth'),
        BlockchainService.getBtcGas(),
        BlockchainService.getEvmGas('polygon'),
        BlockchainService.getEvmGas('base'),
        BlockchainService.getSolanaGas(),
        BlockchainService.getEvmGas('arbitrum')
      ]);

      setGasData([
        { name: 'Ethereum', ...eth, color: 'text-blue-400', load: 45 },
        { name: 'Bitcoin', ...btc, color: 'text-orange-400', load: 82 },
        { name: 'Polygon', ...pol, color: 'text-purple-400', load: 12 },
        { name: 'Base', ...base, color: 'text-blue-600', load: 28 },
        { name: 'Solana', ...sol, color: 'text-emerald-400', load: 65 },
        { name: 'Arbitrum', ...arb, color: 'text-cyan-400', load: 15 }
      ]);
    } catch (error) {
      console.error('Gas fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGas();
    const interval = setInterval(fetchGas, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-3xl border border-white/10" />;

  return (
    <HubCard 
      title="GLOBAL CONGESTION MATRIX" 
      icon={<Gauge className="text-gold size-4 animate-pulse" />}
      resourceId="F11_CHAIN"
      dataSource="Multi-Chain RPC Index"
      className="bg-black/60 border-gold/20 relative"
    >
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">LIVE_FEED_SYNCED</span>
      </div>

      <div className="overflow-x-auto no-scrollbar pt-2">
        <div className="min-w-[800px] grid grid-cols-7 gap-1">
          {/* Header Row */}
          <div className="p-2" />
          <div className="p-2 text-[9px] font-black text-gray-500 uppercase text-center border-b border-white/5">NET_HEARTBEAT</div>
          <div className="p-2 text-[9px] font-black text-gray-500 uppercase text-center border-b border-white/5">SLOW_PRIO</div>
          <div className="p-2 text-[9px] font-black text-gray-500 uppercase text-center border-b border-white/5">AVG_PRIO</div>
          <div className="p-2 text-[9px] font-black text-gray-500 uppercase text-center border-b border-white/5">FAST_PRIO</div>
          <div className="p-2 text-[9px] font-black text-gray-500 uppercase text-center border-b border-white/5">UNIT</div>
          <div className="p-2 text-[9px] font-black text-gray-500 uppercase text-center border-b border-white/5">INTENSITY</div>

          {gasData.map((chain: any, i: number) => (
            <React.Fragment key={chain.name}>
              {/* Chain Name */}
              <div className="p-3 flex items-center space-x-2 border-r border-white/5">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${chain.color}`}>
                  {chain.name.slice(0, 3)}
                </span>
              </div>

              {/* Heartbeat/Load */}
              <div className="p-3 flex items-center justify-center">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${chain.load}%` }}
                    className={`h-full ${chain.load > 70 ? 'bg-red-500' : chain.load > 40 ? 'bg-gold' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>

              {/* Heat Map Cells */}
              <div className="p-3 text-center bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors border-x border-white/5">
                <span className="text-[10px] font-mono text-emerald-400">
                  {typeof chain.low === 'number' && chain.low < 0.001 ? chain.low.toFixed(6) : chain.low}
                </span>
              </div>
              <div className="p-3 text-center bg-gold/5 hover:bg-gold/10 transition-colors">
                <span className="text-[10px] font-mono text-gold">
                  {typeof chain.average === 'number' && chain.average < 0.001 ? chain.average.toFixed(6) : chain.average}
                </span>
              </div>
              <div className="p-3 text-center bg-red-500/5 hover:bg-red-500/10 transition-colors border-x border-white/5">
                <span className="text-[10px] font-mono text-red-400">
                  {typeof chain.high === 'number' && chain.high < 0.001 ? chain.high.toFixed(6) : chain.high}
                </span>
              </div>

              {/* Unit */}
              <div className="p-3 text-center">
                <span className="text-[8px] font-bold text-gray-600 uppercase">{chain.unit}</span>
              </div>

              {/* Intensity Label */}
              <div className="p-3 text-center">
                <span className={`text-[8px] font-black py-0.5 px-1.5 rounded border ${
                  chain.load > 70 ? 'border-red-500/30 text-red-500 bg-red-500/10' : 
                  chain.load > 40 ? 'border-gold/30 text-gold bg-gold/10' : 
                  'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                }`}>
                  {chain.load > 70 ? 'CRITICAL' : chain.load > 40 ? 'NOMINAL' : 'STABLE'}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </HubCard>
  );
};

export default GasTracker;
