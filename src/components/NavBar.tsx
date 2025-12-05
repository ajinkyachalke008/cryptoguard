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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Eye,
  Bell,
  Network,
  Download,
  LayoutDashboard,
  Home,
  Shield,
  Wallet,
  FileCode,
  Image,
  Store,
  MessageSquare,
  ChevronDown
} from "lucide-react"

const mainNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

const scannerItems = [
  { href: "/wallet-scan", label: "Wallet Scanner", icon: Wallet, description: "Multi-chain wallet risk analysis" },
  { href: "/scanner", label: "Quick Scan", icon: Search, description: "Fast wallet lookup" },
  { href: "/protocol-risk", label: "Protocol/Token", icon: FileCode, description: "DeFi protocol risk scoring" },
  { href: "/nft-risk", label: "NFT Collection", icon: Image, description: "Wash trading & fake volume" },
  { href: "/marketplace-risk", label: "Marketplace", icon: Store, description: "Marketplace risk assessment" },
]

const toolItems = [
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/graph", label: "Graph Explorer", icon: Network },
  { href: "/reports", label: "Reports", icon: Download },
  { href: "/ask-ai", label: "Ask CryptoGuard", icon: MessageSquare },
]

export default function NavBar() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isPathActive = (href: string) => pathname === href
  const isScannerActive = scannerItems.some(item => pathname === item.href)

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
          {/* Main Nav Items */}
          {mainNavItems.map((item) => {
            const isActive = isPathActive(item.href)
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

          {/* Scanners Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${
                  isScannerActive
                    ? "text-yellow-300 bg-yellow-500/20"
                    : "text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                }`}
              >
                <Search className="size-4 mr-1.5" />
                Scanners
                <ChevronDown className="size-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-black/95 border-yellow-500/30 backdrop-blur-sm">
              <DropdownMenuLabel className="text-yellow-400 text-xs">Risk Scanners</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-yellow-500/20" />
              {scannerItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`cursor-pointer ${
                      isPathActive(item.href)
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "text-gray-300 hover:text-yellow-300 hover:bg-yellow-500/10"
                    }`}
                  >
                    <Icon className="size-4 mr-2 text-yellow-500" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tools */}
          {toolItems.slice(0, 4).map((item) => {
            const isActive = isPathActive(item.href)
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
            onClick={() => router.push("/ask-ai")}
          >
            <MessageSquare className="size-4 mr-2" /> Ask AI
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
        <div className="lg:hidden border-t border-yellow-500/20 bg-background/95 backdrop-blur max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col p-4 space-y-1">
            {/* Main Items */}
            {mainNavItems.map((item) => {
              const isActive = isPathActive(item.href)
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

            {/* Scanner Section */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 px-3 py-2 font-semibold">SCANNERS</p>
              {scannerItems.map((item) => {
                const isActive = isPathActive(item.href)
                const Icon = item.icon
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`justify-start w-full ${
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
            </div>

            {/* Tools Section */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 px-3 py-2 font-semibold">TOOLS</p>
              {toolItems.map((item) => {
                const isActive = isPathActive(item.href)
                const Icon = item.icon
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`justify-start w-full ${
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
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-yellow-500/50 text-yellow-300"
                onClick={() => {
                  router.push("/ask-ai")
                  setMobileMenuOpen(false)
                }}
              >
                <MessageSquare className="size-4 mr-2" /> Ask AI
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
    </div>
  )
}