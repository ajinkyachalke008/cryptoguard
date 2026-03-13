// src/hub/osint/OSINTRouter.tsx
import React, { lazy, Suspense } from 'react';

const ContractAuditor = lazy(() => import('./features/F8_ContractAudit/ContractAuditor'));
const TransactionTracer = lazy(() => import('./features/F1_Tracer/TransactionTracer'));
const DarkWebMonitor = lazy(() => import('./features/F3_DarkWeb/DarkWebMonitor'));
const WalletProfiler = lazy(() => import('./features/F2_WalletProfile/WalletProfiler'));
const ManipulationDetector = lazy(() => import('./features/F7_Manipulation/ManipulationDetector'));
const ExchangeFlows = lazy(() => import('./features/F4_ExchangeFlows/ExchangeFlows'));
const SmartMoney = lazy(() => import('./features/F5_SmartMoney/SmartMoney'));
const ForensicsLab = lazy(() => import('./features/F6_Forensics/ForensicsLab'));
const BridgeMonitor = lazy(() => import('./features/F9_Bridges/BridgeMonitor'));
const CaseManager = lazy(() => import('./features/F10_CaseManager/CaseManager'));

export const OSINTRouter: React.FC<{ activeTab?: string }> = ({ activeTab = 'tracer' }) => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 text-gold animate-pulse font-bold tracking-widest uppercase">Initializing OSINT Intelligence...</div>}>
      {activeTab === 'tracer' && <TransactionTracer />}
      {activeTab === 'profile' && <WalletProfiler />}
      {activeTab === 'darkweb' && <DarkWebMonitor />}
      {activeTab === 'audit' && <ContractAuditor />}
      {activeTab === 'manipulation' && <ManipulationDetector />}
      {activeTab === 'flows' && <ExchangeFlows />}
      {activeTab === 'money' && <SmartMoney />}
      {activeTab === 'forensics' && <ForensicsLab />}
      {activeTab === 'bridges' && <BridgeMonitor />}
      {activeTab === 'cases' && <CaseManager />}
      {!['tracer', 'profile', 'darkweb', 'audit', 'manipulation', 'flows', 'money', 'forensics', 'bridges', 'cases'].includes(activeTab) && (
        <div className="h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gold/5 rounded-2xl">
          <p className="text-sm italic uppercase tracking-widest font-bold text-gold/20">Module Initializing...</p>
        </div>
      )}
    </Suspense>
  );
};
