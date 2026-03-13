import React, { useState } from 'react';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  Key, 
  AlertCircle, 
  Search, 
  Copy, 
  ChevronRight,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResourceGuide: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const levels = [
    {
      level: 1,
      title: "Zero Friction",
      subtitle: "No Key, No Signup",
      color: "text-green-400",
      description: "Require absolutely no registration. Simply make HTTP requests and get data back.",
      count: 9
    },
    {
      level: 2,
      title: "Quick Signup",
      subtitle: "Free Key in < 5 min",
      color: "text-gold",
      description: "Generous free tiers. Email + password signup with API keys available immediately.",
      count: 11
    },
    {
      level: 3,
      title: "Limited Tiers",
      subtitle: "Approval May Be Required",
      color: "text-red-400",
      description: "Essential for institutional AML and specialized intelligence. May require approval.",
      count: 5
    }
  ];

  const apiData = [
    { id: 1, name: "DeFiLlama", level: 1, bestFor: "TVL, protocol data", url: "api.llama.fi", snippet: "const res = await fetch('https://api.llama.fi/protocols');" },
    { id: 2, name: "GeckoTerminal", level: 1, bestFor: "DEX pool data", url: "api.geckoterminal.com", snippet: "fetch('https://api.geckoterminal.com/api/v2/networks/eth/pools')" },
    { id: 3, name: "DexScreener", level: 1, bestFor: "Real-time DEX pairs", url: "api.dexscreener.com", snippet: "fetch('https://api.dexscreener.com/latest/dex/search?q=PEPE')" },
    { id: 4, name: "Blockstream", level: 1, bestFor: "Bitcoin transactions", url: "blockstream.info/api", snippet: "fetch('https://blockstream.info/api/address/{addr}')" },
    { id: 5, name: "The Graph", level: 1, bestFor: "Protocol data (GraphQL)", url: "api.thegraph.com", snippet: "fetch(GRAPH_URL, { method: 'POST', body: JSON.stringify({ query }) })" },
    { id: 6, name: "Paraswap", level: 1, bestFor: "DEX price routing", url: "apiv5.paraswap.io", snippet: "fetch('https://apiv5.paraswap.io/prices?srcToken=...')" },
    { id: 7, name: "OFAC SDN List", level: 1, bestFor: "Sanctions screening", url: "treasury.gov/ofac", snippet: "fetch('https://www.treasury.gov/ofac/downloads/sdn.xml')" },
    { id: 8, name: "WalletExplorer", level: 1, bestFor: "BTC clustering OSINT", url: "walletexplorer.com", snippet: "fetch('https://www.walletexplorer.com/api/1/address?address={addr}')" },
    { id: 9, name: "ENS (The Graph)", level: 1, bestFor: ".eth resolution", url: "api.thegraph.com", snippet: "query { domains(where: { name: 'vitalik.eth' }) { id } }" },
    { id: 10, name: "Etherscan Family", level: 2, bestFor: "Chain transactions", url: "api.etherscan.io", snippet: "fetch(`${BASE_URL}?module=account&action=txlist&apikey=${KEY}`)" },
    { id: 11, name: "CoinGecko", level: 2, bestFor: "Token prices & market", url: "api.coingecko.com", snippet: "fetch(URL, { headers: { 'x-cg-demo-api-key': KEY } })" },
    { id: 12, name: "Moralis", level: 2, bestFor: "Multi-chain NFT/tokens", url: "moralis.io", snippet: "fetch(URL, { headers: { 'X-API-Key': KEY } })" },
    { id: 13, name: "Alchemy", level: 2, bestFor: "EVM RPC & NFT API", url: "alchemy.com", snippet: "fetch(BASE, { method: 'POST', body: JSON.stringify({ method: 'eth_getBalance' }) })" },
    { id: 14, name: "Ankr Public RPC", level: 2, bestFor: "Multi-chain RPC", url: "rpc.ankr.com", snippet: "fetch('https://rpc.ankr.com/eth', { method: 'POST', ... })" },
    { id: 15, name: "CoinMarketCap", level: 2, bestFor: "Token listings", url: "coinmarketcap.com", snippet: "fetch(URL, { headers: { 'X-CMC_PRO_API_KEY': KEY } })" },
    { id: 16, name: "CryptoCompare", level: 2, bestFor: "OHLCV data", url: "cryptocompare.com", snippet: "fetch(`${URL}/histoday?fsym=BTC&tsym=USD&api_key=${KEY}`)" },
    { id: 17, name: "Binance API", level: 2, bestFor: "Real-time prices", url: "api.binance.com", snippet: "fetch('https://api.binance.com/api/v3/ticker/price')" },
    { id: 18, name: "Messari", level: 2, bestFor: "Asset metrics", url: "data.messari.io", snippet: "fetch(URL, { headers: { 'x-messari-api-key': KEY } })" },
    { id: 19, name: "BlockCypher", level: 2, bestFor: "BTC/LTC/DOGE", url: "blockcypher.com", snippet: "fetch(`${URL}/btc/main/addrs/{addr}?token=${KEY}`)" },
    { id: 20, name: "NOWNodes", level: 2, bestFor: "Privacy coins + 50 chains", url: "nownodes.io", snippet: "fetch(URL, { headers: { 'api-key': KEY } })" },
    { id: 21, name: "AMLBot", level: 3, bestFor: "AML risk scoring", url: "amlbot.com", snippet: "fetch('https://amlbot.com/api', { method: 'POST', body: JSON.stringify({ api_key }) })" },
    { id: 22, name: "Santiment", level: 3, bestFor: "Social signals", url: "santiment.net", snippet: "fetch(GQL_URL, { headers: { 'Authorization': `Apikey ${KEY}` } })" },
    { id: 23, name: "Transpose", level: 3, bestFor: "SQL over blockchain", url: "transpose.io", snippet: "fetch(SQL_URL, { headers: { 'X-API-KEY': KEY }, body: { sql } })" },
    { id: 24, name: "LunarCrush", level: 3, bestFor: "Social intelligence", url: "lunarcrush.com", snippet: "fetch(URL, { headers: { 'Authorization': `Bearer ${TOKEN}` } })" },
    { id: 25, name: "Tenderly", level: 3, bestFor: "TX simulation", url: "tenderly.co", snippet: "fetch(URL, { headers: { 'X-Access-Key': KEY }, body: { network_id: '1' } })" },
  ];

  const filteredApis = apiData.filter(api => 
    (activeLevel === null || api.level === activeLevel) &&
    (api.name.toLowerCase().includes(search.toLowerCase()) || api.bestFor.toLowerCase().includes(search.toLowerCase()))
  );

  const envTemplate = `# CRYPTOGUARD INTELLIGENCE HUB API KEYS
# Register at the URLs in the API Guide

ETHERSCAN_API_KEY=
COINGECKO_API_KEY=
MORALIS_API_KEY=
ALCHEMY_API_KEY=
CMC_API_KEY=
CRYPTOCOMPARE_API_KEY=
MESSARI_API_KEY=
BLOCKCYPHER_TOKEN=
NOWNODES_API_KEY=
AMLBOT_API_KEY=
SANTIMENT_API_KEY=
TRANSPOSE_API_KEY=
LUNARCRUSH_TOKEN=
TENDERLY_API_KEY=`;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Database className="text-gold size-8" />
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">FREE BLOCKCHAIN APIs</h1>
        </div>
        <p className="text-gray-400 max-w-3xl italic">
          25 Completely Free Data Sources • Organized by Integration Ease • Real-time Forensic Intelligence
        </p>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((l) => (
          <motion.div 
            key={l.level}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveLevel(activeLevel === l.level ? null : l.level)}
            className={`cursor-pointer p-6 rounded-2xl border transition-all ${activeLevel === l.level ? 'bg-gold/10 border-gold shadow-[0_0_30px_rgba(255,183,0,0.2)]' : 'bg-black/40 border-gold/20 hover:border-gold/50'}`}
          >
            <div className={`text-xs font-black uppercase tracking-widest ${l.color} mb-1`}>LEVEL {l.level}</div>
            <div className="text-xl font-bold text-white mb-2">{l.title}</div>
            <div className="text-[10px] text-gold/60 uppercase font-black mb-4 tracking-tighter">{l.subtitle}</div>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">{l.description}</p>
            <div className="flex items-center justify-between">
              <HubBadge variant={activeLevel === l.level ? 'gold' : 'gray'}>{l.count} APIs</HubBadge>
              <ChevronRight className={`size-4 transition-transform ${activeLevel === l.level ? 'rotate-90' : ''}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Master Table */}
      <HubCard title="Master Cheatsheet">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 size-4" />
            <input 
              type="text" 
              placeholder="Search by API name or capability..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-gold/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold/40 transition-all font-mono"
            />
          </div>
          {activeLevel && (
            <button 
              onClick={() => setActiveLevel(null)}
              className="text-[10px] font-bold text-gold uppercase hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gold/10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gold/5 text-[10px] font-black uppercase tracking-widest text-gold text-center">
              <tr>
                <th className="p-4 indent-4">API Name</th>
                <th className="p-4">Key?</th>
                <th className="p-4">Best For</th>
                <th className="p-4">Technical Endpoint</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence mode='popLayout'>
                {filteredApis.map((api) => (
                  <motion.tr 
                    layout
                    key={api.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="border-t border-gold/5 hover:bg-gold/[0.02] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-gold transition-colors">{api.name}</span>
                        <span className="text-[9px] text-gray-500 font-mono tracking-tighter uppercase">ID #{api.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {api.level === 1 ? (
                        <HubBadge variant="green">NONE</HubBadge>
                      ) : (
                        <HubBadge variant={api.level === 2 ? 'gold' : 'red'}>REQD</HubBadge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-300 font-mono italic max-w-xs">{api.bestFor}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] text-blue-400 font-mono bg-blue-500/5 p-1 px-2 rounded border border-blue-500/10 truncate max-w-sm">
                        {api.url}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-gold/30 hover:text-gold transition-colors">
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </HubCard>

      {/* Code Snippets & Env */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HubCard title="Quick Integration Snippet">
          <div className="bg-black/60 rounded-xl p-6 border border-gold/5 relative group">
            <pre className="text-xs font-mono text-gray-300 overflow-x-auto custom-scrollbar">
              <code>{filteredApis[0]?.snippet || "// Select an API from the table for snippets"}</code>
            </pre>
            <button className="absolute top-4 right-4 text-gold/20 hover:text-gold transition-all">
              <Copy size={16} />
            </button>
          </div>
          <div className="p-4 mt-4 bg-green-500/5 border border-green-500/10 rounded-xl flex items-start space-x-3">
            <Zap className="size-4 text-green-500 mt-1" />
            <p className="text-[10px] text-gray-400">
              <span className="font-bold text-green-400 uppercase">Pro-Tip:</span> Use our `hub.fetcher.ts` for automatic rate limiting and fallback management.
            </p>
          </div>
        </HubCard>

        <HubCard title=".env Configuration">
          <div className="bg-black/60 rounded-xl p-6 border border-gold/5 relative group">
            <pre className="text-xs font-mono text-gray-300 h-48 overflow-y-auto custom-scrollbar">
              <code>{envTemplate}</code>
            </pre>
            <button 
              onClick={() => navigator.clipboard.writeText(envTemplate)}
              className="absolute top-4 right-4 text-gold/20 hover:text-gold transition-all"
            >
              <Copy size={16} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center space-x-1 text-[9px] text-gray-500">
              <CheckCircle2 size={10} className="text-green-500" />
              <span>Copy to root .env</span>
            </div>
            <div className="flex items-center space-x-1 text-[9px] text-gray-500">
              <Key size={10} className="text-gold" />
              <span>Fill keys sequentially</span>
            </div>
          </div>
        </HubCard>
      </div>

      {/* Footer Note */}
      <div className="p-8 border-t border-gold/10 text-center">
        <div className="flex items-center justify-center space-x-2 text-gold/30 text-[10px] font-black uppercase tracking-[0.3em]">
          <Shield size={12} />
          <span>Institutional Integrity Verification Engine</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceGuide;
