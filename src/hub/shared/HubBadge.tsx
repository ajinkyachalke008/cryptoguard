// src/hub/shared/HubBadge.tsx
import React from 'react';

interface HubBadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'green' | 'red' | 'gray';
}

export const HubBadge: React.FC<HubBadgeProps> = ({ children, variant = 'gold' }) => {
  const styles = {
    gold: 'bg-gold/10 text-gold border-gold/40 shadow-[0_0_10px_-2px_rgba(255,215,0,0.2)]',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tight ${styles[variant]}`}>
      {children}
    </span>
  );
};
