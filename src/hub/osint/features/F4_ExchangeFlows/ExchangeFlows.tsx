// src/hub/osint/features/F4_ExchangeFlows/ExchangeFlows.tsx
import React, { useState, useEffect } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { Activity, ArrowUpCircle, ArrowDownCircle, Landmark, Globe, RefreshCcw, Zap } from 'lucide-react';
import { osintUtils } from '../../osint.utils';

const ExchangeFlows: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);

  const fetchFlows = async () => {
    setLoading(true);
    // Real-time Net Flow calculation (Mocked with high fidelity)
    try {
      const mockFlows = [
        { exchange: 'Binance', inflow: 1240.2, outflow: 980.5, asset: 'BTC' },
        { exchange: 'Coinbase', inflow: 450.0, outflow: 620.4, asset: 'ETH' },
        { exchange: 'Kraken', inflow: 320.1, outflow: 150.2, asset: 'USDT' },
        { exchange: 'Bitfinex', inflow: 890.5, outflow: 1100.2, asset: 'BTC' },
        { exchange: 'OKX', inflow: 2100.0, outflow: 1950.8, asset: 'SOL' }
      ];
      setFlows(mockFlows);
    } catch (error) {
       console.error('Flow fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
    const interval = setInterval(fetchFlows, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Exchange Flow Intelligence</h1>
          <p className="text-gray-400 text-sm italic">Tracking high-value liquidity moves between CEXs and Private Wallets</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] text-gray-500 font-black uppercase">Net CEX Flow (1h)</span>
             <span className="text-sm font-black text-green-500">+$2.1B INFLOW</span>
           </div>
           <button onClick={fetchFlows} className="p-2 bg-gold/10 rounded-lg text-gold hover:bg-gold/20 transition-all">
             <RefreshCcw className="size-4" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {flows.map((flow, i) => {
          const net = flow.inflow - flow.outflow;
          const isPositive = net > 0;
          return (
            <HubCard key={i} title={flow.exchange} resourceId={`FLOW_${flow.exchange}`} dataSource="Node_Inflow_Agent">
              <div className="flex justify-between items-end py-4">
                <div>
                  <div className="text-[10px] text-gray-500 font-black uppercase mb-1">Net {flow.asset} Flow</div>
                  <div className={`text-2xl font-black ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{net.toFixed(1)} <span className="text-xs">{flow.asset}</span>
                  </div>
                </div>
                <div className="text-right">
                   {isPositive ? <ArrowUpCircle className="size-8 text-green-500/20" /> : <ArrowDownCircle className="size-8 text-red-500/20" />}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-gold/5 pt-4">
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase">Inflow</div>
                  <div className="text-xs font-bold text-white">{flow.inflow.toFixed(1)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-gray-500 font-bold uppercase">Outflow</div>
                  <div className="text-xs font-bold text-white">{flow.outflow.toFixed(1)}</div>
                </div>
              </div>
            </HubCard>
          );
        })}
      </div>

      <HubCard title="Institutional Liquidity Heatmap" dataSource="Global_Flow_Matrix">
        <div className="h-48 flex items-center justify-center border border-dashed border-gold/10 rounded-2xl relative overflow-hidden group">
          <Globe className="size-24 text-gold/5 opacity-40 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Landmark className="size-10 text-gold/20 mb-4" />
            <span className="text-[10px] font-black text-gold/40 uppercase tracking-[0.4em]">Matrix Initializing...</span>
          </div>
        </div>
      </HubCard>
    </div>
  );
};

export default ExchangeFlows;
