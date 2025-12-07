"use client"

import { useState } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Monitor,
  Smartphone,
  Chrome,
  Code2,
  FileText,
  Package,
  Apple,
  Boxes,
  CheckCircle2,
  Star,
  Users,
  Zap,
  Shield,
  Globe,
  Database,
  Book,
  FileCode,
  FileSpreadsheet,
  ExternalLink,
  ArrowRight
} from "lucide-react"
import { toast } from "sonner"

interface DownloadItem {
  id: string
  name: string
  description: string
  version: string
  size: string
  platform: string
  releaseDate: string
  downloads: string
  icon: any
  featured?: boolean
}

const desktopApps: DownloadItem[] = [
  {
    id: "win",
    name: "CryptoGuard for Windows",
    description: "Full-featured desktop application with offline scanning and advanced graph analysis",
    version: "v2.5.0",
    size: "156 MB",
    platform: "Windows 10/11 (64-bit)",
    releaseDate: "Nov 28, 2025",
    downloads: "24.5K",
    icon: Monitor,
    featured: true
  },
  {
    id: "mac",
    name: "CryptoGuard for macOS",
    description: "Native macOS application optimized for Apple Silicon and Intel processors",
    version: "v2.5.0",
    size: "142 MB",
    platform: "macOS 12+ (Universal)",
    releaseDate: "Nov 28, 2025",
    downloads: "18.2K",
    icon: Apple,
    featured: true
  },
  {
    id: "linux",
    name: "CryptoGuard for Linux",
    description: "AppImage and DEB packages for popular Linux distributions",
    version: "v2.5.0",
    size: "168 MB",
    platform: "Ubuntu/Debian/Fedora",
    releaseDate: "Nov 28, 2025",
    downloads: "9.8K",
    icon: Boxes
  }
]

const mobileApps: DownloadItem[] = [
  {
    id: "ios",
    name: "CryptoGuard iOS",
    description: "Scan wallets, receive push alerts, and monitor your watchlist on the go",
    version: "v1.8.2",
    size: "89 MB",
    platform: "iOS 15.0 or later",
    releaseDate: "Nov 22, 2025",
    downloads: "45.3K",
    icon: Smartphone,
    featured: true
  },
  {
    id: "android",
    name: "CryptoGuard Android",
    description: "Full mobile experience with biometric security and offline mode",
    version: "v1.8.1",
    size: "72 MB",
    platform: "Android 9.0+",
    releaseDate: "Nov 18, 2025",
    downloads: "62.7K",
    icon: Smartphone,
    featured: true
  }
]

const browserExtensions: DownloadItem[] = [
  {
    id: "chrome",
    name: "CryptoGuard Extension",
    description: "Instant wallet scanning on any web3 site, inline risk warnings, and phishing protection",
    version: "v3.1.4",
    size: "4.2 MB",
    platform: "Chrome/Edge/Brave",
    releaseDate: "Dec 1, 2025",
    downloads: "127.5K",
    icon: Chrome,
    featured: true
  },
  {
    id: "firefox",
    name: "CryptoGuard for Firefox",
    description: "Privacy-focused extension with advanced fraud detection for Firefox users",
    version: "v3.1.2",
    size: "4.5 MB",
    platform: "Firefox 90+",
    releaseDate: "Nov 25, 2025",
    downloads: "34.8K",
    icon: Globe
  }
]

const apiResources = [
  {
    id: "api-docs",
    name: "API Documentation",
    description: "Complete REST API reference with authentication, endpoints, and examples",
    icon: Book,
    type: "PDF",
    size: "12.4 MB",
    pages: "248 pages"
  },
  {
    id: "sdk-js",
    name: "JavaScript SDK",
    description: "NPM package for Node.js and browser integration",
    icon: FileCode,
    type: "NPM",
    size: "2.1 MB",
    version: "v4.2.0"
  },
  {
    id: "sdk-python",
    name: "Python SDK",
    description: "PyPI package with async support and type hints",
    icon: FileCode,
    type: "PyPI",
    size: "1.8 MB",
    version: "v4.1.3"
  },
  {
    id: "postman",
    name: "Postman Collection",
    description: "Pre-configured API requests for testing and development",
    icon: Code2,
    type: "JSON",
    size: "486 KB",
    version: "v2.5.0"
  }
]

