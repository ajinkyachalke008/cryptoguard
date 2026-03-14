// src/hub/osint/OSINTLayout.tsx
import React from 'react';
import { Shield, Map, Monitor, Wallet, Activity, Zap, FileText, Search, Layers, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Sidebar Nav */}
      <div className="w-full lg:w-72 space-y-4 shrink-0">
        <div className="px-6 py-4 bg-black/60 border border-gold/10 rounded-2xl backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/40" />
          <h2 className="text-[11px] font-black text-gold uppercase tracking-[0.3em]">OSINT_COMMAND</h2>
          <p className="text-[10px] text-gray-500 font-bold italic mt-1 uppercase tracking-tight">Intelligence Module v2.0-Alpha</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-1 gap-3">
          {osintTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gold text-black shadow-[0_0_30px_rgba(255,215,0,0.25)] scale-[1.02] z-10' 
                    : 'bg-black/40 border border-gold/5 text-gray-400 hover:border-gold/30 hover:text-gold hover:bg-black/60'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="osint-active-bg"
                    className="absolute inset-0 bg-gold"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center w-full">
                  <div className={`p-2.5 rounded-xl mr-4 transition-colors ${isActive ? 'bg-black/10' : 'bg-gold/5 group-hover:bg-gold/10'}`}>
                    <Icon className={`size-5 ${isActive ? 'text-black' : 'text-gold'}`} />
                  </div>
                  <div className="text-left">
                    <div className={`text-[13px] font-black uppercase tracking-wider leading-none mb-1 shadow-sm ${isActive ? 'text-black' : 'text-white'}`}>
                      {tab.name}
                    </div>
                    <div className={`text-[11px] font-black uppercase tracking-tighter opacity-80 leading-none ${isActive ? 'text-black/90' : 'text-gray-400'}`}>
                      {tab.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feature Area */}
      <div className="flex-1 min-w-0">
        <div className="h-full bg-black/60 border border-gold/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden shadow-[inset_0_0_50px_rgba(255,215,0,0.02)]">
          <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
            <Shield className="size-64 text-gold rotate-12" />
          </div>
          <div className="relative z-10 h-full">
            {children}
          </div>
          {/* Scanning Line Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent absolute top-0 animate-scan-line" />
          </div>
        </div>
      </div>
    </div>
  );
};
