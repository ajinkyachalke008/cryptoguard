// src/components/VoiceAIModal.tsx
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Send, Bot, User, Sparkles, Loader2, Volume2, Globe, Radio, Fingerprint, Waves, Zap, Shield, Database, Cpu, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface VoiceAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceAIModal({ open, onOpenChange }: VoiceAIModalProps) {
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING'>('IDLE');
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 120;
    const barWidth = canvas.width / bars;
    const data = new Uint8Array(bars);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.05)');
      gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 1)');

      if (analyserRef.current && status === 'LISTENING') {
        const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(freqData);
        // Map high-res FFT data to our bars
        for (let i = 0; i < bars; i++) {
          const val = freqData[Math.floor(i * (freqData.length / bars))] / 255 * canvas.height;
          ctx.fillStyle = gradient;
          ctx.fillRect(i * barWidth + 1, canvas.height - val, barWidth - 2, val);
        }
      } else if (status === 'RESPONDING') {
         // Simulated response pattern but more rhythmic than random
         for (let i = 0; i < bars; i++) {
           const val = (Math.sin(Date.now() * 0.01 + i * 0.1) * 0.5 + 0.5) * canvas.height * 0.5;
           ctx.fillStyle = gradient;
           ctx.fillRect(i * barWidth + 1, canvas.height - val, barWidth - 2, val);
         }
      } else {
        // Idle/Processing line
        for (let i = 0; i < bars; i++) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
          ctx.fillRect(i * barWidth + 1, canvas.height / 2, barWidth - 2, 2);
        }
      }
      
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [status]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      setStatus('LISTENING');
      setResponse(null);
      setTranscript("");
      setTimeout(() => setTranscript("Searching for high-risk cluster patterns..."), 1500);
    } catch (err) {
      console.error("Mic access denied:", err);
      // Fallback to simulated if denied
      setStatus('LISTENING');
    }
  };

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setStatus('PROCESSING');
    setTimeout(() => {
      setStatus('RESPONDING');
      setResponse("Institutional uplink confirmed. I have localized a multi-hop laundering sequence involving 4 cross-chain bridges. Primary suspect node: 0x742...44E. Risk Level: CRITICAL. Recommendation: Cross-reference with CipherTrace logs.");
    }, 2500);
  };

  const toggleListening = () => {
    if (status === 'LISTENING') stopListening();
    else startListening();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            onClick={() => onOpenChange(false)}
          >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gold/5 rounded-full blur-[150px] animate-pulse" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: -20 }}
            className="relative w-full max-w-4xl bg-black/40 border border-gold/30 rounded-[4rem] p-1 p-px shadow-[0_0_150px_rgba(255,215,0,0.1)] backdrop-blur-3xl overflow-hidden"
          >
            <div className="bg-[#0a0a0a] rounded-[3.9rem] p-16 relative overflow-hidden">
               <div className="absolute top-10 left-10 size-20 border-t border-l border-gold/40 rounded-tl-3xl opacity-50" />
               <div className="absolute top-10 right-10 size-20 border-t border-r border-gold/40 rounded-tr-3xl opacity-50" />
               <div className="absolute bottom-10 left-10 size-20 border-b border-l border-gold/40 rounded-bl-3xl opacity-50" />
               <div className="absolute bottom-10 right-10 size-20 border-b border-r border-gold/40 rounded-br-3xl opacity-50" />

               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_20px_#ffd700]" />
               
               <button onClick={() => onOpenChange(false)} className="absolute right-12 top-12 text-gold/40 hover:text-gold transition-all hover:scale-110 z-50"><X size={32} /></button>

               <div className="text-center space-y-16">
                  <div className="space-y-4">
                     <div className="inline-flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[12px] font-black text-gold uppercase tracking-[0.5em] animate-pulse">
                        <Radio size={14} /> ARIA-V SPECTRAL UPLINK [LIVE]
                     </div>
                     <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none">
                        VOICE <span className="text-gold">SPECTRE</span>
                     </h2>
                  </div>

                  <div className="relative h-64 w-full flex items-center justify-center p-12 bg-black/60 border border-gold/10 rounded-[3rem] overflow-hidden group">
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                     <canvas ref={canvasRef} width={800} height={200} className="w-full h-full opacity-80" />
                     <div className="absolute inset-0 pointer-events-none border-[20px] border-[#0a0a0a]" />
                     <div className="absolute top-4 left-6 text-[9px] font-mono text-gold/40 uppercase tracking-widest">FFT_SPECTRUM_OSINT_SYBILS</div>
                     <div className="absolute bottom-4 right-6 text-[9px] font-mono text-gold/40 uppercase tracking-widest">SAMPLING: 44.1KHZ // MIC_INPUT: ACTIVE</div>
                  </div>

                  <div className="min-h-[160px] flex flex-col items-center justify-center space-y-8">
                     {status === 'LISTENING' && (
                        <div className="space-y-4">
                           <p className="text-3xl font-black text-white italic animate-pulse tracking-tight">"{transcript || 'Listening for audio vector...'}"</p>
                           <div className="flex gap-4 items-center justify-center text-[10px] text-gold/60 font-black uppercase tracking-[0.3em]">
                              <span className="flex items-center gap-1"><div className="size-1.5 bg-gold rounded-full animate-ping" /> REAL_TIME_INTERCEPT</span>
                              <span>|</span>
                              <span>QUAL_HI_RES</span>
                           </div>
                        </div>
                     )}

                     {status === 'PROCESSING' && (
                        <div className="flex flex-col items-center gap-6">
                           <div className="relative size-24">
                              <Loader2 className="absolute inset-0 size-24 text-gold animate-[spin_2s_linear_infinite]" />
                              <div className="absolute inset-6 size-12 bg-gold/10 rounded-full flex items-center justify-center"><Cpu className="text-gold size-6" /></div>
                           </div>
                           <p className="text-sm text-gold/80 font-black uppercase tracking-[0.4em] italic">Synthesizing Forensic Metadata...</p>
                        </div>
                     )}

                     {status === 'RESPONDING' && response && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 bg-gold/5 border-2 border-gold/20 rounded-[3rem] text-left relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Fingerprint size={120} /></div>
                           <div className="flex items-center gap-3 text-gold font-black text-[12px] uppercase mb-6 tracking-[0.3em]">
                              <Bot size={20} /> ARIA DATA SYNTHESIS
                           </div>
                           <p className="text-xl text-gray-200 leading-relaxed font-medium italic underline decoration-gold/20 underline-offset-8">
                              {response}
                           </p>
                           <div className="mt-10 flex gap-6">
                              <Button variant="outline" className="h-14 px-10 rounded-2xl border-gold/30 gold-glow hover:bg-gold/10 text-gold text-[12px] font-black uppercase tracking-widest">
                                 <Volume2 size={20} className="mr-3" /> READ_ALOUD
                              </Button>
                              <Button variant="outline" className="h-14 px-10 rounded-2xl border-white/10 hover:bg-white/5 text-white text-[12px] font-black uppercase tracking-widest">
                                 <Globe size={20} className="mr-3" /> FULL_DOSSIER
                              </Button>
                           </div>
                        </motion.div>
                     )}

                     {status === 'IDLE' && (
                        <p className="text-gray-600 font-bold uppercase tracking-[0.6em] text-[11px] italic animate-pulse">Touch to Initiate Forensic Interrogation Hub</p>
                     )}
                  </div>

                  <div className="pt-8">
                     <Button onClick={toggleListening} className={`size-36 rounded-full p-0 shadow-2xl transition-all duration-700 group relative ${status === 'LISTENING' ? 'bg-red-600 shadow-red-600/40 scale-110' : 'bg-gold shadow-gold/40 hover:scale-105'}`}>
                        {status === 'LISTENING' || status === 'PROCESSING' ? <X size={48} className="text-white" /> : <Mic size={48} className="text-black group-hover:scale-110 transition-transform" />}
                        <div className="absolute -inset-4 rounded-full border border-gold/20 animate-[ping_4s_infinite]" />
                     </Button>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
