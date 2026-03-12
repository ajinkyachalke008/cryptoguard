"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Monitor } from "lucide-react"
import { toast } from "sonner"

export default function InstallButton({ variant = "default", className = "" }: { variant?: "default" | "outline", className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      toast.success("CryptoGuard is being installed!")
    } else {
      toast.info("Installation cancelled.")
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  if (!isInstallable) return null

  return (
    <div className="flex flex-col gap-1 w-full">
      <Button 
        onClick={handleInstallClick}
        className={`${variant === "default" ? "bg-yellow-500 text-black hover:bg-yellow-400" : "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"} ${className}`}
      >
        <Monitor className="w-4 h-4 mr-2" />
        Install Secure App
      </Button>
      <p className="text-[10px] text-center text-gray-500">Verified by CryptoGuard Multi-Sign Security</p>
    </div>
  )
}
