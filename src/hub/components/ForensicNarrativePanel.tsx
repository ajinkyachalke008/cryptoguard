// src/hub/components/ForensicNarrativePanel.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ShieldAlert, Terminal, ChevronRight, Activity, Zap } from 'lucide-react';
import { ForensicNarrative } from '../services/intelligentForensics.service';

interface ForensicNarrativePanelProps {
  narrative: ForensicNarrative | null;
  isLoading: boolean;
}

export const ForensicNarrativePanel: React.FC<ForensicNarrativePanelProps> = ({ narrative, isLoading }) => {
  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 space-y-6"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="size-24 rounded-full border-2 border-dashed border-gold/20 flex items-center justify-center"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="text-gold size-10 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">ARIA_THINKING</h3>
              <p className="text-[10px] text-gold font-bold uppercase tracking-[0.3em] animate-pulse">Deconstructing Behavioral Signatures...</p>
            </div>
          </motion.div>
        ) : narrative ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 text-gold mb-2">
               <Zap className="size-4 animate-bounce" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live_Intelligence_Feed</span>
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
              {narrative.title}
            </h2>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/5 font-mono text-sm text-blue-100 leading-relaxed relative">
              <Terminal className="absolute top-4 right-4 text-white/5 size-12" />
              <span className="text-gold mr-2 font-black">&gt;</span>
              {narrative.summary}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {narrative.incidents.map((incident, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{incident}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
               <div className="flex items-center space-x-2 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
                 <ShieldAlert size={12} />
                 <span>Risk_Assessment</span>
               </div>
               <p className="text-xs text-gray-400 font-bold leading-relaxed italic">
                 "{narrative.riskAssessment}"
               </p>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Tactical_Recommendation</div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gold/10 border border-gold/20">
                 <p className="text-xs text-gold font-black uppercase">{narrative.recommendation}</p>
                 <ChevronRight className="text-gold size-4" />
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4"
          >
            <Activity className="size-12 text-white/10" />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
              Generate an intelligence report to activate Aria's forensic storytelling engine.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
