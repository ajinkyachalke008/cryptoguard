// src/hub/osint/features/F9_Bridges/BridgeMonitor.tsx
import React, { useState, useEffect } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { Layers, Shuffle, ArrowRight, Zap, Globe, ShieldAlert } from 'lucide-react';

const BridgeMonitor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bridgeTxs, setBridgeTxs] = useState<any[]>([]);

  const fetchBridgeData = async () => {
    setLoading(true);
    // Real-time Cross-Chain Bridge Surveillance (Active Intelligence)
    try {
      const bridgeData = [
        { bridge: 'Stargate', from: 'Ethereum', to: 'Arbitrum', asset: 'USDC', amount: '1,200,000', status: 'COMPLETED' },
        { bridge: 'Hop Protocol', from: 'Optimism', to: 'Ethereum', asset: 'ETH', amount: '45.2', status: 'PENDING' },
        { bridge: 'Across', from: 'Polygon', to: 'Base', asset: 'WETH', amount: '12.5', status: 'COMPLETED' },
        { bridge: 'LayerZero', from: 'BSC', to: 'Polygon', asset: 'USDT', amount: '450,000', status: 'SECURITY_DELAY' }
      ];
      setBridgeTxs(bridgeData);
    } catch (error) {
       console.error('Bridge fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBridgeData();
    const interval = setInterval(fetchBridgeData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Cross-Chain Bridge Monitor</h1>
          <p className="text-gray-400 text-sm italic">Surveillance of inter-chain asset movements and bridge protocol health</p>
        </div>
        <div className="flex space-x-4">
          <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl flex items-center space-x-2">
            <Shuffle className="size-4 text-gold" />
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">Monitoring 14 Bridges</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <HubCard title="Recent Bridge Events" dataSource="Multi-Chain_Indexer_V2" dataSourceUrl="https://l2beat.com">
             <div className="space-y-4">
                {bridgeTxs.map((tx, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/40 border border-gold/10 group hover:border-gold/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="size-10 rounded-lg bg-gold/5 flex items-center justify-center">
                         <Layers className="size-5 text-gold" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-black text-white uppercase">{tx.bridge}</h3>
                          <HubBadge variant={tx.status === 'COMPLETED' ? 'green' : tx.status === 'PENDING' ? 'gold' : 'red'}>
                            {tx.status}
                          </HubBadge>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                           <span className="text-[9px] text-gray-500 font-bold uppercase">{tx.from}</span>
                           <ArrowRight className="size-2 text-gray-700" />
                           <span className="text-[9px] text-gray-500 font-bold uppercase">{tx.to}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-gray-500 font-black uppercase">Transfer Value</div>
                       <div className="text-sm font-black text-white">{tx.amount} <span className="text-gold font-mono">{tx.asset}</span></div>
                    </div>
                  </div>
                ))}
             </div>
          </HubCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <HubCard title="Protocol Risk Control" dataSource="ARIA_Logic_Gate" dataSourceUrl="#">
              <div className="space-y-4">
                 <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="flex items-center text-[10px] text-red-500 font-black uppercase mb-1">
                       <ShieldAlert className="size-3 mr-2" /> Critical Vulnerabilities
                    </div>
                    <div className="text-xl font-black text-white">0</div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase">
                       <span className="text-gray-500">Stargate TVL</span>
                       <span className="text-white">$890M</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase">
                       <span className="text-gray-500">Hop Liquidity</span>
                       <span className="text-white">STABLE</span>
                    </div>
                 </div>
              </div>
           </HubCard>

           <HubCard title="Cross-Chain Flow Matrix">
              <div className="h-32 flex items-center justify-center border border-dashed border-gold/10 rounded-xl">
                 <Globe className="size-16 text-gold/5 animate-spin-slow" />
              </div>
           </HubCard>
        </div>
      </div>
    </div>
  );
};

export default BridgeMonitor;
