// src/hub/osint/features/F2_WalletProfile/WalletProfiler.tsx
import React, { useState } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { Wallet, Fingerprint, Activity, Link2, ShieldCheck, AlertCircle, History, Globe, BrainCircuit, Sparkles } from 'lucide-react';
import { WalletExplorerService } from '../../services/intelligence/walletExplorer.service';
import { EthereumOSINTService } from '../../services/blockchain/ethereum.osint.service';
import { GoPlusService } from '../../services/intelligence/goplus.service';
import { OFACService } from '../../../services/ofac.service';
import { osintUtils } from '../../osint.utils';
import { WalletOSINTProfile } from '../../osint.types';
import { IntelligentForensicsService, ForensicNarrative } from '../../../services/intelligentForensics.service';
import { ForensicNarrativePanel } from '../../../components/ForensicNarrativePanel';

const WalletProfiler: React.FC = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<WalletOSINTProfile | null>(null);

  // AI Narrative State
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
  const [narrative, setNarrative] = useState<ForensicNarrative | null>(null);

  const performProfiling = async () => {
    if (!address) return;
    setLoading(true);
    setNarrative(null);
    try {
      const [clusterData, securityData, sanctionsData, ethTxs] = await Promise.all([
        WalletExplorerService.lookupAddress(address),
        GoPlusService.checkAddress(address),
        OFACService.checkAddress(address),
        EthereumOSINTService.getTxList(address)
      ]);

      const signals: any[] = [];
      if (sanctionsData.isSanctioned) signals.push({ type: 'SANCTIONED_ENTITY', severity: 'CRITICAL', detail: 'This address is on the OFAC SDN List.' });
      if (securityData.result?.malicious_behavior?.length > 0) signals.push({ type: 'MALICIOUS_BEHAVIOR', severity: 'HIGH', detail: 'Known malicious activity detected on-chain.' });

      const labels = [];
      if (clusterData?.wallet?.label) labels.push(clusterData.wallet.label);
      if (securityData.result?.is_contract === '1') labels.push('Smart Contract');

      const txs = ethTxs?.result || [];

      setProfile({
        address,
        chain: 'Ethereum',
        labels,
        firstSeen: txs.length > 0 ? parseInt(txs[txs.length - 1].timeStamp) * 1000 : 0,
        lastSeen: txs.length > 0 ? parseInt(txs[0].timeStamp) * 1000 : 0,
        totalTxCount: txs.length,
        riskScore: sanctionsData.isSanctioned ? 95 : labels.includes('Mixer') ? 85 : 15,
        riskLevel: sanctionsData.isSanctioned ? 'CRITICAL' : labels.includes('Mixer') ? 'HIGH' : 'LOW',
        signals
      });
    } catch (error) {
      console.error('Profiling error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNarrative = async () => {
    if (!profile) return;
    setIsNarrativeLoading(true);
    try {
      const contextData = {
        nodes: [{ id: profile.address, label: profile.labels.join(','), type: 'target', riskScore: profile.riskScore }],
        edges: profile.signals.map(s => ({ source: 'SIGNAL', target: profile.address, type: s.type, detail: s.detail }))
      };
      const result = await IntelligentForensicsService.generateNarrative(contextData);
      setNarrative(result);
    } catch (error) {
      console.error('Narrative generation failed:', error);
    } finally {
      setIsNarrativeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Wallet Profiling & Clustering</h1>
          <p className="text-gray-400 text-sm italic">Entity attribution and behavioral DNA mapping</p>
        </div>
        <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-2xl border border-gold/10">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search Address / ENS..."
            className="bg-transparent text-sm text-white px-4 outline-none w-64"
          />
          <button onClick={performProfiling} disabled={loading} className="px-6 py-2 bg-gold text-black text-xs font-black rounded-xl hover:bg-white transition-all uppercase">
            {loading ? 'ANALYZING...' : 'PROFILE_ENTITY'}
          </button>
        </div>
      </div>

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <HubCard title="Digital Fingerprint" resourceId="F2_FP" dataSource="Entity_Graph_V2" dataSourceUrl="https://walletexplorer.com">
              <div className="flex flex-col items-center py-6">
                <div className="size-24 rounded-full bg-gold/5 border-2 border-gold/20 flex items-center justify-center mb-6 relative">
                  <Fingerprint className="size-12 text-gold relative" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{profile.labels[0] || 'Unknown'}</h3>
                <p className="text-[10px] text-gray-500 font-mono mt-2">{osintUtils.maskAddress(profile.address)}</p>
              </div>
            </HubCard>
            <HubCard title="Behavioral Signals" dataSource="Risk" dataSourceUrl="https://gopluslabs.io">
              <div className="space-y-4">
                {profile.signals.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[9px] font-bold text-red-400">
                    {s.type}: {s.detail}
                  </div>
                ))}
              </div>
            </HubCard>
          </div>

          <div className="lg:col-span-6">
            <HubCard title="AI Intelligence Report" dataSource="ARIA_Clinical_Audit" dataSourceUrl="#">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="text-purple-400 size-5" />
                  <span className="text-xs font-black text-white uppercase">Forensic Analysis</span>
                </div>
                <button onClick={generateNarrative} disabled={isNarrativeLoading} className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[10px] font-black text-purple-400 hover:bg-purple-500 hover:text-white transition-all">
                  {isNarrativeLoading ? 'THINKING...' : 'GENERATE STORY'}
                </button>
              </div>
              <ForensicNarrativePanel narrative={narrative} isLoading={isNarrativeLoading} />
            </HubCard>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <HubCard title="Network DNA" dataSource="Blockstream" dataSourceUrl="https://blockstream.info">
              <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                 <div className="flex justify-between"><span>First Seen</span><span className="text-white">{new Date(profile.firstSeen).toLocaleDateString()}</span></div>
                 <div className="flex justify-between"><span>Last Seen</span><span className="text-white">{new Date(profile.lastSeen).toLocaleDateString()}</span></div>
                 <div className="flex justify-between"><span>Txs</span><span className="text-gold">{profile.totalTxCount}</span></div>
              </div>
            </HubCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletProfiler;
