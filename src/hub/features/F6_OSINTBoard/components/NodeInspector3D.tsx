// src/hub/features/F6_OSINTBoard/components/NodeInspector3D.tsx
import React from 'react';
import { osintUtils } from '../../../osint/osint.utils';
import { X, ExternalLink, Shield, AlertCircle } from 'lucide-react';
import { HubBadge } from '../../../shared/HubBadge';

interface NodeInspector3DProps {
  node: any;
  onClose: () => void;
  onExpand: () => void;
}

const NodeInspector3D: React.FC<NodeInspector3DProps> = ({ node, onClose, onExpand }) => {
  if (!node) return null;

  return (
    <div className="bg-black/80 backdrop-blur-2xl border border-gold/20 rounded-2xl p-5 w-72 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gold font-black text-xs uppercase tracking-widest mb-1">{node.label || 'Unknown Node'}</h3>
          <p className="text-gray-500 font-mono text-[9px] break-all">{node.id}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Risk Status</div>
            <HubBadge variant={node.isSanctioned ? 'red' : 'green'}>
              {node.isSanctioned ? 'SANCTIONED' : 'CLEAR'}
            </HubBadge>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Node Type</div>
            <div className="text-[10px] text-white font-bold uppercase">{node.type || 'Standard'}</div>
          </div>
        </div>

        <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl">
          <div className="flex items-center space-x-2 text-gold mb-2">
            <Shield className="size-3" />
            <span className="text-[9px] font-black uppercase">Intelligence Summary</span>
          </div>
          <p className="text-[10px] text-gray-400 italic leading-snug">
            Entity shows signature behavior consistent with {node.type === 'mixer' ? 'privacy-preservation tools' : 'retail wallet'}. 
            Last active {osintUtils.maskAddress(node.id)} detected on mainnet.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onExpand}
            className="flex-1 py-1.5 bg-gold text-black text-[10px] font-black rounded-lg hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all uppercase"
          >
            Expand Node
          </button>
          <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
            <ExternalLink className="size-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeInspector3D;
