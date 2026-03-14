"use client"
// src/hub/HubLayout.tsx
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HUB_ROUTES, SUPPORTED_CHAINS } from './hub.constants';
import { useHubStore } from './HubStore';
import { ChainId } from './hub.types';
import HubBackground from './shared/HubBackground';
import NavBar from '@/components/NavBar';

export const HubLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedChain, setChain } = useHubStore();

  const tabs = [
    { name: 'Overview', path: HUB_ROUTES.ROOT },
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
      <div className="sticky top-[64px] z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
                  pathname === tab.path 
                    ? 'bg-gold text-black shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-105' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="h-6 w-[1px] bg-white/10 mx-2" />
            <select 
              value={selectedChain}
              onChange={(e) => setChain(e.target.value as ChainId)}
              className="bg-black/40 border border-white/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 outline-none hover:border-gold/50 cursor-pointer appearance-none text-center min-w-[120px]"
            >
              {Object.entries(SUPPORTED_CHAINS).map(([id, config]) => (
                <option key={id} value={id} className="bg-black">{config.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
    </div>
  );
};
