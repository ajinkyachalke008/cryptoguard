// src/hub/osint/features/F1_Tracer/TransactionTracer.tsx
import React, { useState } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { Search, Share2, Download, RefreshCw, Activity, BrainCircuit, Sparkles, ArrowRight, Terminal } from 'lucide-react';
import { BitcoinOSINTService } from '../../services/blockchain/bitcoin.osint.service';
import { EthereumOSINTService } from '../../services/blockchain/ethereum.osint.service';
import { osintUtils } from '../../osint.utils';
import { TraceData } from '../../osint.types';
import NeoGalaxyCanvas from '../../../features/F6_OSINTBoard/components/NeoGalaxyCanvas';
import { IntelligentForensicsService, ForensicNarrative } from '../../../services/intelligentForensics.service';
import { ForensicNarrativePanel } from '../../../components/ForensicNarrativePanel';
import { motion } from 'framer-motion';

const TransactionTracer: React.FC = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TraceData | null>(null);
  
  // AI Narrative State
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
  const [narrative, setNarrative] = useState<ForensicNarrative | null>(null);

  const startTrace = async () => {
    if (!address) return;
    setLoading(true);
    setNarrative(null);
    try {
      let nodes: any[] = [{ id: address, label: osintUtils.maskAddress(address), type: 'root', isSanctioned: false }];
      let edges: any[] = [];
      let txs: any[] = [];

      if (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) {
        const btcRes = await BitcoinOSINTService.getTransactions(address);
        txs = btcRes?.slice(0, 10) || [];
        txs.forEach((tx: any) => {
           tx.vin.forEach((input: any) => {
             const sender = input.prevout?.scriptpubkey_address;
             if (sender && !nodes.find(n => n.id === sender)) nodes.push({ id: sender, label: osintUtils.maskAddress(sender), type: 'inflow' });
             if (sender) edges.push({ source: sender, target: address, amount: input.prevout?.value });
           });
        });
      } else if (address.startsWith('0x')) {
        const ethRes = await EthereumOSINTService.getTxList(address);
        txs = ethRes?.result?.slice(0, 10) || [];
        txs.forEach((tx: any) => {
          const target = tx.to === address.toLowerCase() ? tx.from : tx.to;
          if (!nodes.find(n => n.id === target)) {
            nodes.push({ id: target, label: osintUtils.maskAddress(target), type: tx.to === address.toLowerCase() ? 'inflow' : 'outflow' });
          }
          edges.push({ source: tx.from, target: tx.to, amount: tx.value });
        });
      }

      setData({ nodes, edges });
    } catch (error) {
      console.error('Trace failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNarrative = async () => {
    if (!data) return;
    setIsNarrativeLoading(true);
    try {
      const result = await IntelligentForensicsService.generateNarrative(data);
      setNarrative(result);
    } catch (error) {
      console.error('Narrative generation failed:', error);
    } finally {
      setIsNarrativeLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-250px)] p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-2">
        <div className="flex flex-1 items-center space-x-4 bg-black/40 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 size-4" />
            <input 
              type="text" 
              placeholder="Enter BTC/ETH Address to trace..." 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-white font-mono text-sm pl-12 py-3"
            />
          </div>
          <button 
            onClick={startTrace}
            disabled={loading}
            className="px-8 py-3 bg-gold text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(214,179,93,0.3)]"
          >
            {loading ? 'TRACING...' : 'START_TRACE'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
           <button 
            onClick={generateNarrative}
            disabled={!data || isNarrativeLoading}
            className={`px-6 py-3 border border-purple-500/30 rounded-xl flex items-center space-x-2 group transition-all ${
              !data ? 'opacity-30 cursor-not-allowed' : 'hover:bg-purple-500/10'
            }`}
           >
              <BrainCircuit className={`size-4 ${isNarrativeLoading ? 'animate-spin text-purple-400' : 'text-purple-500 group-hover:scale-110'}`} />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">AI_Forensic_Report</span>
           </button>
           <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Share2 size={16}/></button>
              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Download size={16}/></button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-6 relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/40 backdrop-blur-xl group">
          <NeoGalaxyCanvas nodes={data?.nodes || []} edges={data?.edges || []} />
          
          <div className="absolute top-6 left-6 flex items-center space-x-2 bg-black/80 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl z-20">
             <div className={`size-2 rounded-full ${loading ? 'bg-gold animate-ping' : 'bg-emerald-500'}`} />
             <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
               SIMULATION: {loading ? 'SYNCING' : 'IDLE_WAIT'}
             </span>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-black/80 via-black/40 to-purple-500/5 p-8 backdrop-blur-2xl overflow-y-auto custom-scrollbar relative shadow-2xl">
           <ForensicNarrativePanel narrative={narrative} isLoading={isNarrativeLoading} />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          <HubCard title="Audit Ledger" resourceId="TRACE_LEDGER" dataSource="OSINT_V3" className="flex-1 overflow-hidden flex flex-col">
             <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
               {data && data.edges.length > 0 ? (
                 data.edges.map((edge, i) => (
                   <motion.div 
                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                    key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all group relative overflow-hidden"
                   >
                     <div className="flex justify-between items-center mb-3">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">HOP_{i+1}</span>
                       <span className="text-[8px] font-mono text-gray-600">TX_VOL: {edge.amount}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white font-mono">{osintUtils.maskAddress(edge.source)}</span>
                        <ArrowRight className="size-3 text-gold/40" />
                        <span className="text-[10px] text-white font-mono">{osintUtils.maskAddress(edge.target)}</span>
                     </div>
                   </motion.div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                    <Terminal className="size-12 mb-4" />
                    <p className="text-[8px] font-black uppercase tracking-widest">No Active Ledger Stream</p>
                 </div>
               )}
             </div>
          </HubCard>
        </div>
      </div>
    </div>
  );
};

export default TransactionTracer;
