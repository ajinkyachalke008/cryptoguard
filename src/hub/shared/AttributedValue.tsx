// src/hub/shared/AttributedValue.tsx
import React from 'react';

interface AttributedValueProps {
  label?: string;
  value: string | number | React.ReactNode;
  source: string;
  className?: string;
  valueClassName?: string;
}

export const AttributedValue: React.FC<AttributedValueProps> = ({ 
  label, 
  value, 
  source, 
  className = '', 
  valueClassName = '' 
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">{label}</span>}
      <div className={`text-white font-black tracking-tight ${valueClassName}`}>
        {value}
      </div>
      <div className="flex items-center space-x-1 mt-1">
        <div className="size-1 rounded-full bg-gold/40" />
        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">
          Ref: {source}
        </span>
      </div>
    </div>
  );
};
