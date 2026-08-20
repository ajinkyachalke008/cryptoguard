import { NextRequest, NextResponse } from "next/server"
import { resolveForensicEntity, generateRealisticAddress, generateRealisticTxHash, computeDeterministicSeed, RiskLevel, FORENSIC_COUNTRIES } from "@/lib/services/forensicEngine"

export interface GraphNode {
  id: string
  address: string
  label: string
  nodeType: "target" | "mixer" | "cex" | "bridge" | "defi" | "peel_hop" | "victim" | "contract" | "cold_wallet" | "otc_broker" | "drainer" | "sybil_node" | "validator" | "darknet" | "ransomware" | "lazarus_proxy" | "sanctioned_pool" | "flash_loan_pool" | "casino" | "market_maker" | "multisig"
  riskScore: number
  riskLevel: RiskLevel
  volume: number
  transactionCount: number
  country: string
  nodeExplanation: string
  behavioralTag: string
  entityRole: string
  tier?: string
  sanctionDetails?: string
  contractVerified?: boolean
  layer?: number
}

export interface GraphLink {
  source: string
  target: string
  value: number
  token: string
  transactionCount: number
  hashes: string[]
  patternLabel: string
  flowReason: string
  riskLevel?: RiskLevel
}

export interface ForensicActionPlan {
  actionId: string
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  title: string
  description: string
  targetEntity: string
  legalJurisdiction?: string
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get("address")
    const depth = Math.min(5, Math.max(1, parseInt(searchParams.get("depth") || "2")))
    const chainParam = searchParams.get("chain") || "ethereum"
    const scenario = searchParams.get("scenario") || ""

    if (!address) {
      return NextResponse.json({ error: "Address or transaction hash is required" }, { status: 400 })
    }

    const cleanInput = address.trim()
    const forensic = resolveForensicEntity(cleanInput, chainParam)
    const seed = computeDeterministicSeed(cleanInput)
    
    // Determine risk based on scenario or address seed
    let riskScore = forensic.riskScore
    let riskLevel: RiskLevel = forensic.riskLevel
    if (scenario === "critical") { riskScore = 98; riskLevel = "critical" }
    else if (scenario === "high") { riskScore = 76; riskLevel = "high" }
    else if (scenario === "medium") { riskScore = 52; riskLevel = "medium" }
    else if (scenario === "clean" || scenario === "low") { riskScore = 14; riskLevel = "low" }

    const pattern = forensic.patternDetails
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const nodeMap = new Set<string>()

    // Token symbol variation based on seed
    const TOKENS = ["ETH", "USDT", "USDC", "DAI", "WBTC", "AVAX", "ARB", "OP", "MATIC", "BNB"]
    const primaryToken = TOKENS[seed % TOKENS.length]
    const secondaryToken = TOKENS[(seed + 3) % TOKENS.length]

    // 1. Central Target Node
    const targetNode: GraphNode = {
      id: cleanInput,
      address: cleanInput,
      label: `🎯 Target (${cleanInput.slice(0, 6)}...${cleanInput.slice(-4)})`,
      nodeType: "target",
      riskScore,
      riskLevel,
      volume: forensic.amountUSD * 4 + 85000,
      transactionCount: Math.floor(forensic.amountUSD / 25) + 52,
      country: `${forensic.fromCountry.name} (${forensic.fromCountry.code})`,
      nodeExplanation: `Primary subject under investigation. Key participant in ${pattern.title}. Exhibits risk rating of ${riskScore}/100 with ${forensic.ruleFlags.length} active heuristic compliance flags.`,
      behavioralTag: "Primary Forensic Target",
      entityRole: "Central Flow Subject",
      tier: forensic.fromCountry.tier,
      layer: 2
    }
    nodes.push(targetNode)
    nodeMap.add(cleanInput)

    const addNode = (node: GraphNode) => {
      if (!nodeMap.has(node.id)) {
        nodes.push(node)
        nodeMap.add(node.id)
      }
    }

    const addLink = (link: GraphLink) => {
      links.push(link)
    }

