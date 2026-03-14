import React, { useState } from 'react';
import { AMLBotService } from '../../services/amlBot.service';
import { OFACService } from '../../services/ofac.service';
import { TrusteeCheckService } from '../../services/trustecheck.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { ShieldAlert, Fingerprint, FileText, Download, Layers } from 'lucide-react';
import { DossierToolkit } from '../../reports/components/DossierToolkit';

const AMLCenter: React.FC = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [aml, ofac, trustee] = await Promise.all([
        AMLBotService.checkAddress(address),
        OFACService.checkAddress(address),
        TrusteeCheckService.checkAddress(address)
      ]);
      setReport({ aml, ofac, trustee });
    } catch (error) {
      console.error('AML Check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gold/10 pb-10 relative mb-10">
        <div className="absolute -bottom-px left-0 w-48 h-[2px] bg-gold shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
        <div>
          <div className="flex items-center space-x-3 text-gold/60 text-[10px] font-black uppercase tracking-[0.6em] mb-3">
            <ShieldAlert className="size-3 text-gold" />
            <span>Institutional Grade Risk Attribution</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
            AML<span className="text-gold">·</span>COMPLIANCE
          </h1>
        </div>
        <div className="max-w-md">
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed italic text-right">
            "Deep-level sanctions screening and behavioral risk scoring for institutional entities."
          </p>
        </div>
      </div>

      <div className="relative group mb-12">
        <div className="absolute -inset-1 bg-gold/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
        <div className="relative flex gap-4 bg-black/80 p-2 rounded-2xl border border-gold/10 backdrop-blur-3xl">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search Wallet for Compliance Check..."
            className="flex-1 bg-transparent border-none rounded-xl px-6 py-4 text-white outline-none font-mono text-sm"
          />
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-gold text-black px-10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Fingerprint className="size-4 animate-pulse" />
                VERIFYING...
              </span>
            ) : 'GENERATE_REPORT'}
          </button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
          <HubCard title="Risk Scoring (Primary)" resourceId="F5_AML" dataSource="AMLBot API" dataSourceUrl="https://amlbot.com">
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              <div className="relative size-40 flex items-center justify-center">
                <svg className="size-full -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gold/10" />
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={440} strokeDashoffset={440 - (440 * report.aml.riskScore) / 100} className={report.aml.riskScore > 70 ? 'text-red-500' : report.aml.riskScore > 40 ? 'text-orange-500' : 'text-green-500'} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{report.aml.riskScore}%</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">AMLBot</span>
                </div>
              </div>
              <HubBadge variant={report.aml.verdict === 'BLOCK' ? 'red' : report.aml.verdict === 'REVIEW' ? 'gold' : 'green'}>
                {report.aml.verdict}
              </HubBadge>
            </div>
          </HubCard>

          <HubCard title="Risk Analysis (Secondary)" resourceId="F5_AML" dataSource="Trustee Global AML Index" dataSourceUrl="https://trustee.plus">
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              <div className="relative size-40 flex items-center justify-center">
                <svg className="size-full -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gold/10" />
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={440} strokeDashoffset={440 - (440 * report.trustee.riskScore) / 100} className={report.trustee.riskScore > 70 ? 'text-red-500' : report.trustee.riskScore > 40 ? 'text-orange-500' : 'text-green-500'} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{report.trustee.riskScore}%</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Trustee Plus</span>
                </div>
              </div>
              <HubBadge variant={report.trustee.status === 'Red Flag' ? 'red' : 'green'}>
                {report.trustee.status}
              </HubBadge>
            </div>
          </HubCard>

          <HubCard title="Sanctions Status" dataSource="OFAC Registry" dataSourceUrl="https://sanctionssearch.ofac.treas.gov/">
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 bg-black/40 border border-gold/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShieldAlert className={report.ofac.isSanctioned ? 'text-red-500' : 'text-green-500'} />
                  <div>
                    <div className="text-xs font-bold text-white uppercase">OFAC SDN LIST</div>
                    <div className="text-[10px] text-gray-500 uppercase">US TREASURY SCREENING</div>
                  </div>
                </div>
                <HubBadge variant={report.ofac.isSanctioned ? 'red' : 'green'}>
                  {report.ofac.isSanctioned ? 'FLAGGED' : 'PASSED'}
                </HubBadge>
              </div>

              <div className="p-4 bg-black/40 border border-gold/10 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Fingerprint className="text-gold" />
                  <div className="text-xs font-bold text-white uppercase">Cross-Source Intelligence</div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  Composite score suggests {(report.aml.riskScore + report.trustee.riskScore) / 2}% variance between primary indexers and secondary behavioral filters.
                </p>
              </div>

              <div className="pt-6 border-t border-white/5">
                <DossierToolkit 
                  dossier={{
                    entity: { address, chain: 'eth', type: 'WALLET', tags: ['AML_SCAN'], isDeterministic: false },
                    financials: { netWorth: 0, assets: [], history: [] },
                    security: { 
                      riskScore: (report.aml.riskScore + report.trustee.riskScore) / 2, 
                      riskLevel: report.aml.verdict === 'BLOCK' ? 'Critical' : 'Medium',
                      isSanctioned: report.ofac.isSanctioned,
                      maliciousFlags: report.aml.verdict === 'BLOCK' ? ['CRITICAL_AML_THREAT'] : [],
                      riskAnalysis: report
                    }
                  }}
                />
              </div>
            </div>
          </HubCard>
        </div>
      )}
    </div>
  );
};

export default AMLCenter;
