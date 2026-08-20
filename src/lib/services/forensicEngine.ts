/**
 * Unified Forensic Telemetry Engine
 * 
 * Provides deterministic and realistic intelligence across all sections:
 * 3D Globe, Live Transactions, Quick Scan, Full Scanner, and Graph Explorer.
 */

export interface CountryInfo {
  code: string;
  name: string;
  lat: number;
  lng: number;
  tier?: "regulated" | "crypto_hub" | "monitored" | "sanctioned" | "tax_haven";
}

export const FORENSIC_COUNTRIES: CountryInfo[] = [
  // Tier 1 Major Crypto Hubs & Regulated Markets
  { code: "US", name: "United States", lat: 38.0, lng: -97.0, tier: "regulated" },
  { code: "GB", name: "United Kingdom", lat: 55.0, lng: -3.0, tier: "regulated" },
  { code: "DE", name: "Germany", lat: 51.0, lng: 10.0, tier: "regulated" },
  { code: "FR", name: "France", lat: 46.0, lng: 2.0, tier: "regulated" },
  { code: "NL", name: "Netherlands", lat: 52.0, lng: 5.0, tier: "regulated" },
  { code: "CH", name: "Switzerland", lat: 46.8, lng: 8.2, tier: "crypto_hub" },
  { code: "SG", name: "Singapore", lat: 1.35, lng: 103.82, tier: "crypto_hub" },
  { code: "JP", name: "Japan", lat: 36.0, lng: 138.0, tier: "regulated" },
  { code: "KR", name: "South Korea", lat: 37.0, lng: 127.0, tier: "regulated" },
  { code: "AE", name: "United Arab Emirates", lat: 24.0, lng: 54.0, tier: "crypto_hub" },
  { code: "HK", name: "Hong Kong", lat: 22.3, lng: 114.2, tier: "crypto_hub" },
  { code: "CA", name: "Canada", lat: 56.0, lng: -106.0, tier: "regulated" },
  { code: "AU", name: "Australia", lat: -25.0, lng: 133.0, tier: "regulated" },
  { code: "NZ", name: "New Zealand", lat: -41.0, lng: 174.0, tier: "regulated" },
  { code: "SE", name: "Sweden", lat: 60.0, lng: 18.0, tier: "regulated" },
  { code: "NO", name: "Norway", lat: 60.0, lng: 10.0, tier: "regulated" },
  { code: "DK", name: "Denmark", lat: 56.0, lng: 10.0, tier: "regulated" },
  { code: "FI", name: "Finland", lat: 64.0, lng: 26.0, tier: "regulated" },
  { code: "EE", name: "Estonia", lat: 59.0, lng: 26.0, tier: "crypto_hub" },
  { code: "MT", name: "Malta", lat: 35.9, lng: 14.4, tier: "crypto_hub" },
  { code: "CY", name: "Cyprus", lat: 35.0, lng: 33.0, tier: "crypto_hub" },
  { code: "GI", name: "Gibraltar", lat: 36.14, lng: -5.35, tier: "crypto_hub" },
  { code: "IE", name: "Ireland", lat: 53.0, lng: -8.0, tier: "regulated" },
  { code: "IT", name: "Italy", lat: 42.0, lng: 12.0, tier: "regulated" },
  { code: "ES", name: "Spain", lat: 40.0, lng: -4.0, tier: "regulated" },
  { code: "PT", name: "Portugal", lat: 39.4, lng: -8.2, tier: "crypto_hub" },
  { code: "AT", name: "Austria", lat: 47.5, lng: 14.5, tier: "regulated" },
  { code: "BE", name: "Belgium", lat: 50.8, lng: 4.4, tier: "regulated" },
  { code: "PL", name: "Poland", lat: 52.0, lng: 21.0, tier: "regulated" },
  { code: "CZ", name: "Czech Republic", lat: 49.8, lng: 15.5, tier: "regulated" },

  // Offshore & Tax Haven Jurisdictions
  { code: "KY", name: "Cayman Islands", lat: 19.3, lng: -81.38, tier: "tax_haven" },
  { code: "VG", name: "British Virgin Islands", lat: 18.42, lng: -64.64, tier: "tax_haven" },
  { code: "BS", name: "Bahamas", lat: 25.03, lng: -77.39, tier: "tax_haven" },
  { code: "SC", name: "Seychelles", lat: -4.67, lng: 55.49, tier: "tax_haven" },
  { code: "PA", name: "Panama", lat: 8.53, lng: -80.78, tier: "tax_haven" },
  { code: "MU", name: "Mauritius", lat: -20.34, lng: 57.55, tier: "tax_haven" },
  { code: "BM", name: "Bermuda", lat: 32.32, lng: -64.75, tier: "tax_haven" },

  // High Growth & Monitored Markets
  { code: "BR", name: "Brazil", lat: -10.0, lng: -55.0, tier: "monitored" },
  { code: "IN", name: "India", lat: 21.0, lng: 78.0, tier: "monitored" },
  { code: "NG", name: "Nigeria", lat: 9.0, lng: 8.0, tier: "monitored" },
  { code: "VN", name: "Vietnam", lat: 14.0, lng: 108.0, tier: "monitored" },
  { code: "TR", name: "Turkey", lat: 39.0, lng: 35.0, tier: "monitored" },
  { code: "TH", name: "Thailand", lat: 15.0, lng: 100.0, tier: "monitored" },
  { code: "ID", name: "Indonesia", lat: -5.0, lng: 120.0, tier: "monitored" },
  { code: "PH", name: "Philippines", lat: 13.0, lng: 122.0, tier: "monitored" },
  { code: "ZA", name: "South Africa", lat: -30.0, lng: 25.0, tier: "monitored" },
  { code: "AR", name: "Argentina", lat: -34.0, lng: -64.0, tier: "monitored" },
  { code: "CL", name: "Chile", lat: -33.0, lng: -70.0, tier: "monitored" },
  { code: "CO", name: "Colombia", lat: 4.0, lng: -72.0, tier: "monitored" },
  { code: "MX", name: "Mexico", lat: 23.0, lng: -102.0, tier: "monitored" },
  { code: "KE", name: "Kenya", lat: -1.0, lng: 37.0, tier: "monitored" },
  { code: "GH", name: "Ghana", lat: 7.9, lng: -1.0, tier: "monitored" },
  { code: "EG", name: "Egypt", lat: 26.0, lng: 30.0, tier: "monitored" },
  { code: "SA", name: "Saudi Arabia", lat: 24.0, lng: 45.0, tier: "monitored" },
  { code: "QA", name: "Qatar", lat: 25.3, lng: 51.2, tier: "monitored" },
  { code: "IL", name: "Israel", lat: 31.0, lng: 35.0, tier: "monitored" },
  { code: "TW", name: "Taiwan", lat: 23.6, lng: 121.0, tier: "monitored" },
  { code: "MY", name: "Malaysia", lat: 4.2, lng: 101.9, tier: "monitored" },
  { code: "KZ", name: "Kazakhstan", lat: 48.0, lng: 66.9, tier: "monitored" },
  { code: "GE", name: "Georgia", lat: 42.0, lng: 43.5, tier: "monitored" },

  // Sanctioned & High-Risk Jurisdictions
  { code: "RU", name: "Russia", lat: 55.75, lng: 37.62, tier: "sanctioned" },
  { code: "KP", name: "North Korea (DPRK)", lat: 40.3, lng: 127.5, tier: "sanctioned" },
  { code: "IR", name: "Iran", lat: 32.4, lng: 53.6, tier: "sanctioned" },
  { code: "SY", name: "Syria", lat: 34.8, lng: 38.9, tier: "sanctioned" },
  { code: "MM", name: "Myanmar", lat: 21.9, lng: 95.9, tier: "sanctioned" }
];

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface FraudPatternDefinition {
  title: string;
  category: "Sanctions & Mixers" | "Smart Contract Exploits" | "Cybercrime & Extortion" | "Market Manipulation" | "Legitimate Protocols";
  minScore: number;
  maxScore: number;
  defaultLevel: RiskLevel;
  tags: string[];
  ruleFlags: string[];
  summary: string;
  behavioralFootprint: string[];
  remediationAdvice: string;
  regulatoryImpact: string;
}

