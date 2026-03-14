// src/hub/osint/features/F3_DarkWeb/DarkWebMonitor.tsx
import React, { useState, useEffect } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { Monitor, Skull, ShieldAlert, Activity, ArrowRight, ExternalLink, Filter } from 'lucide-react';
import { RansomwhereService } from '../../services/intelligence/ransomwhere.service';
import { OFACService } from '../../../services/ofac.service';
import { osintUtils } from '../../osint.utils';

interface RansomEvent {
  address: string;
  blockchain: string;
  family: string;
  totalAmountPaid: string;
  transactions: any[];
}

const DarkWebMonitor: React.FC = () => {
  const [ransomFeed, setRansomFeed] = useState<RansomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const feed = await RansomwhereService.getFeed();
      if (feed && feed.result) {
        setRansomFeed(feed.result.slice(0, 50));
      }
    } catch (error) {
      console.error('Failed to fetch dark web signals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const filteredFeed = ransomFeed.filter(item => 
    item.family.toLowerCase().includes(filter.toLowerCase()) ||
    item.address.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Dark Web Monitoring Signals</h1>
          <p className="text-gray-400 text-sm italic">Real-time ransomware and criminal infrastructure tracking</p>
        </div>
        <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-gold/10">
          <Filter className="size-4 text-gold/50 ml-2" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search family or address..."
            className="bg-transparent text-sm text-white px-2 outline-none w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <HubCard title="Threat Radar" resourceId="F3_RADAR" dataSource="Ransomwhere_Intelligence" dataSourceUrl="https://ransomwhere.org">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">Active Ransomware Families</div>
                <div className="text-2xl font-black text-white">143</div>
              </div>
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                <div className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">Total Ransom Paid (24h)</div>
                <div className="text-2xl font-black text-white">$2.4M</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">New Addresses Identified</div>
                <div className="text-2xl font-black text-white">892</div>
              </div>
            </div>
          </HubCard>

          <HubCard title="Risk Topology" dataSource="OSINT_Forensics_V1" dataSourceUrl="#">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span className="text-gray-500">Mixer Activity</span>
                <HubBadge variant="red">HIGH</HubBadge>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span className="text-gray-500">Sanction Inflow</span>
                <HubBadge variant="gold">MODERATE</HubBadge>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span className="text-gray-500">Exchange Deposits</span>
                <HubBadge variant="green">STABLE</HubBadge>
              </div>
            </div>
          </HubCard>
        </div>

        <div className="lg:col-span-3">
          <HubCard title="Real-Time Ransomware Feed" dataSource="Aggregated_Threat_Pulse" dataSourceUrl="#">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <Activity className="size-8 text-gold animate-pulse" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gold/10 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      <th className="pb-4">Family</th>
                      <th className="pb-4">Address</th>
                      <th className="pb-4">Chain</th>
                      <th className="pb-4 text-right">Total Paid</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/5">
                    {filteredFeed.map((item, i) => (
                      <tr key={i} className="group hover:bg-gold/5 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Skull className="size-4 text-red-500" />
                            <span className="font-black text-white text-xs uppercase">{item.family}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-mono text-[10px] text-gray-400 group-hover:text-gold transition-colors">
                            {osintUtils.maskAddress(item.address)}
                          </span>
                        </td>
                        <td className="py-4">
                          <HubBadge variant="gold">{item.blockchain.toUpperCase()}</HubBadge>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-xs font-bold text-white">{item.totalAmountPaid}</span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="p-1 px-2 rounded bg-gold/10 text-[10px] font-bold text-gold hover:bg-gold/20 transition-all uppercase">
                            Investigate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredFeed.length === 0 && (
                  <div className="py-20 text-center text-gray-600 italic text-sm">
                    No threat signals matching your filter.
                  </div>
                )}
              </div>
            )}
          </HubCard>
        </div>
      </div>
    </div>
  );
};

export default DarkWebMonitor;
