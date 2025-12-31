"use client"

import { Button } from "@/components/ui/button"
import { Mic, Sparkles, Sun, Moon, Menu, X, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { RegistrationModal } from "./RegistrationModal"
import { useAuth } from "@/contexts/AuthContext"
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
  ChevronDown,
  TrendingUp,
  Activity
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
  { href: "/contract-explainer", label: "Contract Explainer", icon: FileCode, description: "AI-powered contract analysis" },
]

const toolItems = [
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/crypto-watchlist", label: "Crypto Watchlist", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/graph", label: "Graph Explorer", icon: Network },
  { href: "/trust-timeline", label: "Trust Timeline", icon: Activity },
  { href: "/delta-engine", label: "Delta Engine", icon: Activity },
  { href: "/behavior-heatmap", label: "Behavior Heatmap", icon: Activity },
  { href: "/pattern-matcher", label: "Pattern Matcher", icon: Search },
  { href: "/social-hype", label: "Social Detector", icon: MessageSquare },
  { href: "/transaction-center", label: "Transaction Center", icon: Activity },
  { href: "/reports", label: "Reports", icon: Download },
  { href: "/ask-ai", label: "Ask CryptoGuard", icon: MessageSquare },
  { href: "/downloads", label: "Downloads", icon: Download },
]

export default function NavBar() {
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/downloads")}
            className={`text-sm ${
              isPathActive("/downloads")
                ? "text-yellow-300 bg-yellow-500/20" 
                : "text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/10"
            }`}
          >
            <Download className="size-4 mr-1.5" />
            Downloads
          </Button>
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
          
          {/* Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="hidden sm:flex bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_#ffd70066] font-semibold"
                >
                  <User className="size-4 mr-2" />
                  {user?.email.split('@')[0]}
                  <ChevronDown className="size-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-black/95 border-yellow-500/30 backdrop-blur-sm">
                <DropdownMenuLabel className="text-yellow-400">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-yellow-500/20" />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer text-gray-300 hover:text-yellow-300 hover:bg-yellow-500/10"
                >
                  <LayoutDashboard className="size-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex border-yellow-500/50 text-yellow-300 hover:text-yellow-200"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="hidden sm:flex bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_#ffd70066] font-semibold"
                onClick={() => setOpen(true)}
              >
                Register
              </Button>
            </>
          )}
          
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

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-yellow-500/50 text-yellow-300"
                onClick={() => {
                  router.push("/ask-ai")
                  setMobileMenuOpen(false)
                }}
              >
                <MessageSquare className="size-4 mr-2" /> Ask AI
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-yellow-500/50 text-yellow-300"
                    onClick={() => {
                      router.push("/dashboard")
                      setMobileMenuOpen(false)
                    }}
                  >
                    <User className="size-4 mr-2" />
                    {user?.email}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-500/50 text-red-400"
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="size-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-yellow-500/50 text-yellow-300"
                    onClick={() => {
                      router.push("/login")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-yellow-500 text-black"
                    onClick={() => {
                      setOpen(true)
                      setMobileMenuOpen(false)
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <RegistrationModal open={open} onOpenChange={setOpen} />
    </div>
  )
}