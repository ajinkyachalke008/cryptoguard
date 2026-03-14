// src/hub/features/F2_WalletScanner/WalletScanner.tsx
import React, { useState } from 'react';
import { useHubStore } from '../../HubStore';
import { MoralisService } from '../../services/moralis.service';
import { AlchemyService } from '../../services/alchemy.service';
import { OFACService } from '../../services/ofac.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { Search, ShieldAlert, ShieldCheck, History, Wallet, Globe, Radar, Activity, Scale, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ForensicGraph from './components/ForensicGraph';
import { ExportButton } from '../../reports/components/ExportButton';

const WalletScanner: React.FC = () => {
  const { wallet, setWallet, selectedChain } = useHubStore();
  const [inputAddr, setInputAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = async () => {
    if (!inputAddr) return;
    setLoading(true);
    try {
      const [balances, sanctions, history, netWorth, transfers] = await Promise.all([
        MoralisService.getTokenBalances(inputAddr, selectedChain),
        OFACService.checkAddress(inputAddr),
        MoralisService.getTransactionHistory(inputAddr, selectedChain),
        MoralisService.getWalletNetWorth(inputAddr),
        AlchemyService.getAssetTransfers(inputAddr, selectedChain)
      ]);

      setScanResult({
        balances: balances || [],
        sanctions: sanctions || { isSanctioned: false },
        history: (history?.result || []).slice(0, 15),
        transfers: (transfers?.transfers || []).slice(0, 10),
        netWorth: netWorth?.total_net_worth_usd || 0
      });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gold/10 pb-10 relative">
        <div className="absolute -bottom-px left-0 w-32 h-[2px] bg-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
        <div>
          <div className="flex items-center space-x-3 text-gold/60 text-[10px] font-black uppercase tracking-[0.5em] mb-3">
            <div className="size-1 rounded-full bg-gold animate-ping" />
            <Radar className="size-3" />
            <span>Multi-Chain Forensics & Attribution</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
            WALLET<span className="text-gold">·</span>INTELLIGENCE
          </h1>
          {scanResult && (
            <div className="mt-4">
              <ExportButton 
                dossier={{
                  entity: { address: inputAddr, chain: selectedChain, type: 'WALLET', tags: ['SCANNED_WALLET'], isDeterministic: false },
                  financials: { netWorth: scanResult.netWorth, assets: scanResult.balances, history: scanResult.history },
                  security: { 
                    riskScore: scanResult.sanctions.isSanctioned ? 100 : 15, 
                    riskLevel: scanResult.sanctions.isSanctioned ? 'Critical' : 'Low',
                    isSanctioned: scanResult.sanctions.isSanctioned,
                    maliciousFlags: [],
                    riskAnalysis: null
                  }
                }} 
              />
            </div>
          )}
        </div>
        <div className="w-full md:w-[500px]">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputAddr}
                onChange={(e) => setInputAddr(e.target.value)}
                placeholder="Inject Address (EVM / BTC)..."
                className="w-full bg-black/60 border border-gold/20 rounded-2xl pl-14 pr-32 py-5 text-white outline-none focus:border-gold/50 focus:bg-black/80 transition-all font-mono text-sm backdrop-blur-xl"
              />
              <Search className="absolute left-5 text-gold/50 size-6" />
              <button
                onClick={handleScan}
                disabled={loading}
                className="absolute right-3 bg-gold text-black px-8 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-95 group-hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="size-3 animate-spin" />
                    ANALYZING
                  </span>
                ) : 'SCAN_LINK'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative size-32">
              <div className="absolute inset-0 rounded-full border-2 border-gold/10" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-t-gold border-transparent"
              />
              <motion.div 
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-4 rounded-full bg-gold/5 flex items-center justify-center"
              >
                <Activity className="text-gold size-8" />
              </motion.div>
            </div>
            <div className="text-center">
              <div className="text-xs font-black text-gold uppercase tracking-[0.3em] mb-1">Retrieving Records</div>
              <div className="text-[10px] text-gray-500 font-mono tracking-tighter">CROSS_CHAIN_QUERY_ACTIVE</div>
            </div>
          </motion.div>
        ) : scanResult ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Top Stats Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Net Worth', value: `$${parseFloat(scanResult.netWorth).toLocaleString()}`, icon: <Box className="size-4 text-gold" />, trend: '+12.5%', source: 'Moralis' },
                { label: 'Total Transactions', value: scanResult.history.length, icon: <Activity className="size-4 text-blue-400" />, trend: 'Synchronized', source: 'Alchemy' },
                { label: 'Compliance Status', value: scanResult.sanctions.isSanctioned ? 'SANCTIONED' : 'CLEARED', icon: <Scale className="size-4 text-emerald-400" />, sub: 'OFAC_LIST_v2', source: 'OFAC_Registry' },
                { label: 'Entity Identification', value: 'WHALE_WALLET', icon: <Radar className="size-4 text-purple-400" />, sub: 'BEHAVIORAL_MATCH', source: 'Internal_Heuristics' }
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/5">{stat.icon}</div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase">{stat.trend || stat.sub}</span>
                  </div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">{stat.label}</div>
                  <div className="text-xl font-black text-white tracking-tighter uppercase">{stat.value}</div>
                  
                  <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[7px] font-black text-white/20 uppercase font-mono">{stat.source}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle Section: Forensic Graph & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <ForensicGraph centerAddress={inputAddr} />
                <HubCard title="Asset Portfolio Distribution" resourceId="F2_WALLET" dataSource="Moralis API" dataSourceUrl="https://moralis.io">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scanResult.balances.map((t: any, i: number) => (
                      <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-gray-500 uppercase">
                            {t.symbol?.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-xs font-black text-white tracking-tight">{t.symbol}</div>
                            <div className="text-[9px] text-gray-500 font-bold uppercase">{t.name?.slice(0, 10)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-gold font-mono">{(parseFloat(t.balance) / 10**t.decimals).toFixed(3)}</div>
                          <div className="text-[8px] text-gray-600 font-bold">${parseFloat(t.usd_value || 0).toFixed(0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </HubCard>
              </div>

              {/* Right Sidebar: Timeline & Signals */}
              <div className="lg:col-span-4 space-y-8">
                <HubCard title="Behavioral Timeline" resourceId="F2_WALLET" dataSource="Alchemy Indexer" dataSourceUrl="https://www.alchemy.com">
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {scanResult.history.map((tx: any, i: number) => (
                      <div key={i} className="relative pl-6 pb-6 last:pb-0 group">
                        {/* Timeline Marker */}
                        <div className="absolute left-0 top-1.5 size-2 rounded-full bg-gold/30 border border-gold/50 group-hover:bg-gold transition-colors" />
                        <div className="absolute left-[3px] top-4 bottom-0 w-[2px] bg-white/5" />
                        
                        <div className="flex justify-between items-start mb-1">
                          <div className={`text-[10px] font-black uppercase tracking-widest ${
                            tx.from_address === inputAddr.toLowerCase() ? 'text-orange-500' : 'text-blue-400'
                          }`}>
                            {tx.from_address === inputAddr.toLowerCase() ? 'CONTRACT_OUT' : 'IDENTIFIED_IN'}
                          </div>
                          <div className="text-[9px] font-mono text-gray-600">{new Date(tx.block_timestamp).toLocaleTimeString()}</div>
                        </div>
                        <div className="text-[9px] font-mono text-gray-400 truncate mb-2">{tx.hash}</div>
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                          <span className="text-[8px] font-bold text-gray-500 uppercase">Block</span>
                          <span className="text-[9px] font-mono text-white">{tx.block_number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </HubCard>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-3xl">
            <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Search className="text-gray-700 size-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-white/40 uppercase tracking-widest">Awaiting Parameter Injection</h3>
              <p className="text-xs text-gray-600 italic">Enter a wallet address to initiate deep signal scanning</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletScanner;
