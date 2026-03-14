// src/hub/shared/CyberRadar.tsx
'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Zap, Radio, Globe, Terminal, Activity, Search, Scan, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const CyberRadar: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [pings, setPings] = useState<{ id: number; x: number; y: number; type: 'danger' | 'info'; label: string }[]>([]);
  const [isPulseScanning, setIsPulseScanning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
      if (Math.random() > 0.85) {
        setPings(prev => [...prev.slice(-4), {
          id: Date.now(),
          x: Math.random() * 70 + 15,
          y: Math.random() * 70 + 15,
          type: Math.random() > 0.7 ? 'danger' : 'info',
          label: ['WHALE_MOVE', 'LIQUIDITY_DROP', 'BOT_ATTACK', 'MIXER_HIT', 'BRIDGE_DRAIN'][Math.floor(Math.random() * 5)]
        }]);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const triggerDiagnosticPulse = useCallback(() => {
    setIsPulseScanning(true);
    // Create a wave of pings
    const newPings = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: 50 + Math.cos(i * Math.PI / 4) * 30,
      y: 50 + Math.sin(i * Math.PI / 4) * 30,
      type: 'danger' as const,
      label: 'VULNERABILITY_DETECTED'
    }));
    setPings(prev => [...prev, ...newPings]);
    setTimeout(() => setIsPulseScanning(false), 2000);
  }, []);

  return (
    <div className="w-full h-full relative group bg-black/95 border-2 border-gold/30 rounded-[4rem] overflow-hidden backdrop-blur-3xl p-1 p-px shadow-[0_0_100px_rgba(255,215,0,0.05)]">
       <div className="w-full h-full bg-[#050505] rounded-[3.9rem] flex items-center justify-center relative overflow-hidden">
          {/* Static Scanlines */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,215,0,0.1)_50%)] bg-[length:100%_4px]" />
          <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,1)]" />

          {/* Radar Circles */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
             {[85, 65, 45, 25].map(size => (
               <div key={size} className="absolute rounded-full border border-gold" style={{ width: `${size}%`, height: `${size}%` }} />
             ))}
             <div className="absolute w-full h-px bg-gold/40" />
             <div className="absolute w-px h-full bg-gold/40" />
          </div>

          {/* Sweep */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-gold/40 via-gold/1 to-transparent border-r-2 border-gold/60 shadow-[0_0_80px_rgba(255,215,0,0.1)]"
          />

          {/* Pulse Effect */}
          <AnimatePresence>
            {isPulseScanning && (
              <motion.div 
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute size-40 border-4 border-gold rounded-full z-30"
              />
            )}
          </AnimatePresence>

          {/* Pings */}
          <AnimatePresence>
            {pings.map(p => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: [1, 0], scale: [1, 5] }} 
                transition={{ duration: 3 }} 
                className="absolute flex flex-col items-center z-30" 
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                 <div className={`size-4 rounded-full ${p.type === 'danger' ? 'bg-red-500 shadow-[0_0_20px_#ef4444]' : 'bg-gold shadow-[0_0_20px_#ffd700]'}`} />
                 <span className="text-[8px] font-black text-white bg-black/90 mt-2 px-2 py-1 rounded border border-gold/40 uppercase tracking-widest whitespace-nowrap shadow-xl">{p.label}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* HUD Info */}
          <div className="absolute top-16 left-16 z-40 text-left">
             <div className="flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[10px] font-black text-gold uppercase tracking-[0.5em] mb-4 animate-pulse">
                <Radio size={14} /> SPECTRE_RADAR_UPLINK
             </div>
             <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                CYBER <span className="text-gold">RADAR</span>
             </h2>
             <div className="text-[10px] text-gray-500 font-mono font-bold tracking-[0.4em] uppercase italic bg-black/40 px-3 py-1 rounded w-fit">Status: Deep_Scan_Active // Latency: 9ms</div>
          </div>

          <div className="absolute bottom-16 left-16 z-50">
             <Button 
                onClick={triggerDiagnosticPulse}
                disabled={isPulseScanning}
                className="h-14 px-10 bg-gold text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white transition-all shadow-2xl flex items-center gap-4 group"
             >
                <Scan size={20} className={isPulseScanning ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'} />
                {isPulseScanning ? 'SCRUBBING_NETWORK...' : 'INITIATE_DIAGNOSTIC_PULSE'}
             </Button>
          </div>

          <div className="absolute bottom-16 right-16 text-right z-40 space-y-2">
             <div className="text-[10px] text-emerald-400 font-black font-mono tracking-widest uppercase flex items-center gap-3 justify-end italic">
                <div className="size-2 bg-emerald-500 rounded-full animate-ping" /> Global_Uptime: 99.998%
             </div>
             <div className="text-[8px] text-gray-700 font-black uppercase tracking-[0.6em]">Institutional Forensics Module V9.4</div>
          </div>
       </div>
    </div>
  );
};
