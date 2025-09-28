"use client"

import { Sun, Moon, Github, Linkedin, Twitter } from "lucide-react"
import { useTheme } from "next-themes"

export default function Footer() {
  const { theme, setTheme } = useTheme()
  return (
    <footer className="mt-16 border-t border-yellow-500/20 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-2 items-center">
        <div className="flex gap-6 text-sm">
          <a className="text-yellow-300 hover:text-yellow-200" href="#features">Explore features</a>
          <a className="text-yellow-300 hover:text-yellow-200" href="#about">About us</a>
          <a className="text-yellow-300 hover:text-yellow-200" href="#contact">Contact</a>
        </div>
        <div className="flex items-center justify-end gap-4">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-yellow-300/80 hover:text-yellow-200">
            <Twitter className="size-5 drop-shadow-[0_0_8px_#ffd70055]" />
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-yellow-300/80 hover:text-yellow-200">
            <Github className="size-5 drop-shadow-[0_0_8px_#ffd70055]" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-yellow-300/80 hover:text-yellow-200">
            <Linkedin className="size-5 drop-shadow-[0_0_8px_#ffd70055]" />
          </a>
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md border border-yellow-500/40 p-1.5 text-yellow-300 hover:text-yellow-200 hover:border-yellow-400 shadow-[0_0_12px_#ffd70044]"
          >
            {theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Cryptoguard</span>
        </div>
      </div>
    </footer>
  )
}