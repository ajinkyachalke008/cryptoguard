// src/hub/osint/features/F5_SmartMoney/SmartMoney.tsx
import React, { useState, useEffect } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { Zap, Target, TrendingUp, Search, Eye, ExternalLink } from 'lucide-react';
import { osintUtils } from '../../osint.utils';

const SmartMoney: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [whales, setWhales] = useState<any[]>([]);

  const fetchWhales = async () => {
    setLoading(true);
    // Multi-chain Whale Surveillance (Mocked high-fidelity)
    try {
      const mockWhales = [
        { label: 'Jump Trading', address: '0x123...456', action: 'ACCUMULATING', asset: 'ETH', amount: '$45M', timestamp: '2m ago' },
        { label: 'Wintermute', address: '0x789...012', action: 'ARBITRAGE', asset: 'ARB', amount: '$12M', timestamp: '15m ago' },
        { label: 'Amber Group', address: '0xabc...def', action: 'DISTRIBUTION', asset: 'WBTC', amount: '$82M', timestamp: '45m ago' },
        { label: 'FalconX', address: '0x456...789', action: 'ACCUMULATING', asset: 'SOL', amount: '$24M', timestamp: '1h ago' },
      ];
      setWhales(mockWhales);
    } catch (error) {
       console.error('Whale fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhales();
    const interval = setInterval(fetchWhales, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Smart Money Tracker</h1>
          <p className="text-gray-400 text-sm italic">Surveillance of high-conviction institutional and whale movements</p>
        </div>
        <div className="flex space-x-4">
          <div className="p-3 bg-black/40 border border-gold/10 rounded-xl flex items-center space-x-3">
             <Target className="size-5 text-gold animate-pulse" />
             <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 font-bold uppercase">Whales Online</span>
               <span className="text-sm font-black text-white">412 ACTIVE</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <HubCard title="Live Whale Movement Log" dataSource="On-Chain_Identity_Cluster">
            <div className="space-y-4">
              {whales.map((whale, i) => (
                <div key={i} className="p-4 rounded-xl bg-gold/5 border border-gold/10 hover:border-gold/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="size-10 rounded-full bg-black/40 border border-gold/20 flex items-center justify-center">
                       <Zap className="size-5 text-gold" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-black text-white uppercase">{whale.label}</h3>
                        <HubBadge variant={whale.action === 'ACCUMULATING' ? 'green' : whale.action === 'DISTRIBUTION' ? 'red' : 'gold'}>
                          {whale.action}
                        </HubBadge>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono italic">{whale.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8 text-right">
                    <div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase">Asset / Value</div>
                      <div className="text-xs font-black text-white">{whale.amount} <span className="text-gold font-mono">{whale.asset}</span></div>
                    </div>
                    <div className="text-[10px] text-gray-600 font-black uppercase italic">{whale.timestamp}</div>
                    <button className="text-gold hover:text-white transition-colors">
                      <ExternalLink className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </HubCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <HubCard title="High Conviction List" dataSource="ARIA_Dossier_System">
            <div className="space-y-4">
              <p className="text-[10px] text-gray-400 italic mb-4">Top entities currently showing significant accumulation patterns.</p>
              <div className="space-y-3">
                <WhaleItem label="A16Z" status="BULLISH" value="+$145M" />
                <WhaleItem label="Paradigm" status="BULLISH" value="+$89M" />
                <WhaleItem label="Pantera" status="NEUTRAL" value="-$4M" />
                <WhaleItem label="Framework" status="BULLISH" value="+$22M" />
              </div>
            </div>
          </HubCard>

          <HubCard title="Sentiment Bias" dataSource="LunarCrush_OSINT">
             <div className="text-center py-6">
                <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Institutional Bias</div>
                <div className="text-3xl font-black text-green-500 tracking-tighter uppercase">Aggressive Bull</div>
             </div>
          </HubCard>
        </div>
      </div>
    </div>
  );
};

const WhaleItem: React.FC<{ label: string; status: string; value: string }> = ({ label, status, value }) => (
  <div className="flex justify-between items-center p-2 border-b border-gold/5">
    <div>
      <div className="text-[10px] font-black text-white">{label}</div>
      <div className={`text-[8px] font-bold ${status === 'BULLISH' ? 'text-green-500' : 'text-gray-500'}`}>{status}</div>
    </div>
    <div className="text-[10px] font-black text-gold">{value}</div>
  </div>
);

export default SmartMoney;
