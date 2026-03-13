// src/hub/HubRouter.tsx
import React, { lazy, Suspense } from 'react';
import { HUB_ROUTES } from './hub.constants';

const MarketDashboard = lazy(() => import('./features/F1_MarketDashboard/MarketDashboard'));
const WalletScanner = lazy(() => import('./features/F2_WalletScanner/WalletScanner'));
const DefiExplorer = lazy(() => import('./features/F3_DefiExplorer/DefiExplorer'));
const DexAnalyzer = lazy(() => import('./features/F4_DexAnalyzer/DexAnalyzer'));
const AMLCenter = lazy(() => import('./features/F5_AMLCenter/AMLCenter'));
const OSINTModule = lazy(() => import('./osint/index'));
const GlobalPulse = lazy(() => import('./features/F9_GlobalPulse/GlobalPulse'));
const SentimentMonitor = lazy(() => import('./features/F7_SentimentMonitor/SentimentMonitor'));
const APIHealthPanel = lazy(() => import('./features/F8_APIHealthPanel/APIHealthPanel'));
const ResourceGuide = lazy(() => import('./features/F9_ResourceGuide/ResourceGuide'));
const ChainAnalysis = lazy(() => import('./features/F11_ChainAnalysis/ChainAnalysis'));
const CommandCenter = lazy(() => import('./features/F0_CommandCenter/CommandCenter'));

import { HubErrorBoundary } from './shared/HubErrorBoundary';

export const HubRouter: React.FC<{ activeTab?: string }> = ({ activeTab = HUB_ROUTES.ROOT }) => {
  return (
    <HubErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center p-20 text-gold animate-pulse font-bold tracking-widest">LOADING HUB INTELLIGENCE...</div>}>
        {activeTab === HUB_ROUTES.MARKET && <MarketDashboard />}
        {activeTab === HUB_ROUTES.WALLET && <WalletScanner />}
        {activeTab === HUB_ROUTES.DEFI && <DefiExplorer />}
        {activeTab === HUB_ROUTES.DEX && <DexAnalyzer />}
        {activeTab === HUB_ROUTES.AML && <AMLCenter />}
        {activeTab === HUB_ROUTES.OSINT && <OSINTModule />}
        {activeTab === HUB_ROUTES.SENTIMENT && <SentimentMonitor />}
        {activeTab === (HUB_ROUTES as any).PULSE && <GlobalPulse />}
        {activeTab === HUB_ROUTES.API_HEALTH && <APIHealthPanel />}
        {activeTab === HUB_ROUTES.CHAIN && <ChainAnalysis />}
        {activeTab === HUB_ROUTES.RESOURCES && <ResourceGuide />}
        {activeTab === HUB_ROUTES.ROOT && <CommandCenter />}
      </Suspense>
    </HubErrorBoundary>
  );
};
