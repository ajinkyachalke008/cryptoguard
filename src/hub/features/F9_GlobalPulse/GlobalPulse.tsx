// src/hub/features/F9_GlobalPulse/GlobalPulse.tsx
import React, { useState } from 'react';
import PulseGlobe from './components/PulseGlobe';
import PulseControls from './components/PulseControls';
import FlowLegend from './components/FlowLegend';
import FlowDataTable from './components/FlowDataTable';
import ChainFlowSummary from './components/ChainFlowSummary';
import { useGlobalPulse } from '../../hooks/useGlobalPulse';
import { HubCard } from '../../shared/HubCard';
import { Activity } from 'lucide-react';

const GlobalPulse: React.FC = () => {
  const { flows, loading } = useGlobalPulse();
  const [bloomStrength, setBloomStrength] = useState(1.2);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gold/10 pb-10 relative mb-4 shrink-0">
        <div className="absolute -bottom-px left-0 w-48 h-[2px] bg-gold shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
        <div>
          <div className="flex items-center space-x-3 text-gold/60 text-[10px] font-black uppercase tracking-[0.6em] mb-3">
            <Activity className="size-3 text-gold animate-pulse" />
            <span>Interactive Cross-Chain Liquidity Map</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
            GLOBAL<span className="text-gold">·</span>PULSE
          </h1>
        </div>
        <ChainFlowSummary />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="flex-1 bg-black/40 border border-gold/10 rounded-3xl relative overflow-hidden group shadow-[0_0_50px_rgba(13,71,161,0.1)]">
          <PulseGlobe 
            flows={flows} 
            autoRotate={autoRotate}
            bloomStrength={bloomStrength}
          />
          <PulseControls 
            autoRotate={autoRotate} 
            setAutoRotate={setAutoRotate}
            bloomStrength={bloomStrength}
            setBloomStrength={setBloomStrength}
          />
          <FlowLegend />
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto pr-2">
           <HubCard title="Active Flow Ledger" dataSource="DeFiLlama_Pulse_Node" dataSourceUrl="https://defillama.com">
             <FlowDataTable flows={flows} />
           </HubCard>
           
           <HubCard title="Ecosystem Intensity" dataSource="DexScreener_V3" dataSourceUrl="https://dexscreener.com">
             <div className="space-y-4">
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Network Congestion</div>
                <div className="grid grid-cols-2 gap-4">
                  <IntensityMetric label="Ethereum" value="HIGH" color="text-red-500" />
                  <IntensityMetric label="Solana" value="EXTREME" color="text-orange-500" />
                  <IntensityMetric label="BSC" value="NORMAL" color="text-green-500" />
                  <IntensityMetric label="Polygon" value="LOW" color="text-cyan-500" />
                </div>
             </div>
           </HubCard>
        </div>
      </div>
    </div>
  );
};

const IntensityMetric = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="p-2 bg-white/5 rounded-lg border border-white/5">
    <div className="text-[8px] text-gray-600 font-bold uppercase mb-1">{label}</div>
    <div className={`text-[10px] font-black ${color}`}>{value}</div>
  </div>
);

export default GlobalPulse;
