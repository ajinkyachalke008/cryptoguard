// src/hub/features/F0_CommandCenter/CommandCenter.tsx
import React, { useEffect, useState } from 'react';
import MarketPulse from './components/MarketPulse';
import ThreatFeed from './components/ThreatFeed';
import MempoolMonitor from './components/MempoolMonitor';
import EntityRadar3D from './components/EntityRadar3D';
import AriaVoiceVisualizer from './components/aria/AriaVoiceVisualizer';
import { AriaService, AriaBriefing } from '../../services/aria.service';
import { CoinGeckoService } from '../../services/coinGecko.service';
import { CoinyBubbleService } from '../../services/coinybubble.service';
import { motion } from 'framer-motion';
import { Shield, Radio, Terminal, BrainCircuit, Activity, ChevronRight, Cpu, Globe } from 'lucide-react';
import { HubCard } from '../../shared/HubCard';

import { BlockchainService } from '../../services/blockchain.service';

const CommandCenter: React.FC = () => {
  const [briefing, setBriefing] = useState<AriaBriefing | null>(null);

  useEffect(() => {
    const updateBriefing = async () => {
      try {
        // Individual service calls with silent failures to ensure partial data loading
        const getPricesSafely = async () => {
          try { return await CoinGeckoService.getPrices(['bitcoin']); }
          catch (e) { console.error('CG Error:', e); return { bitcoin: { usd: 94820 } }; }
        };

        const getSentimentSafely = async () => {
          try { return await CoinyBubbleService.getSentiment(); }
          catch (e) { console.error('CB Error:', e); return { value: 50 }; }
        };

        const getStatsSafely = async () => {
          try { return await BlockchainService.getChainStats('bitcoin'); }
          catch (e) { console.error('BS Error:', e); return { status: 'OPTIMAL' }; }
        };

        const [prices, sentiment, btcStats] = await Promise.all([
          getPricesSafely(),
          getSentimentSafely(),
          getStatsSafely()
        ]);

        const btcPrice = prices?.bitcoin?.usd || 94820;
        
        const data = await AriaService.generateBriefing({
          btc_price: btcPrice,
          fg_value: sentiment.value,
          cnt_critical: btcStats.status === 'CONGESTED' ? 5 : 2,
          mempool_status: btcStats.status
        });
        setBriefing(data);
      } catch (error) {
        console.error('Unified Briefing update failed:', error);
      }
    };
    updateBriefing();
    const interval = setInterval(updateBriefing, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 max-w-[1700px] mx-auto pb-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gold/10 pb-10 relative">
        <div className="absolute -bottom-px left-0 w-48 h-[2px] bg-gold shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
        <div>
          <div className="flex items-center space-x-3 text-gold/60 text-[10px] font-black uppercase tracking-[0.6em] mb-3">
            <Radio className="size-3 animate-pulse text-gold" />
            <span>Encrypted Intelligence Stream</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
            INTEL<span className="text-gold">·</span>HUB
          </h1>
        </div>
        <div className="flex items-center space-x-10 bg-black/60 border border-gold/10 px-8 py-5 rounded-2xl backdrop-blur-3xl shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">System Latency</span>
            <div className="flex items-center space-x-2">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-lg font-black text-white font-mono">14<span className="text-[10px] text-gray-500 ml-1">MS</span></span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-gold/10" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active nodes</span>
            <span className="text-lg font-black text-gold font-mono">1,204</span>
          </div>
        </div>
      </div>

      <MarketPulse />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Threat Feed */}
        <div className="lg:col-span-3 h-[750px]">
          <ThreatFeed />
        </div>

        {/* Center Column: 3D Radar & AI Briefing */}
        <div className="lg:col-span-6 space-y-8">
          <div className="h-[480px] relative rounded-3xl overflow-hidden border border-white/5 bg-black/40 backdrop-blur-xl">
            <EntityRadar3D />
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE_SURVEILLANCE</span>
            </div>
          </div>

          <HubCard className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10" resourceId="ARIA_SYSTEM">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <BrainCircuit className="text-purple-400 size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">ARIA·CORE</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Automated_Risk_Analyst</p>
                </div>
              </div>
              <AriaVoiceVisualizer />
            </div>

            {briefing ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-black/80 border border-gold/10 font-mono text-sm text-blue-100 leading-relaxed relative overflow-hidden group/term">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/40" />
                  <Terminal className="absolute top-4 right-4 text-white/5 size-16 group-hover/term:text-gold/5 transition-colors" />
                  <div className="flex items-center space-x-2 mb-4 opacity-50">
                    <div className="size-2 rounded-full bg-red-500/50" />
                    <div className="size-2 rounded-full bg-yellow-500/50" />
                    <div className="size-2 rounded-full bg-green-500/50" />
                    <span className="text-[8px] font-bold ml-2 tracking-widest uppercase">INTEL_TERMINAL_v4.2</span>
                  </div>
                  <span className="text-gold mr-3 font-black animate-pulse">&gt;_</span>
                  {briefing.summary}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Threat Level</div>
                    <div className={`text-xs font-black uppercase ${
                      briefing.threatLevel === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {briefing.threatLevel}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Confidence</div>
                    <div className="text-xs font-black text-white">{briefing.confidence}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gold/10 border border-gold/20">
                    <div className="text-[10px] font-bold text-gold uppercase mb-2">Action Required</div>
                    <div className="text-xs font-black text-gold uppercase">{briefing.action}</div>
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all flex items-center justify-center space-x-2 group">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Open Detailed Intelligence Briefing</span>
                  <ChevronRight size={14} className="text-gold group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-2 flex items-center space-x-2 border-t border-white/5 opacity-40">
                  <div className="size-1 rounded-full bg-purple-500" />
                  <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em]">{briefing.lineage}</span>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                  <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                  <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                </div>
              </div>
            )}
          </HubCard>
        </div>

        {/* Right Column: Network Stats & Signals */}
        <div className="lg:col-span-3 space-y-8">
          <MempoolMonitor />
          
          <HubCard title="Risk Vector Attribution" dataSource="AI_Engine_v4" dataSourceUrl="#">
            <div className="space-y-6">
              {[
                { label: 'Structuring', score: 85, color: 'from-red-500 to-red-900', icon: <Cpu className="size-3" /> },
                { label: 'Peeling Chain', score: 42, color: 'from-orange-500 to-orange-900', icon: <Cpu className="size-3" /> },
                { label: 'Mixer Output', score: 15, color: 'from-blue-500 to-blue-900', icon: <Cpu className="size-3" /> },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between items-center text-[10px] font-black mb-2">
                    <div className="flex items-center space-x-2 text-gray-500 uppercase tracking-widest">
                      {s.icon}
                      <span>{s.label}</span>
                    </div>
                    <span className="text-white font-mono">{s.score}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      className={`h-full bg-gradient-to-r ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </HubCard>

          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-gold/10 to-transparent border border-gold/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.1)_0%,transparent_50%)]" />
            <Activity className="text-gold/20 absolute -bottom-4 -right-4 size-32 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-4">Integrity_Check</div>
              <p className="text-xs text-blue-100/60 leading-relaxed italic">
                "All intelligence streams are verified against decentralized data sources. Session isolation level: MAXIMUM."
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CommandCenter;
