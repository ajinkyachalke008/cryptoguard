"use client"

import { Shield } from "lucide-react"

export function DeveloperBadge() {
  return (
    <div className="flex justify-center mb-6 sm:mb-8">
      <div 
        className="relative inline-flex items-center gap-2.5 sm:gap-3 rounded-full border-2 border-[#FF2E2E] bg-black/80 backdrop-blur-md shadow-[0_0_30px_#FF2E2E66,inset_0_0_20px_#FF2E2E22] animate-[slideDownFade_0.8s_ease-out,neonPulse_2.8s_ease-in-out_infinite,float_4s_ease-in-out_infinite] hover:scale-105 hover:shadow-[0_0_50px_#FF2E2E88,inset_0_0_30px_#FF2E2E33] transition-all duration-300 px-5 sm:px-[22px] py-2 sm:py-2.5 min-w-[320px] sm:min-w-[360px] max-w-[85vw] sm:max-w-[70vw] w-fit"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,0,0,0.9) 100%)",
        }}
      >
        {/* Holographic scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none opacity-60">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF2E2E] to-transparent animate-[scanLine_3.6s_ease-in-out_infinite]" />
        </div>

        {/* Shield Icon */}
        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF2E2E] drop-shadow-[0_0_8px_#FF2E2E] flex-shrink-0 relative z-10" />
        
        {/* Developer Text */}
        <span 
          className="relative z-10 text-[11px] sm:text-[14px] font-bold tracking-wide text-[#FFD659] drop-shadow-[0_0_12px_#FFD65999] whitespace-nowrap"
          style={{
            fontFamily: "'Orbitron', 'Eurostile', 'Rajdhani', sans-serif",
            textShadow: "0 0 20px rgba(255, 214, 89, 0.8), 0 0 40px rgba(255, 214, 89, 0.4)"
          }}
        >
          SOFTWARE DEVELOPER: AJINKYA CHALKE
        </span>

        {/* Corner accent glows */}
        <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#FF2E2E] opacity-40 blur-md rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#FF2E2E] opacity-40 blur-md rounded-full pointer-events-none" />
      </div>
    </div>
  )
}