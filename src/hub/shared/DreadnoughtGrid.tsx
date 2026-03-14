// src/hub/shared/DreadnoughtGrid.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, Lock, AlertTriangle, Scan, Search, ShieldAlert, Cpu } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const DreadnoughtGrid: React.FC = () => {
  const [cells, setCells] = useState<boolean[]>(new Array(100).fill(false));
  const [lockedCells, setLockedCells] = useState<Set<number>>(new Set());
  const [isLocking, setIsLocking] = useState(false);

  const toggleCell = (idx: number) => {
    if (isLocking) return;
    const newCells = [...cells];
    newCells[idx] = !newCells[idx];
    setCells(newCells);
  };

  const initiateContainment = () => {
    setIsLocking(true);
    const selected = cells.map((active, idx) => active ? idx : -1).filter(i => i !== -1);
    
    // Simulate staggered lockdown
    selected.forEach((idx, i) => {
      setTimeout(() => {
        setLockedCells(prev => new Set([...prev, idx]));
        if (i === selected.length - 1) {
           setTimeout(() => {
             setIsLocking(false);
             setCells(new Array(100).fill(false));
           }, 1000);
        }
      }, i * 50);
    });
  };

  const clearContainment = () => {
    setLockedCells(new Set());
    setCells(new Array(100).fill(false));
  };

  return (
    <div className="w-full h-full relative group bg-black rounded-[4rem] border-2 border-red-500/20 overflow-hidden cursor-crosshair shadow-[0_0_100px_rgba(239,68,68,0.05)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent)]" />
      
      {/* HUD Elements */}
      <div className="absolute top-12 left-12 z-20 pointer-events-none">
         <div className="flex items-center gap-3 px-6 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-4 animate-pulse">
            <ShieldAlert size={14} /> DREADNOUGHT_CONTAINMENT_V9.2
         </div>
         <h3 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
            TACTICAL <br/><span className="text-red-500 font-black italic">GRID_SCAN</span>
         </h3>
         <div className="text-[10px] text-gray-500 font-mono font-bold tracking-[0.3em] uppercase italic bg-black/40 px-3 py-1 rounded w-fit">Status: Combat_Mode // Authorization: OMEGA</div>
      </div>

      <div className="absolute bottom-12 right-12 z-20 text-right">
         <div className="text-[10px] text-red-400 font-black uppercase tracking-widest flex items-center gap-2 justify-end mb-2">
            THREAT_LEVEL: OMEGA <div className="size-2 bg-red-500 rounded-full animate-ping" />
         </div>
         <div className="text-[8px] text-gray-700 font-black uppercase tracking-[0.5em]">Forensic Active Mitigation v4.0</div>
      </div>

      {/* Interactive Grid */}
      <div className="absolute inset-x-20 inset-y-40 grid grid-cols-10 gap-2 opacity-80 scale-90">
         {cells.map((active, i) => {
            const isLocked = lockedCells.has(i);
            return (
               <motion.div 
                 key={i}
                 onClick={() => toggleCell(i)}
                 whileHover={{ scale: 1.1 }}
                 className={`aspect-square rounded border-2 transition-all duration-300 relative overflow-hidden group/cell
                   ${isLocked ? 'bg-red-500 border-red-600 shadow-[0_0_20px_rgba(239,68,68,1)]' : 
                     active ? 'bg-gold/40 border-gold shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 
                     'bg-white/5 border-white/10 hover:border-gold/30'}`}
               >
                  {(active || isLocked) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                       {isLocked ? <Lock size={12} className="text-white" /> : <Target size={12} className="text-gold" />}
                    </motion.div>
                  )}
                  {/* Scanline for cell */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px] opacity-20" />
               </motion.div>
            );
         })}
      </div>

      <div className="absolute bottom-12 left-12 z-20 flex gap-4">
         <Button 
           onClick={initiateContainment} 
           disabled={isLocking || cells.every(c => !c)}
           className="h-14 px-10 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-black hover:text-red-500 transition-all shadow-2xl flex items-center gap-4 border-2 border-red-600"
         >
            <Shield size={20} className={isLocking ? 'animate-pulse' : ''} />
            {isLocking ? 'EXECUTING_CONTAINMENT...' : 'TRIGGER_GRID_LOCKDOWN'}
         </Button>
         <Button 
           onClick={clearContainment}
           variant="outline"
           className="h-14 px-10 border-white/10 bg-black/40 text-gray-400 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white/5"
         >
            PURGE_GRID
         </Button>
      </div>

      {/* Cyber Noise Backdrop */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
};
