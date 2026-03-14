"use client"
// src/hub/HubLayout.tsx
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HUB_ROUTES, SUPPORTED_CHAINS } from './hub.constants';
import { useHubStore } from './HubStore';
import { ChainId } from './hub.types';
import HubBackground from './shared/HubBackground';
import NavBar from '@/components/NavBar';
import { Clock } from 'lucide-react';

const DigitalClock = () => {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-gold/5 border border-gold/20 rounded-xl backdrop-blur-xl group hover:border-gold/40 transition-all">
      <Clock className="size-3 text-gold animate-pulse" />
      <span className="text-[11px] font-black text-white font-mono tracking-widest whitespace-nowrap">
        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        <span className="text-gold/50 ml-1 text-[8px]">UTC</span>
      </span>
    </div>
  );
};

export const HubLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedChain, setChain } = useHubStore();

  const tabs = [
    { name: 'Overview', path: HUB_ROUTES.ROOT },
    { name: 'Investigator', path: HUB_ROUTES.INVESTIGATOR },
    { name: 'Market', path: HUB_ROUTES.MARKET },
    { name: 'Wallet', path: HUB_ROUTES.WALLET },
    { name: 'DeFi', path: HUB_ROUTES.DEFI },
    { name: 'DEX', path: HUB_ROUTES.DEX },
    { name: 'AML', path: HUB_ROUTES.AML },
    { name: 'Liquidity Pulse', path: (HUB_ROUTES as any).PULSE },
    { name: 'OSINT', path: HUB_ROUTES.OSINT },
    { name: 'Sentiment', path: HUB_ROUTES.SENTIMENT },
    { name: 'Health', path: HUB_ROUTES.API_HEALTH },
    { name: 'Networks', path: HUB_ROUTES.CHAIN },
    { name: 'Resources', path: HUB_ROUTES.RESOURCES },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-gold/30 selection:text-gold">
      <NavBar />
      <HubBackground />
      
      {/* Hub Sub-Nav */}
      <div className="sticky top-[64px] z-40 w-full border-b border-gold/5 bg-black/60 backdrop-blur-3xl">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between px-8 h-16">
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-2">
            <DigitalClock />
            <div className="h-4 w-[1px] bg-gold/20 mx-2" />
            {tabs.map((tab) => {
              const isActive = pathname === tab.path || (tab.path !== HUB_ROUTES.ROOT && pathname.startsWith(tab.path));
              return (
                <button
                  key={tab.path}
                  onClick={() => router.push(tab.path)}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative group overflow-hidden ${
                    isActive 
                      ? 'text-black shadow-[0_0_25px_-5px_rgba(255,215,0,0.5)] scale-105 z-10' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {/* Background Layer */}
                  <div className={`absolute inset-0 transition-transform duration-500 ${
                    isActive ? 'bg-gold' : 'bg-white/5 -translate-y-full group-hover:translate-y-0'
                  }`} />
                  
                  {/* Text Layer */}
                  <span className="relative z-10 transition-colors duration-300">{tab.name}</span>
                  
                  {/* Active Underglow */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-white/60 blur-[3px]" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="h-8 w-[1px] bg-gold/10 mx-2" />
            <div className="relative group">
              <select 
                value={selectedChain}
                onChange={(e) => setChain(e.target.value as ChainId)}
                className="bg-black/60 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-[0.3em] rounded-xl px-6 py-2.5 outline-none hover:border-gold/50 cursor-pointer appearance-none text-center min-w-[160px] transition-all focus:ring-2 focus:ring-gold/20"
              >
                {Object.entries(SUPPORTED_CHAINS).map(([id, config]) => (
                  <option key={id} value={id} className="bg-[#0a0a0a] text-white py-4">{config.name} CORE</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold/40 text-[8px]">▼</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
    </div>
  );
};
