// src/hub/reports/components/ReportConfigModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, X, Check, ArrowRight } from 'lucide-react';
import { Classification, ReportConfig } from '../reports.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ReportConfig) => void;
  isGenerating: boolean;
}

export const ReportConfigModal: React.FC<Props> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [classification, setClassification] = React.useState<Classification>('CONFIDENTIAL');
  
  const classifications: Classification[] = [
    'UNCLASSIFIED', 'CONFIDENTIAL', 'RESTRICTED', 'FOR LAW ENFORCEMENT', 'INTERNAL USE ONLY'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#0A0E1A] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(0,188,212,0.1)] overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5"><Shield className="size-40 text-cyan-500" /></div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Generate Audit Dossier</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Institutional Intelligence Output v5.0</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500"><X className="size-6" /></button>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em]">Select Classification Level</div>
              <div className="grid grid-cols-1 gap-2">
                {classifications.map((c) => (
                  <button
                    key={c}
                    onClick={() => setClassification(c)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      classification === c 
                        ? 'bg-cyan-500/10 border-cyan-500 text-white' 
                        : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{c}</span>
                    {classification === c && <Check className="size-4 text-cyan-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-gold">
                <FileText className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Report Composition</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-bold uppercase">
                <div>• EXECUTIVE SUMMARY</div>
                <div>• AML RISK ANALYSIS</div>
                <div>• CAPITAL FORENSICS</div>
                <div>• SOURCE LINEAGE</div>
              </div>
            </div>

            <button
               onClick={() => onGenerate({
                 classification,
                 includeRawData: true,
                 includeCharts: true,
                 includeDataLineage: true,
                 includeAnalystCertification: true,
                 includeAppendix: false,
                 watermark: true
               })}
               disabled={isGenerating}
               className="w-full bg-cyan-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_30px_rgba(0,188,212,0.3)] flex items-center justify-center gap-3"
            >
              {isGenerating ? 'COMPILING_DOSSIER...' : 'GENERATE_FINAL_REPORT'}
              {!isGenerating && <ArrowRight className="size-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
