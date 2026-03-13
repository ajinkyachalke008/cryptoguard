// src/hub/features/F9_GlobalPulse/components/ChainFlowSummary.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ChainFlowSummary: React.FC = () => {
  const summaries = [
    { chain: 'Ethereum', netFlow: '+12.5M', trend: 'up' },
    { chain: 'Solana', netFlow: '-4.2M', trend: 'down' },
    { chain: 'BSC', netFlow: '+8.1M', trend: 'up' },
    { chain: 'Polygon', netFlow: '+1.4M', trend: 'up' }
  ];

  return (
    <div className="flex space-x-4">
      {summaries.map(s => (
        <div key={s.chain} className="px-4 py-2 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-end">
          <div className="text-[8px] text-gray-600 font-bold uppercase mb-0.5">{s.chain}</div>
          <div className="flex items-center space-x-2">
             <span className={`text-[10px] font-black ${s.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{s.netFlow}</span>
             {s.trend === 'up' ? <TrendingUp className="size-3 text-green-500/50" /> : <TrendingDown className="size-3 text-red-500/50" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChainFlowSummary;
