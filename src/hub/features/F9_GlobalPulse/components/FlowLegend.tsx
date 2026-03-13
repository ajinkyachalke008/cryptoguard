// src/hub/features/F9_GlobalPulse/components/FlowLegend.tsx
import React from 'react';

const FlowLegend: React.FC = () => {
  return (
    <div className="absolute bottom-6 left-6 z-30 p-4 bg-black/60 backdrop-blur-2xl border border-white/5 rounded-3xl">
      <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Flow Legend</div>
      <div className="space-y-3">
        <LegendItem color="bg-cyan-400" label="Cross-Chain Bridge" />
        <LegendItem color="bg-green-500" label="CEX Liquidity IN" />
        <LegendItem color="bg-red-500" label="CEX Liquidity OUT" />
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center space-x-2">
            <div className="h-1 w-8 bg-gold rounded-full" />
            <span className="text-[10px] text-gray-400 font-bold uppercase">Volume Scale</span>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center space-x-3">
    <div className={`size-2 rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
    <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">{label}</span>
  </div>
);

export default FlowLegend;
