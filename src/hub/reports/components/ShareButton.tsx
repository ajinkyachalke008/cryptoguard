// src/hub/reports/components/ShareButton.tsx
'use client'
import React, { useState } from 'react';
import { Share2, MessageCircle, Send, Mail, X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntelligenceDossier } from '../../services/investigation.service';

interface Props {
  dossier: IntelligenceDossier;
  label?: string;
  className?: string;
}

export const ShareButton: React.FC<Props> = ({ dossier, label = "Intelligence_Share", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSITREP = () => {
    const riskLevel = dossier.security.riskScore < 30 ? 'LOW' : dossier.security.riskScore < 70 ? 'MEDIUM' : 'CRITICAL';
    const reportId = dossier.entity.isDeterministic ? `ESI_${dossier.entity.address.slice(2, 8).toUpperCase()}` : `LIVE_${dossier.entity.address.slice(2, 8).toUpperCase()}`;
    
    return `*CRYPTOGUARD SITREP [${reportId}]*
---------------------------
*Type:* ${dossier.entity.type}
*Address:* ${dossier.entity.address}
*Risk Profile:* ${riskLevel} (${dossier.security.riskScore}/100)
*Sanctions Status:* ${dossier.security.isSanctioned ? '🚩 LISTED' : '✅ CLEARED'}
*Capital Est:* $${dossier.financials.netWorth.toLocaleString()}

*Summary:* ${dossier.security.riskLevel} threat actor profile detected on ${dossier.entity.chain.toUpperCase()}. Forensic scan completed.

_Sent via CryptoGuard Intelligence Hub_`;
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(generateSITREP());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(generateSITREP());
    window.open(`https://t.me/share/url?url=https://cryptoguard.ai&text=${text}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`[SITREP] Intelligence Dossier: ${dossier.entity.address.slice(0, 8)}`);
    const body = encodeURIComponent(generateSITREP());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSITREP());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-[0.2em] hover:text-white transition-all ${className}`}
      >
        <Share2 className="size-3" /> {label}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0E1A] border border-gold/20 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(255,215,0,0.1)] overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gold/50 blur-xl" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Broadcast SITREP</h2>
                  <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">Forensic Transmission Hub</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={shareWhatsApp}
                  className="w-full flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all group"
                >
                  <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                    <MessageCircle className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-white uppercase">WhatsApp</div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">Direct Intel Transmission</div>
                  </div>
                </button>

                <button 
                  onClick={shareTelegram}
                  className="w-full flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all group"
                >
                  <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                    <Send className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-white uppercase">Telegram</div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase">SECURE_LINK_BROADCAST</div>
                  </div>
                </button>

                <button 
                  onClick={shareEmail}
                  className="w-full flex items-center gap-4 p-4 bg-gold/10 border border-gold/20 rounded-2xl hover:bg-gold/20 transition-all group"
                >
                  <div className="size-10 rounded-full bg-gold flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                    <Mail className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-white uppercase">Official Email</div>
                    <div className="text-[10px] text-gold font-bold uppercase">Institutional Sitrep</div>
                  </div>
                </button>

                <div className="pt-4 mt-2 border-t border-white/5">
                  <button 
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all"
                  >
                    {copied ? <Check className="size-3 text-gold" /> : <Copy className="size-3" />}
                    {copied ? 'SITREP_COPIED' : 'Copy Formatted Briefing'}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[9px] text-gray-600 font-mono italic">
                  CAUTION: Encrypted transmission recommended for classified field reports.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