export const FRAUD_PATTERN_TAXONOMY: FraudPatternDefinition[] = [
  {
    title: "Peel Chain Layering & Tornado Cash Mixer Obfuscation",
    category: "Sanctions & Mixers",
    minScore: 92,
    maxScore: 99,
    defaultLevel: "critical",
    tags: ["Tornado Cash", "Peel Chain", "High Velocity", "OFAC Sanctions Hit", "Mixer Deposit"],
    ruleFlags: [
      "Direct inbound deposit from OFAC SDN sanctioned smart contract (0xd90e...)",
      "Sequential fund stripping into 12+ micro-transactions within 180 seconds",
      "Asymmetric high-volume dispersal to unhosted cold storage endpoints",
      "FATF Travel Rule evasion detected through intermediate zero-balance proxies"
    ],
    summary: "Funds originating from or routed into sanctioned anonymity mixing pools (Tornado Cash / Sinbad), followed by rapid recursive peel-chaining to strip identifying transaction graphs.",
    behavioralFootprint: [
      "Consistent fixed-denomination deposits (10 ETH, 100 ETH)",
      "Sub-minute peeling interval with deterministic fee rounding",
      "Complete exhaustion of gas wallets to prevent chain linkage"
    ],
    remediationAdvice: "Initiate immediate on-chain blacklist, file Suspicious Activity Report (SAR), and flag all downstream cluster addresses for institutional blocking.",
    regulatoryImpact: "Severe OFAC sanction exposure; potential secondary sanctions liability for compliant institutions under FinCEN and EU 8th Sanctions Package."
  },
  {
    title: "State-Sponsored Lazarus Group Cyber Heist & Bridge Dispersal",
    category: "Sanctions & Mixers",
    minScore: 94,
    maxScore: 100,
    defaultLevel: "critical",
    tags: ["Lazarus Group", "APT38", "Cross-Chain Bridge", "Sanctioned Entity", "High Value Heist"],
    ruleFlags: [
      "Heuristic signature match with Lazarus Group (TraderTraitor / AppleJeus)",
      "Cross-chain bridge hopping (Ethereum -> Avalanche -> Solana -> Bitcoin via Thorchain)",
      "Rapid conversion into privacy coins (Monero XMR) through decentralized OTC nodes",
      "Direct association with documented multi-million dollar exploit wallet cluster"
    ],
    summary: "Advanced persistent threat (APT) infrastructure associated with state-sponsored cybercrime syndicates conducting multi-million dollar protocol draining and cross-chain laundering.",
    behavioralFootprint: [
      "Automated multi-sig key compromise execution",
      "Immediate liquidation into stablecoins followed by multi-bridge dispersal",
      "Routing through rogue Telegram OTC liquidity brokers without KYC"
    ],
    remediationAdvice: "Emergency asset freeze protocol activation, law enforcement coordination (FBI/Interpol), and automated notification to global cross-chain validator sets.",
    regulatoryImpact: "Strict liability under US Treasury OFAC sanctions. Any asset receipt constitutes a direct federal compliance violation."
  },
  {
    title: "Phishing Drainer & Malicious Signature Authorization (Permit2/Seaport)",
    category: "Cybercrime & Extortion",
    minScore: 84,
    maxScore: 92,
    defaultLevel: "critical",
    tags: ["Phishing Drainer", "Permit2 Exploit", "Angel Drainer", "Batch Liquidation", "Victim Funds"],
    ruleFlags: [
      "Off-chain EIP-712 permit signature executed without interactive transaction approval",
      "Sweeper bot initiated 8 ERC-20 token drain operations in single block",
      "Immediate Uniswap V3 slippage-tolerant market dump to native ETH",
      "Drainer fee share (20%) split to known malware operator smart contract"
    ],
    summary: "Victim credential theft through deceptive web3 sign-in or malicious Permit2 / Seaport authorization, transferring all account tokens to automated drainer contracts.",
    behavioralFootprint: [
      "Zero prior transaction history with target wallet before drain event",
      "High gas bribe paid to block builders (Flashbots / Titan) for priority inclusion",
      "Automated token batching to decentralized exchanges"
    ],
    remediationAdvice: "Revoke all active token approvals via contract revoke tools, flag victim address, and track downstream cashout to KYC off-ramps.",
    regulatoryImpact: "Fraudulent asset handling; requires law enforcement subpoena for IP logs at domain registrar and RPC provider levels."
  },
  {
    title: "Darknet Marketplace Escrow & Russian Hydra-Style Cashout",
    category: "Cybercrime & Extortion",
    minScore: 82,
    maxScore: 89,
    defaultLevel: "critical",
    tags: ["Darknet Escrow", "Hydra Residuals", "No-KYC CEX", "Illicit Narcotics", "Garantex Inflow"],
    ruleFlags: [
      "Inbound transactions from sanctioned Russian exchange Garantex",
      "Direct clustering with documented Darknet vendor escrow multisig",
      "Split payments utilizing Dead-Drop geo-location metadata tags",
      "Frequent small-batch conversions into fiat via unregulated P2P cards"
    ],
    summary: "Commercial illicit marketplace payments and escrow services facilitating contraband trade, using sanctioned regional exchanges for off-ramp liquidity.",
    behavioralFootprint: [
      "Repeated periodic inflows corresponding to darknet settlement cycles",
      "Use of intermediary 'burner' addresses discarded after single settlement",
      "High correlation with Eastern European banking endpoints"
    ],
    remediationAdvice: "Block incoming transfers, log AML transaction alert, and report to national financial intelligence units (FIU).",
    regulatoryImpact: "Violates FATF Recommendation 16 and anti-narcotics laundering statutes across all major jurisdictions."
  },
  {
    title: "Ransomware Extortion Cluster (LockBit / BlackCat Payout)",
    category: "Cybercrime & Extortion",
    minScore: 80,
    maxScore: 88,
    defaultLevel: "critical",
    tags: ["Ransomware Payout", "LockBit 3.0", "Corporate Extortion", "Sanctioned Threat", "BTC Layering"],
    ruleFlags: [
      "Bitcoin transaction cluster linked to confirmed enterprise ransomware incident",
      "High-value lump-sum ransom payment followed by automated affiliate split",
      "CoinJoin / Wasabi privacy mixing execution over 24-hour window",
      "Downstream dispersal to unhosted cold addresses in low-cooperation jurisdictions"
    ],
    summary: "Corporate extortion proceeds paid to decrypt hijacked corporate infrastructure, routed through automated affiliate payout schemes.",
    behavioralFootprint: [
      "Immediate wallet abandonment following ransom distribution",
      "CoinJoin denomination standardization (0.1 BTC / 1.0 BTC pools)",
      "Low velocity during negotiation, followed by extreme transfer velocity upon payout"
    ],
    remediationAdvice: "Notify federal cybersecurity authorities (CISA/NCSC), preserve full chain telemetry for forensic attribution.",
    regulatoryImpact: "OFAC advisory on potential sanctions risks for facilitating ransomware payments to sanctioned cybercrime syndicates."
  },
  {
    title: "Flash Loan Oracle Manipulation & Governance Hijack",
    category: "Smart Contract Exploits",
    minScore: 74,
    maxScore: 79,
    defaultLevel: "high",
    tags: ["Flash Loan", "Oracle Exploit", "Governance Hijack", "Aave Borrow", "Price Manipulation"],
    ruleFlags: [
      "Single-block borrowing of $85M+ across Aave and Balancer flash loan vaults",
      "Spot price manipulation on low-liquidity Curve / Uniswap pools",
      "Instantaneous liquidation of under-collateralized protocol positions",
      "Net profit extracted into DAI and distributed to unverified smart contracts"
    ],
    summary: "Exploitation of decentralized oracle pricing delays or spot AMM balances using zero-capital flash loans to artificially drain protocol collateral reserves.",
    behavioralFootprint: [
      "Complex atomic transaction involving 30+ internal contract invocations",
      "Zero collateral required; execution relies entirely on single-block EVM atomicity",
      "High MEV miner bribe (over 50 ETH) to ensure no front-running"
    ],
    remediationAdvice: "Protocol emergency pause, oracle upgrade to TWAP/Chainlink decentralized feeds, and post-mortem vulnerability disclosure.",
    regulatoryImpact: "DeFi market manipulation; actionable civil and criminal fraud under SEC/CFTC market abuse frameworks."
  },
  {
    title: "Cross-Chain Bridge Hopping & Layered Asset Stripping",
    category: "Smart Contract Exploits",
    minScore: 68,
    maxScore: 75,
    defaultLevel: "high",
    tags: ["Cross-Chain Bridge", "Layering", "Asset Stripping", "Stargate Bridge", "Across Protocol"],
    ruleFlags: [
      "High-frequency bridging across Ethereum, Polygon, Arbitrum, and Avalanche",
      "Asset transformation: ETH -> USDC -> AVAX -> SOL within 15 minutes",
      "Utilization of newly deployed cross-chain liquidity relayer proxies",
      "Sudden acceleration in velocity compared to historical account baseline"
    ],
    summary: "Intentional cross-chain routing across heterogeneous consensus networks to break blockchain explorer graph indexing and obscure forensic tracing.",
    behavioralFootprint: [
      "Immediate bridge claim transaction triggered by secondary relayer key",
      "Systematic conversion across intermediate stablecoins to avoid volatility",
      "Multiple simultaneous bridge deposits to different destination chains"
    ],
    remediationAdvice: "Cross-chain graph correlation, bridge relayer telemetry extraction, and multi-chain address clustering.",
    regulatoryImpact: "Meets FATF criteria for suspicious cross-border structuring and layering techniques."
  },
  {
    title: "Pig Butchering Syndicate / High-Yield Romance Scam",
    category: "Cybercrime & Extortion",
    minScore: 65,
    maxScore: 72,
    defaultLevel: "high",
    tags: ["Pig Butchering", "Romance Scam", "Fake DApp", "Southeast Asia Scam", "USDT Aggregator"],
    ruleFlags: [
      "Inbound deposits from 40+ retail victim wallets across global jurisdictions",
      "Periodic aggregation of USDT into central clearinghouse wallet",
      "Fake decentralized staking contract interaction with simulated yields",
      "Downstream transfer to industrial Southeast Asian casino off-ramps"
    ],
    summary: "Social engineering fraud where victims are groomed into depositing life savings into fraudulent web3 investment platforms, funneling into human-trafficking compound syndicates.",
    behavioralFootprint: [
      "Consistent small test withdrawals allowed to build victim confidence",
      "Subsequent high-volume deposits followed by permanent withdrawal freeze",
      "Centralized batch sweep contracts aggregating funds from hundreds of victim accounts"
    ],
    remediationAdvice: "Submit threat intelligence report to Global Anti-Scam Alliance (GASA), flag hosting infrastructure, and freeze CEX deposit corridors.",
    regulatoryImpact: "Major priority for global AML enforcement (DOJ, FinCEN, UNODC) with mandatory reporting."
  },
  {
    title: "MEV Sandwich Bot Swarm & Liquidity Front-Running",
    category: "Market Manipulation",
    minScore: 60,
    maxScore: 68,
    defaultLevel: "high",
    tags: ["MEV Bot", "Sandwich Attack", "Front-Running", "Flashbots Bundle", "Slippage Exploitation"],
    ruleFlags: [
      "Sub-second mempool transaction ordering via private RPC relays (Flashbots)",
      "Front-run buy transaction immediately preceding large retail DEX swap",
      "Back-run sell transaction immediately succeeding victim trade",
      "Continuous algorithmic extraction of retail slippage tolerance"
    ],
    summary: "Automated predatory bot clusters monitoring mempools to execute atomic sandwich attacks on decentralized exchange traders, extracting millions in risk-free value.",
    behavioralFootprint: [
      "Tens of thousands of atomic bundle executions per day",
      "Extreme gas price bidding targeting 99% of extracted profit to block builders",
      "Tight integration with specialized custom smart contracts"
    ],
    remediationAdvice: "Utilize private RPC endpoints (MEV-Blocker / Flashbots Protect) with zero-slippage limit orders.",
    regulatoryImpact: "Under increasing scrutiny by European ESMA (MiCA) and US regulatory bodies regarding market abuse and fair execution standards."
  },
  {
    title: "Unverified Smart Contract Honeypot & Rug Pull Infrastructure",
    category: "Smart Contract Exploits",
    minScore: 60,
    maxScore: 66,
    defaultLevel: "high",
    tags: ["Honeypot", "Rug Pull", "Hidden Mint", "Liquidity Drain", "Malicious Bytecode"],
    ruleFlags: [
      "Smart contract source code unverified on Etherscan/Blockscout",
      "Bytecode contains conditional transfer blacklists preventing token sales",
      "Creator wallet holds 95% of total supply with hidden owner-only mint functions",
      "Abrupt removal of 100% Uniswap liquidity pool reserves by deployer"
    ],
    summary: "Deceptive token smart contract containing hidden malicious logic preventing buyers from selling, followed by complete liquidity extraction by the deployer.",
    behavioralFootprint: [
      "Aggressive social media hype generation followed by immediate buy-side volume",
      "Sell transactions failing with custom revert errors for all non-whitelisted addresses",
      "Deployer wallet funded via Tornado Cash or high-risk privacy bridge"
    ],
    remediationAdvice: "Perform automated static bytecode decompilation, inspect transfer restrictions, and blacklist deployer cluster.",
    regulatoryImpact: "Direct criminal fraud and unregistered securities issuance violations."
  },
  {
    title: "Sybil Airdrop Farming Cluster & Automated Swarm Fan-Out",
    category: "Market Manipulation",
    minScore: 48,
    maxScore: 59,
    defaultLevel: "medium",
    tags: ["Sybil Cluster", "Airdrop Farming", "Scripted Bot", "Industrial Farm", "Tree Topology"],
    ruleFlags: [
      "Tree topology fan-out from single parent funding address to 250+ child accounts",
      "Identical transaction sequence across 10+ target testnets and mainnet protocols",
      "Synchronized execution timestamps with randomized micro-sleep intervals",
      "Low balance maintenance just above protocol snapshot eligibility threshold"
    ],
    summary: "Industrial-scale bot networks running scripted interactions across unlaunched protocols to illicitly claim disproportionate token airdrops.",
    behavioralFootprint: [
      "Deterministic funding amounts across all child accounts",
      "Zero organic user behavior (no NFT mints, no social activity, only target protocols)",
      "Simultaneous token claims and immediate liquidation to centralized exchanges"
    ],
    remediationAdvice: "Implement Gitcoin Passport / WorldID verification and off-chain graph clustering to disqualify Sybil clusters from token distribution.",
    regulatoryImpact: "Violation of terms of service; potential civil damages for unjust enrichment."
  },
  {
    title: "High-Frequency DEX Swaps & Liquidity Pool Rebalancing",
    category: "Market Manipulation",
    minScore: 40,
    maxScore: 52,
    defaultLevel: "medium",
    tags: ["DEX Arbitrage", "Liquidity Provision", "Uniswap V3", "Curve 3pool", "Moderate Velocity"],
    ruleFlags: [
      "High volume trading across decentralized automated market makers",
      "Frequent liquidity rebalancing in concentrated Uniswap V3 price ticks",
      "Interactions with standard verified DeFi aggregation routers (1inch / Paraswap)",
      "Unflagged counterparties with standard multi-day holding periods"
    ],
    summary: "Active decentralized market maker or arbitrage trader rebalancing liquidity across automated pools with standard risk profile.",
    behavioralFootprint: [
      "Bi-directional capital flow with balanced deposit and withdrawal ratios",
      "Interaction with audited protocol smart contracts",
      "Standard transaction fee payments without extreme MEV priority bribes"
    ],
    remediationAdvice: "Routine transaction monitoring; no compliance escalation required.",
    regulatoryImpact: "Standard commercial decentralized finance activity compliant with current decentralized market guidelines."
  },
  {
    title: "Genesis Funder Wallet & Fresh Account Deployment",
    category: "Market Manipulation",
    minScore: 30,
    maxScore: 42,
    defaultLevel: "medium",
    tags: ["New Account", "Genesis Funding", "Early Phase", "Unclassified"],
    ruleFlags: [
      "Account created less than 72 hours ago with initial exchange withdrawal",
      "Low historical transaction volume with limited counterparty diversity",
      "No sanctions matches or darknet cluster connections identified"
    ],
    summary: "Newly deployed cryptocurrency account with clean genesis funding, currently establishing on-chain transaction history.",
    behavioralFootprint: [
      "Initial funding transaction followed by token allowance approvals",
      "Standard user setup sequence across major EVM applications"
    ],
    remediationAdvice: "Apply standard onboarding monitoring until 30-day transaction maturity threshold is reached.",
    regulatoryImpact: "Standard customer due diligence (CDD) applies."
  },
  {
    title: "Institutional OTC Custody & Multi-Sig Treasury Escrow",
    category: "Legitimate Protocols",
    minScore: 15,
    maxScore: 28,
    defaultLevel: "low",
    tags: ["Institutional Custody", "Safe Multi-Sig", "Corporate Treasury", "Cold Storage", "Low Risk"],
    ruleFlags: [
      "3-of-5 Gnosis Safe multi-signature governance execution",
      "Large-scale balance retention with multi-month dormant custody cycles",
      "Whitelisted counterparties consisting exclusively of Tier-1 OTC desks",
      "Full compliance with institutional Travel Rule messaging protocols"
    ],
    summary: "Institutional corporate treasury or regulated asset manager holding reserves in cold multi-signature escrow with strict internal controls.",
    behavioralFootprint: [
      "Timelocked transaction executions with multiple signer approvals",
      "Zero unvetted smart contract interactions",
      "Consistent interaction with verified institutional custody providers (Fireblocks / Copper)"
    ],
    remediationAdvice: "Clean institutional rating; expedited transaction processing.",
    regulatoryImpact: "Fully compliant with SOC2, ISO27001, and global VASP regulatory requirements."
  },
  {
    title: "Audited Blue-Chip Protocol Staking (Aave V3 / Lido stETH)",
    category: "Legitimate Protocols",
    minScore: 8,
    maxScore: 18,
    defaultLevel: "low",
    tags: ["Aave V3", "Lido Staking", "Audited Protocol", "Yield Generation", "Clean Profile"],
    ruleFlags: [
      "Long-term collateral deposit in Aave V3 Core Lending Market",
      "Holding liquid staking tokens (stETH / rETH) with multi-month staking duration",
      "Smart contracts audited by OpenZeppelin, Trail of Bits, and Certora",
      "Zero association with flagged, mixer, or darknet entity clusters"
    ],
    summary: "Clean decentralized finance participation using audited blue-chip infrastructure for transparent yield generation and collateral management.",
    behavioralFootprint: [
      "Consistent holding periods with low transaction frequency",
      "Standard gas pricing with zero mempool manipulation",
      "Direct user interaction through official protocol gateways"
    ],
    remediationAdvice: "No restrictions; rated as prime low-risk DeFi participant.",
    regulatoryImpact: "Exemplary compliance footprint with complete on-chain transparency."
  },
  {
    title: "Tier-1 KYC Regulated Exchange Gateway (Coinbase / Binance / Kraken)",
    category: "Legitimate Protocols",
    minScore: 2,
    maxScore: 10,
    defaultLevel: "low",
    tags: ["Coinbase Prime", "Binance Hot Wallet", "Kraken Custody", "KYC Verified", "Whitelisted"],
    ruleFlags: [
      "Direct inbound or outbound flow from verified regulated exchange hot wallet",
      "Counterparty identity subject to Bank Secrecy Act (BSA) AML verification",
      "Real-time Travel Rule cryptographic payload validation",
      "Clean historical telemetry spanning over 5 years of verified activity"
    ],
    summary: "Fully regulated institutional exchange gateway where all counterparties undergo rigorous customer identification (KYC) and AML screening.",
    behavioralFootprint: [
      "High volume aggregated batch withdrawals from exchange master wallets",
      "Standard deposit memo routing to segregated cold storage vaults",
      "Immediate AML clearance across major blockchain analytics providers"
    ],
    remediationAdvice: "Optimal clean rating; approved for immediate settlement and institutional clearance.",
    regulatoryImpact: "Full compliance with FinCEN, FCA, BaFin, and MAS regulatory regimes."
  }
];

