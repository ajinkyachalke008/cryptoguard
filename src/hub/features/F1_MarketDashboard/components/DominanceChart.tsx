// src/hub/features/F1_MarketDashboard/components/DominanceChart.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface DominanceData {
  symbol: string;
  percentage: number;
  color: string;
}

const DominanceChart: React.FC<{ data: DominanceData[] }> = ({ data }) => {
  return (
    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Global Allocation</h2>
          <h3 className="text-xl font-black text-white tracking-tighter">MARKET_DOMINANCE</h3>
        </div>
        <div className="flex space-x-1">
          {data.map((d) => (
            <div key={d.symbol} className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
          ))}
        </div>
      </div>

      <div className="relative h-4 mt-8 flex rounded-full overflow-hidden bg-white/5 border border-white/10">
        {data.map((d, i) => (
          <motion.div
            key={d.symbol}
            initial={{ width: 0 }}
            animate={{ width: `${d.percentage}%` }}
            transition={{ duration: 1, delay: i * 0.1 }}
            className="h-full relative group"
            style={{ backgroundColor: d.color }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap z-50">
              {d.symbol}: {d.percentage.toFixed(1)}%
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {data.map((d) => (
          <div key={d.symbol} className="flex items-center space-x-3">
            <div className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">{d.symbol}</div>
              <div className="text-sm font-black text-white">{d.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DominanceChart;
