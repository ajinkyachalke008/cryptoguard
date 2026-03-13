// src/hub/features/F6_OSINTBoard/components/GalaxyControls.tsx
import React from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCw, Settings, Aperture, Camera } from 'lucide-react';

interface GalaxyControlsProps {
  onReset: () => void;
  onScreenshot: () => void;
  bloomStrength: number;
  setBloomStrength: (val: number) => void;
}

const GalaxyControls: React.FC<GalaxyControlsProps> = ({ onReset, onScreenshot, bloomStrength, setBloomStrength }) => {
  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col space-y-2">
      <div className="p-2 bg-black/60 backdrop-blur-xl border border-gold/20 rounded-2xl flex flex-col space-y-1">
        <ControlBtn icon={ZoomIn} onClick={() => {}} />
        <ControlBtn icon={ZoomOut} onClick={() => {}} />
        <div className="h-[1px] bg-gold/10 my-1 mx-2" />
        <ControlBtn icon={RotateCw} onClick={onReset} />
        <ControlBtn icon={Camera} onClick={onScreenshot} />
        <ControlBtn icon={Maximize} onClick={() => {}} />
      </div>

      <div className="p-3 bg-black/60 backdrop-blur-xl border border-gold/20 rounded-2xl">
        <div className="flex items-center space-x-3">
          <Aperture className="size-4 text-gold" />
          <input 
            type="range" 
            min="0" 
            max="3" 
            step="0.1" 
            value={bloomStrength}
            onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
            className="w-24 accent-gold"
          />
        </div>
      </div>
    </div>
  );
};

const ControlBtn: React.FC<{ icon: any; onClick: () => void }> = ({ icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className="p-2.5 rounded-xl text-gold/40 hover:text-gold hover:bg-gold/10 transition-all active:scale-95"
  >
    <Icon className="size-4" />
  </button>
);

export default GalaxyControls;
