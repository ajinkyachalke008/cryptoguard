"use client"

import { Button } from "@/components/ui/button"
import { Mic, Sparkles, Sun, Moon, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { RegistrationModal } from "./RegistrationModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Eye,
  Bell,
  Network,
  FileText,
  LayoutDashboard,
  Home
} from "lucide-react"

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner", label: "Scanner", icon: Search },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/graph", label: "Graph", icon: Network },
  { href: "/reports", label: "Reports", icon: FileText },
]

export default function NavBar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur bg-background/90 border-b border-yellow-500/30">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-yellow-400 font-bold hover:text-yellow-300 transition-colors"
        >
          <Sparkles className="size-5" />
          <span>Cryptoguard</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-yellow-500/20 text-yellow-300 shadow-[0_0_12px_#ffd70033]"
                    : "text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                }`}
              >
                <Icon className="size-4" />
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Ask AI Button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex border-yellow-500/50 text-yellow-300 hover:text-yellow-200 hover:border-yellow-400 shadow-[0_0_20px_#ffd70033] font-semibold"
            onClick={() => setAskOpen(true)}
          >
            <Mic className="size-4 mr-2" /> Ask AI
          </Button>

          {/* Register Button */}
          <Button
            size="sm"
            className="hidden sm:flex bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_#ffd70066] font-semibold"
            onClick={() => setOpen(true)}
          >
            Register
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-yellow-300 hover:text-yellow-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          {/* Mobile Menu */}
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" className="text-yellow-300">
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-black/95 border-yellow-500/50 shadow-[0_0_40px_#ffd70033]"
            >
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => {
                      router.push(link.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 ${
                      isActive
                        ? "text-yellow-300 bg-yellow-500/20"
                        : "text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20"
                    }`}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator className="bg-yellow-500/20" />
              <DropdownMenuItem
                onClick={() => {
                  setAskOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20"
              >
                <Mic className="size-4 mr-2" />
                Ask AI
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="text-gray-300 focus:text-yellow-300 focus:bg-yellow-500/20"
              >
                <Sparkles className="size-4 mr-2" />
                Register
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <RegistrationModal open={open} onOpenChange={setOpen} />
      
      {/* Ask AI Modal */}
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