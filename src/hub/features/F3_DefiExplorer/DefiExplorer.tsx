import React, { useEffect, useState } from 'react';
import { DeFiLlamaService } from '../../services/defiLlama.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { Trophy, TrendingUp, Layers, Activity } from 'lucide-react';

const DefiExplorer: React.FC = () => {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DeFiLlamaService.getProtocols();
        setProtocols(data.slice(0, 50));
      } catch (error) {
        console.error('Failed to fetch protocols:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">DeFi Protocol Explorer</h1>
        <p className="text-gray-400 text-sm italic">Aggregate TVL, yield, and protocol health metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HubCard title="Protocol TVL Metrics" className="bg-gradient-to-br from-gold/10 to-transparent border-gold/30" resourceId="F3_DEFI" dataSource="DefiLlama API">
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="text-gold size-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Protocols Tracked</span>
          </div>
          <div className="text-3xl font-black text-white">{protocols.length}+</div>
        </HubCard>
        
        <HubCard title="Sector Analysis" className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30" resourceId="F3_DEFI" dataSource="DefiLlama API">
          <div className="flex items-center space-x-3 mb-2">
            <Layers className="text-blue-400 size-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Largest Sector</span>
          </div>
          <div className="text-3xl font-black text-white">LIQUID STAKING</div>
        </HubCard>

        <HubCard title="Network Trends" className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30" resourceId="F3_DEFI" dataSource="DefiLlama API">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="text-green-400 size-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Network Dominance</span>
          </div>
          <div className="text-3xl font-black text-white uppercase italic text-sm">ETHEREUM (58.2%)</div>
        </HubCard>
      </div>

      <div className="bg-black/40 border border-gold/10 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-gold/5 border-b border-gold/10 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-6 py-4">Protocol</th>
              <th className="px-6 py-4 text-right">TVL</th>
              <th className="px-6 py-4 text-right">1D Change</th>
              <th className="px-6 py-4 text-right">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {protocols.map((p) => (
              <tr key={p.id} className="hover:bg-gold/5 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img src={p.logo} alt={p.name} className="size-6 rounded-full border border-gold/20" />
                    <div>
                      <div className="font-bold text-white group-hover:text-gold transition-colors">{p.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-white">
                  ${(p.tvl / 1e9).toFixed(2)}B
                </td>
                <td className={`px-6 py-4 text-right font-mono ${p.change_1d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {p.change_1d?.toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-right">
                  <HubBadge variant="gray">{p.category}</HubBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-20 text-center text-gold animate-pulse uppercase tracking-widest font-bold">Fetching Protocol Data...</div>}
      </div>
    </div>
  );
};

export default DefiExplorer;
