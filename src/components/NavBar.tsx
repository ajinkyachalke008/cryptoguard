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
  Download,
  LayoutDashboard,
  Home,
  Shield
} from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner", label: "Scanner", icon: Search },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/graph", label: "Graph", icon: Network },
  { href: "/reports", label: "Reports", icon: Download },
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
        <div 
          className="flex items-center gap-2 text-yellow-400 font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Shield className="size-5" />
          <span>Cryptoguard</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className={`text-sm ${
                  isActive 
                    ? "text-yellow-300 bg-yellow-500/20" 
                    : "text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                }`}
              >
                <Icon className="size-4 mr-1.5" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex border-yellow-500/50 text-yellow-300 hover:text-yellow-200 hover:border-yellow-400 shadow-[0_0_20px_#ffd70033] font-semibold"
            onClick={() => setAskOpen(true)}
          >
            <Mic className="size-4 mr-2" /> Ask AI
          </Button>
          <Button
            size="sm"
            className="hidden sm:flex bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_#ffd70066] font-semibold"
            onClick={() => setOpen(true)}
          >
            Register
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-yellow-300 hover:text-yellow-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-yellow-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-yellow-500/20 bg-background/95 backdrop-blur">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => {
                    router.push(item.href)
                    setMobileMenuOpen(false)
                  }}
                  className={`justify-start ${
                    isActive 
                      ? "text-yellow-300 bg-yellow-500/20" 
                      : "text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  }`}
                >
                  <Icon className="size-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-yellow-500/50 text-yellow-300"
                onClick={() => {
                  setAskOpen(true)
                  setMobileMenuOpen(false)
                }}
              >
                <Mic className="size-4 mr-2" /> Ask AI
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-yellow-500 text-black"
                onClick={() => {
                  setOpen(true)
                  setMobileMenuOpen(false)
                }}
              >
                Register
              </Button>
            </div>
          </nav>
        </div>
      )}

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