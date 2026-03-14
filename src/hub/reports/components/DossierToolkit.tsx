// src/hub/reports/components/DossierToolkit.tsx
'use client'
import React from 'react';
import { FileText, Share2, Download, Zap } from 'lucide-react';
import { ExportButton } from './ExportButton';
import { ShareButton } from './ShareButton';
import { IntelligenceDossier } from '../../services/investigation.service';

interface Props {
  dossier: IntelligenceDossier;
}

export const DossierToolkit: React.FC<Props> = ({ dossier }) => {
  return (
    <div className="relative group">
      {/* Animated Glow Border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 via-cyan-500/50 to-purple-600/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      
      <div className="relative flex items-center bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-1.5 overflow-hidden">
        {/* Core Action: PDF Export */}
        <div className="flex-1 flex items-center px-4 py-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group/export">
          <ExportButton 
            dossier={dossier} 
            label="GENERATE_OFFICIAL_DOSSIER" 
            className="!text-[11px] !font-black !tracking-[0.1em] text-white flex items-center gap-3"
          />
          <div className="ml-auto flex items-center gap-2 text-[9px] font-bold text-gold/40 group-hover/export:text-gold transition-colors">
            <Download className="size-3" />
            <span>PDF_V5.0</span>
          </div>
        </div>

        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* Secondary Action: Instant Share */}
        <div className="flex items-center gap-1 pr-2">
            <ShareButton 
              dossier={dossier} 
              label="SHARE"
              className="px-4 py-2 hover:bg-white/5 rounded-xl !text-[11px] !font-black !text-gold"
            />
            <div className="p-2 text-cyan-500/40 animate-pulse">
                <Zap className="size-3" />
            </div>
        </div>
      </div>
      
      {/* Tooltip hint */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <div className="bg-gold text-black text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)] tracking-tighter">
          Institutional Toolkit Active
        </div>
      </div>
    </div>
  );
};
