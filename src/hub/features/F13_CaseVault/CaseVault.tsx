// src/hub/features/F13_CaseVault/CaseVault.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { Briefcase, Search, Download, Trash2, ExternalLink, ShieldCheck, Activity } from 'lucide-react';
import { VaultService } from '../../services/vault.service';
import { IntelligenceDossier } from '../../services/investigation.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { DossierToolkit } from '../../reports/components/DossierToolkit';

const CaseVault: React.FC = () => {
  const [cases, setCases] = useState<IntelligenceDossier[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCases(VaultService.getCases());
  }, []);

  const filteredCases = cases.filter(c => 
    c.entity.address.toLowerCase().includes(search.toLowerCase()) ||
    c.entity.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (address: string) => {
    VaultService.deleteCase(address);
    setCases(VaultService.getCases());
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-3xl overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-gold/60 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
            <Briefcase className="size-4" />
            <span>Institutional Case Management</span>
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter uppercase leading-none mb-8">
            INVESTIGATION<br/>
            <span className="text-gold">VAULT</span>
          </h1>

          <div className="relative max-w-2xl group">
             <div className="absolute -inset-1 bg-gradient-to-r from-gold/40 to-purple-600/40 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
             <div className="relative flex items-center">
                <Search className="absolute left-6 text-gold size-6" />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by Address / Tag / Risk..."
                  className="w-full bg-black/80 border border-white/10 rounded-2xl pl-16 pr-6 py-6 text-xl text-white outline-none focus:border-gold/50 transition-all font-mono"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((dossier) => (
          <HubCard 
            key={dossier.entity.address} 
            title={dossier.entity.address.slice(0, 10) + '...'}
            className="group hover:border-gold/30 transition-all duration-500"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <HubBadge variant={dossier.security.riskScore > 70 ? 'red' : 'gold'}>
                    RISK_SCORE: {dossier.security.riskScore}
                </HubBadge>
                <button 
                  onClick={() => handleDelete(dossier.entity.address)}
                  className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-all rounded-lg"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="text-[10px] text-gray-400 font-mono break-all line-clamp-2">
                {dossier.entity.address}
              </div>

              <div className="flex flex-wrap gap-1">
                {dossier.entity.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] text-gray-500 font-black uppercase">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 mt-2 border-t border-white/5">
                <DossierToolkit dossier={dossier} />
              </div>
            </div>
          </HubCard>
        ))}

        {filteredCases.length === 0 && (
          <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center">
            <ShieldCheck className="size-16 text-gray-800 mb-6" />
            <h3 className="text-xl font-black text-white/20 uppercase tracking-widest">Vault is Vacuum</h3>
            <p className="text-gray-600 text-[10px] font-bold uppercase mt-2">Dossiers saved from Investigator will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseVault;