export interface ForensicEntity {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  fromCountry: CountryInfo;
  toCountry: CountryInfo;
  chain: string;
  amountUSD: number;
  cryptoAmount: string;
  riskScore: number;
  riskLevel: RiskLevel;
  fraudPattern: string;
  patternDetails: FraudPatternDefinition;
  tags: string[];
  ruleFlags: string[];
  aiExplanation: string;
  detailedAnalysis: string;
  timestamp: number;
}

// Chain Normalization Map
export const CHAIN_ALIAS_MAP: Record<string, string> = {
  eth: 'ethereum',
  ethereum: 'ethereum',
  'eth-mainnet': 'ethereum',
  btc: 'bitcoin',
  bitcoin: 'bitcoin',
  sol: 'solana',
  solana: 'solana',
  matic: 'polygon',
  polygon: 'polygon',
  bsc: 'bsc',
  binance: 'bsc',
  bnb: 'bsc',
  arb: 'arbitrum',
  arbitrum: 'arbitrum',
  opt: 'optimism',
  optimism: 'optimism',
  avax: 'avalanche',
  avalanche: 'avalanche',
  trx: 'tron',
  tron: 'tron',
  ada: 'cardano',
  cardano: 'cardano',
  dot: 'polkadot',
  polkadot: 'polkadot'
};

