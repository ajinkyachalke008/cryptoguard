// src/hub/features/F9_GlobalPulse/components/PulseControls.tsx
import React from 'react';
import { RotateCw, Aperture, Wind, Layers } from 'lucide-react';

interface PulseControlsProps {
  autoRotate: boolean;
  setAutoRotate: (val: boolean) => void;
  bloomStrength: number;
  setBloomStrength: (val: number) => void;
}

const PulseControls: React.FC<PulseControlsProps> = ({ autoRotate, setAutoRotate, bloomStrength, setBloomStrength }) => {
  return (
    <div className="absolute top-6 right-6 z-30 flex flex-col space-y-3">
      <button 
        onClick={() => setAutoRotate(!autoRotate)}
        className={`p-3 rounded-2xl border transition-all flex items-center space-x-2 ${autoRotate ? 'bg-gold/20 border-gold text-gold' : 'bg-black/60 border-white/10 text-white/40'}`}
      >
        <RotateCw className={`size-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">Auto Rotate</span>
      </button>

      <div className="p-4 bg-black/60 backdrop-blur-2xl border border-white/5 rounded-3xl space-y-4">
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[8px] text-gray-500 font-black uppercase">
                <span>Bloom Intensity</span>
                <span className="text-gold">{bloomStrength.toFixed(1)}</span>
            </div>
            <input 
                type="range" min="0" max="3" step="0.1" 
                value={bloomStrength}
                onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
                className="w-32 accent-gold"
            />
        </div>

        <div className="h-[1px] bg-white/5" />
        
        <div className="flex items-center space-x-3 opacity-20 cursor-not-allowed">
            <Wind className="size-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Atmosphere Leak</span>
        </div>
      </div>
    </div>
  );
};

export default PulseControls;