const sampleData = [
  {
    id: "sample-report",
    name: "Sample Wallet Report",
    description: "Example comprehensive wallet risk report with all sections",
    icon: FileText,
    format: "PDF",
    size: "3.2 MB"
  },
  {
    id: "sample-dataset",
    name: "Sample Transaction Dataset",
    description: "10K anonymized transactions with risk scores for testing",
    icon: FileSpreadsheet,
    format: "CSV",
    size: "15.7 MB"
  },
  {
    id: "sample-alerts",
    name: "Sample Alerts Export",
    description: "Real-world alert patterns and case studies",
    icon: Database,
    format: "JSON",
    size: "4.8 MB"
  }
]

const features = [
  { icon: Zap, label: "Real-time Scanning", description: "Instant fraud detection" },
  { icon: Shield, label: "Multi-Chain Support", description: "BTC, ETH, BSC, Solana & more" },
  { icon: Database, label: "Offline Mode", description: "Work without internet" },
  { icon: Globe, label: "Auto-Updates", description: "Always up to date" }
]

export default function DownloadsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (item: DownloadItem | any) => {
    setDownloading(item.id)
    
    // Simulate brief loading
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Create download based on platform
    let downloadUrl = ""
    let fileName = ""
    
    switch (item.id) {
      case "win":
        fileName = "CryptoGuard-Setup-v2.5.0.exe"
        downloadUrl = createDownloadFile(fileName, "Windows installer for CryptoGuard")
        break
      case "mac":
        fileName = "CryptoGuard-v2.5.0.dmg"
        downloadUrl = createDownloadFile(fileName, "macOS installer for CryptoGuard")
        break
      case "linux":
        fileName = "CryptoGuard-v2.5.0.AppImage"
        downloadUrl = createDownloadFile(fileName, "Linux AppImage for CryptoGuard")
        break
      case "ios":
        // Redirect to App Store
        window.open("https://apps.apple.com/app/cryptoguard", "_blank")
        toast.success("Opening App Store...")
        setDownloading(null)
        return
      case "android":
        // Redirect to Play Store
        window.open("https://play.google.com/store/apps/details?id=com.cryptoguard", "_blank")
        toast.success("Opening Google Play...")
        setDownloading(null)
        return
      case "chrome":
        // Redirect to Chrome Web Store
        window.open("https://chrome.google.com/webstore/detail/cryptoguard", "_blank")
        toast.success("Opening Chrome Web Store...")
        setDownloading(null)
        return
      case "firefox":
        // Redirect to Firefox Add-ons
        window.open("https://addons.mozilla.org/firefox/addon/cryptoguard", "_blank")
        toast.success("Opening Firefox Add-ons...")
        setDownloading(null)
        return
      default:
        // For API resources and samples
        fileName = `${item.name.replace(/\s+/g, '-')}.zip`
        downloadUrl = createDownloadFile(fileName, `${item.name} - Download from CryptoGuard`)
        break
    }
    
    // Trigger download
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up blob URL
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
    
    toast.success(`Downloading ${item.name}...`)
    setDownloading(null)
  }
  
  // Helper function to create downloadable files
  const createDownloadFile = (fileName: string, content: string) => {
    const fileContent = `
===========================================
CryptoGuard Installation Package
===========================================

File: ${fileName}
Downloaded: ${new Date().toLocaleString()}

INSTALLATION INSTRUCTIONS:
--------------------------

1. Extract this package to your preferred location
2. Run the installer with administrator privileges
3. Follow the on-screen setup wizard
4. Launch CryptoGuard and sign in with your account

SYSTEM REQUIREMENTS:
-------------------
- Internet connection for initial setup
- 4 GB RAM minimum (8 GB recommended)
- 500 MB available disk space
- Modern processor (2015 or newer)

FEATURES INCLUDED:
-----------------
✓ Real-time wallet scanning
✓ Multi-chain fraud detection
✓ AI-powered risk analysis
✓ Compliance reporting tools
✓ API integration capabilities
✓ Offline mode support

GETTING STARTED:
---------------
1. Create or sign in to your CryptoGuard account
2. Generate your API key from the dashboard
3. Configure your scan preferences
4. Start monitoring crypto transactions

SUPPORT:
--------
Documentation: https://docs.cryptoguard.com
Email: support@cryptoguard.com
Community: https://community.cryptoguard.com

===========================================
© 2025 CryptoGuard. All rights reserved.
===========================================
    `.trim()
    
    const blob = new Blob([fileContent], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }

  const DownloadCard = ({ item, showBadge = false }: { item: DownloadItem; showBadge?: boolean }) => {
    const Icon = item.icon
    const isDownloading = downloading === item.id
    
    return (
      <Card className={`border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all hover:shadow-[0_0_40px_#ffd70022] ${item.featured ? 'ring-2 ring-yellow-500/30' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-yellow-300 text-lg">{item.name}</CardTitle>
                  {item.featured && showBadge && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-400 text-sm mt-1">
                  {item.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Version</p>
              <p className="text-gray-300 font-medium">{item.version}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Size</p>
              <p className="text-gray-300 font-medium">{item.size}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Platform</p>
              <p className="text-gray-300 font-medium">{item.platform}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Downloads</p>
              <p className="text-gray-300 font-medium flex items-center gap-1">
                <Users className="w-3 h-3" />
                {item.downloads}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleDownload(item)}
              disabled={isDownloading}
              className="flex-1 bg-yellow-500 text-black font-semibold hover:bg-yellow-400 shadow-[0_0_24px_#ffd70066]"
            >
              {isDownloading ? (
                <>
                  <Download className="w-4 h-4 mr-2 animate-bounce" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
            >
              <FileText className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Released {item.releaseDate}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-[linear-gradient(180deg,#fff7cc_0%,#ffd700_50%,#b58100_100%)] bg-clip-text text-transparent mb-4">
            Download CryptoGuard
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get CryptoGuard on all your devices. Desktop apps, mobile apps, browser extensions, and developer tools.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>500K+ Downloads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>4.8/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span>100% Secure</span>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mb-8">
          <CardContent className="py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">{feature.label}</p>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="desktop" className="w-full">
          <TabsList className="bg-black/60 border border-yellow-500/30 p-1 mb-8">
            <TabsTrigger value="desktop" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Monitor className="w-4 h-4 mr-2" />
              Desktop Apps
            </TabsTrigger>
            <TabsTrigger value="mobile" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Apps
            </TabsTrigger>
            <TabsTrigger value="extensions" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Chrome className="w-4 h-4 mr-2" />
              Extensions
            </TabsTrigger>
            <TabsTrigger value="developers" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Code2 className="w-4 h-4 mr-2" />
              Developers
            </TabsTrigger>
          </TabsList>

          {/* Desktop Apps */}
          <TabsContent value="desktop" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {desktopApps.map(app => (
                <DownloadCard key={app.id} item={app} showBadge />
              ))}
            </div>

            {/* System Requirements */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mt-8">
              <CardHeader>
                <CardTitle className="text-yellow-300">System Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="text-gray-300 font-semibold mb-2">Windows</h4>
                    <ul className="text-gray-400 space-y-1">
                      <li>• Windows 10/11 (64-bit)</li>
                      <li>• 4 GB RAM minimum</li>
                      <li>• 500 MB disk space</li>
                      <li>• Internet connection</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-300 font-semibold mb-2">macOS</h4>
                    <ul className="text-gray-400 space-y-1">
                      <li>• macOS 12 or later</li>
                      <li>• Apple Silicon or Intel</li>
                      <li>• 4 GB RAM minimum</li>
                      <li>• 450 MB disk space</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-300 font-semibold mb-2">Linux</h4>
                    <ul className="text-gray-400 space-y-1">
                      <li>• Ubuntu 20.04+ / Debian 11+</li>
                      <li>• 4 GB RAM minimum</li>
                      <li>• 550 MB disk space</li>
                      <li>• GTK3 libraries</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Apps */}
          <TabsContent value="mobile" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {mobileApps.map(app => (
                <DownloadCard key={app.id} item={app} showBadge />
              ))}
            </div>

            {/* Mobile Features */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Mobile Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Shield, label: "Biometric Security", desc: "Face ID & Fingerprint" },
                    { icon: Zap, label: "Push Notifications", desc: "Real-time fraud alerts" },
                    { icon: Globe, label: "Offline Mode", desc: "View cached data offline" },
                    { icon: Database, label: "Local Database", desc: "Fast access to scans" }
                  ].map((feature, i) => {
                    const Icon = feature.icon
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-yellow-500/20">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300">{feature.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browser Extensions */}
          <TabsContent value="extensions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {browserExtensions.map(ext => (
                <DownloadCard key={ext.id} item={ext} showBadge />
              ))}
            </div>

            {/* Extension Features */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Extension Capabilities</CardTitle>
                <CardDescription className="text-gray-400">
                  Get instant risk warnings while browsing any crypto website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Automatic wallet address detection on web pages",
                    "Inline risk badges next to addresses on Twitter, Discord, Telegram",
                    "Phishing website warnings with real-time database",
                    "One-click scanning from any web3 dApp",
                    "Transaction preview with risk analysis before signing",
                    "Privacy-focused: no data collection or tracking"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Developer Resources */}
          <TabsContent value="developers" className="space-y-6">
            {/* API Resources */}
            <div>
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">API & SDKs</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {apiResources.map(resource => {
                  const Icon = resource.icon
                  return (
                    <Card key={resource.id} className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-300">{resource.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{resource.type}</span>
                            <span>•</span>
                            <span>{resource.size}</span>
                            {resource.version && (
                              <>
                                <span>•</span>
                                <span>{resource.version}</span>
                              </>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(resource)}
                            disabled={downloading === resource.id}
                            className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30"
                          >
                            {downloading === resource.id ? (
                              <Download className="w-4 h-4 animate-bounce" />
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-1" />
                                Get
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Sample Data */}
            <div>
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">Sample Data & Reports</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sampleData.map(sample => {
                  const Icon = sample.icon
                  return (
                    <Card key={sample.id} className="border-yellow-500/40 bg-black/60 backdrop-blur-sm hover:border-yellow-500/60 transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-300 text-sm">{sample.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{sample.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="text-gray-400">
                            <span>{sample.format}</span>
                            <span className="mx-2">•</span>
                            <span>{sample.size}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(sample)}
                            className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Quick Start */}
            <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-yellow-300 font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <p className="text-gray-300 font-medium">Get your API key</p>
                      <p className="text-sm text-gray-500 mt-1">Sign up and generate your API key from the dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-yellow-300 font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <p className="text-gray-300 font-medium">Install SDK</p>
                      <code className="text-xs bg-black/60 px-2 py-1 rounded text-yellow-300 block mt-2">
                        npm install @cryptoguard/sdk
                      </code>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-yellow-300 font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <p className="text-gray-300 font-medium">Start scanning</p>
                      <code className="text-xs bg-black/60 px-2 py-1 rounded text-yellow-300 block mt-2">
                        const result = await cryptoguard.scanWallet('0x...')
                      </code>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-6 bg-yellow-500 text-black font-semibold hover:bg-yellow-400">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Documentation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="border-yellow-500/40 bg-black/60 backdrop-blur-sm mt-8">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-yellow-300 mb-2">Need Help?</h3>
              <p className="text-gray-400 mb-6">Our support team is here to assist you with installation and setup</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                  <Book className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                  <Users className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
                <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}