"use client"

import { Shield } from "lucide-react"

export function DeveloperBadge() {
  return (
    <div className="flex justify-center w-full px-4 py-2">
      <div 
        className="developer-badge group inline-flex items-center gap-2.5 rounded-[10px] border-2 border-[#FF2E2E] bg-black/15 backdrop-blur-sm px-[22px] py-[10px] shadow-[0_0_18px_#FF2E2E] min-w-[360px] max-w-[70%] w-auto transition-all duration-180 hover:scale-[1.02] hover:shadow-[0_0_28px_#FF2E2E] motion-reduce:transform-none motion-reduce:animate-none"
        role="banner"
        aria-label="Software developer credit: Ajinkya Chalke"
      >
        <Shield 
          className="w-5 h-5 text-[#FFD659] flex-shrink-0" 
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="text-[#FFD659] font-semibold tracking-[0.6px] text-sm sm:text-[14px] whitespace-nowrap developer-badge-text">
          SOFTWARE DEVELOPER: AJINKYA CHALKE
        </span>
      </div>

      <style jsx global>{`
        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 18px #FF2E2E, 0 0 8px #FF2E2E80;
            filter: drop-shadow(0 0 8px #FFD65990);
          }
          50% {
            box-shadow: 0 0 28px #FF2E2E, 0 0 12px #FF6B6B;
            filter: drop-shadow(0 0 12px #FFD659);
          }
        }

        @keyframes scanLine {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes subtleYFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .developer-badge {
          animation: slideDownFade 450ms cubic-bezier(0.22, 0.9, 0.31, 1) forwards,
                     neonPulse 2.8s ease-in-out infinite,
                     subtleYFloat 6s ease-in-out infinite;
          position: relative;
          overflow: visible;
        }

        .developer-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 46, 46, 0.35) 50%,
            transparent 100%
          );
          animation: scanLine 3.6s linear infinite;
          pointer-events: none;
        }

        .developer-badge-text {
          text-shadow: 0 0 8px rgba(255, 214, 89, 0.9);
          font-family: 'Orbitron', 'Eurostile', 'Inter', system-ui, sans-serif;
          overflow: visible;
          text-overflow: clip;
        }

        .developer-badge:hover {
          box-shadow: 0 0 28px #FF2E2E, 0 0 14px #FF6B6B !important;
        }

        .developer-badge:hover .developer-badge-text {
          text-shadow: 0 0 12px rgba(255, 214, 89, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .developer-badge {
            animation: none !important;
            box-shadow: 0 0 18px #FF2E2E;
          }
          
          .developer-badge::before {
            animation: none !important;
            display: none;
          }
          
          .developer-badge:hover {
            transform: none !important;
          }
        }

        @media (max-width: 640px) {
          .developer-badge {
            min-w-[280px];
            max-w-[90%];
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .developer-badge-text {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}