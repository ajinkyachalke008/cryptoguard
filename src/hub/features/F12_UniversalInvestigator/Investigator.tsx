// src/hub/features/F12_UniversalInvestigator/Investigator.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Activity, Globe, Radar, Briefcase, FileText, Share2, Download, Terminal, BrainCircuit, AlertTriangle, Fingerprint, Network, Zap, Target, Cpu, Database } from 'lucide-react';
import { useHubStore } from '../../HubStore';
import { InvestigationService, IntelligenceDossier } from '../../services/investigation.service';
import { AttributedValue } from '../../shared/AttributedValue';
import { HubBadge } from '../../shared/HubBadge';
import { KNOWN_ENTITIES } from '../../osint/osint.constants';
import { DossierToolkit } from '../../reports/components/DossierToolkit';
import { ThreatGlobe } from '../../shared/ThreatGlobe';
import { useRouter } from 'next/navigation';

const InvestigatorPage: React.FC = () => {
  const { selectedChain } = useHubStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<IntelligenceDossier | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (loading) {
       const sequence = ["LINKING_CORE...", "DECRYPTING_DAG...", "PROBING_NODES...", "UPLINK_STABLE."];
       let i = 0;
       const interval = setInterval(() => {
         if(i < sequence.length) { setLogs(prev => [...prev.slice(-3), sequence[i]]); i++; }
         else clearInterval(interval);
       }, 600);
       return () => clearInterval(interval);
    } else {
       setLogs([]);
    }
  }, [loading]);

  const performInvestigation = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const result = await InvestigationService.queryUniversal(query, selectedChain);
      setDossier(result);
      import('../../services/vault.service').then(({ VaultService }) => {
        VaultService.saveCase(result);
      });
    } catch (err) {
      console.error("Investigation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-[1700px] mx-auto pb-40 relative">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      {/* Search Header - Refactored for ULTRA Theme */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative p-16 rounded-[4rem] bg-black/60 border border-gold/40 shadow-[0_0_100px_rgba(255,215,0,0.05)] overflow-hidden">
        <div className="absolute inset-0 opacity-30 mix-blend-screen scale-110">
           <ThreatGlobe />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[12px] font-black text-gold uppercase tracking-[0.5em] animate-pulse w-fit">
              <Fingerprint size={18} /> UNIVERSAL_PROBE_V6.0
            </div>
            <h1 className="text-9xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">
              ELITE<br/><span className="text-gold">PROBE</span>
            </h1>
            <p className="max-w-xl text-lg text-gray-400 font-medium leading-relaxed italic border-l-4 border-gold pl-10">
               Inject target identification protocols to initiate deep-state forensic cluster interrogations.
            </p>
          </div>

          <div className="w-full lg:w-[600px] space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gold/40 to-yellow-600/40 rounded-[2.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000" />
              <div className="relative flex items-center">
                <Search className="absolute left-10 text-gold size-8" />
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performInvestigation()}
                  placeholder="Inject Address / TXID / ENS / Domain..."
                  className="w-full bg-black/90 border-2 border-white/10 rounded-[2.5rem] pl-24 pr-12 py-8 text-2xl text-white outline-none focus:border-gold/50 transition-all font-mono"
                />
              </div>
            </div>
            <button 
              onClick={performInvestigation}
              disabled={loading}
              className="w-full bg-gold text-black py-8 rounded-[2.5rem] font-black uppercase text-xl tracking-[0.4em] hover:bg-white transition-all shadow-[0_0_60px_rgba(255,215,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-6"
            >
              {loading ? <Activity className="animate-spin size-8" /> : <Terminal className="size-8" />}
              {loading ? 'ANALYZING_CLUSTER...' : 'INITIATE_FORENSIC_SYNC'}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-12">
             <div className="relative size-64">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-[8px] border-t-gold border-white/5" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute inset-8 rounded-full border-[8px] border-t-yellow-600 border-white/5" />
                <div className="absolute inset-0 flex items-center justify-center text-gold"><Cpu className="size-24 animate-pulse" /></div>
             </div>
             <div className="text-center space-y-6">
                <div className="text-4xl font-black text-white italic uppercase tracking-tighter">Aggregating Global OSINT Tethers</div>
                <div className="flex flex-col gap-2 items-center">
                  {logs.map((log, i) => (
                    <div key={i} className="text-[12px] font-mono text-emerald-400 font-bold uppercase tracking-[0.3em]">{">"} {log}</div>
                  ))}
                </div>
             </div>
          </div>
        ) : dossier ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Profile & Security */}
            <div className="lg:col-span-4 space-y-12">
               {/* Use glass-card utility */}
              <div className="glass-card p-10 rounded-[4rem] border-gold/20 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Fingerprint size={120} /></div>
                <div className="flex justify-between items-center text-gray-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">
                  <span>Digital Identifier Dossier</span>
                  <Database className="text-gold size-5" />
                </div>
                
                <div className="space-y-8">
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 relative group/item">
                     <div className="flex justify-between items-start mb-4">
                        <div className="text-[10px] text-gray-500 font-black uppercase">Primary Identifier</div>
                        {KNOWN_ENTITIES[dossier.entity.address] && (
                           <div className="px-4 py-1 bg-gold/10 border border-gold/40 text-[9px] text-gold font-black uppercase tracking-tighter">Verified: {KNOWN_ENTITIES[dossier.entity.address].name}</div>
                        )}
                     </div>
                     <div className="text-xl font-mono text-white break-all mb-6 leading-relaxed">{dossier.entity.address}</div>
                     <div className="flex flex-wrap gap-3">
                        <HubBadge variant="gold">{KNOWN_ENTITIES[dossier.entity.address]?.type || dossier.entity.type}</HubBadge>
                        <HubBadge variant="gray">{dossier.entity.chain.toUpperCase()}</HubBadge>
                        {dossier.entity.tags.map(tag => <HubBadge key={tag} variant="gray">{tag}</HubBadge>)}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <AttributedValue label="Compliance Status" value={dossier.security.isSanctioned ? 'LISTED' : 'CLEARED'} source="OFAC_Treasury_SDN" valueClassName={dossier.security.isSanctioned ? 'text-red-500 font-black' : 'text-emerald-400 font-black'} />
                     <AttributedValue label="Investigation ID" value={dossier.entity.isDeterministic ? `ESI_${dossier.entity.address.slice(2, 8).toUpperCase()}` : `LIVE_${dossier.entity.address.slice(2, 8).toUpperCase()}`} source="ARIA_System_Registry" valueClassName="text-gold font-black" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-10 rounded-[4rem] border-gold/20 space-y-8">
                 <div className="flex justify-between items-center text-gray-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">
                   <span>Risk Analysis Vectors</span>
                   <Shield className="text-gold size-5" />
                 </div>
                 <div className="space-y-4">
                    {dossier.security.maliciousFlags.length > 0 && (
                      <div className="mb-8 space-y-3">
                        <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.5em] flex items-center gap-3">
                          <Activity className="size-4 animate-pulse" /> LIVE_THREAT_FEED
                        </div>
                        {dossier.security.maliciousFlags.map((flag, idx) => (
                          <div key={idx} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-400 font-mono italic flex gap-3">
                            <span className="text-red-500 font-black">!</span> {flag}
                          </div>
                        ))}
                      </div>
                    )}

                    {dossier.security.riskAnalysis ? (
                      Object.entries(dossier.security.riskAnalysis).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/20 transition-all">
                           <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                           <span className={`text-[11px] font-black font-mono px-3 py-1 rounded-lg ${val === '1' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                             {val === '1' ? 'FLAGGED' : 'CLEARED'}
                           </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 text-gray-600 italic text-sm font-medium">No significant high-risk vectors detected in global cluster scan.</div>
                    )}
                 </div>
              </div>
            </div>

            {/* Right Column: Financials & Synthesis */}
            <div className="lg:col-span-8 space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="glass-card p-12 rounded-[5rem] border-emerald-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={140} className="text-emerald-500" /></div>
                     <AttributedValue 
                       label="Capital Index Estimation" 
                       value={`$${dossier.financials.netWorth.toLocaleString()}`} 
                       source="MORALIS_CAPITAL_V3" 
                       valueClassName="text-6xl font-black text-white italic tracking-tighter"
                     />
                     <div className="mt-12 space-y-4">
                        <div className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em] mb-6">Asset Allocation Matrix</div>
                        {dossier.financials.assets.slice(0, 5).map((asset, i) => (
                           <div key={i} className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/10 hover:bg-emerald-500/5 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="size-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-black uppercase">{asset.symbol?.slice(0,2)}</div>
                                 <span className="text-sm font-black text-white uppercase tracking-widest">{asset.symbol}</span>
                              </div>
                              <span className="text-sm font-mono text-emerald-400 font-black underline decoration-emerald-500/20 underline-offset-4">${parseFloat(asset.usd_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="glass-card p-12 rounded-[5rem] border-cyan-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={140} className="text-cyan-500" /></div>
                     <AttributedValue 
                       label="Signal Frequency" 
                       value={`${dossier.financials.history.length} Events`} 
                       source="UNIVERSAL_PULSE_V3" 
                       valueClassName="text-6xl font-black text-white italic tracking-tighter"
                     />
                     <div className="mt-12 space-y-4">
                        <div className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em] mb-6">Behavioral Flow Logs</div>
                        {dossier.financials.history.slice(0, 5).map((tx: any, i: number) => (
                           <div key={i} className="bg-black/40 p-5 rounded-2xl border border-white/10 text-[11px] flex justify-between items-center group/log hover:bg-cyan-500/5 transition-all">
                              <div className="flex flex-col gap-1">
                                 <span className="text-cyan-400 font-black uppercase tracking-widest">Transfer Detected</span>
                                 <span className="text-gray-600 font-mono text-[9px]">{tx.hash.slice(0, 16)}...</span>
                              </div>
                              <span className="text-gray-500 font-mono font-bold bg-white/5 px-3 py-1 rounded-lg">{new Date(tx.block_timestamp || Date.now()).toLocaleDateString()}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="glass-card p-16 rounded-[4rem] border-gold/40 relative overflow-hidden group">
                  <div className="absolute -inset-20 bg-gold/5 blur-[80px] pointer-events-none" />
                  <div className="flex items-start gap-12 relative z-10">
                     <div className="size-32 rounded-[3rem] bg-gold border-4 border-black flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(255,215,0,0.3)] animate-pulse">
                        <BrainCircuit className="size-16 text-black" />
                     </div>
                     <div className="space-y-8 flex-1">
                        <div className="flex justify-between items-center">
                           <div className="text-3xl font-black text-white italic uppercase tracking-tighter">ARIA INTELLIGENCE SYNTHESIS</div>
                           <div className="px-5 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">STATUS: VERIFIED</div>
                        </div>
                        <p className="text-lg text-gray-400 font-medium leading-[1.8] italic border-l-4 border-gold pl-10">
                           Entity interrogation completed across multi-chain endpoints. Preliminary structural analysis indicates a {dossier.security.riskScore < 30 ? 'low-risk profile' : dossier.security.riskScore < 70 ? 'moderate-risk profile' : 'significant cluster threat'} with established nodes detected on {dossier.entity.chain.toUpperCase()}. Capital velocity is rated {dossier.financials.netWorth > 10000 ? 'COMMAND_TIER' : 'NOMINAL_TIER'}.
                        </p>
                        <div className="pt-10 border-t border-white/10">
                           <DossierToolkit dossier={dossier} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-60 border-4 border-dashed border-white/5 rounded-[5rem] bg-white/2 cursor-crosshair group relative overflow-hidden">
             <div className="absolute inset-0 bg-gold/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             <div className="size-48 bg-white/5 rounded-full flex items-center justify-center mb-12 relative group-hover:scale-110 transition-transform duration-700">
                <Radar className="text-gold/20 group-hover:text-gold size-24 animate-[pulse_3s_infinite]" />
                <div className="absolute -inset-4 rounded-full border-2 border-gold/10 animate-[ping_4s_infinite]" />
             </div>
             <div className="text-center space-y-6 relative z-10">
               <h3 className="text-5xl font-black text-white/10 group-hover:text-white/40 transition-colors uppercase italic tracking-[0.8em]">Awaiting Uplink</h3>
               <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-sm italic">Inject credentials to initiate global cross-chain interrogation</p>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestigatorPage;
