import React, { useState } from 'react';
import { AMLBotService } from '../../services/amlBot.service';
import { OFACService } from '../../services/ofac.service';
import { TrusteeCheckService } from '../../services/trustecheck.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { ShieldAlert, Fingerprint, FileText, Download, Layers } from 'lucide-react';

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
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">AML & Compliance Center</h1>
        <p className="text-gray-400 text-sm italic">Institutional risk scoring and sanctions screening</p>
      </div>

      <HubCard className="bg-gold/5 border-gold/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search Wallet for Compliance Check..."
            className="flex-1 bg-black/40 border border-gold/20 rounded-xl px-6 py-4 text-white outline-none focus:border-gold/50 font-mono text-sm"
          />
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-gold text-black px-10 rounded-xl font-bold uppercase tracking-widest hover:bg-yellow-400 disabled:opacity-50 transition-all font-mono"
          >
            {loading ? 'RUNNING INTERPOL CHECK...' : 'GENERATE COMPLIANCE REPORT'}
          </button>
        </div>
      </HubCard>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
          <HubCard title="Risk Scoring (Primary)" resourceId="F5_AML" dataSource="AMLBot API">
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

          <HubCard title="Risk Analysis (Secondary)" resourceId="F5_AML" dataSource="Trustee Global AML Index">
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

          <HubCard title="Sanctions Status" dataSource="OFAC Registry">
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

              <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-bold uppercase transition-all">
                <Download className="size-4" /> Export Combined Audit
              </button>
            </div>
          </HubCard>
        </div>
      )}
    </div>
  );
};

export default AMLCenter;
