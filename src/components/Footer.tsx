"use client"

import { Sun, Moon, Github, Linkedin, Twitter } from "lucide-react"
import { useTheme } from "next-themes"

export default function Footer() {
  const { theme, setTheme } = useTheme()
  return (
    <footer className="mt-12 sm:mt-16 border-t border-yellow-500/30 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-0 items-center">
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm">
          <a className="text-yellow-300 hover:text-yellow-200 font-medium transition-colors active:scale-95" href="#features">Explore features</a>
          <a className="text-yellow-300 hover:text-yellow-200 font-medium transition-colors active:scale-95" href="#about">About us</a>
          <a className="text-yellow-300 hover:text-yellow-200 font-medium transition-colors active:scale-95" href="#contact">Contact</a>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-yellow-300/90 hover:text-yellow-200 transition-colors active:scale-95">
            <Twitter className="size-4 sm:size-5 drop-shadow-[0_0_8px_#ffd70055]" />
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-yellow-300/90 hover:text-yellow-200 transition-colors active:scale-95">
            <Github className="size-4 sm:size-5 drop-shadow-[0_0_8px_#ffd70055]" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-yellow-300/90 hover:text-yellow-200 transition-colors active:scale-95">
            <Linkedin className="size-4 sm:size-5 drop-shadow-[0_0_8px_#ffd70055]" />
          </a>
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md border border-yellow-500/50 p-1 sm:p-1.5 text-yellow-300 hover:text-yellow-200 hover:border-yellow-400 shadow-[0_0_12px_#ffd70044] transition-all active:scale-95"
          >
            {theme === "dark" ? (
              <Sun className="size-4 sm:size-5" />
            ) : (
              <Moon className="size-4 sm:size-5" />
            )}
          </button>
          <span className="text-[10px] sm:text-xs text-gray-400">© 2025 Cryptoguard</span>
        </div>
      </div>
    </footer>
  )
}