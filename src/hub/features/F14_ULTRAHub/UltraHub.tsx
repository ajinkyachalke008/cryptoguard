// src/hub/features/F14_ULTRAHub/UltraHub.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuantumFlow } from '../../shared/QuantumFlow';
import { CyberRadar } from '../../shared/CyberRadar';
import { ThreatGlobe } from '../../shared/ThreatGlobe';
import { DreadnoughtGrid } from '../../shared/DreadnoughtGrid';
import { NeuralSync } from '../../shared/NeuralSync';
import { GlyphDNA } from '../../shared/GlyphDNA';
import { Shield, Zap, Target, Activity, Database, Fingerprint, Terminal, Grid3X3, Cpu, Radio, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react';
import { HubCard } from '../../shared/HubCard';
import { useRouter } from 'next/navigation';

const UltraHub: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const sequence = ["LINKING_CORE...", "DECRYPTING_DAG...", "RADAR_SYNC_COMPLETE.", "UPLINK_STABLE."];
    let i = 0;
    const interval = setInterval(() => {
      if(i < sequence.length) { setLogs(prev => [...prev.slice(-3), sequence[i]]); i++; }
      else clearInterval(interval);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-12 space-y-16 relative overflow-hidden">
      {/* Background HUD Grid */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-10" />
      
      {/* Top Header Section */}
      <header className="flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
         <div className="space-y-8">
            <div className="flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[12px] font-black text-gold uppercase tracking-[0.5em] animate-pulse w-fit">
               <Shield size={18} /> INSTITUTIONAL_OVERRIDE_ACTIVE
            </div>
            <h1 className="text-[10rem] font-black italic uppercase tracking-tighter leading-[0.8]">
               ULTRA<br/><span className="text-gold">HUB</span>
            </h1>
            <p className="max-w-xl text-xl text-gray-400 font-medium leading-relaxed italic border-l-4 border-gold pl-10">
               Welcome to the Cryptoguard Command Bridge. Elite forensic interrogation system initialized. Authorized access only.
            </p>
         </div>

         <div className="w-full lg:w-[500px] space-y-6">
            <div className="p-10 bg-white/5 border border-white/10 rounded-[4rem] backdrop-blur-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Terminal size={120} /></div>
               <div className="flex justify-between items-center text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                  <span>System Diagnostics</span>
                  <Activity className="text-gold size-4 animate-pulse" />
               </div>
               <div className="space-y-3 font-mono text-[11px] text-gray-400">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4">
                       <span className="text-gold/40">[{new Date().toLocaleTimeString()}]</span>
                       <span className="text-emerald-400 font-bold">{log}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex gap-4">
                <button 
                   onClick={() => router.push("/scanner")}
                   className="flex-1 py-5 bg-black text-gold rounded-full font-black uppercase text-xs tracking-[0.5em] shadow-2xl hover:bg-white hover:text-black transition-all"
                >
                   START_COMMAND_LINK
                </button>
                <button 
                   onClick={() => router.push("/reports")}
                   className="flex-1 py-5 bg-black/40 border border-gold/20 text-gold rounded-full font-black uppercase text-xs tracking-[0.5em] hover:bg-gold hover:text-black transition-all"
                >
                   GENERATE_REPORT
                </button>
             </div>
         </div>
      </header>

      {/* Sector Scan Overlays */}
      <div className="fixed inset-0 pointer-events-none z-50">
         <div className="absolute top-0 right-0 p-8 text-[10px] font-mono text-gold/20 flex flex-col items-end uppercase tracking-[0.4em]">
            <span>SECTOR_07: ACTIVE</span>
            <span>UPLINK_DELAY: 4MS</span>
         </div>
         <div className="absolute bottom-0 left-0 p-8 text-[10px] font-mono text-gold/20 uppercase tracking-[0.4em]">
            COORD: 34.0522° N, 118.2437° W
         </div>
      </div>

      {/* Main Command Grid */}
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.15 } }
        }}
        className="relative z-10"
      >
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Row 1: The Core Viewports */}
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-8 h-[700px]">
               <ThreatGlobe />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-4 h-[700px] flex flex-col gap-12">
               <div className="flex-1 overflow-hidden"><CyberRadar /></div>
               <div className="p-8 bg-black/60 border border-gold/20 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><AlertTriangle size={60} /></div>
                  <div className="text-[10px] text-red-500 font-black uppercase mb-4 tracking-[0.3em]">Institutional_Protocol</div>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed italic border-l-2 border-red-500/40 pl-4">
                     All viewports are synced to Government High-Res OSINT feeds. Anomalous pings will trigger central neural containment.
                  </p>
               </div>
            </motion.div>

            {/* Row 2: Secondary Interrogators */}
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-6 h-[600px]">
               <QuantumFlow />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-6 h-[600px]">
               <DreadnoughtGrid />
            </motion.div>

            {/* Row 3: AI & Behavioral Bio-Security */}
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-7 h-[600px]">
               <NeuralSync />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-5 h-[600px]">
               <GlyphDNA />
            </motion.div>

            {/* Status Monitoring Bar */}
            <div className="lg:col-span-12">
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-10 bg-gold/5 border border-gold/40 rounded-[4rem] flex flex-wrap gap-12 items-center justify-between"
               >
                  <div className="flex gap-12">
                     <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Risk Index</div>
                        <div className="text-3xl font-black italic text-red-500 uppercase">High_Alert</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Node Connectivity</div>
                        <div className="text-3xl font-black italic text-emerald-500 uppercase">Sycnhronized</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Forensic Uptime</div>
                        <div className="text-3xl font-black italic text-white uppercase">99.98%</div>
                     </div>
                  </div>
                  
                  <div className="flex gap-4">
                     {[Shield, Zap, Radio, Target, Activity].map((Icon, idx) => (
                        <div key={idx} className="size-16 rounded-3xl bg-black border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all cursor-crosshair">
                           <Icon size={24} />
                        </div>
                     ))}
                  </div>
               </motion.div>
            </div>
         </div>

         {/* Permanent Footer Action Grid */}
         <div className="absolute bottom-12 left-12 z-20 flex gap-4">
            <button 
               onClick={() => router.push("/reports")}
               className="px-8 py-3 bg-gold text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl shadow-gold/20"
            >
               Export_TraceGraph
            </button>
            <button 
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
            >
               Back_To_Top
            </button>
         </div>
      </motion.main>
    </div>
  );
};

export default UltraHub;