export function normalizeChainName(chain: string): string {
  const lower = (chain || 'ethereum').toLowerCase().trim();
  return CHAIN_ALIAS_MAP[lower] || lower;
}

// Deterministic seed computation from any string (address, txHash, ID)
export function computeDeterministicSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate realistic crypto addresses
export function generateRealisticAddress(seed: number, index: number = 0, chain: string = 'ethereum'): string {
  const hex = ((seed * (index + 1) * 9301 + 49297) % 233280).toString(16).padStart(6, '0');
  const hex2 = ((seed * (index + 7) * 7301 + 19297) % 233280).toString(16).padStart(6, '0');
  const hex3 = ((seed * (index + 13) * 5301 + 39297) % 233280).toString(16).padStart(6, '0');
  
  if (normalizeChainName(chain) === 'solana') {
    const b58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let res = '';
    for (let i = 0; i < 44; i++) {
      const idx = (seed * (i + 1) + index * 17) % b58Chars.length;
      res += b58Chars[idx];
    }
    return res;
  }
  
  if (normalizeChainName(chain) === 'bitcoin') {
    return `bc1q${hex}${hex2}${hex3}`.slice(0, 42);
  }
  
  return `0x${hex}${hex2}${hex3}e8b${index}7a4192b49c0d2`.slice(0, 42);
}

