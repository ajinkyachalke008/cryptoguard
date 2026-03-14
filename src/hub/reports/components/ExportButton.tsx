// src/hub/reports/components/ExportButton.tsx
'use client'
import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { ReportConfigModal } from './ReportConfigModal';
import { CryptoGuardReportEngine } from '../engine/ReportEngine';
import { ReportDataCompiler } from '../engine/ReportDataCompiler';
import { DataLineageTracker } from '../engine/DataLineageTracker';
import { IntelligenceDossier } from '../../services/investigation.service';

interface Props {
  dossier: IntelligenceDossier;
  label?: string;
  className?: string;
}

export const ExportButton: React.FC<Props> = ({ dossier, label = 'Export_Gov_Report', className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (config: any) => {
    setIsGenerating(true);
    try {
      const tracker = new DataLineageTracker();
      
      // Wrap data aggregation with tracking
      const reportData = await tracker.wrap(
        'Aggregated Intelligence Synthesis',
        'MultiSource_API_Matrix',
        '/hub/investigator/aggregation',
        () => ReportDataCompiler.compileWalletData(dossier, config.classification, 'Analyst_AJ', tracker)
      );

      const engine = new CryptoGuardReportEngine();
      await engine.generate(reportData);
      
      const filename = `CryptoGuard_Dossier_${dossier.entity.address.slice(0, 8)}.pdf`;
      engine.save(filename);
      
      setIsModalOpen(false);
    } catch (err) {
      console.error("REPORT_GENERATION_CRITICAL_FAILURE:", err);
      alert("Institutional Report Generation Failed. Check Console for Lineage logs.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-[0.2em] hover:text-white transition-all ${className}`}
      >
        {isGenerating ? <Loader2 className="size-3 animate-spin"/> : <FileText className="size-3" />} 
        {isGenerating ? 'Compiling...' : label}
      </button>

      <ReportConfigModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </>
  );
};