    const pickCountry = (offset: number) => {
      return FORENSIC_COUNTRIES[(seed + offset * 7) % FORENSIC_COUNTRIES.length]
    }

    // ═══════════════════════════════════════════════════════════
    // PROCEDURAL TOPOLOGY GENERATION (DEPTH 1 TO 5)
    // ═══════════════════════════════════════════════════════════

    if (riskLevel === "critical") {
      // 🚨 CRITICAL GRAPH: Mixers, Phishing, Lazarus, Darknet, Ransomware

      // Layer 1: Ingress Victim Clusters
      const victimCount = depth === 5 ? 14 : depth === 4 ? 9 : depth === 3 ? 6 : depth === 2 ? 4 : 2
      for (let v = 1; v <= victimCount; v++) {
        const vCountry = pickCountry(v + 10)
        const vAddr = generateRealisticAddress(seed, 100 + v, forensic.chain)
        addNode({
          id: vAddr,
          address: vAddr,
          label: `🛑 Compromised Account #${v}`,
          nodeType: "victim",
          riskScore: Math.min(26, 12 + v * 2),
          riskLevel: "low",
          volume: forensic.amountUSD * (1.6 / v),
          transactionCount: 1 + (v % 4),
          country: `${vCountry.name} (${vCountry.code})`,
          nodeExplanation: `Victim wallet drained via unauthorized Permit2 / Seaport signature payload. Origin: ${vCountry.name}.`,
          behavioralTag: "Victim Ingress Endpoint",
          entityRole: "Compromised Source",
          layer: 1
        })
        addLink({
          source: vAddr,
          target: cleanInput,
          value: forensic.amountUSD * (1.6 / v),
          token: primaryToken,
          transactionCount: 1,
          hashes: [generateRealisticTxHash(seed + 100 + v, forensic.chain)],
          patternLabel: "Phishing Ingress Drain",
          flowReason: "Unauthorized asset extraction",
          riskLevel: "critical"
        })

        // Depth >= 4: Victim Funding Wallets
        if (depth >= 4 && v <= 4) {
          const vFunder = generateRealisticAddress(seed, 150 + v, forensic.chain)
          addNode({
            id: vFunder,
            address: vFunder,
            label: `💼 Retail User Wallet (Victim #${v} Source)`,
            nodeType: "cold_wallet",
            riskScore: 6,
            riskLevel: "low",
            volume: forensic.amountUSD * 2.2,
            transactionCount: 45,
            country: `${vCountry.name} (${vCountry.code})`,
            nodeExplanation: "Personal user account supplying initial legitimate capital before security breach.",
            behavioralTag: "Legitimate Retail Wallet",
            entityRole: "Pre-Compromise Ingress",
            layer: 0
          })
          addLink({
            source: vFunder,
            target: vAddr,
            value: forensic.amountUSD * (1.8 / v),
            token: primaryToken,
            transactionCount: 2,
            hashes: [generateRealisticTxHash(seed + 150 + v, forensic.chain)],
            patternLabel: "Personal Deposit",
            flowReason: "Pre-exploit funding",
            riskLevel: "low"
          })
        }
      }

      // Layer 3: Anonymity Hubs (Tornado / Sinbad / Wasabi)
      const mixer1 = "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b"
      addNode({
        id: mixer1,
        address: mixer1,
        label: "🌪️ Tornado Cash 100 ETH Vault (OFAC SDN)",
        nodeType: "mixer",
        riskScore: 99,
        riskLevel: "critical",
        volume: 32000000,
        transactionCount: 9420,
        country: "OFAC SDN Blacklisted",
        nodeExplanation: "Cryptographic anonymity mixing contract designated under US Treasury OFAC sanctions. Zero-knowledge proof pool.",
        behavioralTag: "Sanctioned Mixer Pool",
        entityRole: "Primary Layering Anonymizer",
        sanctionDetails: "US Treasury OFAC Executive Order 13694",
        layer: 3
      })
      addLink({
        source: cleanInput,
        target: mixer1,
        value: forensic.amountUSD * 0.85,
        token: primaryToken,
        transactionCount: 6,
        hashes: [generateRealisticTxHash(seed + 201, forensic.chain)],
        patternLabel: "Sanctioned Mixer Deposit",
        flowReason: "Direct capital deposit into OFAC SDN mixing contract",
        riskLevel: "critical"
      })

      if (depth >= 3) {
        const mixer2 = "0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936"
        addNode({
          id: mixer2,
          address: mixer2,
          label: "🌪️ Tornado Cash 10 ETH Vault (Secondary)",
          nodeType: "mixer",
          riskScore: 99,
          riskLevel: "critical",
          volume: 18500000,
          transactionCount: 7150,
          country: "OFAC SDN Blacklisted",
          nodeExplanation: "Secondary 10 ETH anonymity pool for split fractional laundering.",
          behavioralTag: "Sanctioned Mixer Pool",
          entityRole: "Split Anonymizer Pool",
          sanctionDetails: "US Treasury OFAC Executive Order 13694",
          layer: 3
        })
        addLink({
          source: cleanInput,
          target: mixer2,
          value: forensic.amountUSD * 0.35,
          token: primaryToken,
          transactionCount: 3,
          hashes: [generateRealisticTxHash(seed + 202, forensic.chain)],
          patternLabel: "Secondary Mixer Split",
          flowReason: "Fractional deposit for pool obfuscation",
          riskLevel: "critical"
        })
      }

      // Layer 4: Multi-Step Peel Chains
      const peelCount = depth === 5 ? 12 : depth === 4 ? 8 : depth === 3 ? 6 : depth === 2 ? 4 : 2
      let prevHop = mixer1
      for (let p = 1; p <= peelCount; p++) {
        const hopCountry = pickCountry(p + 30)
        const hopAddr = generateRealisticAddress(seed, 300 + p, forensic.chain)
        const hopRisk = Math.max(75, 98 - p * 3)
        addNode({
          id: hopAddr,
          address: hopAddr,
          label: `⛓️ Peel Layering Hop #${p}`,
          nodeType: "peel_hop",
          riskScore: hopRisk,
          riskLevel: "critical",
          volume: forensic.amountUSD * (1 - p * 0.07),
          transactionCount: 3,
          country: `${hopCountry.name} (${hopCountry.code})`,
          nodeExplanation: `Sequential intermediary layering address. Strips gas increments and forwards bulk balance to next hop to bypass heuristic clustering.`,
          behavioralTag: `Peel Chain Stage ${p}`,
          entityRole: "Layering Intermediary",
          layer: 4
        })
        addLink({
          source: prevHop,
          target: hopAddr,
          value: forensic.amountUSD * (1 - p * 0.07),
          token: primaryToken,
          transactionCount: 1,
          hashes: [generateRealisticTxHash(seed + 300 + p, forensic.chain)],
          patternLabel: `Peel Hop #${p} (-7%)`,
          flowReason: `Recursive peel transfer #${p}`,
          riskLevel: "critical"
        })
        prevHop = hopAddr
      }

      // Layer 5: Liquidation Off-Ramps & OTC Brokers
      const offRampCount = depth >= 4 ? 5 : depth >= 3 ? 3 : 2
      for (let o = 1; o <= offRampCount; o++) {
        const cexAddr = generateRealisticAddress(seed, 400 + o, forensic.chain)
        const cexCountry = pickCountry(80 + o)
        addNode({
          id: cexAddr,
          address: cexAddr,
          label: o === 1 ? "⚠️ High-Risk Offshore CEX Deposit (No KYC)" : `💼 P2P OTC Liquidity Desk #${o}`,
          nodeType: o === 1 ? "cex" : "otc_broker",
          riskScore: 88 - o * 2,
          riskLevel: "critical",
          volume: forensic.amountUSD * (0.55 / o),
          transactionCount: 22 + o * 4,
          country: `${cexCountry.name} (${cexCountry.code})`,
          nodeExplanation: "Unregulated offshore exchange deposit address facilitating rapid high-risk fiat cashouts without Travel Rule compliance.",
          behavioralTag: "No-KYC Off-Ramp Gateway",
          entityRole: "Liquidation Off-Ramp",
          layer: 5
        })
        addLink({
          source: prevHop,
          target: cexAddr,
          value: forensic.amountUSD * (0.55 / o),
          token: secondaryToken,
          transactionCount: 2,
          hashes: [generateRealisticTxHash(seed + 400 + o, forensic.chain)],
          patternLabel: "Off-Ramp Liquidation",
          flowReason: "Final transfer for fiat conversion",
          riskLevel: "critical"
        })
      }

      // Depth 5: Cold Storage Vaults
      if (depth >= 5) {
        for (let c = 1; c <= 4; c++) {
          const coldAddr = generateRealisticAddress(seed, 480 + c, forensic.chain)
          addNode({
            id: coldAddr,
            address: coldAddr,
            label: `🔒 Dormant Reserve Vault #${c}`,
            nodeType: "cold_wallet",
            riskScore: 80,
            riskLevel: "high",
            volume: forensic.amountUSD * 0.4,
            transactionCount: 2,
            country: "Switzerland (CH)",
            nodeExplanation: "Air-gapped multi-signature vault retaining residual laundered capital for long-term dormancy.",
            behavioralTag: "Dormant Laundering Vault",
            entityRole: "Cold Storage Retention",
            layer: 5
          })
          addLink({
            source: prevHop,
            target: coldAddr,
            value: forensic.amountUSD * 0.3,
            token: primaryToken,
            transactionCount: 1,
            hashes: [generateRealisticTxHash(seed + 480 + c, forensic.chain)],
            patternLabel: "Cold Retention",
            flowReason: "Long-term cold storage retention",
            riskLevel: "high"
          })
        }
      }

    } else if (riskLevel === "high") {
      // ⚠️ HIGH RISK GRAPH: Cross-Chain Bridges, MEV Sandwiches, Flash Loans

      const proxyContract = generateRealisticAddress(seed, 501, forensic.chain)
      const proxyCountry = pickCountry(12)
      addNode({
        id: proxyContract,
        address: proxyContract,
        label: "⚡ Unverified Proxy Contract (High Gas)",
        nodeType: "contract",
        riskScore: 78,
        riskLevel: "high",
        volume: forensic.amountUSD * 2.8,
        transactionCount: 94,
        country: `${proxyCountry.name} (${proxyCountry.code})`,
        nodeExplanation: "Smart contract deployed without verified source code. Emits high gas consumption and performs delegatecalls to unverified proxies.",
        behavioralTag: "Unverified Execution Proxy",
        entityRole: "Execution Middleware",
        layer: 1
      })
      addLink({
        source: proxyContract,
        target: cleanInput,
        value: forensic.amountUSD * 1.4,
        token: primaryToken,
        transactionCount: 4,
        hashes: [generateRealisticTxHash(seed + 501, forensic.chain)],
        patternLabel: "DelegateCall Execution",
        flowReason: "Arbitrage execution payload through unverified router",
        riskLevel: "high"
      })

      const bridge1 = "0x4D9079Bb4165a60105FA8888F50c1BD360205890"
      addNode({
        id: bridge1,
        address: bridge1,
        label: "🌉 Across Bridge Protocol (ETH ➔ AVAX)",
        nodeType: "bridge",
        riskScore: 68,
        riskLevel: "high",
        volume: 38500000,
        transactionCount: 4150,
        country: "Cross-Chain Relayer",
        nodeExplanation: "Decentralized cross-chain bridge router. Facilitates rapid liquidity transfers across chains, breaking single-chain graph tracking.",
        behavioralTag: "Cross-Chain Liquidity Router",
        entityRole: "Cross-Chain Bridge Hub",
        layer: 3
      })
      addLink({
        source: cleanInput,
        target: bridge1,
        value: forensic.amountUSD * 0.95,
        token: primaryToken,
        transactionCount: 3,
        hashes: [generateRealisticTxHash(seed + 601, forensic.chain)],
        patternLabel: "Cross-Chain Transfer",
        flowReason: "Asset bridging from Ethereum to Avalanche",
        riskLevel: "high"
      })

      const fanOutCount = depth === 5 ? 14 : depth === 4 ? 9 : depth === 3 ? 6 : depth === 2 ? 3 : 2
      for (let b = 1; b <= fanOutCount; b++) {
        const outAddr = generateRealisticAddress(seed, 700 + b, forensic.chain)
        const branchCountry = pickCountry(b + 50)
        addNode({
          id: outAddr,
          address: outAddr,
          label: `🔀 Dispersal Sub-Wallet #${b}`,
          nodeType: "peel_hop",
          riskScore: Math.max(55, 72 - b * 2),
          riskLevel: "high",
          volume: forensic.amountUSD * (0.35 / b),
          transactionCount: 5,
          country: `${branchCountry.name} (${branchCountry.code})`,
          nodeExplanation: `Dispersal account on destination blockchain receiving bridged capital for split re-distribution.`,
          behavioralTag: "Bridge Dispersal Node",
          entityRole: "Sub-Chain Recipient",
          layer: 4
        })
        addLink({
          source: bridge1,
          target: outAddr,
          value: forensic.amountUSD * (0.35 / b),
          token: secondaryToken,
          transactionCount: 1,
          hashes: [generateRealisticTxHash(seed + 700 + b, forensic.chain)],
          patternLabel: "Bridge Claim & Fan-Out",
          flowReason: "Cross-chain claim and secondary fan-out",
          riskLevel: "high"
        })
      }

    } else if (riskLevel === "medium") {
      // ⚡ MEDIUM RISK GRAPH: Sybil Swarms, DEX Swaps, Wash Trading Rings

      const funderAddr = generateRealisticAddress(seed, 801, forensic.chain)
      const funderCountry = pickCountry(14)
      addNode({
        id: funderAddr,
        address: funderAddr,
        label: "🌱 Genesis Funder Wallet",
        nodeType: "cold_wallet",
        riskScore: 38,
        riskLevel: "medium",
        volume: forensic.amountUSD * 2.2,
        transactionCount: 18,
        country: `${funderCountry.name} (${funderCountry.code})`,
        nodeExplanation: "Initial funding parent account. Transferred seed capital to initialize target wallet.",
        behavioralTag: "Genesis Capital Provider",
        entityRole: "Initial Funder",
        layer: 1
      })
      addLink({
        source: funderAddr,
        target: cleanInput,
        value: forensic.amountUSD * 1.2,
        token: primaryToken,
        transactionCount: 2,
        hashes: [generateRealisticTxHash(seed + 801, forensic.chain)],
        patternLabel: "Genesis Funding Transfer",
        flowReason: "Account creation and gas funding",
        riskLevel: "medium"
      })

      const dexPool = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
      addNode({
        id: dexPool,
        address: dexPool,
        label: "🦄 Uniswap V3 WETH/USDC 0.05% Pool",
        nodeType: "defi",
        riskScore: 18,
        riskLevel: "low",
        volume: 145000000,
        transactionCount: 12400,
        country: "Decentralized Smart Contract",
        nodeExplanation: "Audited Uniswap V3 concentrated liquidity pool for standard token exchange.",
        behavioralTag: "Decentralized Liquidity Pool",
        entityRole: "AMM Swap Pool",
        layer: 3
      })
      addLink({
        source: cleanInput,
        target: dexPool,
        value: forensic.amountUSD * 0.75,
        token: secondaryToken,
        transactionCount: 4,
        hashes: [generateRealisticTxHash(seed + 850, forensic.chain)],
        patternLabel: "DEX Swap Execution",
        flowReason: "Market swap of tokens",
        riskLevel: "low"
      })

      const sybilCount = depth === 5 ? 18 : depth === 4 ? 12 : depth === 3 ? 7 : depth === 2 ? 4 : 2
      for (let s = 1; s <= sybilCount; s++) {
        const sybilAddr = generateRealisticAddress(seed, 900 + s, forensic.chain)
        const sybilCountry = pickCountry(s + 20)
        addNode({
          id: sybilAddr,
          address: sybilAddr,
          label: `🤖 Sybil Puppet Node #${s}`,
          nodeType: "sybil_node",
          riskScore: 48 + (s % 10),
          riskLevel: "medium",
          volume: forensic.amountUSD * (0.25 / s),
          transactionCount: 8 + s,
          country: `${sybilCountry.name} (${sybilCountry.code})`,
          nodeExplanation: `Automated airdrop farming puppet node exhibiting identical execution signatures.`,
          behavioralTag: "Sybil Swarm Node",
          entityRole: "Airdrop Sybil Puppet",
          layer: 4
        })
        addLink({
          source: cleanInput,
          target: sybilAddr,
          value: forensic.amountUSD * (0.25 / s),
          token: primaryToken,
          transactionCount: 2,
          hashes: [generateRealisticTxHash(seed + 900 + s, forensic.chain)],
          patternLabel: "Sybil Fan-Out Transfer",
          flowReason: "Synchronized puppet funding",
          riskLevel: "medium"
        })
      }

    } else {
      // 🛡️ LOW RISK / CLEAN GRAPH: Institutional Custody, Aave Lending, Tier-1 CEX

      const custodyAddr = "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
      addNode({
        id: custodyAddr,
        address: custodyAddr,
        label: "🏦 Coinbase Institutional Custody Vault",
        nodeType: "cex",
        riskScore: 8,
        riskLevel: "low",
        volume: 95000000,
        transactionCount: 28500,
        country: "United States (US)",
        nodeExplanation: "Regulated, KYC-verified institutional cold custody vault operated under SOC-2 compliance standards.",
        behavioralTag: "Verified Institutional Custody",
        entityRole: "Enterprise Custody Source",
        contractVerified: true,
        layer: 1
      })
      addLink({
        source: custodyAddr,
        target: cleanInput,
        value: forensic.amountUSD * 1.6,
        token: "USDC",
        transactionCount: 6,
        hashes: [generateRealisticTxHash(seed + 101, forensic.chain)],
        patternLabel: "Institutional Withdrawal",
        flowReason: "Verified treasury management transfer",
        riskLevel: "low"
      })

      const aavePool = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
      addNode({
        id: aavePool,
        address: aavePool,
        label: "🛡️ Aave V3 Lending Pool (Audited)",
        nodeType: "defi",
        riskScore: 10,
        riskLevel: "low",
        volume: 260000000,
        transactionCount: 52000,
        country: "Decentralized Protocol",
        nodeExplanation: "Formally verified lending pool with active bug bounties and timelock governance.",
        behavioralTag: "Audited DeFi Protocol",
        entityRole: "Yield Collateral Pool",
        contractVerified: true,
        layer: 3
      })
      addLink({
        source: cleanInput,
        target: aavePool,
        value: forensic.amountUSD * 0.85,
        token: "aUSDC",
        transactionCount: 3,
        hashes: [generateRealisticTxHash(seed + 102, forensic.chain)],
        patternLabel: "Collateral Supply",
        flowReason: "Yield generation and collateralization",
        riskLevel: "low"
      })

      const safeCount = depth === 5 ? 14 : depth === 4 ? 9 : depth === 3 ? 6 : depth === 2 ? 3 : 2
      for (let sc = 1; sc <= safeCount; sc++) {
        const sAddr = generateRealisticAddress(seed, 250 + sc, forensic.chain)
        const sCountry = pickCountry(sc + 4)
        addNode({
          id: sAddr,
          address: sAddr,
          label: sc === 1 ? "🔐 Gnosis Safe 3/5 Multi-Sig" : `💼 Verified Enterprise Treasury #${sc}`,
          nodeType: sc === 1 ? "contract" : "cold_wallet",
          riskScore: 10 + sc,
          riskLevel: "low",
          volume: forensic.amountUSD * (1.2 / sc),
          transactionCount: 16 + sc * 3,
          country: `${sCountry.name} (${sCountry.code})`,
          nodeExplanation: "Verified corporate treasury management address adhering to institutional compliance guidelines.",
          behavioralTag: "Verified Corporate Treasury",
          entityRole: "Institutional Recipient",
          contractVerified: true,
          layer: 4
        })
        addLink({
          source: cleanInput,
          target: sAddr,
          value: forensic.amountUSD * (0.6 / sc),
          token: "USDC",
          transactionCount: 2,
          hashes: [generateRealisticTxHash(seed + 250 + sc, forensic.chain)],
          patternLabel: "Treasury Allocation",
          flowReason: "Scheduled corporate operational transfer",
          riskLevel: "low"
        })
      }
    }

