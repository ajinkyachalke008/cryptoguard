// src/hub/osint/OSINTLayout.tsx
import React from 'react';
import { Shield, Map, Monitor, Wallet, Activity, Zap, FileText, Search, Layers, Filter } from 'lucide-react';

interface OSINTLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const OSINTLayout: React.FC<OSINTLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const osintTabs = [
    { id: 'tracer', name: 'Tracer', icon: Map, desc: 'Flow Analysis' },
    { id: 'profile', name: 'Profile', icon: Wallet, desc: 'Entity Intel' },
    { id: 'darkweb', name: 'Dark Web', icon: Monitor, desc: 'Threat Signals' },
    { id: 'audit', name: 'Audit', icon: Shield, desc: 'Security SCAN' },
    { id: 'flows', name: 'Flows', icon: Activity, desc: 'Exch Intel' },
    { id: 'money', name: 'Smart Money', icon: Zap, desc: 'Whale Tracking' },
    { id: 'forensics', name: 'Forensics', icon: Search, desc: 'Lab Tools' },
    { id: 'manipulation', name: 'Manipulation', icon: Filter, desc: 'Pump/Wash' },
    { id: 'bridges', name: 'Bridges', icon: Layers, desc: 'Cross-Chain' },
    { id: 'cases', name: 'Cases', icon: FileText, desc: 'Management' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar Nav */}
      <div className="w-full lg:w-64 space-y-2">
        <div className="px-4 py-2 mb-4 bg-gold/5 border border-gold/20 rounded-xl">
          <h2 className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">OSINT Command</h2>
          <p className="text-[9px] text-gray-500 italic">Open Source Intelligence Module v1.0</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-1 gap-2">
          {osintTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center p-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.2)] scale-[1.02]' 
                    : 'bg-black/40 border border-white/5 text-gray-500 hover:border-gold/30 hover:text-gold'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-black/20' : 'bg-gold/5 group-hover:bg-gold/10'}`}>
                  <Icon className="size-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-black uppercase tracking-tight leading-none mb-0.5">{tab.name}</div>
                  <div className={`text-[9px] font-bold italic opacity-60 leading-none ${isActive ? 'text-black/70' : ''}`}>{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feature Area */}
      <div className="flex-1 min-w-0">
        <div className="h-full bg-black/20 border border-white/5 rounded-3xl p-6 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-20">
            <Shield className="size-32 text-gold/20 rotate-12" />
          </div>
          <div className="relative z-10 h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