// Generate realistic transaction hash
export function generateRealisticTxHash(seed: number, chain: string = 'ethereum'): string {
  const norm = normalizeChainName(chain);
  if (norm === 'solana') {
    return generateRealisticAddress(seed, 99, 'solana');
  }
  const part1 = ((seed * 1337) % 0xffffffff).toString(16).padStart(8, '0');
  const part2 = ((seed * 7331) % 0xffffffff).toString(16).padStart(8, '0');
  const part3 = ((seed * 31337) % 0xffffffff).toString(16).padStart(8, '0');
  const part4 = ((seed * 91137) % 0xffffffff).toString(16).padStart(8, '0');
  return `0x${part1}${part2}${part3}${part4}`;
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

/**
 * Resolve or generate deterministic forensic telemetry for any transaction or wallet identifier.
 */
export function resolveForensicEntity(identifier: string, preferredChain: string = 'ethereum'): ForensicEntity {
  const cleanId = (identifier || '0x742d35Cc6634C0532925a3b844Bc9e7595f2bd3e').trim();
  const seed = computeDeterministicSeed(cleanId);
  const chain = normalizeChainName(preferredChain);
  
  // Specific known test addresses / known patterns
  const isKnownSanction = cleanId.toLowerCase().includes('742d') || cleanId.toLowerCase().includes('fraud') || cleanId.toLowerCase().includes('tornado');
  const isKnownBridge = cleanId.toLowerCase().includes('3f5c') || cleanId.toLowerCase().includes('bridge');
  const isKnownExchange = cleanId.toLowerCase().includes('8ba1') || cleanId.toLowerCase().includes('binance') || cleanId.toLowerCase().includes('coinbase');
  
  let patternIdx: number;
  if (isKnownSanction) {
    patternIdx = seed % 5; // 0..4 (Critical patterns)
  } else if (isKnownBridge) {
    patternIdx = 5 + (seed % 5); // 5..9 (High risk patterns)
  } else if (isKnownExchange) {
    patternIdx = 13 + (seed % 3); // 13..15 (Low risk patterns)
  } else {
    patternIdx = seed % FRAUD_PATTERN_TAXONOMY.length;
  }
  
  const pattern = FRAUD_PATTERN_TAXONOMY[patternIdx];
  const scoreSpread = pattern.maxScore - pattern.minScore + 1;
  const riskScore = pattern.minScore + (seed % scoreSpread);
  const riskLevel = getRiskLevelFromScore(riskScore);
  
  // Countries: Choose sender and recipient countries
  const fromCountry = FORENSIC_COUNTRIES[seed % FORENSIC_COUNTRIES.length];
  let toCountryIdx = (seed + 11) % FORENSIC_COUNTRIES.length;
  if (toCountryIdx === (seed % FORENSIC_COUNTRIES.length)) {
    toCountryIdx = (toCountryIdx + 1) % FORENSIC_COUNTRIES.length;
  }
  const toCountry = FORENSIC_COUNTRIES[toCountryIdx];
  
  // Financial amounts
  const amountUSD = ((seed % 950) * 140 + 350);
  let cryptoAmount = "";
  if (chain === 'bitcoin') {
    cryptoAmount = `${(amountUSD / 96500).toFixed(4)} BTC`;
  } else if (chain === 'solana') {
    cryptoAmount = `${(amountUSD / 185).toFixed(2)} SOL`;
  } else if (chain === 'bsc') {
    cryptoAmount = `${(amountUSD / 680).toFixed(3)} BNB`;
  } else if (chain === 'polygon') {
    cryptoAmount = `${(amountUSD / 0.55).toFixed(1)} MATIC`;
  } else {
    cryptoAmount = `${(amountUSD / 2700).toFixed(3)} ETH`;
  }
  
  // Addresses & Hash
  const txHash = cleanId.startsWith('0x') && cleanId.length === 66 ? cleanId : generateRealisticTxHash(seed, chain);
  const fromAddress = cleanId.length === 42 || cleanId.length === 44 ? cleanId : generateRealisticAddress(seed, 1, chain);
  const toAddress = generateRealisticAddress(seed, 2, chain);
  
  // Detailed AI Explanation
  const aiExplanation = `${pattern.defaultLevel.toUpperCase()} RISK [${riskScore}/100] • ${pattern.title}: Telemetry detected on ${chain.toUpperCase()} involving origin jurisdiction ${fromCountry.name} (${fromCountry.code}) and recipient ${toCountry.name} (${toCountry.code}). ${pattern.summary} Transaction value: $${amountUSD.toLocaleString()} (${cryptoAmount}).`;
  
  const detailedAnalysis = `FORENSIC CASE ASSESSMENT:
Category: ${pattern.category}
Threat Signature: ${pattern.title}
Risk Index: ${riskScore} / 100 (${riskLevel.toUpperCase()})

EXECUTIVE SUMMARY:
${pattern.summary}

BEHAVIORAL FOOTPRINT & ON-CHAIN HEURISTICS:
${pattern.behavioralFootprint.map((b, i) => `${i + 1}. ${b}`).join('\n')}

DETECTED COMPLIANCE FLAGS:
${pattern.ruleFlags.map((rf, i) => `• ${rf}`).join('\n')}

REGULATORY & LEGAL IMPLICATIONS:
${pattern.regulatoryImpact}

TACTICAL REMEDIATION GUIDANCE:
${pattern.remediationAdvice}`;

  return {
    id: txHash,
    txHash,
    fromAddress,
    toAddress,
    fromCountry,
    toCountry,
    chain,
    amountUSD,
    cryptoAmount,
    riskScore,
    riskLevel,
    fraudPattern: pattern.title,
    patternDetails: pattern,
    tags: [...pattern.tags, `${fromCountry.code} ➔ ${toCountry.code}`, `${chain.toUpperCase()}`],
    ruleFlags: pattern.ruleFlags,
    aiExplanation,
    detailedAnalysis,
    timestamp: Date.now() - (seed % 3600000),
  };
}

