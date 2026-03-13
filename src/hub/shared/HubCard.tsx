import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ExternalLink, Cpu } from 'lucide-react';
import { HUB_RESOURCES } from '../data/hubResources';

interface HubCardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  resourceId?: string;
  dataSource?: string;
}

export const HubCard: React.FC<HubCardProps> = ({ title, icon, children, className = '', glow = true, resourceId, dataSource }) => {
  const [showInfo, setShowInfo] = useState(false);
  const resource = resourceId ? HUB_RESOURCES[resourceId] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-xl bg-black/40 border border-gold/20 backdrop-blur-md overflow-hidden ${glow ? 'hover:border-gold/50 transition-colors shadow-[0_0_15px_-5px_rgba(255,215,0,0.1)] hover:shadow-[0_0_20px_-5px_rgba(255,215,0,0.3)]' : ''} ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        {title && (
          <h3 className="text-xl font-bold text-gold uppercase tracking-wider flex items-center gap-2">
            {icon}
            {title}
          </h3>
        )}
        {resource && (
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="text-gold/50 hover:text-gold transition-colors p-1 rounded-full hover:bg-gold/10"
          >
            <Info size={18} />
          </button>
        )}
      </div>

      <div className="relative z-10">
        {children}
      </div>
      
      {/* Detail Overlay */}
      <AnimatePresence>
        {showInfo && resource && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Cpu className="text-gold size-5" />
                <h4 className="text-sm font-black text-white uppercase tracking-tighter">RESOURCE METADATA</h4>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-400 mb-2 italic">"{resource.description}"</p>
                <div className="h-[1px] bg-gold/10" />
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-3">Granular Details</h5>
                <ul className="space-y-2">
                  {resource.details.map((d, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start space-x-2">
                      <span className="text-gold mt-1">▹</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-3">Resources Required</h5>
                <div className="space-y-2">
                  {resource.resources.map((r, i) => (
                    <a 
                      key={i} 
                      href={r.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block p-2 rounded bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-gold/5 transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white group-hover:text-gold">{r.name}</span>
                        <ExternalLink size={10} className="text-gray-500" />
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1">{r.purpose}</div>
                    </a>
                  ))}
                </div>
              </div>

              {resource.technicalNotes && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Tech Note</span>
                  <p className="text-[10px] text-blue-300/70">{resource.technicalNotes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold/10 pointer-events-none" />
      
      {dataSource && (
        <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between pointer-events-none">
          <div className="h-[1px] flex-1 bg-white/5 mr-4" />
          <div className="flex items-center space-x-1 font-mono text-[7px] font-black text-gray-500 uppercase tracking-widest bg-[#0a0a0a] px-2">
            <span className="text-gold/50 tracking-tighter mr-1">DATA_SRC:</span>
            {dataSource}
          </div>
        </div>
      )}
    </motion.div>
  );
};
