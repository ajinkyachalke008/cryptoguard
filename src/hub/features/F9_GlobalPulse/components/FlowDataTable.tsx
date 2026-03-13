// src/hub/features/F9_GlobalPulse/components/FlowDataTable.tsx
import React from 'react';
import { PulseFlow } from '../../../hooks/useGlobalPulse';
import { ArrowRight, Globe, Zap } from 'lucide-react';

interface FlowDataTableProps {
  flows: PulseFlow[];
}

const FlowDataTable: React.FC<FlowDataTableProps> = ({ flows }) => {
  return (
    <div className="space-y-3">
      {flows.map(flow => (
        <div key={flow.id} className="p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-gold/30 transition-all">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[8px] font-black uppercase tracking-widest ${flow.type === 'bridge' ? 'text-cyan-400' : 'text-green-500'}`}>
              {flow.type.replace('_', ' ')}
            </div>
            <div className="text-[10px] text-white font-black">${(flow.volumeUSD24h / 1000).toFixed(0)}K</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="size-4 rounded bg-white/5 flex items-center justify-center">
                <Globe className="size-2.5 text-gray-500" />
              </div>
              <span className="text-[10px] text-white/70 font-bold uppercase">{flow.source.label}</span>
            </div>
            <ArrowRight className="size-3 text-gold/30" />
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-white/70 font-bold uppercase">{flow.target.label}</span>
              <div className="size-4 rounded bg-white/5 flex items-center justify-center">
                <Zap className="size-2.5 text-gold" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlowDataTable;
