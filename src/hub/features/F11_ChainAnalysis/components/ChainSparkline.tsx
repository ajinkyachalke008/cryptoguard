// src/hub/features/F11_ChainAnalysis/components/ChainSparkline.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  color?: string;
}

const ChainSparkline: React.FC<SparklineProps> = ({ data, color = '#FFD700' }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 20 - ((val - min) / (range || 1)) * 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-8 overflow-hidden">
      <svg viewBox="0 0 100 20" className="w-full h-full preserve-3d">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <motion.polyline
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          fill="url(#lineGrad)"
          stroke="none"
          points={`0,20 ${points} 100,20`}
        />

        {/* The line */}
        <motion.polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* End pulse point */}
        <motion.circle
          cx="100"
          cy={20 - ((data[data.length - 1] - min) / (range || 1)) * 15}
          r="1"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </svg>
    </div>
  );
};

export default ChainSparkline;
