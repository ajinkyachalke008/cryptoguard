// src/hub/osint/features/F8_ContractAudit/ContractAuditor.tsx
import React, { useState } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { Search, Shield, AlertTriangle, CheckCircle, Info, Lock, Code } from 'lucide-react';
import { GoPlusService } from '../../services/intelligence/goplus.service';
import { ExportButton } from '../../../reports/components/ExportButton';
import { osintUtils } from '../../osint.utils';
import { TokenAuditResult } from '../../osint.types';

const ContractAuditor: React.FC = () => {
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('1'); // Default to Ethereum
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<TokenAuditResult | null>(null);

  const runAudit = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const goplusRes = await GoPlusService.checkToken(chainId, address);
      const data = goplusRes.result[address.toLowerCase()];

      if (data) {
        setAudit({
          contractAddress: address,
          chain: chainId === '1' ? 'Ethereum' : chainId === '56' ? 'BNB Chain' : 'Polygon',
          grade: calculateGrade(data),
          riskLevel: data.is_honeypot === '1' ? 'CRITICAL' : parseFloat(data.sell_tax) > 0.2 ? 'HIGH' : 'LOW',
          honeypot: data.is_honeypot === '1',
          mintable: data.is_mintable === '1',
          proxy: data.is_proxy === '1',
          buyTax: parseFloat(data.buy_tax || '0') * 100,
          sellTax: parseFloat(data.sell_tax || '0') * 100,
          ownerPrivileges: [
            data.can_take_back_ownership === '1' ? 'Can Reclaim Ownership' : '',
            data.hidden_owner === '1' ? 'Hidden Owner' : '',
            data.transfer_pausable === '1' ? 'Trading Can Be Paused' : '',
          ].filter(Boolean),
          holderConcentration: parseFloat(data.top10_holder_rate || '0') * 100,
        });
      }
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (data: any) => {
    let score = 100;
    if (data.is_honeypot === '1') score -= 60;
    if (data.is_mintable === '1') score -= 20;
    if (data.is_proxy === '1') score -= 10;
    if (parseFloat(data.sell_tax) > 0.1) score -= 20;
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Token Contract Auditor</h1>
          <p className="text-gray-400 text-sm italic">Automated security analysis and honeypot detection</p>
        </div>
        <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-gold/10">
          <select 
            value={chainId} 
            onChange={(e) => setChainId(e.target.value)}
            className="bg-transparent text-xs text-gold outline-none border-r border-gold/10 pr-2 mr-2"
          >
            <option value="1">ETH</option>
            <option value="56">BSC</option>
            <option value="137">POL</option>
          </select>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Contract Address..."
            className="bg-transparent text-sm text-white px-2 outline-none w-64"
          />
          <button 
            onClick={runAudit} 
            disabled={loading}
            className="px-4 py-1.5 bg-gold/10 text-gold text-xs font-bold rounded-lg hover:bg-gold/20 transition-all"
          >
            {loading ? 'ANALYZING...' : 'RUN AUDIT'}
          </button>
        </div>
      </div>

      {audit && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <HubCard title="Security Summary" className="lg:col-span-1" resourceId="F8_AUDIT" dataSource="GoPlus_Security_V3" dataSourceUrl="https://gopluslabs.io">
            <div className="flex flex-col items-center justify-center py-6">
              <div className={`text-7xl font-black mb-2 ${
                audit.grade === 'A' ? 'text-green-500' : 
                audit.grade === 'B' ? 'text-blue-500' : 
                audit.grade === 'C' ? 'text-gold' : 
                audit.grade === 'D' ? 'text-orange-500' : 'text-red-500'
              }`}>
                {audit.grade}
              </div>
              <HubBadge variant={audit.riskLevel === 'CRITICAL' ? 'red' : audit.riskLevel === 'HIGH' ? 'red' : 'green'}>
                {audit.riskLevel} RISK
              </HubBadge>
            </div>
            <div className="space-y-3 pt-4 border-t border-gold/5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 uppercase font-bold">Address</span>
                <span className="text-white font-mono">{osintUtils.maskAddress(audit.contractAddress)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 uppercase font-bold">Network</span>
                <span className="text-white">{audit.chain}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-gold/5">
                <ExportButton 
                  label="Export Security Dossier"
                  className="w-full justify-center py-2 bg-white/5 border border-white/10 rounded-lg"
                  dossier={{
                    entity: { address: audit.contractAddress, chain: chainId, type: 'CONTRACT', tags: ['SECURITY_AUDIT'], isDeterministic: false },
                    financials: { netWorth: 0, assets: [], history: [] },
                    security: { 
                      riskScore: audit.grade === 'F' ? 100 : audit.grade === 'D' ? 70 : 15, 
                      riskLevel: audit.riskLevel,
                      isSanctioned: false,
                      maliciousFlags: audit.ownerPrivileges,
                      riskAnalysis: audit
                    }
                  }} 
                />
              </div>
            </div>
          </HubCard>

          <HubCard title="Attack Surface Analysis" className="lg:col-span-2" dataSource="OSINT_Engine_Audit" dataSourceUrl="#">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 space-y-4">
                <h3 className="text-xs font-bold text-gold uppercase flex items-center">
                  <Shield className="size-3 mr-2" /> Core Security Checks
                </h3>
                <div className="space-y-3">
                  <SecurityFlag label="Honeypot Detected" value={audit.honeypot} inverse />
                  <SecurityFlag label="Mintable Functions" value={audit.mintable} inverse />
                  <SecurityFlag label="Proxy / Upgradeable" value={audit.proxy} inverse />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 space-y-4">
                <h3 className="text-xs font-bold text-gold uppercase flex items-center">
                  <Lock className="size-3 mr-2" /> Ownership & Privileges
                </h3>
                <div className="space-y-2">
                  {audit.ownerPrivileges.length > 0 ? (
                    audit.ownerPrivileges.map((p, i) => (
                      <div key={i} className="flex items-center text-[10px] text-orange-400 font-bold uppercase">
                        <AlertTriangle className="size-3 mr-2" /> {p}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center text-[10px] text-green-400 font-bold uppercase">
                      <CheckCircle className="size-3 mr-2" /> No Malicious Privileges Detected
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 space-y-4">
                <h3 className="text-xs font-bold text-gold uppercase flex items-center">
                  <Code className="size-3 mr-2" /> Tax Configuration
                </h3>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Buy Tax</div>
                    <div className={`text-xl font-bold ${audit.buyTax > 10 ? 'text-red-500' : 'text-white'}`}>{audit.buyTax.toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Sell Tax</div>
                    <div className={`text-xl font-bold ${audit.sellTax > 10 ? 'text-red-500' : 'text-white'}`}>{audit.sellTax.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 space-y-4">
                <h3 className="text-xs font-bold text-gold uppercase flex items-center">
                  <Info className="size-3 mr-2" /> Distribution Risk
                </h3>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Top 10 Holder Concentration</div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${audit.holderConcentration > 50 ? 'bg-red-500' : 'bg-gold'}`}
                      style={{ width: `${audit.holderConcentration}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-white mt-1">{audit.holderConcentration.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </HubCard>
        </div>
      )}

      {!audit && !loading && (
        <div className="h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gold/5 rounded-2xl">
          <Shield className="size-12 mb-4 opacity-20" />
          <p className="text-sm italic">Enter a token contract address to perform an automated security audit.</p>
        </div>
      )}
    </div>
  );
};

const SecurityFlag: React.FC<{ label: string; value: boolean; inverse?: boolean }> = ({ label, value, inverse }) => (
  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
    <span className="text-gray-400">{label}</span>
    <span className={value ? (inverse ? 'text-red-500' : 'text-green-500') : (inverse ? 'text-green-500' : 'text-red-500')}>
      {value ? 'DETECTED' : 'CLEAR'}
    </span>
  </div>
);

export default ContractAuditor;
