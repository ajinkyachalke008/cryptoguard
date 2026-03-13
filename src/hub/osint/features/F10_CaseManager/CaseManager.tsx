// src/hub/osint/features/F10_CaseManager/CaseManager.tsx
import React, { useState } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { FileText, Plus, Save, Trash2, Download, Search, Clock, Shield } from 'lucide-react';

const CaseManager: React.FC = () => {
  const [cases, setCases] = useState<any[]>([
    { id: 'CASE-001', title: 'Lazarus Group Wallet Cluster', status: 'ACTIVE', priority: 'CRITICAL', updated: '2h ago' },
    { id: 'CASE-002', title: 'Pepe Token Wash Trade Investigation', status: 'ACTIVE', priority: 'HIGH', updated: '1d ago' },
    { id: 'CASE-003', title: 'Multichain Bridge Exploit Flow', status: 'CLOSED', priority: 'CRITICAL', updated: '1w ago' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">OSINT Case Manager</h1>
          <p className="text-gray-400 text-sm italic">Aggregate evidence, document findings, and manage investigative dossiers</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2 bg-gold text-black text-xs font-black rounded-xl hover:bg-white transition-all uppercase">
          <Plus className="size-4" />
          <span>New Case</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <HubCard title="Dossier Statistics" dataSource="Case_Management_V1">
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                    <div className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">Active Investigations</div>
                    <div className="text-3xl font-black text-white">12</div>
                 </div>
                 <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Reports Exported</div>
                    <div className="text-3xl font-black text-white">142</div>
                 </div>
              </div>
           </HubCard>
           
           <HubCard title="Compliance Shortcuts">
              <div className="space-y-2">
                 <button className="w-full p-3 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold text-gray-400 uppercase text-left hover:border-gold/30 hover:text-gold transition-all flex items-center">
                    <Shield className="size-3 mr-2" /> SAR Filing Assistant
                 </button>
                 <button className="w-full p-3 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold text-gray-400 uppercase text-left hover:border-gold/30 hover:text-gold transition-all flex items-center">
                    <Search className="size-3 mr-2" /> Law Enforcement Portal
                 </button>
              </div>
           </HubCard>
        </div>

        <div className="lg:col-span-3">
          <HubCard title="Investigative Dossiers" dataSource="Internal_Evidence_Store">
             <div className="space-y-4">
                {cases.map((cs, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/40 border border-gold/10 group hover:border-gold/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="size-12 rounded-xl bg-gold/5 flex items-center justify-center">
                         <FileText className="size-6 text-gold" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-gold font-mono font-black">{cs.id}</span>
                          <h3 className="text-sm font-black text-white uppercase">{cs.title}</h3>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                           <HubBadge variant={cs.status === 'ACTIVE' ? 'gold' : 'green'}>{cs.status}</HubBadge>
                           <span className="text-[10px] text-red-500 font-black uppercase">{cs.priority} PRIORITY</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className="text-right mr-4">
                          <div className="text-[9px] text-gray-500 font-bold uppercase">Last Update</div>
                          <div className="text-[10px] text-white font-black italic">{cs.updated}</div>
                       </div>
                       <button className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-all"><Download className="size-4" /></button>
                       <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                ))}
             </div>
          </HubCard>
        </div>
      </div>
    </div>
  );
};

export default CaseManager;
