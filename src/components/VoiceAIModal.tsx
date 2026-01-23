"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mic, Send, Bot, User, Sparkles, Loader2, Volume2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VoiceAIModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceAIModal({ open, onOpenChange }: VoiceAIModalProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setPulseScale(1 + Math.random() * 0.5)
      }, 200)
      return () => clearInterval(interval)
    } else {
      setPulseScale(1)
    }
  }, [isListening])

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      if (transcript) {
        processCommand(transcript)
      }
    } else {
      setIsListening(true)
      setResponse(null)
      setTranscript("")
      
      // Simulate voice-to-text
      setTimeout(() => {
        const commands = [
          "Show latest fraud in Asia",
          "What is the risk score of 0x742d...44E?",
          "Analyze the latest Uniswap transaction",
          "Check for wash trading in Bored Ape Yacht Club"
        ]
        setTranscript(commands[Math.floor(Math.random() * commands.length)])
      }, 2000)
    }
  }

  const processCommand = (cmd: string) => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setResponse(`I've analyzed your request regarding "${cmd}". I am currently scanning the relevant entities and cross-referencing with our global fraud database. The results show a 12% increase in suspicious activity in that sector over the last 24 hours.`)
    }, 1500)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-yellow-500/50 bg-black/90 p-8 shadow-[0_0_80px_#ffd70033]"
          >
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400"
            >
              <X className="size-5" />
            </button>

            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300">
                <Sparkles className="size-3" />
                ASK CRYPTOGUARD
              </div>
              
              <h2 className="mb-8 text-2xl font-black text-white italic uppercase tracking-tight">
                Voice Investigation
              </h2>

              {/* Visualizer */}
              <div className="relative mb-12 flex justify-center">
                <motion.div
                  animate={{ scale: pulseScale }}
                  className={`relative flex h-32 w-32 items-center justify-center rounded-full border-4 transition-colors duration-500 ${
                    isListening ? "border-yellow-500 bg-yellow-500/20" : "border-yellow-500/30 bg-black/40"
                  }`}
                >
                  <div className={`absolute inset-0 rounded-full bg-yellow-400/20 blur-xl transition-opacity duration-500 ${isListening ? "opacity-100" : "opacity-0"}`} />
                  <Mic className={`size-12 transition-colors duration-500 ${isListening ? "text-yellow-400" : "text-yellow-500/50"}`} />
                </motion.div>
                
                {/* Orbiting particles */}
                {isListening && [1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div 
                      className="absolute h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#ffd700]"
                      style={{ 
                        top: '50%', 
                        left: '50%', 
                        transform: `translate(${70 + i * 20}px, -50%)` 
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Interaction State */}
              <div className="min-h-[100px] space-y-4">
                {isListening && !transcript && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-medium text-yellow-300 animate-pulse"
                  >
                    Listening...
                  </motion.p>
                )}
                
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-white">
                      <User className="size-4 text-gray-500" />
                      <p className="text-lg font-bold italic">"{transcript}"</p>
                    </div>
                    
                    {!isProcessing && !response && (
                      <Button 
                        onClick={() => processCommand(transcript)}
                        className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold"
                      >
                        <Send className="size-4 mr-2" />
                        Execute Command
                      </Button>
                    )}
                  </motion.div>
                )}

                {isProcessing && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 text-yellow-500 animate-spin" />
                    <p className="text-sm text-gray-400">Processing global dataset...</p>
                  </div>
                )}

                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-left"
                  >
                    <div className="mb-2 flex items-center gap-2 text-yellow-400 font-bold text-sm">
                      <Bot className="size-4" />
                      <span>CRYPTOGUARD AI</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {response}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-[10px] border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                        <Volume2 className="size-3 mr-1" /> Read Aloud
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-[10px] border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                        <Globe className="size-3 mr-1" /> Full Report
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Hint */}
              {!isListening && !response && !isProcessing && (
                <p className="mt-8 text-xs text-gray-500">
                  Click the microphone to start voice investigation
                </p>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="mt-8 flex justify-center gap-4">
              <Button
                onClick={toggleListening}
                size="lg"
                className={`h-16 w-16 rounded-full p-0 shadow-lg transition-all ${
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/40" 
                    : "bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/40"
                }`}
              >
                {isListening ? (
                  <X className="size-8 text-white" />
                ) : (
                  <Mic className="size-8 text-black" />
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
