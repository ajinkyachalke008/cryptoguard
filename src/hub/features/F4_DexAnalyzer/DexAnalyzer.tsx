import React, { useState } from 'react';
import { DexScreenerService } from '../../services/dexScreener.service';
import { GeckoTerminalService } from '../../services/geckoTerminal.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { Search, AlertTriangle, Droplets, BarChart3, ExternalLink, ShieldCheck, Activity } from 'lucide-react';
import { ExportButton } from '../../reports/components/ExportButton';

const DexAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await DexScreenerService.search(query);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">DEX & Token Analyzer</h1>
        <p className="text-gray-400 text-sm italic">Liquidity depth, price impact, and smart contract risk flags</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gold/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Token Name, Symbol or Contract Address..."
            className="relative w-full bg-black/60 border border-gold/20 rounded-2xl pl-14 pr-4 py-5 text-white outline-none focus:border-gold/50 transition-all font-mono text-sm backdrop-blur-xl"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/50 size-6" />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-gold text-black px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-95"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Activity className="size-3 animate-spin" />
              <span>RESEARCHING</span>
            </div>
          ) : 'SEARCH_TOKEN'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((pair, i) => {
          const risk = DexScreenerService.analyzeRisk(pair);
          return (
            <HubCard key={i} className="group overflow-hidden border-gold/10 hover:border-gold/30" resourceId="F4_DEX" dataSource="DexScreener Indexer" dataSourceUrl="https://dexscreener.com">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className="size-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-[10px] font-bold">{pair.baseToken.symbol[0]}</div>
                    <div className="size-8 rounded-full bg-gray-800 border border-gold/10 flex items-center justify-center text-[10px] font-bold text-gray-500">{pair.quoteToken.symbol[0]}</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase">{pair.baseToken.symbol} / {pair.quoteToken.symbol}</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase">{pair.dexId} • {pair.chainId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-white">${parseFloat(pair.priceUsd).toFixed(6)}</div>
                  <HubBadge variant={parseFloat(pair.priceChange.h24) >= 0 ? 'green' : 'red'}>
                    {pair.priceChange.h24}%
                  </HubBadge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 border-y border-gold/5 py-4">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1 mb-1">
                    <Droplets className="size-3" /> Liquidity
                  </div>
                  <div className="text-sm font-bold text-white">${(pair.liquidity?.usd / 1000).toFixed(1)}K</div>
                </div>
                <div className="text-center border-x border-gold/5">
                  <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1 mb-1">
                    <BarChart3 className="size-3" /> 24H Volume
                  </div>
                  <div className="text-sm font-bold text-white">${(pair.volume.h24 / 1000).toFixed(1)}K</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="size-3" /> FDV
                  </div>
                  <div className="text-sm font-bold text-white">${(pair.fdv / 1e6).toFixed(1)}M</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="size-3" /> Smart Analysis
                </h4>
                <div className="flex flex-wrap gap-2">
                  {risk.flags.map((f, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase font-bold">
                      {f}
                    </span>
                  ))}
                  {risk.flags.length === 0 && <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 uppercase font-bold text-shadow-glow">LOW RISK PROFILE</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <a 
                  href={pair.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center flex-1 py-2 bg-gold/5 hover:bg-gold/10 border border-gold/10 hover:border-gold/30 rounded-lg text-xs font-bold text-gold transition-all uppercase gap-2"
                >
                  View on {pair.dexId} <ExternalLink className="size-3" />
                </a>
                <ExportButton 
                  label="Dossier"
                  className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-gold hover:text-white transition-all uppercase"
                  dossier={{
                    entity: { address: pair.baseToken.address, chain: pair.chainId, type: 'CONTRACT', tags: ['DEX_TOKEN'], isDeterministic: false },
                    financials: { netWorth: pair.liquidity?.usd || 0, assets: [], history: [] },
                    security: { 
                      riskScore: risk.flags.length * 20, 
                      riskLevel: risk.flags.length > 2 ? 'High' : 'Low',
                      isSanctioned: false,
                      maliciousFlags: risk.flags,
                      riskAnalysis: risk
                    }
                  }} 
                />
              </div>
            </HubCard>
          );
        })}
        {results.length === 0 && !loading && query && (
          <div className="col-span-full py-20 text-center text-gray-600 italic">No matching pairs found for "{query}"</div>
        )}
      </div>
    </div>
  );
};

export default DexAnalyzer;
