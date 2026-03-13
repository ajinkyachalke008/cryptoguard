// src/hub/features/F2_WalletScanner/components/ForensicGraph.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Database, User, ArrowRight } from 'lucide-react';

interface ForensicGraphProps {
  centerAddress: string;
}

const ForensicGraph: React.FC<ForensicGraphProps> = ({ centerAddress }) => {
  const neighbors = [
    { label: 'Exchanges', icon: <Database className="size-4" />, x: -140, y: -60, color: 'text-blue-400' },
    { label: 'DEX Routers', icon: <Database className="size-4" />, x: -140, y: 60, color: 'text-purple-400' },
    { label: 'Layer 2', icon: <Database className="size-4" />, x: 140, y: -60, color: 'text-indigo-400' },
    { label: 'Privacy Mixer', icon: <Database className="size-4" />, x: 140, y: 60, color: 'text-red-400' },
  ];

  return (
    <div className="relative h-[300px] w-full bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.05)_0%,transparent_70%)]" />
      
      {/* Visual Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {neighbors.map((n, i) => (
          <motion.line
            key={i}
            x1="50%"
            y1="50%"
            x2={`calc(50% + ${n.x}px)`}
            y2={`calc(50% + ${n.y}px)`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 1.5, delay: i * 0.2 }}
          />
        ))}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffcc00" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Node */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative z-10 size-16 rounded-2xl bg-gold flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.5)] border-2 border-white/20"
      >
        <User className="text-black size-8" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
          TARGET_NODE
        </div>
      </motion.div>

      {/* Neighbor Nodes */}
      {neighbors.map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ x: n.x, y: n.y, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
          className="absolute z-10 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-3 group hover:border-white/30 transition-all"
        >
          <div className={n.color}>{n.icon}</div>
          <div className="text-left">
            <div className="text-[10px] font-black text-white leading-none mb-1">{n.label}</div>
            <div className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">IDENTIFIED</div>
          </div>
        </motion.div>
      ))}

      {/* Scan Beam */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 w-full h-[2px] bg-gradient-to-r from-gold/40 to-transparent -translate-y-1/2 origin-left" />
      </motion.div>
    </div>
  );
};

export default ForensicGraph;
