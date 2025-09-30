"use client"

import { Button } from "@/components/ui/button"
import { Mic, Sparkles, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { RegistrationModal } from "./RegistrationModal"

export default function NavBar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur bg-background/90 border-b border-yellow-500/30">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-400 font-bold">
          <Sparkles className="size-5" />
          <span>Cryptoguard</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-yellow-500/50 text-yellow-300 hover:text-yellow-200 hover:border-yellow-400 shadow-[0_0_20px_#ffd70033] font-semibold"
            onClick={() => setAskOpen(true)}
          >
            <Mic className="size-4 mr-2" /> Ask AI
          </Button>
          <Button
            className="bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_#ffd70066] font-semibold"
            onClick={() => setOpen(true)}
          >
            Register
          </Button>
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-yellow-300 hover:text-yellow-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        </div>
      </div>
      <RegistrationModal open={open} onOpenChange={setOpen} />
      {/* Ask AI placeholder */}
      {askOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setAskOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-yellow-500/50 bg-background/95 p-6 shadow-[0_0_40px_#ffd70044] backdrop-blur">
            <div className="text-yellow-400 mb-3 font-bold">Ask Cryptoguard</div>
            <input
              placeholder="e.g., Show latest fraud in Asia"
              className="w-full rounded-md bg-black/60 border border-yellow-500/40 p-3 outline-none text-sm text-foreground placeholder:text-gray-400"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAskOpen(false)}>Close</Button>
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold">Ask</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}