    // Concrete Forensic Next Steps Action Plan
    const actionPlan: ForensicActionPlan[] = riskLevel === "critical" ? [
      {
        actionId: "ACT-01",
        priority: "CRITICAL",
        title: "Submit OFAC SDN Blacklist Notice",
        description: "File emergency transaction intelligence alert regarding direct deposits to Tornado Cash mixing pools.",
        targetEntity: "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b",
        legalJurisdiction: "US Treasury OFAC / FinCEN"
      },
      {
        actionId: "ACT-02",
        priority: "CRITICAL",
        title: "Subpoena Offshore CEX Off-Ramp Account",
        description: "Serve legal preservation order to off-ramp exchange compliance desks for identity KYC logs.",
        targetEntity: "Offshore Deposit Gateways",
        legalJurisdiction: "FATF Travel Rule Compliance Network"
      },
      {
        actionId: "ACT-03",
        priority: "HIGH",
        title: "Revoke Malicious Token Approvals",
        description: "Advise compromised victim cluster to broadcast Permit2 allowance cancellation transactions.",
        targetEntity: "Phishing Drainer Spender Contracts",
        legalJurisdiction: "Smart Contract Security"
      },
      {
        actionId: "ACT-04",
        priority: "HIGH",
        title: "Establish Real-Time Mempool Sentinel",
        description: "Deploy automated node monitors on all identified peel chain hops for subsequent movement.",
        targetEntity: "Sequential Layering Hops",
        legalJurisdiction: "CryptoGuard Automated Sentinel"
      }
    ] : riskLevel === "high" ? [
      {
        actionId: "ACT-01",
        priority: "HIGH",
        title: "Trace Destination Cross-Chain Bridge Claim",
        description: "Monitor destination relayer contracts on Avalanche / Arbitrum to identify recipient keypairs.",
        targetEntity: "Across & Stargate Relayers",
        legalJurisdiction: "Multi-Chain Relayer Consortium"
      },
      {
        actionId: "ACT-02",
        priority: "HIGH",
        title: "Decompile Unverified Proxy Bytecode",
        description: "Perform automated EVM bytecode disassembly to identify hidden delegatecall execution logic.",
        targetEntity: "Unverified Execution Proxy",
        legalJurisdiction: "Static Smart Contract Audit"
      }
    ] : [
      {
        actionId: "ACT-01",
        priority: "LOW",
        title: "Periodic Enterprise Proof-of-Reserves Audit",
        description: "Verify cryptographic multi-signature quorum balance against custodian reserves statement.",
        targetEntity: "Institutional Vaults",
        legalJurisdiction: "SOC-2 / ISO 27001 Audit Standard"
      }
    ]

    return NextResponse.json({
      nodes,
      links,
      stats: {
        totalNodes: nodes.length,
        totalLinks: links.length,
        riskScore,
        riskLevel,
        fraudPattern: pattern.title,
        patternCategory: pattern.category,
        patternSummary: pattern.summary,
        remediationAdvice: pattern.remediationAdvice,
        regulatoryImpact: pattern.regulatoryImpact,
        detectedMixers: nodes.filter(n => n.nodeType === "mixer").length,
        bridgesUsed: nodes.filter(n => n.nodeType === "bridge").length,
        cexDepositNodes: nodes.filter(n => n.nodeType === "cex").length,
        peelHops: nodes.filter(n => n.nodeType === "peel_hop").length,
        victimsCount: nodes.filter(n => n.nodeType === "victim").length,
        depth
      },
      actionPlan,
      target: {
        address: cleanInput,
        riskScore,
        riskLevel,
        chain: forensic.chain,
        amountUSD: forensic.amountUSD,
        primaryToken,
        secondaryToken
      }
    })

  } catch (error) {
    console.error("Forensic Graph API Error:", error)
    return NextResponse.json({ error: "Failed to compute forensic graph topology" }, { status: 500 })
  }
}
