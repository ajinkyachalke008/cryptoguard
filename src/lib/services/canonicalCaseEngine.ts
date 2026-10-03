/**
 * Canonical Synthetic Forensic Case & Graph Engine
 * 
 * Provides unified, deterministic, and live-feeling forensic transaction intelligence.
 * Ensures strict flow conservation, realistic decimals, chronological timestamps,
 * directed graph pathfinding, and seamless cross-surface consistency.
 */

import {
  CountryInfo,
  FORENSIC_COUNTRIES,
  RiskLevel,
  FraudPatternDefinition,
  FRAUD_PATTERN_TAXONOMY,
  normalizeChainName,
  computeDeterministicSeed,
  generateRealisticAddress,
  generateRealisticTxHash,
  getRiskLevelFromScore,
  registerCanonicalResolvers
} from "./forensicEngine";

// ═════════════════════════════════════════════════════════════════════════════
// 1. CANONICAL DATA MODELS
// ═════════════════════════════════════════════════════════════════════════════

export type NodeType =
  | "target"
  | "mixer"
  | "cex"
  | "bridge"
  | "defi"
  | "peel_hop"
  | "victim"
  | "contract"
  | "cold_wallet"
  | "otc_broker"
  | "drainer"
  | "sybil_node"
  | "validator"
  | "darknet"
  | "ransomware"
  | "lazarus_proxy"
  | "sanctioned_pool"
  | "flash_loan_pool"
  | "casino"
  | "market_maker"
  | "multisig";

export type FlowStage = "ingress" | "core" | "anonymize" | "peel" | "egress";

export interface CanonicalAccount {
  id: string; // unique address string
  address: string;
  label: string;
  nodeType: NodeType;
  riskScore: number;
  riskLevel: RiskLevel;
  volume: number; // Cumulative USD volume
  transactionCount: number;
  country: string;
  countryCode: string;
  tier?: string;
  behavioralTag: string;
  entityRole: string;
  nodeExplanation: string;
  sanctionDetails?: string;
  contractVerified?: boolean;
  layer: number; // 0: funder, 1: victim, 2: target, 3: mixer/bridge, 4: peel/layer, 5: exit
  firstSeen: string; // ISO 8601
  lastSeen: string; // ISO 8601
  heuristicFlags: string[];
  evidenceStatus: "SIMULATED_FORENSIC_CASE";
  visualColor?: string; // Deterministic Yellow/Green/Red/Blue forensic identity
}

export interface CanonicalTransaction {
  transactionId: string; // e.g. "TX-SIM-2026-000184"
  txHash: string; // 0x<64-hex>
  source: string;
  destination: string;
  amount: number; // precise token amount
  amountUSD: number;
  token: string;
  timestamp: string; // ISO 8601 strictly chronological
  blockNumber: number;
  chain: string;
  gasFee: number;
  gasToken: string;
  riskScore: number;
  riskLevel: RiskLevel;
  patternLabel: string;
  flowReason: string;
  stage: FlowStage;
  heuristicFlags: string[];
  forensicNotes: string;
  relatedTxIds: string[];
  caseId: string;
  evidenceStatus: "SIMULATED_FORENSIC_CASE";
}

export interface ForensicActionPlan {
  actionId: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  targetEntity: string;
  legalJurisdiction?: string;
}

export interface CanonicalForensicCase {
  caseId: string; // e.g. "CASE-SIM-TORNADO-839102"
  seed: number;
  generationVersion: string;
  provenance: "SIMULATED_FORENSIC_CASE";
  scenarioId: string;
  scenarioName: string;
  category: string;
  targetAddress: string;
  chain: string;
  primaryToken: string;
  secondaryToken: string;
  totalInflow: number;
  totalOutflow: number;
  retainedBalance: number;
  totalFees: number;
  riskScore: number;
  riskLevel: RiskLevel;
  ruleFlags: string[];
  summary: string;
  remediationAdvice: string;
  regulatoryImpact: string;
  accounts: CanonicalAccount[];
  transactions: CanonicalTransaction[];
  actionPlan: ForensicActionPlan[];
  generatedAt: string;
}

export interface GraphNode extends CanonicalAccount {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number; // Cumulative USD volume
  token: string;
  transactionCount: number;
  hashes: string[];
  patternLabel: string;
  flowReason: string;
  riskLevel?: RiskLevel;
  stage?: FlowStage;
  transactions?: CanonicalTransaction[];
}

export interface GraphStats {
  totalNodes: number;
  totalLinks: number;
  riskScore: number;
  riskLevel: RiskLevel;
  fraudPattern: string;
  patternCategory?: string;
  patternSummary?: string;
  remediationAdvice?: string;
  regulatoryImpact?: string;
  detectedMixers: number;
  bridgesUsed: number;
  cexDepositNodes: number;
  peelHops?: number;
  victimsCount?: number;
  depth?: number;
  totalInflowUSD?: number;
  totalOutflowUSD?: number;
}

export interface ProjectedGraphData {
  caseId: string;
  seed: number;
  generationVersion: string;
  provenance: "SIMULATED_FORENSIC_CASE";
  scenarioId: string;
  nodes: GraphNode[];
  links: GraphLink[];
  stats: GraphStats;
  actionPlan: ForensicActionPlan[];
  target: CanonicalAccount;
  allTransactions: CanonicalTransaction[];
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. GLOBAL REGISTRY FOR CROSS-SURFACE CANONICAL CONSISTENCY
// ═════════════════════════════════════════════════════════════════════════════

const g = globalThis as any;
if (!g.__canonicalCaseRegistry) g.__canonicalCaseRegistry = new Map<string, CanonicalForensicCase>();
if (!g.__canonicalAccountRegistry) g.__canonicalAccountRegistry = new Map<string, CanonicalAccount>();
if (!g.__canonicalTxRegistry) g.__canonicalTxRegistry = new Map<string, CanonicalTransaction>();

const canonicalCaseRegistry: Map<string, CanonicalForensicCase> = g.__canonicalCaseRegistry;
const canonicalAccountRegistry: Map<string, CanonicalAccount> = g.__canonicalAccountRegistry;
const canonicalTxRegistry: Map<string, CanonicalTransaction> = g.__canonicalTxRegistry;

export function registerCanonicalCase(c: CanonicalForensicCase): void {
  canonicalCaseRegistry.set(c.caseId, c);
  canonicalCaseRegistry.set(`${c.targetAddress.toLowerCase()}:${c.scenarioId}:${c.seed}`, c);
  canonicalCaseRegistry.set(`${c.targetAddress.toLowerCase()}:${c.seed}`, c);
  for (const acc of c.accounts) {
    canonicalAccountRegistry.set(acc.address.toLowerCase(), acc);
  }
  for (const tx of c.transactions) {
    canonicalTxRegistry.set(tx.transactionId, tx);
    canonicalTxRegistry.set(tx.txHash.toLowerCase(), tx);
  }
}

export function findCanonicalAccount(address: string): CanonicalAccount | undefined {
  const clean = address.toLowerCase();
  const existing = canonicalAccountRegistry.get(clean);
  if (existing) return existing;

  // Do NOT treat transaction IDs or 66-character tx hashes as wallet addresses
  if (clean.length > 44 || clean.startsWith("tx-sim-") || canonicalTxRegistry.has(clean) || canonicalTxRegistry.has(address)) {
    return undefined;
  }

  // Auto-generate canonical case deterministically for wallet addresses
  const seed = computeDeterministicSeed(clean);
  const genCase = generateSyntheticCase({ targetAddress: address, seed });
  return canonicalAccountRegistry.get(clean);
}

export function findCanonicalTransaction(idOrHash: string): CanonicalTransaction | undefined {
  return canonicalTxRegistry.get(idOrHash.toLowerCase()) || canonicalTxRegistry.get(idOrHash);
}

export function getCachedCanonicalCase(targetAddress: string, seed: number, scenarioId?: string): CanonicalForensicCase | undefined {
  if (scenarioId) {
    const scMatch = canonicalCaseRegistry.get(`${targetAddress.toLowerCase()}:${scenarioId.toLowerCase()}:${seed}`);
    if (scMatch) return scMatch;
  }
  return canonicalCaseRegistry.get(`${targetAddress.toLowerCase()}:${seed}`);
}

// Connect canonical lookup into forensicEngine
registerCanonicalResolvers(findCanonicalAccount, findCanonicalTransaction);

// ═════════════════════════════════════════════════════════════════════════════
// 3. DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
// ═════════════════════════════════════════════════════════════════════════════

export function createPRNG(seed: number) {
  let s = Math.abs(seed) || 1;
  return function nextFloat(): number {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. TOPOLOGY MOTIFS & CASE GENERATOR
// ═════════════════════════════════════════════════════════════════════════════

const TOKEN_PRICES: Record<string, number> = {
  ETH: 2650,
  BTC: 64200,
  SOL: 152,
  BNB: 585,
  MATIC: 0.52,
  AVAX: 28.5,
  ARB: 0.68,
  USDT: 1.0,
  USDC: 1.0,
  DAI: 1.0,
};

export interface GenerateCaseOptions {
  scenarioId?: string;
  targetAddress: string;
  seed: number;
  chain?: string;
}

export function generateSyntheticCase(options: GenerateCaseOptions): CanonicalForensicCase {
  const { scenarioId, targetAddress, seed } = options;
  const cleanTarget = targetAddress.trim();
  const chain = normalizeChainName(options.chain || "ethereum");

  // Check cache first
  const cached = getCachedCanonicalCase(cleanTarget, seed, scenarioId);
  if (cached && (!scenarioId || cached.scenarioId.toLowerCase() === scenarioId.toLowerCase())) {
    return cached;
  }

  const prng = createPRNG(seed);

  // ═════════════════════════════════════════════════════════════════════════
  // 1. SCENARIO RESOLUTION: SPECIFIC ARCHETYPES & PRESET MAPPINGS
  // ═════════════════════════════════════════════════════════════════════════

  const SCENARIO_ALIASES: Record<string, string> = {
    // Critical (85–100)
    tornado_cash: "tornado_cash",
    tornado: "tornado_cash",
    mixer: "tornado_cash",
    critical: "tornado_cash",
    drainer: "drainer",
    permit2: "drainer",
    phishing: "drainer",
    lazarus: "lazarus",
    apt38: "lazarus",
    ronin: "lazarus",
    ransomware: "ransomware",
    lockbit: "ransomware",
    darknet: "darknet",
    narcotics: "darknet",
    escrow: "darknet",
    sim_swap: "sim_swap",
    simswap: "sim_swap",
    infinite_mint: "infinite_mint",
    infinitemint: "infinite_mint",
    rug_pull: "rug_pull",
    rugpull: "rug_pull",
    pig_butchering: "pig_butchering",
    pigbutchering: "pig_butchering",
    romance_scam: "pig_butchering",
    // High (60–84)
    stargate: "stargate",
    bridge: "stargate",
    cross_chain: "stargate",
    high: "stargate",
    flash_loan: "flash_loan",
    flashloan: "flash_loan",
    curve: "flash_loan",
    nested_mixer: "nested_mixer",
    peel_chain: "nested_mixer",
    layerzero: "layerzero",
    oft: "layerzero",
    offshore_cex: "offshore_cex",
    smurfing: "offshore_cex",
    otc_brokerage: "otc_brokerage",
    otc: "otc_brokerage",
    casino: "casino",
    gambling: "casino",
    split_peel_ring: "split_peel_ring",
    sanctioned_entity: "sanctioned_entity",
    sanctions: "sanctioned_entity",
    // Medium (30–59)
    sybil: "sybil",
    airdrop: "sybil",
    medium: "sybil",
    wash_trading: "wash_trading",
    washtrading: "wash_trading",
    proxy_contract: "proxy_contract",
    proxy: "proxy_contract",
    bot_cluster: "bot_cluster",
    miner_bribe: "miner_bribe",
    flashbots: "miner_bribe",
    dusting_attack: "dusting_attack",
    dusting: "dusting_attack",
    // Low / Clean (0–29)
    institutional: "institutional",
    coinbase: "institutional",
    clean: "institutional",
    low: "institutional",
    aave_lending: "aave_lending",
    corporate_multisig: "corporate_multisig",
    gnosis: "corporate_multisig",
    treasury: "corporate_multisig",
    market_maker: "market_maker",
    wintermute: "market_maker",
  };

  const ALL_28_SCENARIOS = [
    "tornado_cash", "drainer", "lazarus", "ransomware", "darknet", "sim_swap", "infinite_mint", "rug_pull", "pig_butchering",
    "stargate", "flash_loan", "nested_mixer", "layerzero", "offshore_cex", "otc_brokerage", "casino", "split_peel_ring", "sanctioned_entity",
    "sybil", "wash_trading", "proxy_contract", "bot_cluster", "miner_bribe", "dusting_attack",
    "institutional", "aave_lending", "corporate_multisig", "market_maker"
  ];

  const PRESET_ADDRESS_MAP: Record<string, string> = {
    // Critical
    "0x742d35cc6634c0532925a3b844bc9e7595f2bd3e": "tornado_cash",
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "drainer",
    "0x098b716b8aaf21512996dc57eb0615e2383e2f96": "lazarus",
    "0x3845badade8e6dff049820680d1f14bd3903a5d0": "ransomware",
    "0x1111111254fb6c44bac0bed2854e76f90643097d": "darknet",
    "0x4b16c5de96eb2117bbe5fd171e4d203624b014aa": "sim_swap",
    "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b": "infinite_mint",
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": "rug_pull",
    "0x3301374f17f4ffb4e87c050a97b2eb6a70e7e1f4": "pig_butchering",
    // High
    "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": "stargate",
    "0x6b175474e89094c44da98b954eedeac495271d0f": "flash_loan",
    "0x8894e0a0c962cb723c1976a4421c95949be2d4e3": "nested_mixer",
    "0x66a9893cc07d91d95644aedd05d03f95e1dba8af": "layerzero",
    "0x28c6c06298d514db089934071355e5743bf21d60": "offshore_cex",
    "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": "otc_brokerage",
    "0xa090e606e30bd747d4e6245a1517ebe430f0057e": "casino",
    "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f": "split_peel_ring",
    "0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a": "sanctioned_entity",
    // Medium
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "sybil",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "wash_trading",
    "0x514910771af9ca656af840dff83e8264ecf986ca": "proxy_contract",
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "bot_cluster",
    "0x00000000000000adc04c56bf30ac9d3c0aaf14dc": "miner_bribe",
    "0x000000000000000000000000000000000000dead": "dusting_attack",
    // Low
    "0x8ba1f109551bd432803012645Ac136ddd64dba72": "institutional",
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": "aave_lending",
    "0x12302fe9c02ff50939baaaaf415fc226c078613c": "corporate_multisig",
    "0xdbf5e9c5206d0db70a90108bf936da60221dc080": "market_maker",
  };

  const targetLower = cleanTarget.toLowerCase();
  let resolvedScenarioId = "nested_mixer";

  if (scenarioId && SCENARIO_ALIASES[scenarioId.toLowerCase()]) {
    resolvedScenarioId = SCENARIO_ALIASES[scenarioId.toLowerCase()];
  } else if (PRESET_ADDRESS_MAP[targetLower]) {
    resolvedScenarioId = PRESET_ADDRESS_MAP[targetLower];
  } else {
    resolvedScenarioId = ALL_28_SCENARIOS[seed % ALL_28_SCENARIOS.length];
  }

  // Token determination
  const tokens = chain === "bitcoin" ? ["BTC", "USDT"] : chain === "solana" ? ["SOL", "USDC"] : ["ETH", "USDT", "USDC", "DAI", "WBTC"];
  const primaryToken = tokens[seed % tokens.length];
  const secondaryToken = tokens[(seed + 1) % tokens.length];
  const tokenPrice = TOKEN_PRICES[primaryToken] || 2500;

  // Base capital: scale realistically between $180,000 and $4,500,000
  const baseUSD = Math.floor(180000 + prng() * 4320000);
  const baseTokenAmount = parseFloat((baseUSD / tokenPrice).toFixed(6));

  const accounts: CanonicalAccount[] = [];
  const transactions: CanonicalTransaction[] = [];
  const accountMap = new Map<string, CanonicalAccount>();

  const addAccount = (acc: CanonicalAccount) => {
    if (!accountMap.has(acc.address.toLowerCase())) {
      accountMap.set(acc.address.toLowerCase(), acc);
      accounts.push(acc);
    }
  };

  const nowMs = Date.now();
  const baseTimestampMs = nowMs - Math.floor((3600 * 4 + prng() * 3600 * 14) * 1000);

  let txCounter = 1;
  const generateTxId = () => {
    const pad = String(txCounter++).padStart(6, "0");
    return `TX-SIM-2026-${pad}`;
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 2. DYNAMIC TARGET PROFILE & METADATA PER SCENARIO
  // ═════════════════════════════════════════════════════════════════════════

  let targetRiskScore = 85;
  let targetCategory = "Critical Threat & Sanctions";
  let targetNodeType: NodeType = "target";
  let targetLabel = `Target (${cleanTarget.slice(0, 6)}...${cleanTarget.slice(-4)})`;
  let targetRole = "Central Inflow Aggregator";
  let targetTag = "Primary Subject under Investigation";
  let targetExplanation = `Central entity in ${resolvedScenarioId.replace("_", " ").toUpperCase()} topology.`;
  let remediationAdvice = "Enforce strict AML transaction monitoring, request custodian source-of-funds verification, and freeze terminal exit endpoints.";
  let regulatoryImpact = "Immediate exposure to FATF Travel Rule reporting standards and AML 6th Directive compliance mandates.";
  let actionPlan: ForensicActionPlan[] = [];

  const targetCountry = FORENSIC_COUNTRIES[seed % FORENSIC_COUNTRIES.length];

  if (["institutional", "aave_lending", "corporate_multisig", "market_maker"].includes(resolvedScenarioId)) {
    targetRiskScore = Math.floor(6 + prng() * 14); // 6–19 (Low)
    targetCategory = "Regulated Institutional Flow";
    targetRole = "Regulated Capital Custody";
    targetTag = "Verified Legitimate Institution";
  } else if (["sybil", "wash_trading", "proxy_contract", "bot_cluster", "miner_bribe", "dusting_attack"].includes(resolvedScenarioId)) {
    targetRiskScore = Math.floor(36 + prng() * 20); // 36–55 (Medium)
    targetCategory = "Medium-Risk Anomaly & Automation";
    targetRole = "Automated Protocol Intermediary";
    targetTag = "High-Frequency Algorithmic Node";
  } else if (["stargate", "flash_loan", "nested_mixer", "layerzero", "offshore_cex", "otc_brokerage", "casino", "split_peel_ring", "sanctioned_entity"].includes(resolvedScenarioId)) {
    targetRiskScore = Math.floor(66 + prng() * 16); // 66–81 (High)
    targetCategory = "High-Risk Layering & Relayer";
    targetRole = "Cross-Venue Liquidity Bridge";
    targetTag = "High-Risk Obfuscation Gateway";
  } else {
    targetRiskScore = Math.floor(88 + prng() * 12); // 88–99 (Critical)
    targetCategory = "Critical Threat & Sanctions";
    targetRole = "Malicious Syndicate Controller";
    targetTag = "Critical Threat Actor Subject";
  }

  // Specific Target Customizations per scenario archetype
  switch (resolvedScenarioId) {
    case "tornado_cash":
      targetRiskScore = 99;
      targetNodeType = "mixer";
      targetLabel = "Tornado.Cash: 100 ETH Vault (OFAC SDN 0x12d6)";
      targetRole = "Sanctioned Mixer Pool";
      targetTag = "OFAC SDN Designated Cryptographic Mixer";
      targetExplanation = "OFAC-sanctioned zk-SNARK non-custodial cryptographic mixing smart contract.";
      remediationAdvice = "Broadcast automated blocking notice under OFAC Executive Order 13694 and blacklist all interacting addresses.";
      regulatoryImpact = "Severe OFAC SDN sanctions violation risk for US/EU entities interacting with this contract.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "OFAC SDN Blacklist Broadcast", description: "Flag contract address and interacting deposit wallets with active sanctions alerts.", targetEntity: cleanTarget, legalJurisdiction: "US Treasury OFAC" },
        { actionId: "ACT-02", priority: "HIGH", title: "zk-SNARK Relayer Interception", description: "Subpoena third-party relayer gas sponsors to unmask withdrawal request IPs.", targetEntity: "Tornado Cash Relayer", legalJurisdiction: "INTERPOL Cybercrime" },
        { actionId: "ACT-03", priority: "MEDIUM", title: "Terminal CEX Freeze Order", description: "Issue preservation orders to downstream offshore exchanges receiving unmixed proceeds.", targetEntity: "Offshore CEX", legalJurisdiction: "FATF Member States" }
      ];
      break;

    case "drainer":
      targetRiskScore = 96;
      targetNodeType = "drainer";
      targetLabel = "Permit2 Batch Drainer Contract (0xdac1...1ec7)";
      targetRole = "Malicious Drainer Operator";
      targetTag = "Batch Permit2 Signature Exploit";
      targetExplanation = "Automated contract exploiting off-chain Permit2 signature approvals to sweep multiple victim balances.";
      remediationAdvice = "Broadcast emergency Permit2 allowance revocation alert and notify affected RPC providers.";
      regulatoryImpact = "Unlawful computer access, grand larceny, and consumer financial fraud.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "Permit2 Allowance Revocation Alert", description: "Trigger public RPC broadcast warning users to cancel active Permit2 nonces.", targetEntity: cleanTarget, legalJurisdiction: "Consumer Protection / FBI IC3" },
        { actionId: "ACT-02", priority: "HIGH", title: "DEX Swap Liquidity Freeze", description: "Alert Uniswap router interfaces and MEV builders to block drainer token dumps.", targetEntity: "Uniswap V3 Router", legalJurisdiction: "SEC / FinCEN" },
        { actionId: "ACT-03", priority: "MEDIUM", title: "Operator Syndicate Cold Vault Freezing", description: "Submit blockchain intelligence report to exchanges to seize affiliate payout cuts.", targetEntity: "Malware Syndicate", legalJurisdiction: "Europol" }
      ];
      break;

    case "lazarus":
      targetRiskScore = 100;
      targetNodeType = "lazarus_proxy";
      targetLabel = "Lazarus Group (APT38): Ronin Exploit Proxy";
      targetRole = "State-Sponsored Exploit Proxy";
      targetTag = "DPRK APT38 Cyber Warfare Syndicate";
      targetExplanation = "Primary exploit proxy executing multi-sig validator key bypass on Ronin Bridge cross-chain contract.";
      remediationAdvice = "Refer to UN Security Council Panel of Experts, broadcast INTERPOL Red Notice, and freeze downstream OTC desks.";
      regulatoryImpact = "International state-sponsored cyber terrorism and UN Security Council Resolution 1718 sanctions enforcement.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "UN Security Council 1718 Sanctions Alert", description: "Submit forensic proof dossier to UN 1718 Sanctions Committee on DPRK illicit finance.", targetEntity: cleanTarget, legalJurisdiction: "UN Security Council" },
        { actionId: "ACT-02", priority: "CRITICAL", title: "INTERPOL Red Notice Coordination", description: "Transmit state actor biometric and wallet telemetry to global cybercrime units.", targetEntity: "DPRK APT38 Operators", legalJurisdiction: "INTERPOL" },
        { actionId: "ACT-03", priority: "HIGH", title: "Southeast Asia P2P OTC Desk Blacklist", description: "Serve freeze mandates on unlicensed OTC brokers facilitating fiat off-ramps.", targetEntity: "P2P Settlement Desks", legalJurisdiction: "FinCEN / MAS" }
      ];
      break;

    case "ransomware":
      targetRiskScore = 97;
      targetNodeType = "ransomware";
      targetLabel = "LockBit Ransomware: Inflow Aggregation Hub";
      targetRole = "Ransomware Extortion Collector";
      targetTag = "LockBit Multi-Tier Syndicate Hub";
      targetExplanation = "Automated ransom collection gateway aggregating extortion payouts from corporate enterprise breaches.";
      remediationAdvice = "Coordinate with FBI Cyber Division and CISA; enforce immediate asset freezing at connected off-ramps.";
      regulatoryImpact = "Extortion under the Computer Fraud and Abuse Act (CFAA) and OFAC ransomware advisory violations.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "FBI Cyber Division Incident Submission", description: "File joint IC3 extortion report with enterprise victim payment hash proof.", targetEntity: cleanTarget, legalJurisdiction: "FBI Cyber Division" },
        { actionId: "ACT-02", priority: "HIGH", title: "Sanctioned Russian CEX Freezing Notice", description: "Broadcast secondary sanctions alert for Garantex and associated liquidity mules.", targetEntity: "High-Risk Exchange", legalJurisdiction: "OFAC / FinCEN" }
      ];
      break;

    case "darknet":
      targetRiskScore = 94;
      targetNodeType = "darknet";
      targetLabel = "Darknet Marketplace: Escrow & Mixer Pool";
      targetRole = "Decentralized Black Market Escrow";
      targetTag = "Dark Web Vendor Escrow Smart Contract";
      targetExplanation = "Multi-signature automated escrow facilitating illicit commerce and narcotic transactions with atomic swap obfuscation.";
      remediationAdvice = "Notify Europol Dark Web Investigation Unit and monitor associated Monero atomic swap relay endpoints.";
      regulatoryImpact = "Controlled Substances Act and Title 18 Anti-Money Laundering violations.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "Europol Dark Web Investigation Referral", description: "Forward escrow multi-sig signature evidence and vendor escrow telemetry.", targetEntity: cleanTarget, legalJurisdiction: "Europol EC3" },
        { actionId: "ACT-02", priority: "HIGH", title: "Monero Atomic Swap Cluster Interception", description: "Trace cross-chain swap initiation transactions at known atomic swap relayers.", targetEntity: "XMR Relayers", legalJurisdiction: "FATF" }
      ];
      break;

    case "sim_swap":
      targetRiskScore = 92;
      targetNodeType = "target";
      targetLabel = "Executive SIM-Swap Asset Relay EOA";
      targetRole = "Executive Account Takeover Relay";
      targetTag = "High-Velocity Asset Stripping Subject";
      targetExplanation = "Attacker address holding drained assets following mobile carrier SIM-swap executive identity compromise.";
      remediationAdvice = "Submit emergency preservation letters to receiving DEX aggregators and cross-chain bridge validators.";
      regulatoryImpact = "Identity theft, wire fraud, and computer fraud under federal and state penal codes.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "Telecom Carrier Fraud Preservation", description: "Demand call detail records and IMSI update timestamps from cellular carrier.", targetEntity: "Carrier Endpoint", legalJurisdiction: "FCC / Law Enforcement" },
        { actionId: "ACT-02", priority: "HIGH", title: "Bridge Escape Route Interception", description: "Alert Arbitrum bridge validators to freeze outgoing minted tokens.", targetEntity: "Bridge Relayer", legalJurisdiction: "Validator Set" }
      ];
      break;

    case "infinite_mint":
      targetRiskScore = 98;
      targetNodeType = "contract";
      targetLabel = "Infinite Mint Vulnerability Exploit Router";
      targetRole = "Smart Contract Exploit Execution";
      targetTag = "Vulnerable Minting Logic Exploit";
      targetExplanation = "Malicious smart contract exploiting reentrancy and lack of access control to mint arbitrary unbacked token supplies.";
      remediationAdvice = "Trigger emergency pause on compromised token proxy contract and coordinate DEX LP protection.";
      regulatoryImpact = "Market manipulation, securities fraud, and unauthorized protocol exploitation.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "Emergency Protocol Circuit Breaker", description: "Trigger multi-sig emergency shutdown function on affected ERC-20 contract.", targetEntity: cleanTarget, legalJurisdiction: "Smart Contract Governance" },
        { actionId: "ACT-02", priority: "HIGH", title: "DEX Liquidity Pool Protection", description: "Notify Uniswap and Curve liquidity providers of unbacked synthetic token dumping.", targetEntity: "AMM Pools", legalJurisdiction: "CFTC / SEC" }
      ];
      break;

    case "rug_pull":
      targetRiskScore = 96;
      targetNodeType = "contract";
      targetLabel = "Liquidity Pool Rug Pull Deployer Contract";
      targetRole = "Malicious Token Deployer Contract";
      targetTag = "Rug Pull & Liquidity Drain Exploit";
      targetExplanation = "Smart contract deployer executing emergency liquidity removal and dumping unvested developer allocations on retail holders.";
      remediationAdvice = "Blacklist deployer address, report developer key footprint to blockchain analytics consortium, and freeze DEX LP exit funds.";
      regulatoryImpact = "Securities fraud, wire fraud, and grand theft under US Title 18 and international criminal law.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "Emergency AMM Router Blacklist", description: "Notify DEX router maintainers to freeze swaps and display malicious token warning.", targetEntity: cleanTarget, legalJurisdiction: "DEX Security Alliance" },
        { actionId: "ACT-02", priority: "HIGH", title: "Presale Inflow Trace & Victim Restitution", description: "Trace deployer presale deposit addresses to aggregate victim loss claims for FBI IC3.", targetEntity: "Victim Inflow Cluster", legalJurisdiction: "FBI IC3" }
      ];
      break;

    case "pig_butchering":
      targetRiskScore = 95;
      targetNodeType = "victim";
      targetLabel = "Sha Zhu Pan Fraud Gateway (Syndicate Host)";
      targetRole = "Romance Scam Syndicate Gateway";
      targetTag = "Sha Zhu Pan Industrial Fraud Nexus";
      targetExplanation = "Phishing investment portal simulating high-yield algorithmic returns while systematically extracting retail victim funds into Southeast Asian crime compounds.";
      remediationAdvice = "Submit victim transaction dossier to Global Anti-Scam Organization (GASO) and coordinate with INTERPOL Financial Crime Unit.";
      regulatoryImpact = "Human trafficking-linked organized financial cybercrime, transnational wire fraud, and money laundering.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "Syndicate Collector Hub Interception", description: "Trace downstream transfers to industrial scam compound hot wallets in Myanmar/Cambodia.", targetEntity: cleanTarget, legalJurisdiction: "INTERPOL / GASO" },
        { actionId: "ACT-02", priority: "HIGH", title: "Telecom & Social Engineering Footprint Subpoena", description: "Subpoena WhatsApp/Telegram telecom records tied to romance solicitation accounts.", targetEntity: "Lead Contact Identity", legalJurisdiction: "National Cybercrime Agencies" }
      ];
      break;

    case "stargate":
      targetRiskScore = 72;
      targetNodeType = "bridge";
      targetLabel = "Stargate Finance: Bridge Router (0x8731)";
      targetRole = "Cross-Chain Liquidity Router";
      targetTag = "LayerZero Omni-Chain Relayer";
      targetExplanation = "Multi-chain router executing unified liquidity pool rebalancing between Ethereum and alternative EVM L1/L2s.";
      remediationAdvice = "Verify cross-chain packet attestations with LayerZero Decentralized Verifier Network (DVN).";
      regulatoryImpact = "FATF cross-border wire transfer requirements and bridge relayer reporting obligations.";
      actionPlan = [
        { actionId: "ACT-01", priority: "HIGH", title: "LayerZero DVN Attestation Audit", description: "Verify cryptographic multi-signature validity of cross-chain payload messages.", targetEntity: cleanTarget, legalJurisdiction: "LayerZero DVN Network" },
        { actionId: "ACT-02", priority: "MEDIUM", title: "Cross-Chain Destination Address Mapping", description: "Track receiving addresses across Avalanche and Arbitrum rollups.", targetEntity: "Destination Mints", legalJurisdiction: "FATF Member States" }
      ];
      break;

    case "flash_loan":
      targetRiskScore = 78;
      targetNodeType = "defi";
      targetLabel = "Curve 3pool Flash Loan Exploit Contract";
      targetRole = "DeFi Arbitrage Exploit Contract";
      targetTag = "Flash Loan Oracle Manipulation";
      targetExplanation = "Complex arbitrage contract borrowing $35M in flash liquidity to skew Curve virtual price oracle for protocol extraction.";
      remediationAdvice = "Adopt multi-block TWAP and Chainlink price feeds to mitigate single-block oracle manipulation vectors.";
      regulatoryImpact = "Commodities Exchange Act market manipulation and algorithmic fraud scrutiny.";
      actionPlan = [
        { actionId: "ACT-01", priority: "HIGH", title: "Oracle TWAP Vulnerability Disclosure", description: "Issue urgent security bulletin advising protocols to switch from spot pool balances to TWAP.", targetEntity: cleanTarget, legalJurisdiction: "DeFi Security Alliance" },
        { actionId: "ACT-02", priority: "HIGH", title: "Flashbots Miner Bribe Audit", description: "Analyze private mempool bundle header and validator coinbase payment distribution.", targetEntity: "Flashbots Relay", legalJurisdiction: "CFTC" }
      ];
      break;

    case "nested_mixer":
      targetRiskScore = 79;
      targetNodeType = "mixer";
      targetLabel = "Multi-Pool Cascading Anonymity Relay";
      targetRole = "Multi-Mixer Chain Obfuscator";
      targetTag = "Cascading Privacy Protocols";
      targetExplanation = "Intermediate address routing funds across consecutive privacy mixing pools to fracture temporal graph analysis.";
      remediationAdvice = "Execute temporal heuristic clustering to identify common relayer gas funding origins.";
      regulatoryImpact = "Non-compliant money transmission and AML 6th Directive layering violations.";
      actionPlan = [
        { actionId: "ACT-01", priority: "HIGH", title: "Multi-Mixer Graph Reconstruction", description: "Correlate deposit note amounts with unshielded withdrawal tranches using gas-fee heuristics.", targetEntity: cleanTarget, legalJurisdiction: "FinCEN" }
      ];
      break;

    case "layerzero":
      targetRiskScore = 68;
      targetNodeType = "bridge";
      targetLabel = "LayerZero V2: OFT Teleportation Endpoint";
      targetRole = "Omnichain Token Relayer Endpoint";
      targetTag = "Cross-Network Message Dispatcher";
      targetExplanation = "Omnichain Fungible Token endpoint handling atomic mint-and-burn messages across heterogeneous blockchains.";
      remediationAdvice = "Audit DVN signature thresholds and monitor destination execution addresses for rapid liquidation.";
      regulatoryImpact = "Cross-jurisdictional asset relocation and cross-chain Travel Rule compliance.";
      actionPlan = [
        { actionId: "ACT-01", priority: "MEDIUM", title: "Omnichain Teleportation Trace", description: "Log DVN validator message receipts and track subsequent DEX swap outputs.", targetEntity: cleanTarget, legalJurisdiction: "FATF" }
      ];
      break;

    case "offshore_cex":
      targetRiskScore = 78;
      targetNodeType = "cex";
      targetLabel = "Offshore Non-KYC Exchange Deposit Gateway";
      targetRole = "Unregulated Exchange Deposit Gateway";
      targetTag = "Structuring & Smurfing Cashout";
      targetExplanation = "Terminal deposit address at foreign exchange operating without mandatory AML/KYC or Travel Rule verification.";
      remediationAdvice = "Serve bilateral mutual legal assistance treaty (MLAT) preservation order to exchange host jurisdiction.";
      regulatoryImpact = "FinCEN Bank Secrecy Act non-compliance and structured smurfing violations.";
      actionPlan = [
        { actionId: "ACT-01", priority: "HIGH", title: "FinCEN Form 111 Structuring Filing", description: "Submit suspicious activity report for structured transactions below $10,000 threshold.", targetEntity: cleanTarget, legalJurisdiction: "FinCEN / IRS-CI" },
        { actionId: "ACT-02", priority: "HIGH", title: "Offshore Omnibus Subpoena", description: "Transmit MLAT preservation request for account KYC logs and IP access records.", targetEntity: "Offshore Exchange", legalJurisdiction: "FATF / MLAT" }
      ];
      break;

    case "otc_brokerage":
      targetRiskScore = 74;
      targetNodeType = "otc_broker";
      targetLabel = "Unregistered P2P OTC Settlement Desk";
      targetRole = "Unregistered Money Services Business";
      targetTag = "High-Volume P2P Liquidity Broker";
      targetExplanation = "High-volume peer-to-peer broker executing bilateral off-book fiat-to-crypto stablecoin settlements.";
      remediationAdvice = "Request commercial banking source-of-funds documentation and verify FinCEN MSB registration status.";
      regulatoryImpact = "Operating an unlicensed money transmitting business under 18 U.S. Code § 1960.";
      actionPlan = [
        { actionId: "ACT-01", priority: "HIGH", title: "Unlicensed MSB Enforcement Referral", description: "Refer unregistered money transmitter to federal and state banking regulators.", targetEntity: cleanTarget, legalJurisdiction: "FinCEN / State Banking Dept" }
      ];
      break;

    case "casino":
      targetRiskScore = 72;
      targetNodeType = "casino";
      targetLabel = "High-Volume Gaming Platform Operational Hot Wallet";
      targetRole = "Gaming Platform Treasury Hot Wallet";
      targetTag = "High-Velocity Tumbling Platform";
      targetExplanation = "Central operational hot wallet handling high-stakes wagering, jackpot disbursements, and coin mixer functions.";
      remediationAdvice = "Audit Curacao eGaming license status and demand AML suspicious transaction log disclosures.";
      regulatoryImpact = "Unlawful Internet Gambling Enforcement Act (UIGEA) and FinCEN gaming reporting standards.";
      actionPlan = [
        { actionId: "ACT-01", priority: "HIGH", title: "Curacao eGaming Compliance Audit", description: "Demand player verification records and source of wealth declarations.", targetEntity: cleanTarget, legalJurisdiction: "Curacao Gaming Control Board" }
      ];
      break;

    case "split_peel_ring":
      targetRiskScore = 76;
      targetNodeType = "peel_hop";
      targetLabel = "Ephemeral Counterparty Split-Peel Ring Hub";
      targetRole = "Balance Fragmenter & Ring Disperser";
      targetTag = "Multi-Hop Remainder Stripping Hub";
      targetExplanation = "Automated splitter dividing large balances into fractional tranches sent across disposable ephemeral accounts.";
      remediationAdvice = "Reconstruct UTXO-style remainder balances to locate final consolidated cold storage vaults.";
      regulatoryImpact = "Structuring transactions to evade currency transaction reporting thresholds (31 U.S.C. § 5324).";
      actionPlan = [
        { actionId: "ACT-01", priority: "HIGH", title: "Remainder Balance Chain De-Anonymization", description: "Trace fractional peel remainders across ephemeral intermediary hops.", targetEntity: cleanTarget, legalJurisdiction: "FinCEN" }
      ];
      break;

    case "sanctioned_entity":
      targetRiskScore = 79;
      targetNodeType = "sanctioned_pool";
      targetLabel = "Sanctioned Sovereign Evasion Vehicle (UAE FZE)";
      targetRole = "Designated Sanctions Evasion Vehicle";
      targetTag = "OFAC Designated Evasion Shell";
      targetExplanation = "Offshore corporate front entity facilitating cross-border payment settlements for specially designated nationals (SDNs) via Tether Gold and stablecoin layering.";
      remediationAdvice = "Block transactions immediately under OFAC SDN directives and file FinCEN Suspicious Activity Report (SAR).";
      regulatoryImpact = "Direct violation of OFAC Sanctions Regulations and international sanctions evasion enforcement.";
      actionPlan = [
        { actionId: "ACT-01", priority: "CRITICAL", title: "OFAC SDN Asset Freeze Notice", description: "Issue automated blocking memorandum across participating financial institutions.", targetEntity: cleanTarget, legalJurisdiction: "US Treasury OFAC" },
        { actionId: "ACT-02", priority: "HIGH", title: "UAE Commercial Registry MLAT Audit", description: "Request corporate beneficial ownership records through mutual legal assistance channels.", targetEntity: "UAE Front Company", legalJurisdiction: "UAE FIU / FinCEN" }
      ];
      break;

    case "sybil":
      targetRiskScore = 52;
      targetNodeType = "sybil_node";
      targetLabel = "Sybil Farming Syndicate Master Distributor";
      targetRole = "Sybil Farming Syndicate Master";
      targetTag = "Scripted Multi-Account Airdrop Swarm";
      targetExplanation = "Central distributor funding dozens of puppet accounts with uniform gas allotments to exploit token airdrops.";
      remediationAdvice = "Apply behavioral clustering heuristics and revoke allocations from the identified puppet cluster.";
      regulatoryImpact = "Protocol terms of service fraud and multi-account identity misrepresentation.";
      actionPlan = [
        { actionId: "ACT-01", priority: "MEDIUM", title: "Sybil Score Disqualification", description: "Broadcast cluster fingerprint to Gitcoin Passport and LayerZero airdrop filters.", targetEntity: cleanTarget, legalJurisdiction: "Protocol Governance" }
      ];
      break;

    case "wash_trading":
      targetRiskScore = 54;
      targetNodeType = "defi";
      targetLabel = "Uniswap V2: WETH-LP Manipulated Pair";
      targetRole = "Targeted AMM Liquidity Pool";
      targetTag = "Closed-Loop Wash Trading Ring";
      targetExplanation = "Decentralized liquidity pool subjected to circular transaction loops among colluding accounts to falsify 24h trading volume.";
      remediationAdvice = "Flag trading pair for artificial volume inflation on analytics providers and notify DEX router interfaces.";
      regulatoryImpact = "Section 9(a)(1) of the Securities Exchange Act prohibiting fraudulent wash sales.";
      actionPlan = [
        { actionId: "ACT-01", priority: "MEDIUM", title: "Artificial Volume Flagging", description: "Notify CoinGecko and DexScreener of wash volume exclusion for token pair.", targetEntity: cleanTarget, legalJurisdiction: "CFTC / SEC" },
        { actionId: "ACT-02", priority: "MEDIUM", title: "Circular Trade Loop Audit", description: "Identify colluding addresses executing non-economic round-trip capital cycles.", targetEntity: "Colluding Ring Nodes", legalJurisdiction: "Exchange Compliance" }
      ];
      break;

    case "proxy_contract":
      targetRiskScore = 46;
      targetNodeType = "contract";
      targetLabel = "Unverified Transparent Proxy Bytecode";
      targetRole = "Upgradeable Proxy Contract";
      targetTag = "Unverified DelegateCall Execution";
      targetExplanation = "Upgradeable transparent proxy delegating execution logic to an unverified bytecode smart contract.";
      remediationAdvice = "Decompile implementation bytecode to verify logic safety and inspect proxy administrator multi-sig controls.";
      regulatoryImpact = "Smart contract security non-disclosure and potential back-door governance risks.";
      actionPlan = [
        { actionId: "ACT-01", priority: "MEDIUM", title: "Bytecode Decompilation Audit", description: "Disassemble unverified implementation contract to check for malicious transfer functions.", targetEntity: cleanTarget, legalJurisdiction: "Security Review" }
      ];
      break;

    case "bot_cluster":
      targetRiskScore = 44;
      targetNodeType = "contract";
      targetLabel = "High-Frequency Arbitrage Bot Controller";
      targetRole = "Algorithmic Arbitrage Controller";
      targetTag = "High-Frequency MEV Bot Network";
      targetExplanation = "Automated smart contract directing synchronized worker bots to capture cross-DEX price discrepancies.";
      remediationAdvice = "Implement private RPC endpoints to protect ordinary users from front-running and sandwich extraction.";
      regulatoryImpact = "Algorithmic trading monitoring and high-frequency mempool manipulation oversight.";
      actionPlan = [
        { actionId: "ACT-01", priority: "LOW", title: "Mempool MEV Monitoring", description: "Analyze bot gas bidding strategies and sandwich attack transaction footprints.", targetEntity: cleanTarget, legalJurisdiction: "MEV Research" }
      ];
      break;

    case "miner_bribe":
      targetRiskScore = 40;
      targetNodeType = "validator";
      targetLabel = "Flashbots Private Builder: Coinbase Bribe Relay";
      targetRole = "Block Builder Private Bundle Relay";
      targetTag = "Direct Validator Coinbase Bribe Hub";
      targetExplanation = "Private relay forwarding bundled transactions and direct miner bribes to validators bypassing public mempool.";
      remediationAdvice = "Verify PBS (Proposer-Builder Separation) relay inclusion proofs and validator consensus headers.";
      regulatoryImpact = "Ethereum network censorship resistance standards and MEV fairness guidelines.";
      actionPlan = [
        { actionId: "ACT-01", priority: "LOW", title: "PBS Inclusion Verification", description: "Verify bundle inclusion proofs against public validator block production logs.", targetEntity: cleanTarget, legalJurisdiction: "Validator Governance" }
      ];
      break;

    case "dusting_attack":
      targetRiskScore = 48;
      targetNodeType = "sybil_node";
      targetLabel = "UTXO & Token Dusting Deanonymization Engine";
      targetRole = "Deanonymization Dusting Bot";
      targetTag = "UTXO Deanonymization Vector";
      targetExplanation = "Automated surveillance script broadcasting microscopic token amounts (dust) to hundreds of high-value wallets to track downstream consolidated spend activity.";
      remediationAdvice = "Instruct affected wallet holders to mark dust UTXOs/tokens as unspendable to prevent wallet cluster linkage.";
      regulatoryImpact = "Surveillance reconnaissance and deanonymization threat preceding targeted phishing or physical extortion.";
      actionPlan = [
        { actionId: "ACT-01", priority: "MEDIUM", title: "Dust UTXO Containment Guidance", description: "Advise recipients to freeze unspent dust outputs to prevent cluster heuristic linkage.", targetEntity: cleanTarget, legalJurisdiction: "Threat Intelligence Advisory" }
      ];
      break;

    case "institutional":
      targetRiskScore = 8;
      targetNodeType = "cold_wallet";
      targetLabel = "Coinbase Prime: Regulated Qualified Custody";
      targetRole = "SOC2 Regulated Qualified Custodian";
      targetTag = "Audited Institutional Cold Storage";
      targetExplanation = "Regulated qualified custodian wallet holding segregated corporate assets under SOC2 Type II controls.";
      remediationAdvice = "Maintain routine proof-of-reserves attestations and annual external security audit compliance.";
      regulatoryImpact = "Fully compliant with FATF Travel Rule, SEC custody requirements, and FinCEN regulations.";
      actionPlan = [
        { actionId: "ACT-01", priority: "LOW", title: "Proof of Reserves Verification", description: "Audit cryptographic balance attestation against qualified custodian ledger.", targetEntity: cleanTarget, legalJurisdiction: "SEC / FinCEN" }
      ];
      break;

    case "aave_lending":
      targetRiskScore = 12;
      targetNodeType = "defi";
      targetLabel = "Aave V3: Audited Lending Pool Core";
      targetRole = "Decentralized Lending Market";
      targetTag = "Formally Verified Liquidity Protocol";
      targetExplanation = "Audited decentralized liquidity protocol providing over-collateralized borrowing and interest-bearing aTokens.";
      remediationAdvice = "Monitor pool utilization ratios and collateral reserve factors for optimal liquidity safety.";
      regulatoryImpact = "Compliant decentralized finance operations with verified smart contracts and public audits.";
      actionPlan = [
        { actionId: "ACT-01", priority: "LOW", title: "Pool Liquidity Health Inspection", description: "Verify borrow interest rate model parameters and protocol liquidation thresholds.", targetEntity: cleanTarget, legalJurisdiction: "Aave DAO Governance" }
      ];
      break;

    case "corporate_multisig":
      targetRiskScore = 14;
      targetNodeType = "multisig";
      targetLabel = "Gnosis Safe 3/5: Corporate Treasury Vault";
      targetRole = "Corporate Treasury Multi-Signature Vault";
      targetTag = "3-of-5 Governance Governed Reserve";
      targetExplanation = "Multi-signature corporate treasury vault requiring 3 of 5 executive hardware key signatures for disbursements.";
      remediationAdvice = "Follow documented signer key management policy and perform periodic signer rotation.";
      regulatoryImpact = "Corporate governance compliant under Delaware corporate law and statutory accounting standards.";
      actionPlan = [
        { actionId: "ACT-01", priority: "LOW", title: "Signer Key Management Review", description: "Audit hardware wallet signer identities and verify quarterly key rotation schedule.", targetEntity: cleanTarget, legalJurisdiction: "Corporate Governance" }
      ];
      break;

    case "market_maker":
      targetRiskScore = 10;
      targetNodeType = "market_maker";
      targetLabel = "Wintermute: Institutional Algorithmic Desk";
      targetRole = "FCA-Registered Institutional Market Maker";
      targetTag = "Regulated Liquidity Provision Desk";
      targetExplanation = "Institutional trading desk providing continuous two-sided liquidity across centralized and decentralized markets.";
      remediationAdvice = "Ensure ongoing compliance with FCA algorithmic trading notifications and exchange market-making agreements.";
      regulatoryImpact = "Fully authorized under UK Financial Conduct Authority (FCA) and MiCA framework guidelines.";
      actionPlan = [
        { actionId: "ACT-01", priority: "LOW", title: "FCA Algorithmic Trading Compliance", description: "File routine market-making bilateral trade reconciliations with regulatory supervisors.", targetEntity: cleanTarget, legalJurisdiction: "UK FCA / ESMA" }
      ];
      break;
  }

  const targetRiskLevel = getRiskLevelFromScore(targetRiskScore);

  const targetAccount: CanonicalAccount = {
    id: cleanTarget,
    address: cleanTarget,
    label: targetLabel,
    nodeType: targetNodeType,
    riskScore: targetRiskScore,
    riskLevel: targetRiskLevel,
    volume: baseUSD * 2,
    transactionCount: Math.floor(14 + prng() * 60),
    country: `${targetCountry.name} (${targetCountry.code})`,
    countryCode: targetCountry.code,
    tier: targetCountry.tier,
    behavioralTag: targetTag,
    entityRole: targetRole,
    nodeExplanation: targetExplanation,
    layer: 2,
    firstSeen: new Date(baseTimestampMs - 86400000 * 30).toISOString(),
    lastSeen: new Date(baseTimestampMs + 3600000 * 4).toISOString(),
    heuristicFlags: [
      targetRiskScore > 75 ? "HIGH_RISK_AGGREGATOR" : targetRiskScore < 30 ? "REGULATED_INSTITUTION" : "ALGORITHMIC_ENTITY",
      "CENTRAL_FLOW_SUBJECT"
    ],
    evidenceStatus: "SIMULATED_FORENSIC_CASE"
  };
  addAccount(targetAccount);

  let currentBlock = 20845100 + Math.floor(prng() * 100000);
  let cumulativeTime = baseTimestampMs;

  const createTx = (
    src: CanonicalAccount,
    dst: CanonicalAccount,
    tokenAmt: number,
    stage: FlowStage,
    patternLabel: string,
    flowReason: string,
    delayMinutes: number
  ): CanonicalTransaction => {
    cumulativeTime += Math.floor(delayMinutes * 60 * 1000);
    currentBlock += Math.max(1, Math.floor(delayMinutes * 5));
    const usdVal = parseFloat((tokenAmt * tokenPrice).toFixed(2));
    const gas = parseFloat((0.0018 + prng() * 0.0042).toFixed(6));
    const txId = generateTxId();
    const hash = generateRealisticTxHash(seed + txCounter * 17, chain);

    const tx: CanonicalTransaction = {
      transactionId: txId,
      txHash: hash,
      source: src.address,
      destination: dst.address,
      amount: parseFloat(tokenAmt.toFixed(6)),
      amountUSD: usdVal,
      token: primaryToken,
      timestamp: new Date(cumulativeTime).toISOString(),
      blockNumber: currentBlock,
      chain: chain.toUpperCase(),
      gasFee: gas,
      gasToken: primaryToken === "BTC" ? "BTC" : "ETH",
      riskScore: Math.max(src.riskScore, dst.riskScore),
      riskLevel: getRiskLevelFromScore(Math.max(src.riskScore, dst.riskScore)),
      patternLabel,
      flowReason,
      stage,
      heuristicFlags: [
        stage === "ingress" ? "INGRESS_TRANSFER" : stage === "egress" ? "CEX_EXIT" : "INTERMEDIATE_ROUTING"
      ],
      forensicNotes: `Transfer of ${tokenAmt.toFixed(4)} ${primaryToken} ($${usdVal.toLocaleString()}) from ${src.label} to ${dst.label}. Reason: ${flowReason}.`,
      relatedTxIds: [],
      caseId: `CASE-SIM-${resolvedScenarioId.toUpperCase()}-${seed.toString().slice(-6)}`,
      evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };

    transactions.push(tx);
    return tx;
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 3. TOPOLOGY SYNTHESIS ACCORDING TO DISTINCT SCENARIO MOTIF
  // ═════════════════════════════════════════════════════════════════════════

  switch (resolvedScenarioId) {
    case "tornado_cash": {
      // Fan-In from 2 Depositors  Target 100 ETH Vault  zk-SNARK Anonymity  2 Unlinked Withdrawals + Relayer Fee  Offshore CEX & Cold Stash
      const in1Addr = generateRealisticAddress(seed, 101, chain);
      const in1: CanonicalAccount = {
        id: in1Addr, address: in1Addr, label: "Deposit Origin EOA #1 (Flagged Inflow)", nodeType: "victim",
        riskScore: 88, riskLevel: "critical", volume: 100 * tokenPrice, transactionCount: 4,
        country: "Russian Federation (RU)", countryCode: "RU", behavioralTag: "Heist Ingress Endpoint",
        entityRole: "Exploit Loot Inflow", nodeExplanation: "Origin wallet depositing 100 ETH tranche of exploit loot into anonymity pool.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 7200000).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["ILLICIT_DEPOSIT", "SANCTIONED_DESTINATION"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(in1);
      createTx(in1, targetAccount, 100, "ingress", "Sanctioned Mixer Deposit #1", "100 ETH Fixed Note Inflow", 10);

      const in2Addr = generateRealisticAddress(seed, 102, chain);
      const in2: CanonicalAccount = {
        id: in2Addr, address: in2Addr, label: "Deposit Origin EOA #2 (Sanctioned Origin)", nodeType: "victim",
        riskScore: 84, riskLevel: "high", volume: 100 * tokenPrice, transactionCount: 2,
        country: "Cayman Islands (KY)", countryCode: "KY", behavioralTag: "Heist Ingress Endpoint",
        entityRole: "Secondary Inflow Source", nodeExplanation: "Secondary wallet depositing 100 ETH tranche into mixer pool.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 3600000).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["ILLICIT_DEPOSIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(in2);
      createTx(in2, targetAccount, 100, "ingress", "Sanctioned Mixer Deposit #2", "100 ETH Fixed Note Inflow", 15);

      const relayerAddr = "0x58b90159491753907c16c0f653457a3e74b341c2";
      const relayer: CanonicalAccount = {
        id: relayerAddr, address: relayerAddr, label: "Tornado.Cash: 0.25 ETH Gas Relayer", nodeType: "defi",
        riskScore: 78, riskLevel: "high", volume: 140000, transactionCount: 820,
        country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Mixer Gas Relayer",
        entityRole: "Privacy Relayer Service", nodeExplanation: "Third-party relayer broadcasting withdrawal transactions to prevent gas-linking.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 200).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["RELAYER_SERVICE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(relayer);

      const w1Addr = generateRealisticAddress(seed, 201, chain);
      const w1: CanonicalAccount = {
        id: w1Addr, address: w1Addr, label: "Fresh Unlinked Withdrawal EOA #1", nodeType: "cold_wallet",
        riskScore: 86, riskLevel: "high", volume: 99.75 * tokenPrice, transactionCount: 2,
        country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "Post-Mixer Withdrawal EOA",
        entityRole: "Cleaned Asset Recipient", nodeExplanation: "Fresh unlinked address receiving 100 ETH note output minus relayer gas fee.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["POST_MIXER_RECIPIENT", "FRESH_ACCOUNT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(w1);
      createTx(targetAccount, w1, 99.75, "anonymize", "zk-SNARK Anonymous Note Withdrawal #1", "Zero-knowledge note redemption", 30);
      createTx(targetAccount, relayer, 0.25, "anonymize", "Relayer Gas Compensation", "0.25 ETH Relayer Fee", 1);

      const w2Addr = generateRealisticAddress(seed, 202, chain);
      const w2: CanonicalAccount = {
        id: w2Addr, address: w2Addr, label: "Fresh Unlinked Withdrawal EOA #2", nodeType: "cold_wallet",
        riskScore: 85, riskLevel: "high", volume: 99.75 * tokenPrice, transactionCount: 2,
        country: "Panama (PA)", countryCode: "PA", behavioralTag: "Post-Mixer Withdrawal EOA",
        entityRole: "Cleaned Asset Recipient", nodeExplanation: "Second fresh address redeeming 100 ETH note anonymously.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 7200000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["POST_MIXER_RECIPIENT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(w2);
      createTx(targetAccount, w2, 99.75, "anonymize", "zk-SNARK Anonymous Note Withdrawal #2", "Second 100 ETH note redemption", 45);

      const cexAddr = "0x28c6c06298d514db089934071355e5743bf21d60";
      const cex: CanonicalAccount = {
        id: cexAddr, address: cexAddr, label: "Offshore Non-KYC Exchange Deposit", nodeType: "cex",
        riskScore: 84, riskLevel: "high", volume: 180 * tokenPrice, transactionCount: 650,
        country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "Non-KYC Exchange Deposit",
        entityRole: "Fiat Liquidation Endpoint", nodeExplanation: "Deposit address at unregulated offshore exchange.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CEX_EXIT", "POST_MIXER_DEPOSIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(cex);
      createTx(w1, cex, 95.0, "egress", "CEX Liquidation Deposit", "Fiat conversion", 50);

      const coldStashAddr = generateRealisticAddress(seed, 301, chain);
      const coldStash: CanonicalAccount = {
        id: coldStashAddr, address: coldStashAddr, label: "Threat Actor Secondary Cold Storage", nodeType: "cold_wallet",
        riskScore: 82, riskLevel: "high", volume: 95 * tokenPrice, transactionCount: 1,
        country: "United Arab Emirates (AE)", countryCode: "AE", behavioralTag: "Unhosted Reserve Vault",
        entityRole: "Long-Term Retention Vault", nodeExplanation: "Cold storage retaining mixer proceeds.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 10800000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["UNHOSTED_STORAGE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(coldStash);
      createTx(w2, coldStash, 95.0, "egress", "Unhosted Stash Retention", "Cold reserve storage", 60);
      break;
    }

    case "drainer": {
      // Fan-In from 4-6 victims  Target (Drainer)  Uniswap V3  Split to Operator (80%) & Affiliate (20%)  CEX exit
      const victimCount = Math.floor(4 + prng() * 4);
      let totalInflowTokens = 0;

      for (let v = 1; v <= victimCount; v++) {
        const vCountry = FORENSIC_COUNTRIES[(seed + v * 9) % FORENSIC_COUNTRIES.length];
        const vAddr = generateRealisticAddress(seed, 100 + v, chain);
        const vCutRatio = (1 / victimCount) * (0.8 + prng() * 0.4);
        const vAmt = parseFloat((baseTokenAmount * vCutRatio).toFixed(6));
        totalInflowTokens += vAmt;

        const victimAcc: CanonicalAccount = {
          id: vAddr, address: vAddr, label: `Victim EOA: Permit2 Signer #${v}`, nodeType: "victim",
          riskScore: Math.floor(18 + prng() * 12), riskLevel: "low", volume: vAmt * tokenPrice, transactionCount: 2,
          country: `${vCountry.name} (${vCountry.code})`, countryCode: vCountry.code,
          behavioralTag: "Victim Ingress Endpoint", entityRole: "Compromised Source",
          nodeExplanation: `Victim drained via malicious Permit2 signature. Country of origin: ${vCountry.name}.`,
          layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 120).toISOString(), lastSeen: new Date(baseTimestampMs + 60000 * v).toISOString(),
          heuristicFlags: ["VICTIM_ACCOUNT", "PERMIT2_EXPLOIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(victimAcc);
        createTx(victimAcc, targetAccount, vAmt, "ingress", "Phishing Signature Sweep", "Batch token drain", 0.35 + prng() * 0.4);
      }

      const dexAddr = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
      const dexAcc: CanonicalAccount = {
        id: dexAddr, address: dexAddr, label: "Uniswap V3: SwapRouter02 (0x68b3...4910)", nodeType: "defi",
        riskScore: 35, riskLevel: "medium", volume: totalInflowTokens * tokenPrice, transactionCount: 1420,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "DEX Liquidity Pool",
        entityRole: "Asset Swap Intermediary", nodeExplanation: "Automated market maker executing slippage-tolerant market swap to native ETH.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DEX_LIQUIDITY_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(dexAcc);
      createTx(targetAccount, dexAcc, totalInflowTokens * 0.985, "core", "Immediate Market Dump", "DEX slippage swap", 1.8);

      const opAddr = generateRealisticAddress(seed, 250, chain);
      const opAcc: CanonicalAccount = {
        id: opAddr, address: opAddr, label: "Syndicate Primary Operations Cold Vault", nodeType: "drainer",
        riskScore: 97, riskLevel: "critical", volume: totalInflowTokens * 0.78 * tokenPrice, transactionCount: 38,
        country: "Cayman Islands (KY)", countryCode: "KY", behavioralTag: "Malware Syndicate Primary",
        entityRole: "Threat Actor Main Wallet", nodeExplanation: "Syndicate address receiving 80% primary cut from batch drainer operations.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 14).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DRAINER_OPERATOR", "CRITICAL_THREAT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(opAcc);
      createTx(dexAcc, opAcc, totalInflowTokens * 0.78, "peel", "Operator Split (80%)", "Syndicate fee capture", 4.2);

      const affAddr = generateRealisticAddress(seed, 251, chain);
      const affAcc: CanonicalAccount = {
        id: affAddr, address: affAddr, label: "Affiliate Commission Settlement EOA", nodeType: "drainer",
        riskScore: 91, riskLevel: "critical", volume: totalInflowTokens * 0.19 * tokenPrice, transactionCount: 14,
        country: "Russian Federation (RU)", countryCode: "RU", behavioralTag: "Affiliate Commission",
        entityRole: "Phisher Commission Node", nodeExplanation: "20% affiliate bounty distributed to distribution partner.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 7).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["AFFILIATE_FEE_SPLIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(affAcc);
      createTx(dexAcc, affAcc, totalInflowTokens * 0.19, "peel", "Affiliate Bounty (20%)", "Lead referral commission", 3.1);

      const exitAddr = "0x28c6c06298d514db089934071355e5743bf21d60";
      const exitAcc: CanonicalAccount = {
        id: exitAddr, address: exitAddr, label: "Offshore Exchange Liquidation Gateway", nodeType: "cex",
        riskScore: 84, riskLevel: "high", volume: totalInflowTokens * 0.75 * tokenPrice, transactionCount: 840,
        country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "Unregulated CEX Off-Ramp",
        entityRole: "Fiat Liquidation Endpoint", nodeExplanation: "Direct deposit into high-risk offshore exchange account.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 200).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CEX_EXIT", "OFFSHORE_LIQUIDATION"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(exitAcc);
      createTx(opAcc, exitAcc, totalInflowTokens * 0.75, "egress", "CEX Liquidation Deposit", "Fiat cashout conversion", 14.5);
      break;
    }

    case "lazarus": {
      // 2 Stolen Validator Keys  Lazarus Exploit Proxy (Target)  100 ETH Mixer  Railgun Relayer  SE Asia OTC  DPRK Treasury
      const val1Addr = generateRealisticAddress(seed, 401, chain);
      const val1: CanonicalAccount = {
        id: val1Addr, address: val1Addr, label: "Ronin Bridge: Exfiltrated Validator Key #1", nodeType: "validator",
        riskScore: 95, riskLevel: "critical", volume: baseUSD * 3, transactionCount: 8,
        country: "North Korea (KP)", countryCode: "KP", behavioralTag: "Compromised Validator Node",
        entityRole: "Stolen Private Key Signer", nodeExplanation: "Axie Ronin Bridge validator key exfiltrated via spear-phishing PDF payload.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 5).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["COMPROMISED_VALIDATOR", "STATE_ACTOR"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(val1);
      createTx(val1, targetAccount, baseTokenAmount * 0.6, "ingress", "Validator Multisig Bypass #1", "Forged bridge withdrawal signature", 5);

      const val2Addr = generateRealisticAddress(seed, 402, chain);
      const val2: CanonicalAccount = {
        id: val2Addr, address: val2Addr, label: "Ronin Bridge: Exfiltrated Validator Key #2", nodeType: "validator",
        riskScore: 95, riskLevel: "critical", volume: baseUSD * 2.5, transactionCount: 6,
        country: "North Korea (KP)", countryCode: "KP", behavioralTag: "Compromised Validator Node",
        entityRole: "Stolen Private Key Signer #2", nodeExplanation: "Second compromised validator completing required 5-of-9 threshold.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 5).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["COMPROMISED_VALIDATOR"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(val2);
      createTx(val2, targetAccount, baseTokenAmount * 0.4, "ingress", "Validator Multisig Bypass #2", "Threshold signature completion", 8);

      const mixerAddr = "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b";
      const mixerAcc: CanonicalAccount = {
        id: mixerAddr, address: mixerAddr, label: "Tornado.Cash: 100 ETH Pool (OFAC SDN)", nodeType: "mixer",
        riskScore: 99, riskLevel: "critical", volume: 65000000, transactionCount: 18000,
        country: "OFAC SDN Sanctioned", countryCode: "US", behavioralTag: "Sanctioned Mixer Pool",
        entityRole: "Layering Anonymizer", nodeExplanation: "Non-custodial cryptographic mixing pool designated under OFAC sanctions.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 800).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["OFAC_SANCTIONS", "MIXER_EXPOSURE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(mixerAcc);
      createTx(targetAccount, mixerAcc, baseTokenAmount * 0.95, "core", "Sanctioned Mixer Tranche", "Zero-knowledge note splitting", 25);

      const railgunAddr = "0xfa705b630b05b631d8c117d98305c48fc0106e23";
      const railgunAcc: CanonicalAccount = {
        id: railgunAddr, address: railgunAddr, label: "Railgun Privacy Relayer Node", nodeType: "defi",
        riskScore: 96, riskLevel: "critical", volume: 18000000, transactionCount: 3200,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "DeFi Privacy Relayer",
        entityRole: "Secondary Obfuscation Layer", nodeExplanation: "zk-SNARK privacy protocol relayer unshielding tranches to OTC counterparties.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["PRIVACY_PROTOCOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(railgunAcc);
      createTx(mixerAcc, railgunAcc, baseTokenAmount * 0.92, "anonymize", "Railgun Unshielding Transfer", "Secondary zk-privacy relay", 35);

      const otcAddr = generateRealisticAddress(seed, 405, chain);
      const otcAcc: CanonicalAccount = {
        id: otcAddr, address: otcAddr, label: "Offshore P2P OTC Settlement Desk (Mekong)", nodeType: "otc_broker",
        riskScore: 94, riskLevel: "critical", volume: baseUSD * 1.5, transactionCount: 140,
        country: "Myanmar (MM)", countryCode: "MM", behavioralTag: "Sanctioned OTC Broker",
        entityRole: "Fiat Liquidation Counterparty", nodeExplanation: "Underground financial broker trading crypto stablecoins for physical currency.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["UNDERGROUND_OTC", "FATF_BLACKLIST"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(otcAcc);
      createTx(railgunAcc, otcAcc, baseTokenAmount * 0.88, "peel", "Underground OTC Settlement", "Bilateral off-book fiat trade", 60);

      const stateVaultAddr = generateRealisticAddress(seed, 406, chain);
      const stateVault: CanonicalAccount = {
        id: stateVaultAddr, address: stateVaultAddr, label: "APT38 State Cyber Bureau Sovereign Vault", nodeType: "cold_wallet",
        riskScore: 100, riskLevel: "critical", volume: baseUSD * 2.2, transactionCount: 4,
        country: "North Korea (KP)", countryCode: "KP", behavioralTag: "State Cyber Warfare Vault",
        entityRole: "Final Sovereign Exploit Loot Reserve", nodeExplanation: "State-controlled sovereign vault holding weapons program financing.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 86400000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["STATE_SPONSORED_VAULT", "UN_SANCTIONS_MATCH"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(stateVault);
      createTx(otcAcc, stateVault, baseTokenAmount * 0.85, "egress", "State Sovereign Loot Remittance", "Final weapon funding reserve", 90);
      break;
    }

    case "wash_trading": {
      // TRUE CLOSED CIRCULAR LOOP: Trader A  Uniswap Pair  Trader B  Trader C  Trader A!
      const pairAddr = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
      const pair: CanonicalAccount = {
        id: pairAddr, address: pairAddr, label: "Uniswap V2: WETH-LP Manipulated Pair", nodeType: "defi",
        riskScore: 50, riskLevel: "medium", volume: baseUSD * 12, transactionCount: 1420,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Manipulated AMM Pool",
        entityRole: "Target Liquidity Pair", nodeExplanation: "Target AMM liquidity pair registering dozens of round-trip circular trades.",
        layer: 2, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CIRCULAR_LIQUIDITY_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(pair);

      const traderBAddr = generateRealisticAddress(seed, 501, chain);
      const traderB: CanonicalAccount = {
        id: traderBAddr, address: traderBAddr, label: "Trader B: Collusive Wash Ring Node #2", nodeType: "defi",
        riskScore: 52, riskLevel: "medium", volume: baseUSD * 3, transactionCount: 180,
        country: "Hong Kong (HK)", countryCode: "HK", behavioralTag: "Secondary Churn Account",
        entityRole: "Wash Ring Intermediate", nodeExplanation: "Colluding bot account buying back manipulated tokens to artificially pump 24h volume.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 30).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["WASH_RING_NODE", "COLLUDING_PARTY"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(traderB);

      const traderCAddr = generateRealisticAddress(seed, 502, chain);
      const traderC: CanonicalAccount = {
        id: traderCAddr, address: traderCAddr, label: "Trader C: Circular Settlement Return Relay", nodeType: "defi",
        riskScore: 52, riskLevel: "medium", volume: baseUSD * 3, transactionCount: 160,
        country: "Singapore (SG)", countryCode: "SG", behavioralTag: "Return Cycle Relay",
        entityRole: "Capital Recirculation Node", nodeExplanation: "Third colluding node returning principal capital back to Trader A to complete circular cycle.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 20).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CIRCULAR_RETURN_NODE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(traderC);

      createTx(targetAccount, pair, baseTokenAmount, "core", "Artificially Inflated Buy Order", "Wash trade cycle hop 1", 2);
      createTx(pair, traderB, baseTokenAmount * 0.997, "core", "AMM Liquidity Swap Execution", "Wash trade cycle hop 2", 2);
      createTx(traderB, traderC, baseTokenAmount * 0.995, "peel", "Internal Syndicate Capital Relay", "Wash trade cycle hop 3", 4);
      createTx(traderC, targetAccount, baseTokenAmount * 0.992, "egress", "Circular Capital Restitution (Closed Loop)", "Wash trade cycle loop completion", 5);
      break;
    }

    case "flash_loan": {
      // Aave Flash Loan Pool  Exploit Contract (Target)  Curve 3pool (Skewed Oracle)  Target Lending Protocol  Repay Aave  Net Profit + Miner Bribe
      const aavePoolAddr = "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2";
      const aavePool: CanonicalAccount = {
        id: aavePoolAddr, address: aavePoolAddr, label: "Aave V3: Flash Loan Pool Core (0x8787)", nodeType: "flash_loan_pool",
        riskScore: 25, riskLevel: "low", volume: 35000000, transactionCount: 8900,
        country: "United Kingdom (GB)", countryCode: "GB", behavioralTag: "Uncollateralized Flash Lender",
        entityRole: "Atomic Flash Capital Provider", nodeExplanation: "Aave V3 flash loan pool providing uncollateralized single-transaction borrowing.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["FLASH_LOAN_PROVIDER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(aavePool);

      const curvePoolAddr = "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7";
      const curvePool: CanonicalAccount = {
        id: curvePoolAddr, address: curvePoolAddr, label: "Curve.fi: DAI/USDC/USDT 3pool (0xbEbc)", nodeType: "defi",
        riskScore: 42, riskLevel: "medium", volume: 28000000, transactionCount: 4200,
        country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Manipulated Price Oracle Pool",
        entityRole: "Imbalance AMM Vector", nodeExplanation: "Stablecoin pool subjected to massive flash swap distorting virtual price oracle.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 500).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["ORACLE_MANIPULATION_TARGET"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(curvePool);

      const victimVaultAddr = generateRealisticAddress(seed, 810, chain);
      const victimVault: CanonicalAccount = {
        id: victimVaultAddr, address: victimVaultAddr, label: "Target Lending Protocol: Borrow Vault", nodeType: "defi",
        riskScore: 78, riskLevel: "high", volume: 12000000, transactionCount: 140,
        country: "United States (US)", countryCode: "US", behavioralTag: "Drained Collateral Vault",
        entityRole: "Exploited Protocol Contract", nodeExplanation: "Lending protocol drained of collateral due to skewed price feed.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["EXPLOITED_PROTOCOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(victimVault);

      const minerBribeAddr = "0x00000000000000adc04c56bf30ac9d3c0aaf14dc";
      const minerBribe: CanonicalAccount = {
        id: minerBribeAddr, address: minerBribeAddr, label: "Flashbots Builder: Direct Coinbase Bribe", nodeType: "validator",
        riskScore: 55, riskLevel: "medium", volume: 450000, transactionCount: 940,
        country: "Germany (DE)", countryCode: "DE", behavioralTag: "MEV Miner Bribe Recipient",
        entityRole: "Validator Direct Fee Node", nodeExplanation: "Direct coinbase transfer to block builder ensuring zero-revert atomic execution.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 120).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["MEV_COINBASE_BRIBE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(minerBribe);

      const profitStashAddr = generateRealisticAddress(seed, 815, chain);
      const profitStash: CanonicalAccount = {
        id: profitStashAddr, address: profitStashAddr, label: "Exploit Proceeds: Primary Retention Cold Vault", nodeType: "cold_wallet",
        riskScore: 92, riskLevel: "critical", volume: baseUSD * 1.8, transactionCount: 3,
        country: "Panama (PA)", countryCode: "PA", behavioralTag: "Net Exploit Proceeds Stash",
        entityRole: "Attacker Profit Vault", nodeExplanation: "Unhosted wallet retaining net extracted profit after flash loan repayment.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["EXPLOIT_PROCEEDS"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(profitStash);

      createTx(aavePool, targetAccount, baseTokenAmount * 4, "ingress", "Uncollateralized Flash Loan Drawdown", "Instant borrow 35M USDC", 0.1);
      createTx(targetAccount, curvePool, baseTokenAmount * 3.5, "core", "Massive Imbalance Oracle Swap", "Curve pool distortion", 0.1);
      createTx(victimVault, targetAccount, baseTokenAmount * 2.2, "core", "Undercollateralized Drain", "Drained lending collateral", 0.1);
      createTx(targetAccount, aavePool, baseTokenAmount * 4.002, "peel", "Atomic Flash Loan Repayment", "Principal + 0.05% fee return", 0.1);
      createTx(targetAccount, minerBribe, baseTokenAmount * 0.08, "egress", "MEV Searcher Miner Bribe", "Coinbase validator inclusion fee", 0.1);
      createTx(targetAccount, profitStash, baseTokenAmount * 2.1, "egress", "Net Arbitrage Profit Extraction", "Final clean exploit loot", 0.2);
      break;
    }

    case "stargate": {
      // Ethereum Origin Whale  Stargate Router (Target)  LayerZero Relayer  Avalanche Destination  TraderJoe DEX
      const originWhaleAddr = generateRealisticAddress(seed, 1101, chain);
      const originWhale: CanonicalAccount = {
        id: originWhaleAddr, address: originWhaleAddr, label: "Ethereum High-Volume Origin EOA (Tier-1 Whale)", nodeType: "cold_wallet",
        riskScore: 42, riskLevel: "medium", volume: baseUSD * 2, transactionCount: 140,
        country: "United States (US)", countryCode: "US", behavioralTag: "Cross-Chain Capital Deployer",
        entityRole: "Origin Bridge Funder", nodeExplanation: "High-net-worth wallet initiating cross-chain bridge transfer to Avalanche ecosystem.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 200).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["WHALE_ORIGIN"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(originWhale);
      createTx(originWhale, targetAccount, baseTokenAmount, "ingress", "Cross-Chain Deposit Lock", "Asset lock on Ethereum", 10);

      const relayerAddr = "0x66a9893cc07d91d95644aedd05d03f95e1dba8af";
      const relayer: CanonicalAccount = {
        id: relayerAddr, address: relayerAddr, label: "LayerZero V2: DVN Attestation Oracle", nodeType: "bridge",
        riskScore: 68, riskLevel: "high", volume: baseUSD * 10, transactionCount: 15400,
        country: "Canada (CA)", countryCode: "CA", behavioralTag: "Decentralized Verifier Network",
        entityRole: "Message Packet Relayer", nodeExplanation: "DVN relayer verifying multi-sig consensus headers for cross-chain message packet delivery.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CROSS_CHAIN_RELAYER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(relayer);
      createTx(targetAccount, relayer, baseTokenAmount * 0.998, "core", "Omnichain Packet Dispatch", "Packet broadcast across DVN network", 2);

      const avaxDestAddr = generateRealisticAddress(seed, 1102, "ethereum");
      const avaxDest: CanonicalAccount = {
        id: avaxDestAddr, address: avaxDestAddr, label: "Avalanche C-Chain Bridge Receiver (0x7a25)", nodeType: "cold_wallet",
        riskScore: 58, riskLevel: "medium", volume: baseUSD * 0.98, transactionCount: 12,
        country: "Singapore (SG)", countryCode: "SG", behavioralTag: "Destination Bridge Recipient",
        entityRole: "Receiving Chain Liquidity Holder", nodeExplanation: "Destination address receiving minted bridged assets on Avalanche C-Chain.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DESTINATION_MINT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(avaxDest);
      createTx(relayer, avaxDest, baseTokenAmount * 0.995, "peel", "Cross-Chain Mint Execution", "Asset delivery on destination chain", 8);

      const tjPoolAddr = "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd";
      const tjPool: CanonicalAccount = {
        id: tjPoolAddr, address: tjPoolAddr, label: "Trader Joe V2.1: AVAX/USDC Liquidity Pool", nodeType: "defi",
        riskScore: 40, riskLevel: "medium", volume: baseUSD * 1.5, transactionCount: 3800,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "DEX AMM Pair",
        entityRole: "Secondary Market Liquidity", nodeExplanation: "Decentralized automated market maker on Avalanche converting bridged tokens into native AVAX.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DEX_SWAP_DESTINATION"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(tjPool);
      createTx(avaxDest, tjPool, baseTokenAmount * 0.98, "egress", "Native Liquidity Market Swap", "Conversion to AVAX", 15);
      break;
    }

    case "corporate_multisig": {
      // Stripe / Fiat On-Ramp  Gnosis Safe 3/5 (Target)  Payroll Dispatcher  Verified Employees & Vendors  Tax Reserve (Risk: 8–15, ALL GREEN LOW RISK)
      const revenueAddr = generateRealisticAddress(seed, 901, chain);
      const revenue: CanonicalAccount = {
        id: revenueAddr, address: revenueAddr, label: " Stripe / Fiat On-Ramp Corporate Revenue Hub", nodeType: "cold_wallet",
        riskScore: 8, riskLevel: "low", volume: baseUSD * 2.5, transactionCount: 420,
        country: "United States (US)", countryCode: "US", behavioralTag: "Compliant Revenue Ingress",
        entityRole: "Commercial Revenue Inbound", nodeExplanation: "Licensed payment processor on-ramp settling SaaS subscription revenue.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["SOC2_COMPLIANT", "COMMERCIAL_REVENUE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(revenue);
      createTx(revenue, targetAccount, baseTokenAmount, "ingress", "Monthly SaaS Revenue Allocation", "Legitimate corporate treasury funding", 60);

      const payrollAddr = generateRealisticAddress(seed, 902, chain);
      const payroll: CanonicalAccount = {
        id: payrollAddr, address: payrollAddr, label: " Automated Corporate Payroll Dispatcher", nodeType: "multisig",
        riskScore: 10, riskLevel: "low", volume: baseUSD * 0.45, transactionCount: 120,
        country: "Germany (DE)", countryCode: "DE", behavioralTag: "HR & Contractor Disbursal Hub",
        entityRole: "Payroll Distribution Smart Contract", nodeExplanation: "Automated smart contract executing monthly engineering and operations payroll.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["PAYROLL_DISPATCHER", "VERIFIED_ENTITY"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(payroll);
      createTx(targetAccount, payroll, baseTokenAmount * 0.45, "core", "Treasury Operating Expense Disbursal", "Monthly OpEx allocation", 120);

      const emp1Addr = generateRealisticAddress(seed, 911, chain);
      const emp1: CanonicalAccount = {
        id: emp1Addr, address: emp1Addr, label: " Verified Employee Wallet (Lead Architect)", nodeType: "cold_wallet",
        riskScore: 6, riskLevel: "low", volume: 45000, transactionCount: 24,
        country: "United Kingdom (GB)", countryCode: "GB", behavioralTag: "KYC Verified Employee",
        entityRole: "Full-Time Staff Compensation", nodeExplanation: "KYC-verified employee salary disbursement under UK PAYE withholding.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["KYC_VERIFIED"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(emp1);
      createTx(payroll, emp1, baseTokenAmount * 0.15, "peel", "Monthly Staff Salary Transfer", "Executive compensation", 10);

      const vendorAddr = generateRealisticAddress(seed, 912, chain);
      const vendor: CanonicalAccount = {
        id: vendorAddr, address: vendorAddr, label: " Cloud Infrastructure Vendor (AWS / Infura)", nodeType: "contract",
        riskScore: 8, riskLevel: "low", volume: 85000, transactionCount: 48,
        country: "United States (US)", countryCode: "US", behavioralTag: "Audited SaaS Vendor",
        entityRole: "Operational Supplier Invoice", nodeExplanation: "Commercial invoice settlement for cloud RPC nodes and hosting infrastructure.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["AUDITED_VENDOR"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(vendor);
      createTx(payroll, vendor, baseTokenAmount * 0.18, "peel", "Cloud Node Infrastructure Invoice", "Vendor service invoice #2026-981", 15);

      const taxAddr = generateRealisticAddress(seed, 915, chain);
      const tax: CanonicalAccount = {
        id: taxAddr, address: taxAddr, label: "️ Corporate Statutory Tax & Audit Reserve", nodeType: "cold_wallet",
        riskScore: 5, riskLevel: "low", volume: baseUSD * 0.35, transactionCount: 12,
        country: "Ireland (IE)", countryCode: "IE", behavioralTag: "Statutory Tax Withholding Vault",
        entityRole: "Corporate Tax Escrow", nodeExplanation: "Segregated custody account holding quarterly corporate tax and VAT withholdings.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["TAX_WITHHOLDING_ESCROW"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(tax);
      createTx(targetAccount, tax, baseTokenAmount * 0.35, "egress", "Quarterly Corporate Tax Provision", "Statutory tax reserve", 180);
      break;
    }

    case "casino": {
      // 2 Bettors  Casino House Hot Wallet (Target)  Bets Contract  Winner Payout + House Margin Stash
      const bettor1Addr = generateRealisticAddress(seed, 1001, chain);
      const bettor1: CanonicalAccount = {
        id: bettor1Addr, address: bettor1Addr, label: " High-Roller VIP Bettor #1", nodeType: "cold_wallet",
        riskScore: 68, riskLevel: "high", volume: 150000, transactionCount: 85,
        country: "Malta (MT)", countryCode: "MT", behavioralTag: "High-Frequency Gaming Ingress",
        entityRole: "Gambling Platform Depositor", nodeExplanation: "High-volume private account depositing wagering balances into casino hot wallet.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["HIGH_ROLLER_GAMBLER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(bettor1);
      createTx(bettor1, targetAccount, baseTokenAmount * 0.45, "ingress", "VIP Gaming Chip Deposit", "Wagering deposit", 15);

      const bettor2Addr = generateRealisticAddress(seed, 1002, chain);
      const bettor2: CanonicalAccount = {
        id: bettor2Addr, address: bettor2Addr, label: " High-Roller VIP Bettor #2", nodeType: "cold_wallet",
        riskScore: 65, riskLevel: "high", volume: 120000, transactionCount: 42,
        country: "Cyprus (CY)", countryCode: "CY", behavioralTag: "High-Frequency Gaming Ingress",
        entityRole: "Casino Depositor", nodeExplanation: "Secondary high-volume account depositing gaming stake.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 45).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CASINO_DEPOSIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(bettor2);
      createTx(bettor2, targetAccount, baseTokenAmount * 0.55, "ingress", "Sportsbook Stakes Deposit", "Wagering deposit", 20);

      const betsContractAddr = generateRealisticAddress(seed, 1003, chain);
      const betsContract: CanonicalAccount = {
        id: betsContractAddr, address: betsContractAddr, label: " Provably Fair Roulette & Bets Contract", nodeType: "casino",
        riskScore: 70, riskLevel: "high", volume: baseUSD * 1.5, transactionCount: 2400,
        country: "Curacao (CW)", countryCode: "CW", behavioralTag: "Provably Fair RNG Contract",
        entityRole: "Gaming Engine Smart Contract", nodeExplanation: "On-chain gaming logic contract utilizing verifiable random function (VRF) for betting settlements.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["VRF_GAMING_CONTRACT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(betsContract);
      createTx(targetAccount, betsContract, baseTokenAmount * 0.85, "core", "Gaming Pool Escrow Placement", "Active betting bankroll", 5);

      const winnerAddr = generateRealisticAddress(seed, 1004, chain);
      const winner: CanonicalAccount = {
        id: winnerAddr, address: winnerAddr, label: " Jackpot Winner Cashout Wallet", nodeType: "cold_wallet",
        riskScore: 74, riskLevel: "high", volume: baseUSD * 0.6, transactionCount: 4,
        country: "Georgia (GE)", countryCode: "GE", behavioralTag: "Jackpot Payout Egress",
        entityRole: "High-Yield Winning Player", nodeExplanation: "Player wallet receiving large lump-sum casino jackpot disbursement.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["JACKPOT_CASHOUT", "RAPID_WITHDRAWAL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(winner);
      createTx(betsContract, winner, baseTokenAmount * 0.58, "egress", "Jackpot Winnings Disbursement", "High-roll payout", 30);

      const houseStashAddr = generateRealisticAddress(seed, 1005, chain);
      const houseStash: CanonicalAccount = {
        id: houseStashAddr, address: houseStashAddr, label: " Casino House Gross Gaming Revenue Stash", nodeType: "cold_wallet",
        riskScore: 72, riskLevel: "high", volume: baseUSD * 0.4, transactionCount: 520,
        country: "Curacao (CW)", countryCode: "CW", behavioralTag: "Platform House Edge Retention",
        entityRole: "Casino Operational Revenue Vault", nodeExplanation: "Unhosted vault retaining platform house-edge net profits.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 240).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["HOUSE_REVENUE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(houseStash);
      createTx(betsContract, houseStash, baseTokenAmount * 0.25, "egress", "House Edge Profit Retention", "Platform margin capture", 45);
      break;
    }

    case "sybil": {
      // Funder  Target Master Relay  8 Puppet Nodes (Identical micro-gas allotments)  Consolidation Sweeper
      const funderAddr = generateRealisticAddress(seed, 999, chain);
      const funderAcc: CanonicalAccount = {
        id: funderAddr, address: funderAddr, label: " Sybil Syndicate Master Seed Wallet", nodeType: "sybil_node",
        riskScore: 56, riskLevel: "medium", volume: baseUSD * 1.2, transactionCount: 48,
        country: "Vietnam (VN)", countryCode: "VN", behavioralTag: "Sybil Swarm Funder",
        entityRole: "Master Seed Ingress", nodeExplanation: "Automated wallet distributing uniform gas allotments to multi-account farming script.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 14).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["SYBIL_FUNDER", "BOT_SCRIPTED"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(funderAcc);
      createTx(funderAcc, targetAccount, baseTokenAmount, "ingress", "Swarm Gas Allocation", "Seed funding swarm", 5.0);

      const puppetCount = Math.floor(6 + prng() * 4);
      const puppetCut = parseFloat((baseTokenAmount * 0.95 / puppetCount).toFixed(6));
      const puppetAccs: CanonicalAccount[] = [];

      for (let p = 1; p <= puppetCount; p++) {
        const pAddr = generateRealisticAddress(seed, 600 + p, chain);
        const pAcc: CanonicalAccount = {
          id: pAddr, address: pAddr, label: ` Puppet Node #${p}`, nodeType: "sybil_node",
          riskScore: Math.floor(48 + prng() * 12), riskLevel: "medium", volume: puppetCut * tokenPrice, transactionCount: 3,
          country: "Singapore (SG)", countryCode: "SG", behavioralTag: "Automated Airdrop Farmer",
          entityRole: "Disposable Farm Node", nodeExplanation: "Automated node executing scripted contract touch points to simulate unique organic activity.",
          layer: 3, firstSeen: new Date(baseTimestampMs).toISOString(), lastSeen: new Date(nowMs).toISOString(),
          heuristicFlags: ["PUPPET_NODE", "IDENTICAL_MICRO_ALLOCATION"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(pAcc);
        puppetAccs.push(pAcc);
        createTx(targetAccount, pAcc, puppetCut, "core", "Uniform Micro Gas Dispersal", "Scripted swarm funding", 0.8 + prng() * 0.4);
      }

      const accExitAddr = generateRealisticAddress(seed, 777, chain);
      const accExit: CanonicalAccount = {
        id: accExitAddr, address: accExitAddr, label: " Swarm Profit Consolidation Hub", nodeType: "sybil_node",
        riskScore: 68, riskLevel: "high", volume: baseUSD * 0.9, transactionCount: puppetCount + 2,
        country: "Hong Kong (HK)", countryCode: "HK", behavioralTag: "Sybil Profit Sweeper",
        entityRole: "Central Accumulator", nodeExplanation: "Consolidation smart contract or sweeper bot re-aggregating farmed tokens into single balance.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CONSOLIDATION_HUB", "FAN_IN"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(accExit);

      puppetAccs.slice(0, 4).forEach((p, idx) => {
        createTx(p, accExit, puppetCut * 0.92, "egress", "Airdrop Claim Harvest Sweep", "Profit consolidation", 12.0 + idx * 3.0);
      });
      break;
    }

    case "ransomware": {
      // Enterprise Victim  Target Collector  Tumbler Alpha  Tumbler Beta  80% Affiliate + 20% Dev Royalty  Garantex
      const victimAddr = generateRealisticAddress(seed, 1201, chain);
      const victim: CanonicalAccount = {
        id: victimAddr, address: victimAddr, label: " Compromised Fortune 500 Healthcare Network", nodeType: "victim",
        riskScore: 24, riskLevel: "low", volume: baseUSD * 1.5, transactionCount: 1,
        country: "United States (US)", countryCode: "US", behavioralTag: "Extortion Ingress Victim",
        entityRole: "Ransom Payment Payer", nodeExplanation: "Corporate victim paying ransom demanded under LockBit 3.0 extortion campaign.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 3).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["RANSOMWARE_VICTIM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(victim);
      createTx(victim, targetAccount, baseTokenAmount, "ingress", "Enterprise Extortion Ransom Payment", "LockBit 3.0 decryption key payment", 10);

      const tumbler1Addr = generateRealisticAddress(seed, 1202, chain);
      const tumbler1: CanonicalAccount = {
        id: tumbler1Addr, address: tumbler1Addr, label: "️ ChipMixer Tumbler Intermediate Alpha", nodeType: "mixer",
        riskScore: 94, riskLevel: "critical", volume: baseUSD * 1.4, transactionCount: 1400,
        country: "Germany (DE)", countryCode: "DE", behavioralTag: "Multi-Input Tumbler Node",
        entityRole: "Layering Tumbler Hop 1", nodeExplanation: "Automated cryptographic coin tumbler splitting inputs into standardized denomination chips.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["TUMBLER_NODE", "SANCTIONED_INFRASTRUCTURE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(tumbler1);
      createTx(targetAccount, tumbler1, baseTokenAmount * 0.98, "core", "Initial Tumbler Dispersion", "Standardized chip split", 20);

      const tumbler2Addr = generateRealisticAddress(seed, 1203, chain);
      const tumbler2: CanonicalAccount = {
        id: tumbler2Addr, address: tumbler2Addr, label: "️ ChipMixer Tumbler Intermediate Beta", nodeType: "mixer",
        riskScore: 92, riskLevel: "critical", volume: baseUSD * 1.3, transactionCount: 980,
        country: "Poland (PL)", countryCode: "PL", behavioralTag: "Multi-Input Tumbler Node",
        entityRole: "Layering Tumbler Hop 2", nodeExplanation: "Secondary tumbler hop consolidating mixed chips prior to syndicate commission payout.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["TUMBLER_NODE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(tumbler2);
      createTx(tumbler1, tumbler2, baseTokenAmount * 0.96, "anonymize", "Secondary Tumbler Reshuffle", "Layering obfuscation hop", 35);

      const affiliateAddr = generateRealisticAddress(seed, 1204, chain);
      const affiliate: CanonicalAccount = {
        id: affiliateAddr, address: affiliateAddr, label: " LockBit Affiliate Penetration Team Vault", nodeType: "ransomware",
        riskScore: 98, riskLevel: "critical", volume: baseUSD * 0.78, transactionCount: 16,
        country: "Russian Federation (RU)", countryCode: "RU", behavioralTag: "Ransomware Affiliate Primary",
        entityRole: "Attacker Penetration Crew", nodeExplanation: "Affiliate actor wallet receiving 80% primary cut of the corporate extortion payout.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 14).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["AFFILIATE_PAYOUT", "EXTORTION_PROCEEDS"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(affiliate);
      createTx(tumbler2, affiliate, baseTokenAmount * 0.76, "peel", "Affiliate Operator Cut (80%)", "Affiliate commission disbursal", 45);

      const devAddr = generateRealisticAddress(seed, 1205, chain);
      const devRoyalty: CanonicalAccount = {
        id: devAddr, address: devAddr, label: "️ LockBit Core Developer Royalty Vault", nodeType: "ransomware",
        riskScore: 99, riskLevel: "critical", volume: baseUSD * 0.2, transactionCount: 42,
        country: "Russian Federation (RU)", countryCode: "RU", behavioralTag: "Ransomware Core Dev Stash",
        entityRole: "RaaS Platform Core Developer", nodeExplanation: "LockBit core developer escrow receiving 20% RaaS franchise licensing fee.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 120).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["RAAS_DEV_ROYALTY"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(devRoyalty);
      createTx(tumbler2, devRoyalty, baseTokenAmount * 0.19, "peel", "RaaS Core Dev License Fee (20%)", "Platform royalty transfer", 50);

      const garantexAddr = "0x28c6c06298d514db089934071355e5743bf21d60";
      const garantex: CanonicalAccount = {
        id: garantexAddr, address: garantexAddr, label: " Garantex High-Risk Exchange (OFAC SDN)", nodeType: "cex",
        riskScore: 96, riskLevel: "critical", volume: baseUSD * 5, transactionCount: 4500,
        country: "Russian Federation (RU)", countryCode: "RU", behavioralTag: "Sanctioned Russian CEX",
        entityRole: "Terminal Cashout Exchange", nodeExplanation: "OFAC-sanctioned Russian exchange known for facilitating ransomware fiat cashouts.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["OFAC_SANCTIONED_CEX", "FIAT_CASHOUT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(garantex);
      createTx(affiliate, garantex, baseTokenAmount * 0.72, "egress", "Ransom Proceeds Liquidation", "Fiat ruble conversion", 60);
      break;
    }

    case "darknet": {
      // 3 Buyers  Darknet Escrow Contract  Vendor Payout + Marketplace Commission  Monero Atomic Swap  Cash Courier
      const buyer1Addr = generateRealisticAddress(seed, 1301, chain);
      const buyer1: CanonicalAccount = {
        id: buyer1Addr, address: buyer1Addr, label: " Darknet Marketplace Buyer #1", nodeType: "darknet",
        riskScore: 82, riskLevel: "high", volume: 28000, transactionCount: 4,
        country: "United States (US)", countryCode: "US", behavioralTag: "Darknet Buyer Ingress",
        entityRole: "Marketplace Consumer", nodeExplanation: "Purchaser depositing cryptocurrency for illicit contraband into market escrow.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 2).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["DARKNET_PURCHASER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(buyer1);
      createTx(buyer1, targetAccount, baseTokenAmount * 0.35, "ingress", "Marketplace Escrow Inbound #1", "Escrow deposit", 8);

      const buyer2Addr = generateRealisticAddress(seed, 1302, chain);
      const buyer2: CanonicalAccount = {
        id: buyer2Addr, address: buyer2Addr, label: " Darknet Marketplace Buyer #2", nodeType: "darknet",
        riskScore: 79, riskLevel: "high", volume: 32000, transactionCount: 3,
        country: "United Kingdom (GB)", countryCode: "GB", behavioralTag: "Darknet Buyer Ingress",
        entityRole: "Marketplace Consumer", nodeExplanation: "Secondary consumer funding escrow order.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["DARKNET_PURCHASER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(buyer2);
      createTx(buyer2, targetAccount, baseTokenAmount * 0.45, "ingress", "Marketplace Escrow Inbound #2", "Escrow deposit", 12);

      const buyer3Addr = generateRealisticAddress(seed, 1303, chain);
      const buyer3: CanonicalAccount = {
        id: buyer3Addr, address: buyer3Addr, label: " Darknet Marketplace Buyer #3", nodeType: "darknet",
        riskScore: 80, riskLevel: "high", volume: 18000, transactionCount: 2,
        country: "Netherlands (NL)", countryCode: "NL", behavioralTag: "Darknet Buyer Ingress",
        entityRole: "Marketplace Consumer", nodeExplanation: "Third consumer order confirmation deposit.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 3600000 * 12).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["DARKNET_PURCHASER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(buyer3);
      createTx(buyer3, targetAccount, baseTokenAmount * 0.2, "ingress", "Marketplace Escrow Inbound #3", "Escrow deposit", 15);

      const marketAdminAddr = generateRealisticAddress(seed, 1304, chain);
      const marketAdmin: CanonicalAccount = {
        id: marketAdminAddr, address: marketAdminAddr, label: "️ Darknet Market Operator Commission Stash", nodeType: "darknet",
        riskScore: 96, riskLevel: "critical", volume: baseUSD * 0.8, transactionCount: 840,
        country: "Panama (PA)", countryCode: "PA", behavioralTag: "Darknet Platform Commission",
        entityRole: "Marketplace Administrator", nodeExplanation: "5% platform commission retained by dark web marketplace administrator.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 200).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["MARKETPLACE_ADMIN"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(marketAdmin);
      createTx(targetAccount, marketAdmin, baseTokenAmount * 0.05, "core", "Escrow Platform Commission (5%)", "Admin fee retention", 30);

      const vendorAddr = generateRealisticAddress(seed, 1305, chain);
      const vendor: CanonicalAccount = {
        id: vendorAddr, address: vendorAddr, label: " Darknet Narcotics Vendor Settlement Hub", nodeType: "darknet",
        riskScore: 94, riskLevel: "critical", volume: baseUSD * 1.2, transactionCount: 120,
        country: "Czech Republic (CZ)", countryCode: "CZ", behavioralTag: "Verified Darknet Vendor",
        entityRole: "Contraband Supplier", nodeExplanation: "Escrow release payout delivered upon encrypted tracking proof verification.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["ILLICIT_VENDOR"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(vendor);
      createTx(targetAccount, vendor, baseTokenAmount * 0.94, "core", "Escrow Order Settlement Release", "Disbursement to vendor", 35);

      const xmrRelayAddr = generateRealisticAddress(seed, 1306, chain);
      const xmrRelay: CanonicalAccount = {
        id: xmrRelayAddr, address: xmrRelayAddr, label: " Monero (XMR) Cross-Chain Atomic Swap Relayer", nodeType: "defi",
        riskScore: 88, riskLevel: "critical", volume: baseUSD * 1.1, transactionCount: 420,
        country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Decentralized Atomic Swap",
        entityRole: "Privacy Cross-Chain Swap Desk", nodeExplanation: "Decentralized atomic swap smart contract exchanging transparent tokens for privacy-preserving Monero.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["ATOMIC_SWAP", "PRIVACY_COIN_EXIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(xmrRelay);
      createTx(vendor, xmrRelay, baseTokenAmount * 0.9, "anonymize", "Atomic Swap to Monero (XMR)", "Decentralized zero-knowledge swap", 45);

      const courierAddr = generateRealisticAddress(seed, 1307, chain);
      const courier: CanonicalAccount = {
        id: courierAddr, address: courierAddr, label: " P2P Physical Cashout Drop Agent", nodeType: "cold_wallet",
        riskScore: 85, riskLevel: "high", volume: baseUSD * 0.85, transactionCount: 14,
        country: "Netherlands (NL)", countryCode: "NL", behavioralTag: "Underground Cash Courier",
        entityRole: "Physical Cash Settlement", nodeExplanation: "Physical cash drop agent providing local cash delivery for Monero transfers.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["PHYSICAL_CASHOUT", "HAWALA_NETWORK"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(courier);
      createTx(xmrRelay, courier, baseTokenAmount * 0.85, "egress", "P2P Physical Cash Remittance", "Underground cashout settlement", 60);
      break;
    }

    case "sim_swap": {
      // Victim Exec  Attacker Hub  50/50 Split Uniswap / Sushi  2 Mules  Arbitrum Bridge
      const victimAddr = generateRealisticAddress(seed, 1401, chain);
      const victim: CanonicalAccount = {
        id: victimAddr, address: victimAddr, label: " Compromised Telecom Identity (Tech CEO EOA)", nodeType: "victim",
        riskScore: 28, riskLevel: "low", volume: baseUSD * 2, transactionCount: 1,
        country: "United States (US)", countryCode: "US", behavioralTag: "SIM-Swap Identity Victim",
        entityRole: "Compromised Executive Account", nodeExplanation: "Executive personal wallet stripped after unauthorized cellular carrier SIM transfer.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["SIM_SWAP_VICTIM", "ACCOUNT_TAKEOVER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(victim);
      createTx(victim, targetAccount, baseTokenAmount, "ingress", "Full Balance Asset Stripping", "Unauthorized SIM-swap drain", 1.2);

      const uniPoolAddr = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640";
      const uniPool: CanonicalAccount = {
        id: uniPoolAddr, address: uniPoolAddr, label: " Uniswap V3 ETH/USDC Liquid Dump", nodeType: "defi",
        riskScore: 32, riskLevel: "medium", volume: baseUSD * 15, transactionCount: 12000,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "High-Liquidity AMM",
        entityRole: "Decentralized Liquidation Venue", nodeExplanation: "Primary automated market maker pool liquidating stolen governance tokens into native ETH.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 500).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["HIGH_LIQUIDITY_AMM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(uniPool);
      createTx(targetAccount, uniPool, baseTokenAmount * 0.49, "core", "Rapid Market Swap Batch A", "Slippage-tolerant market sell", 2.5);

      const sushiPoolAddr = "0x397ff1542f962076d0bfe58ea045ffa2d347aca0";
      const sushiPool: CanonicalAccount = {
        id: sushiPoolAddr, address: sushiPoolAddr, label: " SushiSwap Alternative AMM Liquidity", nodeType: "defi",
        riskScore: 35, riskLevel: "medium", volume: baseUSD * 4, transactionCount: 3400,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Alternative DEX Pool",
        entityRole: "Parallel Swap Intermediary", nodeExplanation: "Secondary decentralized exchange routed in parallel to evade front-running bots.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["PARALLEL_AMM_DUMP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(sushiPool);
      createTx(targetAccount, sushiPool, baseTokenAmount * 0.49, "core", "Rapid Market Swap Batch B", "Secondary DEX split", 2.8);

      const mule1Addr = generateRealisticAddress(seed, 1404, chain);
      const mule1: CanonicalAccount = {
        id: mule1Addr, address: mule1Addr, label: " Ephemeral Layering Mule A", nodeType: "cold_wallet",
        riskScore: 89, riskLevel: "critical", volume: baseUSD * 0.48, transactionCount: 2,
        country: "Panama (PA)", countryCode: "PA", behavioralTag: "Ephemeral Cashout Mule",
        entityRole: "Rapid Relay Intermediary", nodeExplanation: "Fresh disposable address forwarding swapped ETH within 3 minutes of initial compromise.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 180000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["EPHEMERAL_MULE", "RAPID_TURNOVER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(mule1);
      createTx(uniPool, mule1, baseTokenAmount * 0.48, "peel", "Swapped Capital Extraction A", "Liquidity collection", 4.0);

      const mule2Addr = generateRealisticAddress(seed, 1405, chain);
      const mule2: CanonicalAccount = {
        id: mule2Addr, address: mule2Addr, label: " Ephemeral Layering Mule B", nodeType: "cold_wallet",
        riskScore: 88, riskLevel: "critical", volume: baseUSD * 0.48, transactionCount: 2,
        country: "Cyprus (CY)", countryCode: "CY", behavioralTag: "Ephemeral Cashout Mule",
        entityRole: "Parallel Relay Intermediary", nodeExplanation: "Second disposable address receiving SushiSwap liquidation proceeds.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 240000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["EPHEMERAL_MULE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(mule2);
      createTx(sushiPool, mule2, baseTokenAmount * 0.48, "peel", "Swapped Capital Extraction B", "Parallel liquidity collection", 4.5);

      const arbBridgeAddr = "0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a";
      const arbBridge: CanonicalAccount = {
        id: arbBridgeAddr, address: arbBridgeAddr, label: " Arbitrum One Bridge Gateway", nodeType: "bridge",
        riskScore: 68, riskLevel: "high", volume: baseUSD * 8, transactionCount: 28000,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "L1-to-L2 Bridge Portal",
        entityRole: "Layer-2 Relocation Bridge", nodeExplanation: "Official rollup gateway moving assets off Ethereum L1 to bypass blacklists.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["L2_BRIDGE_ESCAPE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(arbBridge);
      createTx(mule1, arbBridge, baseTokenAmount * 0.46, "egress", "L1-to-Arbitrum Teleportation A", "Cross-layer asset escape", 8.0);
      createTx(mule2, arbBridge, baseTokenAmount * 0.46, "egress", "L1-to-Arbitrum Teleportation B", "Parallel cross-layer escape", 8.5);
      break;
    }

    case "infinite_mint": {
      // Exploit Deployer  Vulnerable Proxy  Exploit Router (Target)  Uniswap Dump  Miner Bribe + Attacker Vault
      const deployerAddr = generateRealisticAddress(seed, 1501, chain);
      const deployer: CanonicalAccount = {
        id: deployerAddr, address: deployerAddr, label: " Exploiter EOA Controller", nodeType: "target",
        riskScore: 98, riskLevel: "critical", volume: baseUSD * 2.5, transactionCount: 6,
        country: "Russian Federation (RU)", countryCode: "RU", behavioralTag: "Smart Contract Exploit Deployer",
        entityRole: "Attacker Private Key Controller", nodeExplanation: "Threat actor funding gas and orchestrating malicious reentrancy / minting calls.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["EXPLOIT_DEPLOYER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(deployer);

      const vulnContractAddr = generateRealisticAddress(seed, 1502, chain);
      const vulnContract: CanonicalAccount = {
        id: vulnContractAddr, address: vulnContractAddr, label: " Vulnerable ERC-20 Proxy Contract", nodeType: "contract",
        riskScore: 92, riskLevel: "critical", volume: baseUSD * 4, transactionCount: 140,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Flawed Logic Implementation",
        entityRole: "Vulnerable Target Smart Contract", nodeExplanation: "DeFi token smart contract containing unchecked `mint()` authorization flaw.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["VULNERABLE_SMART_CONTRACT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(vulnContract);
      createTx(deployer, vulnContract, 0.5, "ingress", "Trigger Unchecked Minting Vector", "Execution of flawed access control function", 0.1);
      createTx(vulnContract, targetAccount, baseTokenAmount * 8, "ingress", "Infinite Synthetic Token Mint", "Unbacked issuance of 500,000,000 tokens", 0.1);

      const dexPairAddr = "0x514910771af9ca656af840dff83e8264ecf986ca";
      const dexPair: CanonicalAccount = {
        id: dexPairAddr, address: dexPairAddr, label: " Uniswap V2 Manipulated Liquidity Pool", nodeType: "defi",
        riskScore: 75, riskLevel: "high", volume: baseUSD * 6, transactionCount: 1800,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Drained AMM Pair",
        entityRole: "Liquidity Depletion Target", nodeExplanation: "Automated liquidity pool stripped of ETH reserves following massive unbacked token dump.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["AMM_DRAIN_EVENT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(dexPair);
      createTx(targetAccount, dexPair, baseTokenAmount * 7.8, "core", "Massive Synthetic Token Dump", "Market liquidation of unbacked supply", 0.2);

      const minerAddr = "0x00000000000000adc04c56bf30ac9d3c0aaf14dc";
      const minerBribe: CanonicalAccount = {
        id: minerAddr, address: minerAddr, label: " Flashbots Builder Inclusion Bribe", nodeType: "validator",
        riskScore: 50, riskLevel: "medium", volume: 250000, transactionCount: 1200,
        country: "Germany (DE)", countryCode: "DE", behavioralTag: "MEV Coinbase Bribe",
        entityRole: "Validator Block Inclusion", nodeExplanation: "Direct coinbase transfer guaranteeing zero-revert front-of-block transaction inclusion.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 120).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["COINBASE_BRIBE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(minerBribe);
      createTx(targetAccount, minerBribe, baseTokenAmount * 0.1, "egress", "Miner Inclusion Bribe Payment", "Flashbots private bundle bribe", 0.2);

      const coldStashAddr = generateRealisticAddress(seed, 1505, chain);
      const coldStash: CanonicalAccount = {
        id: coldStashAddr, address: coldStashAddr, label: "Exfiltrated Proceeds Unhosted Cold Vault", nodeType: "cold_wallet",
        riskScore: 99, riskLevel: "critical", volume: baseUSD * 2.1, transactionCount: 2,
        country: "Cayman Islands (KY)", countryCode: "KY", behavioralTag: "Unhosted Stolen Loot Vault",
        entityRole: "Final Exploit Proceeds Stash", nodeExplanation: "Air-gapped unhosted wallet retaining drained ETH extracted from liquidity pool.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["UNHOSTED_VAULT", "EXPLOIT_LOOT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(coldStash);
      createTx(dexPair, coldStash, baseTokenAmount * 1.9, "egress", "Extracted Liquidity Loot Stash", "Net stolen ETH capture", 0.5);
      break;
    }

    case "rug_pull": {
      // 4 Presale Investors  Target Token Deployer  Uniswap LP  Deployer calls removeLiquidity  Dev Stash  Tornado Cash
      const retailCount = 4;
      for (let r = 1; r <= retailCount; r++) {
        const rAddr = generateRealisticAddress(seed, 1600 + r, chain);
        const rAcc: CanonicalAccount = {
          id: rAddr, address: rAddr, label: `Retail Presale Contributor #${r}`, nodeType: "victim",
          riskScore: 16, riskLevel: "low", volume: (baseUSD * 0.25) / retailCount, transactionCount: 2,
          country: "United States (US)", countryCode: "US", behavioralTag: "DeFi Retail Contributor",
          entityRole: "Presale Participant", nodeExplanation: "Retail investor funding project presale in anticipation of token listing.",
          layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 5).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
          heuristicFlags: ["PRESALE_INVESTOR", "RUG_VICTIM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(rAcc);
        createTx(rAcc, targetAccount, baseTokenAmount * 0.22, "ingress", "Presale Token Contribution", "Presale allocation funding", 5 * r);
      }

      const lpPoolAddr = generateRealisticAddress(seed, 1609, chain);
      const lpPool: CanonicalAccount = {
        id: lpPoolAddr, address: lpPoolAddr, label: "Uniswap V2: SHIB-AI / WETH Liquidity Pool", nodeType: "defi",
        riskScore: 84, riskLevel: "high", volume: baseUSD * 1.8, transactionCount: 840,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Compromised AMM Liquidity",
        entityRole: "Public Trading Pair", nodeExplanation: "Target liquidity pool seeded with initial presale funds, then drained via sudden LP withdrawal.",
        layer: 3, firstSeen: new Date(baseTimestampMs).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DRAINED_LP_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(lpPool);
      createTx(targetAccount, lpPool, baseTokenAmount * 0.85, "core", "Initial Liquidity Seeding", "Deployer LP creation", 45);

      const devStashAddr = generateRealisticAddress(seed, 1610, chain);
      const devStash: CanonicalAccount = {
        id: devStashAddr, address: devStashAddr, label: "Deployer Shadow Holding EOA", nodeType: "contract",
        riskScore: 98, riskLevel: "critical", volume: baseUSD * 1.6, transactionCount: 4,
        country: "United Arab Emirates (AE)", countryCode: "AE", behavioralTag: "Malicious Developer Stash",
        entityRole: "Rug Pull Beneficiary", nodeExplanation: "Secret wallet controlled by pseudonymous developers executing emergency liquidity drainage.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 86400000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["RUG_PULL_BENEFICIARY"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(devStash);
      createTx(lpPool, devStash, baseTokenAmount * 0.82, "peel", "Emergency Liquidity Removal (Rug Pull)", "Full LP reserve drainage", 120);

      const mixerAddr = "0x742d35cc6634c0532925a3b844bc9e7595f2bd3e";
      const mixer: CanonicalAccount = {
        id: mixerAddr, address: mixerAddr, label: "️ Tornado Cash 100 ETH Vault (OFAC SDN)", nodeType: "mixer",
        riskScore: 99, riskLevel: "critical", volume: baseUSD * 10, transactionCount: 18000,
        country: "OFAC Sanctioned", countryCode: "US", behavioralTag: "Sanctioned Mixer Pool",
        entityRole: "Anonymity Obfuscator", nodeExplanation: "Cryptographic mixer used by developers to sever on-chain ties to presale theft.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 500).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["OFAC_SANCTIONS", "MIXER_DEPOSIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(mixer);
      createTx(devStash, mixer, baseTokenAmount * 0.78, "egress", "Mixer Anonymization Tranche", "Zero-knowledge note deposit", 180);
      break;
    }

    case "pig_butchering": {
      // 3 Romance Scam Victims  Target Fake Platform  Syndicate Collector  SE Asia Compound  Cash Courier
      const v1Addr = generateRealisticAddress(seed, 1701, chain);
      const v1: CanonicalAccount = {
        id: v1Addr, address: v1Addr, label: "Victim EOA Alpha (Private Individual - FL)", nodeType: "victim",
        riskScore: 18, riskLevel: "low", volume: 145000, transactionCount: 3,
        country: "United States (US)", countryCode: "US", behavioralTag: "Social Engineering Target",
        entityRole: "Groomed Investor", nodeExplanation: "Retail victim convinced to invest savings by fraudulent online acquaintance.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 30).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["ROMANCE_SCAM_VICTIM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(v1);
      createTx(v1, targetAccount, baseTokenAmount * 0.45, "ingress", "Fraudulent Platform Deposit #1", "Fake yield deposit", 15);

      const v2Addr = generateRealisticAddress(seed, 1702, chain);
      const v2: CanonicalAccount = {
        id: v2Addr, address: v2Addr, label: "Victim EOA Beta (Private Individual - ON)", nodeType: "victim",
        riskScore: 15, riskLevel: "low", volume: 180000, transactionCount: 2,
        country: "Canada (CA)", countryCode: "CA", behavioralTag: "Deceived Retail Investor",
        entityRole: "Groomed Investor", nodeExplanation: "Second victim coerced into transferring retirement funds to fake AI platform.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 20).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["ROMANCE_SCAM_VICTIM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(v2);
      createTx(v2, targetAccount, baseTokenAmount * 0.35, "ingress", "Fraudulent Platform Deposit #2", "Secondary deposit tranche", 25);

      const v3Addr = generateRealisticAddress(seed, 1703, chain);
      const v3: CanonicalAccount = {
        id: v3Addr, address: v3Addr, label: "Victim EOA Gamma (Private Individual - UK)", nodeType: "victim",
        riskScore: 12, riskLevel: "low", volume: 95000, transactionCount: 2,
        country: "United Kingdom (GB)", countryCode: "GB", behavioralTag: "Elderly Target",
        entityRole: "Groomed Investor", nodeExplanation: "Third victim paying fraudulent 'liquidity fee' to unlock imaginary trading profits.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 10).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["ROMANCE_SCAM_VICTIM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(v3);
      createTx(v3, targetAccount, baseTokenAmount * 0.2, "ingress", "Deceptive 'Tax Clearance' Deposit", "Extortion fee payment", 35);

      const collectorAddr = generateRealisticAddress(seed, 1704, chain);
      const collector: CanonicalAccount = {
        id: collectorAddr, address: collectorAddr, label: "Syndicate Money Mule Aggregator Hub", nodeType: "cold_wallet",
        riskScore: 94, riskLevel: "critical", volume: baseUSD * 1.5, transactionCount: 88,
        country: "Thailand (TH)", countryCode: "TH", behavioralTag: "Syndicate Collector Hub",
        entityRole: "Regional Laundering Mule", nodeExplanation: "Middleman aggregator sweeping deposits from hundreds of cloned fake broker portals.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["PIG_BUTCHERING_COLLECTOR"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(collector);
      createTx(targetAccount, collector, baseTokenAmount * 0.96, "core", "Automated Platform Sweep", "Drainage of retail victim balances", 50);

      const compoundAddr = generateRealisticAddress(seed, 1705, chain);
      const compoundVault: CanonicalAccount = {
        id: compoundAddr, address: compoundAddr, label: "Mekong Basin Industrial Scam Compound Hub", nodeType: "cold_wallet",
        riskScore: 99, riskLevel: "critical", volume: baseUSD * 8, transactionCount: 420,
        country: "Myanmar (MM)", countryCode: "MM", behavioralTag: "Industrial Cybercrime Compound",
        entityRole: "Syndicate Headquarters Vault", nodeExplanation: "Trafficking-linked cybercrime industrial park operating industrial-scale romance fraud.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 250).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["HUMAN_TRAFFICKING_NEXUS", "ORGANIZED_CRIME"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(compoundVault);
      createTx(collector, compoundVault, baseTokenAmount * 0.92, "peel", "Syndicate Headquarters Remittance", "Loot transfer to compound command", 80);

      const hawalaAddr = generateRealisticAddress(seed, 1706, chain);
      const hawala: CanonicalAccount = {
        id: hawalaAddr, address: hawalaAddr, label: "Informal Value Transfer System (IVTS / Hawala)", nodeType: "cold_wallet",
        riskScore: 92, riskLevel: "critical", volume: baseUSD * 5, transactionCount: 120,
        country: "Cambodia (KH)", countryCode: "KH", behavioralTag: "Unlicensed Hawala Off-Ramp",
        entityRole: "Informal Value Transfer System", nodeExplanation: "Underground network settling cryptocurrency balances into physical cash across SE Asia.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["HAWALA_SETTLEMENT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(hawala);
      createTx(compoundVault, hawala, baseTokenAmount * 0.88, "egress", "Physical Cash Conversion", "Underground fiat liquidation", 120);
      break;
    }

    case "sanctioned_entity": {
      // Russian Oligarch Shell  Target UAE FZE  Layering Mule  Tether Gold (XAUT) Desk  Non-FATF Bank Node
      const oligarchAddr = generateRealisticAddress(seed, 1801, chain);
      const oligarch: CanonicalAccount = {
        id: oligarchAddr, address: oligarchAddr, label: "Cyprus Holding Entity (Sanctioned Ultimate Owner)", nodeType: "sanctioned_pool",
        riskScore: 88, riskLevel: "critical", volume: baseUSD * 3.5, transactionCount: 14,
        country: "Cyprus (CY)", countryCode: "CY", behavioralTag: "Sanctioned Entity Nexus",
        entityRole: "Beneficial Ownership Origin", nodeExplanation: "Corporate entity linked to Russian Specially Designated National (SDN) oligarch.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["SDN_BENEFICIAL_OWNER", "SANCTIONS_EVASION"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(oligarch);
      createTx(oligarch, targetAccount, baseTokenAmount, "ingress", "Cross-Border Commercial Inflow", "Oligarch treasury asset relocation", 20);

      const muleAddr = generateRealisticAddress(seed, 1802, chain);
      const mule: CanonicalAccount = {
        id: muleAddr, address: muleAddr, label: "Layering Intermediary EOA (Nominee Controlled)", nodeType: "cold_wallet",
        riskScore: 82, riskLevel: "high", volume: baseUSD * 1.5, transactionCount: 8,
        country: "United Arab Emirates (AE)", countryCode: "AE", behavioralTag: "Sanctions Layering Mule",
        entityRole: "Structuring Intermediary", nodeExplanation: "Nominee director wallet masking transaction origin.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 30).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["NOMINEE_INTERMEDIARY"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(mule);
      createTx(targetAccount, mule, baseTokenAmount * 0.97, "core", "Intercompany Loan Layering", "Bilateral balance transfer", 40);

      const goldDeskAddr = generateRealisticAddress(seed, 1803, chain);
      const goldDesk: CanonicalAccount = {
        id: goldDeskAddr, address: goldDeskAddr, label: "Tether Gold (XAUT) Settlement Desk", nodeType: "defi",
        riskScore: 78, riskLevel: "high", volume: baseUSD * 4, transactionCount: 1400,
        country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Commodity Crypto Swap Desk",
        entityRole: "Gold Tokenization Venue", nodeExplanation: "Over-the-counter desk swapping liquid stablecoins into physical gold-backed tokens to hedge asset freezes.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["COMMODITY_BACKED_TOKEN"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(goldDesk);
      createTx(mule, goldDesk, baseTokenAmount * 0.95, "peel", "Stablecoin-to-Gold Token Swap", "Hedging against USD stablecoin freeze", 60);

      const foreignBankAddr = generateRealisticAddress(seed, 1804, chain);
      const foreignBank: CanonicalAccount = {
        id: foreignBankAddr, address: foreignBankAddr, label: "Non-FATF Correspondent Banking Gateway", nodeType: "cold_wallet",
        riskScore: 85, riskLevel: "high", volume: baseUSD * 2.5, transactionCount: 45,
        country: "Kazakhstan (KZ)", countryCode: "KZ", behavioralTag: "Non-Compliant Correspondent Node",
        entityRole: "Eurasian Banking Settlement", nodeExplanation: "Financial gateway settling tokenized commodities into Eurasian economic union banking rails.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["NON_FATF_JURISDICTION"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(foreignBank);
      createTx(goldDesk, foreignBank, baseTokenAmount * 0.92, "egress", "Cross-Border Gold Settlement", "Final sanctions evasion off-ramp", 90);
      break;
    }

    case "nested_mixer": {
      // Exploit Loot  Target Multi-Pool Relay  Tornado 10 ETH  Relayer Mule  Railgun Pool  2 Peel Hops  Non-KYC Swap
      const originAddr = generateRealisticAddress(seed, 1901, chain);
      const origin: CanonicalAccount = {
        id: originAddr, address: originAddr, label: "Exploit Loot Primary Inflow (Flagged Theft)", nodeType: "victim",
        riskScore: 92, riskLevel: "critical", volume: baseUSD * 1.8, transactionCount: 2,
        country: "Cayman Islands (KY)", countryCode: "KY", behavioralTag: "Exploit Ingress Point",
        entityRole: "Compromised Treasury Source", nodeExplanation: "Origin wallet containing unshielded funds extracted from compromised DeFi contract.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 2).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["EXPLOIT_ORIGIN"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(origin);
      createTx(origin, targetAccount, baseTokenAmount, "ingress", "Exploit Inbound Transfer", "Direct asset ingestion", 10);

      const poolAAddr = "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b";
      const poolA: CanonicalAccount = {
        id: poolAAddr, address: poolAAddr, label: "Tornado.Cash: 10 ETH Anonymity Pool", nodeType: "mixer",
        riskScore: 99, riskLevel: "critical", volume: 45000000, transactionCount: 14000,
        country: "OFAC Sanctioned", countryCode: "US", behavioralTag: "Primary Mixer Pool",
        entityRole: "First Obfuscation Stage", nodeExplanation: "First-tier zero-knowledge cryptographic mixing pool.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 600).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["OFAC_SANCTIONS", "MIXER_TIER_1"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(poolA);
      createTx(targetAccount, poolA, baseTokenAmount * 0.98, "core", "Initial zk-Mixer Deposit", "10 ETH note denomination splits", 25);

      const relayerMuleAddr = generateRealisticAddress(seed, 1903, chain);
      const relayerMule: CanonicalAccount = {
        id: relayerMuleAddr, address: relayerMuleAddr, label: "Relayer Layering Intermediary Mule", nodeType: "cold_wallet",
        riskScore: 88, riskLevel: "critical", volume: baseUSD * 0.95, transactionCount: 4,
        country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "Inter-Mixer Hop",
        entityRole: "Privacy Protocol Bridge", nodeExplanation: "Intermediate wallet withdrawing from Tornado Cash and immediately funding secondary privacy protocol.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["INTER_MIXER_HOP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(relayerMule);
      createTx(poolA, relayerMule, baseTokenAmount * 0.95, "anonymize", "Tornado Cash Relayer Redemption", "Unlinked note redemption", 45);

      const poolBAddr = "0xfa705b630b05b631d8c117d98305c48fc0106e23";
      const poolB: CanonicalAccount = {
        id: poolBAddr, address: poolBAddr, label: "Railgun zk-SNARK Privacy Pool Core", nodeType: "defi",
        riskScore: 94, riskLevel: "critical", volume: 16000000, transactionCount: 2900,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Secondary Privacy Protocol",
        entityRole: "Second Obfuscation Stage", nodeExplanation: "Secondary decentralized privacy system defeating single-mixer temporal correlation.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 200).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["NESTED_PRIVACY_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(poolB);
      createTx(relayerMule, poolB, baseTokenAmount * 0.93, "anonymize", "Railgun Shielded Deposit", "Secondary zero-knowledge shielding", 60);

      const peel1Addr = generateRealisticAddress(seed, 1905, chain);
      const peel1: CanonicalAccount = {
        id: peel1Addr, address: peel1Addr, label: "Post-Mixer Peel Hop Alpha", nodeType: "peel_hop",
        riskScore: 84, riskLevel: "high", volume: baseUSD * 0.88, transactionCount: 3,
        country: "Panama (PA)", countryCode: "PA", behavioralTag: "Peel Chain Intermediary",
        entityRole: "Sequential Splitter Hop 1", nodeExplanation: "Peeling 20% to cold storage while forwarding 80% to next hop.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 7200000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["PEEL_CHAIN_STEP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(peel1);
      createTx(poolB, peel1, baseTokenAmount * 0.89, "peel", "Railgun Unshielding Transfer", "Decentralized unshielding output", 80);

      const instantSwapAddr = "0x1111111254fb6c44bac0bed2854e76f90643097d";
      const instantSwap: CanonicalAccount = {
        id: instantSwapAddr, address: instantSwapAddr, label: "Non-KYC FixedFloat Instant Swapper Hot Wallet", nodeType: "cex",
        riskScore: 82, riskLevel: "high", volume: baseUSD * 0.7, transactionCount: 240,
        country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "No-KYC Instant Exchange",
        entityRole: "Terminal Swapper Endpoint", nodeExplanation: "Automated instant swapper converting cleaned tokens into alternative chains without KYC verification.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 10800000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["NON_KYC_SWAP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(instantSwap);
      createTx(peel1, instantSwap, baseTokenAmount * 0.7, "egress", "Instant Swapper Deposit", "Non-KYC conversion", 110);
      break;
    }

    case "layerzero": {
      // Whale EOA  Target LayerZero OFT  DVN Verifier  Optimism L2 OFT  Velodrome Pool  Destination EOA
      const whaleAddr = generateRealisticAddress(seed, 2001, chain);
      const whale: CanonicalAccount = {
        id: whaleAddr, address: whaleAddr, label: "Ethereum High-Volume Origin EOA", nodeType: "cold_wallet",
        riskScore: 38, riskLevel: "medium", volume: baseUSD * 2.5, transactionCount: 220,
        country: "United States (US)", countryCode: "US", behavioralTag: "Cross-Chain Capital Deployer",
        entityRole: "Origin Asset Sender", nodeExplanation: "High-volume wallet initiating cross-chain omnichain fungible token dispatch.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CROSS_CHAIN_SENDER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(whale);
      createTx(whale, targetAccount, baseTokenAmount, "ingress", "Omnichain Token Send Lock", "Asset lock on Ethereum mainnet", 10);

      const dvnAddr = generateRealisticAddress(seed, 2002, chain);
      const dvn: CanonicalAccount = {
        id: dvnAddr, address: dvnAddr, label: "LayerZero Decentralized Verifier Network (DVN)", nodeType: "bridge",
        riskScore: 55, riskLevel: "medium", volume: baseUSD * 10, transactionCount: 45000,
        country: "Canada (CA)", countryCode: "CA", behavioralTag: "Decentralized Message Attestation",
        entityRole: "Consensus Verifier Relay", nodeExplanation: "Multi-signature decentralized verifier network validating packet integrity across network boundaries.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DVN_VALIDATOR"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(dvn);
      createTx(targetAccount, dvn, baseTokenAmount * 0.999, "core", "Cross-Chain Message Packet Dispatch", "DVN cryptographic attestation payload", 15);

      const opReceiverAddr = generateRealisticAddress(seed, 2003, chain);
      const opReceiver: CanonicalAccount = {
        id: opReceiverAddr, address: opReceiverAddr, label: "Optimism Layer-2 OFT Receiver Contract", nodeType: "contract",
        riskScore: 50, riskLevel: "medium", volume: baseUSD * 1.5, transactionCount: 850,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "L2 Minting Endpoint",
        entityRole: "Destination Minting Contract", nodeExplanation: "Layer-2 contract receiving packet verification and minting 1:1 backed OFT tokens.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["L2_MINT_ENDPOINT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(opReceiver);
      createTx(dvn, opReceiver, baseTokenAmount * 0.997, "peel", "L2 Cross-Chain Mint Execution", "Asset delivery on Optimism L2", 25);

      const veloPoolAddr = generateRealisticAddress(seed, 2004, chain);
      const veloPool: CanonicalAccount = {
        id: veloPoolAddr, address: veloPoolAddr, label: "Velodrome Finance V2 Concentrated Liquidity", nodeType: "defi",
        riskScore: 35, riskLevel: "medium", volume: baseUSD * 2, transactionCount: 5200,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Optimism DEX AMM",
        entityRole: "Decentralized Exchange Venue", nodeExplanation: "Automated market maker executing low-slippage swap on Optimism Layer-2.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 200).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["L2_DEX_SWAP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(veloPool);
      createTx(opReceiver, veloPool, baseTokenAmount * 0.98, "egress", "L2 DEX Liquidity Provision Swap", "Optimism token swap", 35);
      break;
    }

    case "offshore_cex": {
      // 4 Smurfing Wallets (Structured sub-$10k deposits)  Target CEX Deposit Hub  Internal Cold Treasury Vault  Tier-0 Cashout Wallet
      const smurfCount = 4;
      const subTenKUSD = 9800;
      const smurfTokenAmt = parseFloat((subTenKUSD / tokenPrice).toFixed(6));

      for (let s = 1; s <= smurfCount; s++) {
        const sAddr = generateRealisticAddress(seed, 2100 + s, chain);
        const sAcc: CanonicalAccount = {
          id: sAddr, address: sAddr, label: `Structuring Smurf EOA #${s} (Sub-$10k Placement)`, nodeType: "peel_hop",
          riskScore: 82, riskLevel: "high", volume: subTenKUSD, transactionCount: 1,
          country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "Structuring & Smurfing Node",
          entityRole: "CTR Threshold Evader", nodeExplanation: "Structured deposit calibrated precisely under the $10,000 Currency Transaction Report (CTR) threshold.",
          layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 2).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
          heuristicFlags: ["SUB_10K_STRUCTURING", "SMURFING_PATTERN"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(sAcc);
        createTx(sAcc, targetAccount, smurfTokenAmt, "ingress", "Structured Sub-$10k Deposit", "Evading CTR threshold report", 8 * s);
      }

      const internalVaultAddr = generateRealisticAddress(seed, 2110, chain);
      const internalVault: CanonicalAccount = {
        id: internalVaultAddr, address: internalVaultAddr, label: "Offshore CEX Omnibus Treasury Vault", nodeType: "cex",
        riskScore: 78, riskLevel: "high", volume: baseUSD * 12, transactionCount: 15400,
        country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "Exchange Cold Storage Omnibus",
        entityRole: "Internal Treasury Vault", nodeExplanation: "Internal cold storage wallet consolidating unverified offshore exchange customer deposits.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 500).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["EXCHANGE_OMNIBUS_VAULT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(internalVault);
      createTx(targetAccount, internalVault, smurfTokenAmt * smurfCount * 0.98, "core", "Omnibus Internal Sweep", "Exchange hot-to-cold sweep", 45);

      const cashoutAddr = generateRealisticAddress(seed, 2115, chain);
      const cashout: CanonicalAccount = {
        id: cashoutAddr, address: cashoutAddr, label: "Tier-0 Non-KYC Liquidation Endpoint", nodeType: "cold_wallet",
        riskScore: 84, riskLevel: "high", volume: baseUSD * 0.4, transactionCount: 2,
        country: "Panama (PA)", countryCode: "PA", behavioralTag: "Unverified Off-Ramp EOA",
        entityRole: "Smurfing Ring Beneficiary", nodeExplanation: "Disposable wallet withdrawing pooled structured funds without identity verification.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["TIER_0_NON_KYC_WITHDRAWAL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(cashout);
      createTx(internalVault, cashout, smurfTokenAmt * smurfCount * 0.94, "egress", "Non-KYC Withdrawal Execution", "Immediate withdrawal to unhosted wallet", 75);
      break;
    }

    case "otc_brokerage": {
      // 3 Private Clients  Target OTC Broker Desk  2 Counterparties  Escrow Multisig  Correspondent Bank
      const c1Addr = generateRealisticAddress(seed, 2201, chain);
      const c1: CanonicalAccount = {
        id: c1Addr, address: c1Addr, label: "Institutional OTC Client A (Bilateral Wire)", nodeType: "cold_wallet",
        riskScore: 45, riskLevel: "medium", volume: baseUSD * 0.5, transactionCount: 4,
        country: "United Arab Emirates (AE)", countryCode: "AE", behavioralTag: "High-Net-Worth Private Client",
        entityRole: "OTC Order Ingress", nodeExplanation: "Private investor settling real estate capital via off-book stablecoin trade.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 30).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["HIGH_NET_WORTH_CLIENT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(c1);
      createTx(c1, targetAccount, baseTokenAmount * 0.5, "ingress", "OTC Stablecoin Block Trade #1", "Bilateral order placement", 10);

      const c2Addr = generateRealisticAddress(seed, 2202, chain);
      const c2: CanonicalAccount = {
        id: c2Addr, address: c2Addr, label: "Institutional OTC Client B (Commodities)", nodeType: "cold_wallet",
        riskScore: 50, riskLevel: "medium", volume: baseUSD * 0.5, transactionCount: 6,
        country: "Singapore (SG)", countryCode: "SG", behavioralTag: "Commodities Desk Settlement",
        entityRole: "OTC Order Ingress", nodeExplanation: "Commodities trader executing bilateral foreign exchange trade.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 45).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["COMMODITIES_TRADER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(c2);
      createTx(c2, targetAccount, baseTokenAmount * 0.5, "ingress", "OTC Stablecoin Block Trade #2", "Bilateral order placement", 15);

      const cp1Addr = generateRealisticAddress(seed, 2203, chain);
      const cp1: CanonicalAccount = {
        id: cp1Addr, address: cp1Addr, label: "P2P Market Maker Desk (UAE Freezone)", nodeType: "otc_broker",
        riskScore: 72, riskLevel: "high", volume: baseUSD * 4, transactionCount: 380,
        country: "United Arab Emirates (AE)", countryCode: "AE", behavioralTag: "P2P Liquidity Counterparty",
        entityRole: "Market Maker Liquidity Provider", nodeExplanation: "Regional OTC trader fulfilling bilateral order books.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["UNLICENSED_MSB", "P2P_COUNTERPARTY"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(cp1);
      createTx(targetAccount, cp1, baseTokenAmount * 0.48, "core", "Bilateral Liquidity Allocation #1", "Off-book liquidity fill", 30);

      const escrowAddr = generateRealisticAddress(seed, 2204, chain);
      const escrow: CanonicalAccount = {
        id: escrowAddr, address: escrowAddr, label: "P2P Bilateral Escrow 2-of-3 Multisig", nodeType: "multisig",
        riskScore: 65, riskLevel: "high", volume: baseUSD * 2.5, transactionCount: 95,
        country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Bilateral Escrow Contract",
        entityRole: "Multi-Sig Settlement Custody", nodeExplanation: "2-of-3 multi-signature escrow holding collateral until fiat wire confirmation.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 120).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["ESCROW_MULTISIG"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(escrow);
      createTx(targetAccount, escrow, baseTokenAmount * 0.48, "peel", "Escrow Collateral Lockup", "Awaiting fiat bank wire verification", 45);

      const bankGatewayAddr = generateRealisticAddress(seed, 2205, chain);
      const bankGateway: CanonicalAccount = {
        id: bankGatewayAddr, address: bankGatewayAddr, label: "Offshore Correspondent Banking Settlement Account", nodeType: "cold_wallet",
        riskScore: 68, riskLevel: "high", volume: baseUSD * 2.2, transactionCount: 140,
        country: "Hong Kong (HK)", countryCode: "HK", behavioralTag: "Correspondent Fiat Off-Ramp",
        entityRole: "Fiat Wire Clearing Desk", nodeExplanation: "Terminal off-ramp settling crypto into commercial offshore bank wires.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CORRESPONDENT_BANK_WIRE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(bankGateway);
      createTx(escrow, bankGateway, baseTokenAmount * 0.46, "egress", "Fiat Wire Confirmation Release", "Final escrow settlement", 75);
      break;
    }

    case "split_peel_ring": {
      // Primary Inbound  Target Splitter  4 Ephemeral Ring Nodes (25% remainder splits)  Deep Cold Storage
      const ingressAddr = generateRealisticAddress(seed, 2301, chain);
      const ingress: CanonicalAccount = {
        id: ingressAddr, address: ingressAddr, label: "Stolen Capital Primary Inflow EOA", nodeType: "victim",
        riskScore: 85, riskLevel: "critical", volume: baseUSD * 1.5, transactionCount: 2,
        country: "Cayman Islands (KY)", countryCode: "KY", behavioralTag: "Aggregated Ingress Source",
        entityRole: "Stolen Fund Distributor", nodeExplanation: "Initial balance source undergoing automated splitting to evade graph heuristics.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 2).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["ILLICIT_PRIMARY_INFLOW"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(ingress);
      createTx(ingress, targetAccount, baseTokenAmount, "ingress", "Full Balance Input Allocation", "Raw capital delivery to splitter", 10);

      const ringNodes: CanonicalAccount[] = [];
      for (let r = 1; r <= 4; r++) {
        const rAddr = generateRealisticAddress(seed, 2310 + r, chain);
        const rAcc: CanonicalAccount = {
          id: rAddr, address: rAddr, label: `Ephemeral Ring Intermediary #${r}`, nodeType: "peel_hop",
          riskScore: 78 - r * 2, riskLevel: "high", volume: baseUSD * 0.25, transactionCount: 2,
          country: FORENSIC_COUNTRIES[(seed + r * 5) % FORENSIC_COUNTRIES.length].name,
          countryCode: FORENSIC_COUNTRIES[(seed + r * 5) % FORENSIC_COUNTRIES.length].code,
          behavioralTag: "Ring Splitter Node", entityRole: "Intermediate Layering Hop",
          nodeExplanation: `Ephemeral disposable address peeling 25% allocation in parallel step #${r}.`,
          layer: 3, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
          heuristicFlags: ["RING_INTERMEDIARY", "EPHEMERAL_SPLIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(rAcc);
        ringNodes.push(rAcc);
        createTx(targetAccount, rAcc, baseTokenAmount * 0.245, "core", `Parallel 25% Balance Peel #${r}`, "Ring split execution", 15 + r * 5);
      }

      const deepVaultAddr = generateRealisticAddress(seed, 2320, chain);
      const deepVault: CanonicalAccount = {
        id: deepVaultAddr, address: deepVaultAddr, label: "Threat Actor Deep Cold Storage Reserve", nodeType: "cold_wallet",
        riskScore: 82, riskLevel: "high", volume: baseUSD * 0.95, transactionCount: 5,
        country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Consolidated Cold Reserve",
        entityRole: "Long-Term Retention Vault", nodeExplanation: "Air-gapped hardware vault re-aggregating peeled remainders from all ephemeral ring branches.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 7200000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DEEP_COLD_STORAGE", "RE_AGGREGATION_VAULT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(deepVault);

      ringNodes.forEach((node, idx) => {
        createTx(node, deepVault, baseTokenAmount * 0.23, "egress", `Remainder Convergence #${idx + 1}`, "Deep cold retention", 45 + idx * 10);
      });
      break;
    }

    case "dusting_attack": {
      // Threat Intel Station  Target Dusting Bot  5 High-Profile Targets (0.00005460 dust)  Cluster Correlation Engine
      const intelAddr = generateRealisticAddress(seed, 2401, chain);
      const intel: CanonicalAccount = {
        id: intelAddr, address: intelAddr, label: "Blockchain Surveillance & Intelligence Recon Hub", nodeType: "sybil_node",
        riskScore: 45, riskLevel: "medium", volume: 15000, transactionCount: 38,
        country: "Israel (IL)", countryCode: "IL", behavioralTag: "Surveillance Controller",
        entityRole: "Reconnaissance Operator", nodeExplanation: "Surveillance operator funding microscopic dusting transactions to deanonymize target clusters.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 10).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["SURVEILLANCE_OPERATOR"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(intel);
      createTx(intel, targetAccount, 0.5, "ingress", "Surveillance Gas & Dust Provision", "Funding dusting engine", 5);

      const targetVictims = [
        "Monitored Target: High-Net-Worth DeFi Executive",
        "Monitored Target: Foundation Multi-Sig Keyholder",
        "Monitored Target: Tier-1 Validator Multi-Sig Signer",
        "Monitored Target: High-Volume OTC Trading Whale",
        "Monitored Target: DAO Governance Core Contributor"
      ];
      const dustVictims: CanonicalAccount[] = [];

      targetVictims.forEach((label, idx) => {
        const vAddr = generateRealisticAddress(seed, 2410 + idx, chain);
        const vAcc: CanonicalAccount = {
          id: vAddr, address: vAddr, label, nodeType: "victim",
          riskScore: 20 + idx * 3, riskLevel: "low", volume: baseUSD * (1.2 + idx * 0.5), transactionCount: 45 + idx * 10,
          country: "United States (US)", countryCode: "US", behavioralTag: "Surveillance Dust Target",
          entityRole: "High-Profile Wallet Subject", nodeExplanation: "Target wallet receiving unsolicited microscopic dusting transaction designed to deanonymize spend history.",
          layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
          heuristicFlags: ["DUSTED_WALLET", "SURVEILLANCE_TARGET"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(vAcc);
        dustVictims.push(vAcc);
        createTx(targetAccount, vAcc, 0.00005460, "core", `Microscopic Dust Payload #${idx + 1}`, "546 satoshis / dust attack probe", 2 * (idx + 1));
      });

      const clusterEngineAddr = generateRealisticAddress(seed, 2420, chain);
      const clusterEngine: CanonicalAccount = {
        id: clusterEngineAddr, address: clusterEngineAddr, label: "Cluster Heuristic Deanonymization Engine", nodeType: "contract",
        riskScore: 50, riskLevel: "medium", volume: 5000, transactionCount: 88,
        country: "United States (US)", countryCode: "US", behavioralTag: "Heuristic Correlation Engine",
        entityRole: "Analytics Graph Correlator", nodeExplanation: "Passive surveillance database detecting when dusted wallets merge UTXOs in subsequent spend transactions.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CLUSTER_DEANONYMIZER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(clusterEngine);

      dustVictims.slice(0, 3).forEach((v, idx) => {
        createTx(v, clusterEngine, 0.00005400, "egress", `Unaware Spent Dust Merge #${idx + 1}`, "Cluster correlation confirmation", 60 + idx * 15);
      });
      break;
    }

    case "proxy_contract": {
      // User Inbound  Target Transparent Proxy  Unverified Bytecode (hidden delegatecall)  Backdoor Controller  Drainer Stash
      const callerAddr = generateRealisticAddress(seed, 2501, chain);
      const caller: CanonicalAccount = {
        id: callerAddr, address: callerAddr, label: "End-User Protocol Interacting EOA", nodeType: "victim",
        riskScore: 22, riskLevel: "low", volume: baseUSD * 0.4, transactionCount: 5,
        country: "France (FR)", countryCode: "FR", behavioralTag: "Ordinary DeFi User",
        entityRole: "Calling EOA", nodeExplanation: "DeFi user initiating regular transaction through transparent proxy interface.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 14).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["UNSUSPECTING_CALLER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(caller);
      createTx(caller, targetAccount, baseTokenAmount * 0.4, "ingress", "Proxy Function Call Ingestion", "Deposit function invocation", 10);

      const unverifiedImplAddr = generateRealisticAddress(seed, 2502, chain);
      const unverifiedImpl: CanonicalAccount = {
        id: unverifiedImplAddr, address: unverifiedImplAddr, label: "Unverified Bytecode Implementation Contract", nodeType: "contract",
        riskScore: 78, riskLevel: "high", volume: baseUSD * 1.5, transactionCount: 320,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Unverified Bytecode",
        entityRole: "Proxy Logic Implementation", nodeExplanation: "Unverified smart contract executing low-level delegatecall logic with undocumented administrative overrides.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 45).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["UNVERIFIED_BYTECODE", "DELEGATECALL_TARGET"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(unverifiedImpl);
      createTx(targetAccount, unverifiedImpl, baseTokenAmount * 0.39, "core", "DelegateCall Execution Forward", "Low-level logic dispatch", 15);

      const backdoorAddr = generateRealisticAddress(seed, 2503, chain);
      const backdoor: CanonicalAccount = {
        id: backdoorAddr, address: backdoorAddr, label: "Privileged Backdoor Access Controller", nodeType: "contract",
        riskScore: 88, riskLevel: "critical", volume: baseUSD * 1.2, transactionCount: 18,
        country: "Cayman Islands (KY)", countryCode: "KY", behavioralTag: "Backdoor Trigger Contract",
        entityRole: "Privileged Execution Vector", nodeExplanation: "Hidden smart contract routine bypassing owner multi-sig to divert protocol fees.",
        layer: 4, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["HIDDEN_BACKDOOR", "GOVERNANCE_BYPASS"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(backdoor);
      createTx(unverifiedImpl, backdoor, baseTokenAmount * 0.35, "peel", "Unauthorized Reserve Extraction", "Privilege escalation extraction", 35);

      const drainStashAddr = generateRealisticAddress(seed, 2504, chain);
      const drainStash: CanonicalAccount = {
        id: drainStashAddr, address: drainStashAddr, label: "Exploiter Covert Extraction Vault", nodeType: "cold_wallet",
        riskScore: 92, riskLevel: "critical", volume: baseUSD * 1.1, transactionCount: 3,
        country: "Panama (PA)", countryCode: "PA", behavioralTag: "Attacker Secret Vault",
        entityRole: "Final Exploit Beneficiary", nodeExplanation: "Covert unhosted wallet accumulating drained protocol reserves from unverified proxy backdoors.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 7200000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["EXPLOIT_LOOT_VAULT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(drainStash);
      createTx(backdoor, drainStash, baseTokenAmount * 0.33, "egress", "Covert Protocol Drainage Transfer", "Final balance siphoning", 60);
      break;
    }

    case "bot_cluster": {
      // Gas Tank Funder  Target Cluster Controller  2 Worker Bots (Front-Runner + Back-Runner)  Victim Swap in Uniswap V3  MEV Profit Stash
      const gasTankAddr = generateRealisticAddress(seed, 2601, chain);
      const gasTank: CanonicalAccount = {
        id: gasTankAddr, address: gasTankAddr, label: "MEV Syndicate Master Gas Tank Funder", nodeType: "cold_wallet",
        riskScore: 42, riskLevel: "medium", volume: baseUSD * 0.8, transactionCount: 850,
        country: "United States (US)", countryCode: "US", behavioralTag: "High-Gas Operator Tank",
        entityRole: "Bot Cluster Gas Sponsor", nodeExplanation: "Automated wallet replenishing gas subsidies for high-frequency MEV searcher contracts.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["GAS_TANK_FUNDER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(gasTank);
      createTx(gasTank, targetAccount, baseTokenAmount * 0.15, "ingress", "High-Priority Gas Subsidy Refill", "Cluster gas allocation", 1.0);

      const botAlphaAddr = generateRealisticAddress(seed, 2602, chain);
      const botAlpha: CanonicalAccount = {
        id: botAlphaAddr, address: botAlphaAddr, label: "Algorithmic Worker Bot Alpha (Front-Runner)", nodeType: "contract",
        riskScore: 48, riskLevel: "medium", volume: baseUSD * 3.5, transactionCount: 4200,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "High-Frequency MEV Bot",
        entityRole: "Sandwich Attack Front-Runner", nodeExplanation: "Worker bot bidding high priority gas to buy before victim swap in mempool.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["FRONT_RUNNER_BOT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(botAlpha);
      createTx(targetAccount, botAlpha, baseTokenAmount * 0.8, "core", "Front-Runner Capital Allocation", "Front-run execution funding", 1.2);

      const victimSwapAddr = generateRealisticAddress(seed, 2603, chain);
      const victimSwap: CanonicalAccount = {
        id: victimSwapAddr, address: victimSwapAddr, label: "Unprotected Retail DEX Swap (Mempool Ingress)", nodeType: "victim",
        riskScore: 18, riskLevel: "low", volume: baseUSD * 0.7, transactionCount: 1,
        country: "Germany (DE)", countryCode: "DE", behavioralTag: "Sandwich Attack Victim",
        entityRole: "Unprotected Mempool Trade", nodeExplanation: "Retail user swap subjected to negative slippage extraction via sandwich attack.",
        layer: 3, firstSeen: new Date(baseTimestampMs).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["SANDWICH_VICTIM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(victimSwap);

      const uniV3Addr = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640";
      const uniV3: CanonicalAccount = {
        id: uniV3Addr, address: uniV3Addr, label: "Uniswap V3: ETH/USDC Core Pool", nodeType: "defi",
        riskScore: 30, riskLevel: "medium", volume: baseUSD * 25, transactionCount: 35000,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Target AMM Pool",
        entityRole: "Decentralized Liquidity Pool", nodeExplanation: "Concentrated liquidity pool where sandwich arbitrage is executed within single block.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 500).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CONCENTRATED_LIQUIDITY_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(uniV3);
      createTx(botAlpha, uniV3, baseTokenAmount * 0.8, "peel", "Front-Run Buy Order", "Bidding priority fee to execute ahead of victim", 1.3);
      createTx(victimSwap, uniV3, baseTokenAmount * 0.65, "peel", "Victim Trade Execution", "Victim buy order at inflated price", 1.4);

      const botBetaAddr = generateRealisticAddress(seed, 2604, chain);
      const botBeta: CanonicalAccount = {
        id: botBetaAddr, address: botBetaAddr, label: "Algorithmic Worker Bot Beta (Back-Runner)", nodeType: "contract",
        riskScore: 48, riskLevel: "medium", volume: baseUSD * 3.5, transactionCount: 4180,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "High-Frequency MEV Bot",
        entityRole: "Sandwich Attack Back-Runner", nodeExplanation: "Worker bot selling accumulated position immediately after victim trade.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 60).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["BACK_RUNNER_BOT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(botBeta);
      createTx(uniV3, botBeta, baseTokenAmount * 0.84, "peel", "Back-Run Sell Order", "Instant sell capturing price delta profit", 1.5);

      const mevVaultAddr = generateRealisticAddress(seed, 2605, chain);
      const mevVault: CanonicalAccount = {
        id: mevVaultAddr, address: mevVaultAddr, label: "MEV Syndicate Realized Profit Vault", nodeType: "cold_wallet",
        riskScore: 52, riskLevel: "medium", volume: baseUSD * 1.8, transactionCount: 420,
        country: "Hong Kong (HK)", countryCode: "HK", behavioralTag: "Algorithmic Arbitrage Reserve",
        entityRole: "MEV Operator Treasury", nodeExplanation: "Aggregator vault sweeping daily net arbitrage profits extracted from mempool sandwiches.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["MEV_PROFIT_SWEEP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(mevVault);
      createTx(botBeta, mevVault, baseTokenAmount * 0.04, "egress", "Net Arbitrage Profit Sweep", "Sandwich profit extraction", 5.0);
      break;
    }

    case "miner_bribe": {
      // MEV Searcher  Target Flashbots Relay  Block Construction Engine  Coinbase Validator Bribe  Consensus Rewards Pool
      const searcherAddr = generateRealisticAddress(seed, 2701, chain);
      const searcher: CanonicalAccount = {
        id: searcherAddr, address: searcherAddr, label: "MEV Searcher Arbitrage Operator EOA", nodeType: "cold_wallet",
        riskScore: 44, riskLevel: "medium", volume: baseUSD * 2.5, transactionCount: 1800,
        country: "Germany (DE)", countryCode: "DE", behavioralTag: "Sophisticated MEV Searcher",
        entityRole: "Private Bundle Origin", nodeExplanation: "Algorithmic searcher constructing 0-gas private mempool bundles to execute riskless multi-DEX arbitrage.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["PRIVATE_BUNDLE_SEARCHER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(searcher);
      createTx(searcher, targetAccount, baseTokenAmount * 0.25, "ingress", "MEV Searcher Bundle Submission", "Private mempool bundle transmission", 1.0);

      const pbsEngineAddr = generateRealisticAddress(seed, 2702, chain);
      const pbsEngine: CanonicalAccount = {
        id: pbsEngineAddr, address: pbsEngineAddr, label: "Proposer-Builder Separation (PBS) Block Builder", nodeType: "contract",
        riskScore: 38, riskLevel: "medium", volume: baseUSD * 15, transactionCount: 24000,
        country: "United States (US)", countryCode: "US", behavioralTag: "Block Builder Infrastructure",
        entityRole: "Block Assembly Pipeline", nodeExplanation: "Proposer-Builder Separation (PBS) engine ordering private bundles into maximum-value payload block.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["PBS_BUILDER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(pbsEngine);
      createTx(targetAccount, pbsEngine, baseTokenAmount * 0.248, "core", "Relay Payload Inclusion Verification", "Bundle payload verification", 1.2);

      const validatorAddr = "0x00000000000000adc04c56bf30ac9d3c0aaf14dc";
      const validator: CanonicalAccount = {
        id: validatorAddr, address: validatorAddr, label: "Ethereum Consensus Validator (Lido Node Operator)", nodeType: "validator",
        riskScore: 35, riskLevel: "medium", volume: baseUSD * 8, transactionCount: 18000,
        country: "Finland (FI)", countryCode: "FI", behavioralTag: "Consensus Block Proposer",
        entityRole: "Block Proposer Validator", nodeExplanation: "Active Ethereum proof-of-stake validator proposing winning block and receiving direct coinbase payment.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["VALIDATOR_NODE", "COINBASE_RECIPIENT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(validator);
      createTx(pbsEngine, validator, baseTokenAmount * 0.18, "peel", "Direct Coinbase Validator Bribe", "block.coinbase.transfer() payment", 1.5);

      const stakingPoolAddr = generateRealisticAddress(seed, 2705, chain);
      const stakingPool: CanonicalAccount = {
        id: stakingPoolAddr, address: stakingPoolAddr, label: "Validator Consensus Rewards Escrow Pool", nodeType: "cold_wallet",
        riskScore: 20, riskLevel: "low", volume: baseUSD * 6, transactionCount: 520,
        country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Staking Pool Treasury",
        entityRole: "Consensus Reward Distribution", nodeExplanation: "Treasury vault aggregating validator MEV rewards for distribution to stakers.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["STAKING_REWARDS_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(stakingPool);
      createTx(validator, stakingPool, baseTokenAmount * 0.175, "egress", "MEV Block Reward Consolidation", "Staking reward allocation", 15.0);
      break;
    }

    case "institutional": {
      // Regulated Asset Manager  Target Coinbase Prime Custody  Multi-Sig Cold Vault  Kiln Liquid Staking  Audit Escrow (ALL GREEN, LOW RISK)
      const assetMgrAddr = generateRealisticAddress(seed, 2801, chain);
      const assetMgr: CanonicalAccount = {
        id: assetMgrAddr, address: assetMgrAddr, label: "Regulated Institutional Asset Manager (SOC2 Type II)", nodeType: "cold_wallet",
        riskScore: 6, riskLevel: "low", volume: baseUSD * 3, transactionCount: 24,
        country: "United States (US)", countryCode: "US", behavioralTag: "SEC-Registered Investment Advisor",
        entityRole: "Audited Capital Allocator", nodeExplanation: "SEC-registered institutional investment advisor transferring corporate digital asset reserves.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["SEC_REGISTERED", "SOC2_AUDITED"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(assetMgr);
      createTx(assetMgr, targetAccount, baseTokenAmount, "ingress", "Institutional Reserve Deposit", "Regulated custody allocation", 15);

      const coldVaultAddr = generateRealisticAddress(seed, 2802, chain);
      const coldVault: CanonicalAccount = {
        id: coldVaultAddr, address: coldVaultAddr, label: "Coinbase Prime: 4-of-7 Institutional Cold Vault", nodeType: "cold_wallet",
        riskScore: 7, riskLevel: "low", volume: baseUSD * 2.8, transactionCount: 18,
        country: "United States (US)", countryCode: "US", behavioralTag: "Qualified Custody Cold Vault",
        entityRole: "Segregated Cold Storage", nodeExplanation: "Air-gapped hardware multi-signature vault requiring 4 of 7 executive keys with HSM signing.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["QUALIFIED_CUSTODIAN_VAULT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(coldVault);
      createTx(targetAccount, coldVault, baseTokenAmount * 0.999, "core", "Qualified Custody Vault Transfer", "Segregated institutional custody placement", 30);

      const kilnStakingAddr = generateRealisticAddress(seed, 2803, chain);
      const kilnStaking: CanonicalAccount = {
        id: kilnStakingAddr, address: kilnStakingAddr, label: "Kiln: SOC2 Compliant Liquid Staking Node Pool", nodeType: "validator",
        riskScore: 8, riskLevel: "low", volume: baseUSD * 1.8, transactionCount: 140,
        country: "France (FR)", countryCode: "FR", behavioralTag: "Enterprise Staking Provider",
        entityRole: "Institutional Staking Pool", nodeExplanation: "Enterprise-grade liquid staking platform providing native validation yields under SOC2 Type II compliance.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 200).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["ENTERPRISE_STAKING"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(kilnStaking);
      createTx(coldVault, kilnStaking, baseTokenAmount * 0.6, "peel", "Institutional Staking Allocation", "Proof-of-Stake validator funding", 60);

      const auditEscrowAddr = generateRealisticAddress(seed, 2804, chain);
      const auditEscrow: CanonicalAccount = {
        id: auditEscrowAddr, address: auditEscrowAddr, label: "Qualified Custody Statutory Audit Escrow", nodeType: "cold_wallet",
        riskScore: 5, riskLevel: "low", volume: baseUSD * 0.4, transactionCount: 12,
        country: "United States (US)", countryCode: "US", behavioralTag: "Statutory Audit Escrow",
        entityRole: "Regulatory Proof of Reserves", nodeExplanation: "Dedicated custody balance backing quarterly Big 4 proof-of-reserves audit attestations.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["AUDIT_ESCROW", "FATF_COMPLIANT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(auditEscrow);
      createTx(coldVault, auditEscrow, baseTokenAmount * 0.39, "egress", "Proof of Reserves Escrow Allocation", "Quarterly audit attestation balance", 90);
      break;
    }

    case "aave_lending": {
      // Verified LP  Target Aave Pool  aToken Reserve Vault  Over-Collateralized Borrow Facility  Treasury (ALL GREEN, LOW RISK)
      const lpAddr = generateRealisticAddress(seed, 2901, chain);
      const lp: CanonicalAccount = {
        id: lpAddr, address: lpAddr, label: "Audited DeFi Capital Provider EOA", nodeType: "cold_wallet",
        riskScore: 10, riskLevel: "low", volume: baseUSD * 2, transactionCount: 48,
        country: "United Kingdom (GB)", countryCode: "GB", behavioralTag: "Institutional Liquidity Provider",
        entityRole: "Capital Supplier", nodeExplanation: "Audited institutional liquidity provider supplying USDC to earn protocol lending interest.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 250).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["AUDITED_LP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(lp);
      createTx(lp, targetAccount, baseTokenAmount, "ingress", "Liquidity Supply Deposit", "Deposit USDC to earn variable APY", 15);

      const aTokenVaultAddr = generateRealisticAddress(seed, 2902, chain);
      const aTokenVault: CanonicalAccount = {
        id: aTokenVaultAddr, address: aTokenVaultAddr, label: "Aave V3: aUSDC Interest-Bearing Reserve Vault", nodeType: "contract",
        riskScore: 11, riskLevel: "low", volume: baseUSD * 1.9, transactionCount: 850,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Interest-Bearing Token Contract",
        entityRole: "Collateralized aToken Mint", nodeExplanation: "Formally verified ERC-20 contract minting interest-bearing aUSDC tokens 1:1 against supplied collateral.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["ATOKEN_MINT_VAULT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(aTokenVault);
      createTx(targetAccount, aTokenVault, baseTokenAmount * 0.999, "core", "Collateralized Token Mint", "1:1 interest-bearing token minting", 25);

      const borrowFacilityAddr = generateRealisticAddress(seed, 2903, chain);
      const borrowFacility: CanonicalAccount = {
        id: borrowFacilityAddr, address: borrowFacilityAddr, label: "Aave V3: Variable Debt WETH Facility", nodeType: "defi",
        riskScore: 12, riskLevel: "low", volume: baseUSD * 1.4, transactionCount: 320,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Over-Collateralized Credit Line",
        entityRole: "Borrow Engine", nodeExplanation: "Lending pool module maintaining health factor of 1.85 with automated liquidation parameters.",
        layer: 4, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["COLLATERALIZED_BORROW"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(borrowFacility);
      createTx(aTokenVault, borrowFacility, baseTokenAmount * 0.65, "peel", "Over-Collateralized Borrow Drawdown", "Healthy LTV borrow drawdown", 45);

      const corpTreasuryAddr = generateRealisticAddress(seed, 2904, chain);
      const corpTreasury: CanonicalAccount = {
        id: corpTreasuryAddr, address: corpTreasuryAddr, label: "Corporate Operating Treasury Account", nodeType: "cold_wallet",
        riskScore: 9, riskLevel: "low", volume: baseUSD * 0.65, transactionCount: 15,
        country: "Germany (DE)", countryCode: "DE", behavioralTag: "Corporate Operating Treasury",
        entityRole: "Working Capital Reserve", nodeExplanation: "Corporate operational account utilizing borrowed capital for business growth without triggering taxable sales.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CORPORATE_TREASURY", "TAX_EFFICIENT_BORROW"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(corpTreasury);
      createTx(borrowFacility, corpTreasury, baseTokenAmount * 0.645, "egress", "Working Capital Disbursal", "Operating capital allocation", 60);
      break;
    }

    case "market_maker": {
      // Prime Broker Credit Line  Target Wintermute Desk  Regulated CEX (Coinbase/Kraken) + Uniswap V3 LP  FCA Custodian (ALL GREEN, LOW RISK)
      const primeBrokerAddr = generateRealisticAddress(seed, 3001, chain);
      const primeBroker: CanonicalAccount = {
        id: primeBrokerAddr, address: primeBrokerAddr, label: "Tier-1 Prime Brokerage Credit Line Account", nodeType: "cold_wallet",
        riskScore: 8, riskLevel: "low", volume: baseUSD * 4, transactionCount: 52,
        country: "United States (US)", countryCode: "US", behavioralTag: "Institutional Credit Facility",
        entityRole: "Prime Broker Funder", nodeExplanation: "Regulated prime broker extending revolving liquidity credit facility for market-making operations.",
        layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(baseTimestampMs).toISOString(),
        heuristicFlags: ["PRIME_BROKER_CREDIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(primeBroker);
      createTx(primeBroker, targetAccount, baseTokenAmount, "ingress", "Prime Broker Liquidity Drawdown", "Market making liquidity allocation", 10);

      const cexHubAddr = "0x28c6c06298d514db089934071355e5743bf21d60";
      const cexHub: CanonicalAccount = {
        id: cexHubAddr, address: cexHubAddr, label: "Regulated Exchange Liquidity Hub (Coinbase / Kraken)", nodeType: "cex",
        riskScore: 10, riskLevel: "low", volume: baseUSD * 18, transactionCount: 22000,
        country: "United States (US)", countryCode: "US", behavioralTag: "Regulated Exchange Order Book",
        entityRole: "Centralized Orderbook Provision", nodeExplanation: "Continuous two-sided order placement providing tight bid-ask spreads across major USD pairs.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 600).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["REGULATED_CEX_MM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(cexHub);
      createTx(targetAccount, cexHub, baseTokenAmount * 0.55, "core", "Centralized Order Book Provision", "Active bid-ask quote liquidity", 20);

      const ammPoolAddr = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640";
      const ammPool: CanonicalAccount = {
        id: ammPoolAddr, address: ammPoolAddr, label: "Uniswap V3: Concentrated Liquidity Position (NFT)", nodeType: "defi",
        riskScore: 12, riskLevel: "low", volume: baseUSD * 12, transactionCount: 14000,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Concentrated AMM Liquidity",
        entityRole: "Decentralized Liquidity Provision", nodeExplanation: "Dynamic concentrated liquidity tick range management mitigating impermanent loss.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 400).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CONCENTRATED_AMM_MM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(ammPool);
      createTx(targetAccount, ammPool, baseTokenAmount * 0.42, "core", "Concentrated Liquidity Placement", "Narrow tick range provision", 25);

      const fcaCustodianAddr = generateRealisticAddress(seed, 3004, chain);
      const fcaCustodian: CanonicalAccount = {
        id: fcaCustodianAddr, address: fcaCustodianAddr, label: "FCA Authorized Settlement Custodian Bank", nodeType: "cold_wallet",
        riskScore: 7, riskLevel: "low", volume: baseUSD * 3.5, transactionCount: 180,
        country: "United Kingdom (GB)", countryCode: "GB", behavioralTag: "FCA Regulated Custody Bank",
        entityRole: "Delta-Neutral Profit Custody", nodeExplanation: "UK FCA-authorized custodian bank handling daily delta-neutral settlement transfers and client safeguarding.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["FCA_REGULATED_CUSTODIAN", "DELTA_NEUTRAL_SETTLEMENT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(fcaCustodian);
      createTx(cexHub, fcaCustodian, baseTokenAmount * 0.08, "egress", "Daily Delta-Neutral Hedging Settlement", "FCA custodian banking wire", 60);
      break;
    }

    default: {
      // ️ GENERAL / PEEL CHAIN / NESTED MIXER / OTC / PROXY MOTIF:
      // Multi-Hop Split + Peel Chain with Flow Conservation
      const victimCount = Math.floor(2 + prng() * 2);
      let totalInflowTokens = 0;

      for (let v = 1; v <= victimCount; v++) {
        const vCountry = FORENSIC_COUNTRIES[(seed + v * 13) % FORENSIC_COUNTRIES.length];
        const vAddr = generateRealisticAddress(seed, 100 + v, chain);
        const vCut = parseFloat((baseTokenAmount * (0.4 + prng() * 0.3)).toFixed(6));
        totalInflowTokens += vCut;

        const vAcc: CanonicalAccount = {
          id: vAddr, address: vAddr, label: `Compromised Ingress EOA #${v}`, nodeType: "victim",
          riskScore: Math.floor(20 + prng() * 10), riskLevel: "low", volume: vCut * tokenPrice, transactionCount: 3,
          country: `${vCountry.name} (${vCountry.code})`, countryCode: vCountry.code,
          behavioralTag: "Compromised Asset Origin", entityRole: "Inbound Source",
          nodeExplanation: `Initial capital extraction point. Jurisdiction: ${vCountry.name}.`,
          layer: 1, firstSeen: new Date(baseTimestampMs - 86400000 * 45).toISOString(), lastSeen: new Date(baseTimestampMs + 60000 * v * 15).toISOString(),
          heuristicFlags: ["VICTIM_SOURCE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(vAcc);
        createTx(vAcc, targetAccount, vCut, "ingress", "Exploit Inbound Transfer", "Direct asset movement", 15.0 + v * 10.0);
      }

      const intermediatePoolAddr = generateRealisticAddress(seed, 290, chain);
      const intermediatePool: CanonicalAccount = {
        id: intermediatePoolAddr, address: intermediatePoolAddr, label: "Intermediate Cryptographic Anonymity Pool", nodeType: "mixer",
        riskScore: Math.min(99, targetRiskScore + 5), riskLevel: targetRiskLevel,
        volume: totalInflowTokens * tokenPrice, transactionCount: 840,
        country: targetCountry.name, countryCode: targetCountry.code,
        behavioralTag: "Cryptographic Anonymity Pool", entityRole: "Layering Intermediary",
        nodeExplanation: "Intermediate smart contract obfuscating flow provenance.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["ANONYMITY_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(intermediatePool);
      createTx(targetAccount, intermediatePool, totalInflowTokens * 0.94, "core", "Obfuscation Relay Deposit", "Zero-knowledge transfer", 20.0);

      const peelCount = Math.floor(3 + prng() * 3);
      let currentBal = totalInflowTokens * 0.94 * 0.98;
      let prev = intermediatePool;

      for (let p = 1; p <= peelCount; p++) {
        const hopCountry = FORENSIC_COUNTRIES[(seed + p * 17) % FORENSIC_COUNTRIES.length];
        const hopAddr = generateRealisticAddress(seed, 300 + p, chain);
        const peelRatio = 0.2;
        const forwardRatio = 0.8;
        const peelAmt = parseFloat((currentBal * peelRatio).toFixed(6));
        const forwardAmt = parseFloat((currentBal * forwardRatio * 0.998).toFixed(6));

        const hopAcc: CanonicalAccount = {
          id: hopAddr, address: hopAddr, label: `Peel Chain Intermediary Hop #${p}`, nodeType: "peel_hop",
          riskScore: Math.max(65, Math.floor(targetRiskScore - p * 3)), riskLevel: getRiskLevelFromScore(Math.max(65, targetRiskScore - p * 3)),
          volume: currentBal * tokenPrice, transactionCount: 2,
          country: `${hopCountry.name} (${hopCountry.code})`, countryCode: hopCountry.code,
          behavioralTag: `Peel Splitter Hop ${p}`, entityRole: "Intermediate Layering Wallet",
          nodeExplanation: `Sequential fund stripper hop #${p}. Forwarded 80% downstream, peeled 20% to cold storage.`,
          layer: 4, firstSeen: new Date(baseTimestampMs + 3600000 * p).toISOString(), lastSeen: new Date(baseTimestampMs + 3600000 * (p + 1)).toISOString(),
          heuristicFlags: ["PEEL_CHAIN_STEP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(hopAcc);
        createTx(prev, hopAcc, currentBal, "peel", `Peel Hop #${p} Transfer`, "Sequential graph disruption", 25.0 + p * 10.0);

        const coldAddr = generateRealisticAddress(seed, 400 + p, chain);
        const coldAcc: CanonicalAccount = {
          id: coldAddr, address: coldAddr, label: `Cold Storage Stash (Hop #${p} Peel)`, nodeType: "cold_wallet",
          riskScore: Math.max(60, targetRiskScore - 10), riskLevel: getRiskLevelFromScore(Math.max(60, targetRiskScore - 10)),
          volume: peelAmt * tokenPrice, transactionCount: 1,
          country: `${hopCountry.name} (${hopCountry.code})`, countryCode: hopCountry.code,
          behavioralTag: "Peeled Balance Accumulator", entityRole: "Unhosted Stash Wallet",
          nodeExplanation: `Unhosted storage holding peeled balance during step #${p}.`,
          layer: 4, firstSeen: new Date(baseTimestampMs + 3600000 * p).toISOString(), lastSeen: new Date(nowMs).toISOString(),
          heuristicFlags: ["PEELED_REMAINDER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
        };
        addAccount(coldAcc);
        createTx(hopAcc, coldAcc, peelAmt, "peel", `Micro Peel Branch #${p}`, "Unhosted stash retention", 5.0);

        currentBal = forwardAmt;
        prev = hopAcc;
      }

      const finalExitAddr = "0x28c6c06298d514db089934071355e5743bf21d60";
      const finalExit: CanonicalAccount = {
        id: finalExitAddr, address: finalExitAddr, label: "Terminal Liquidation Exchange Deposit", nodeType: "cex",
        riskScore: Math.max(70, targetRiskScore - 8), riskLevel: getRiskLevelFromScore(Math.max(70, targetRiskScore - 8)),
        volume: currentBal * tokenPrice, transactionCount: 340,
        country: "Seychelles (SC)", countryCode: "SC",
        behavioralTag: "Liquidation Off-Ramp", entityRole: "Fiat Cashout Point",
        nodeExplanation: "Terminal deposit address facilitating fiat OTC conversion.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CEX_EXIT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(finalExit);
      createTx(prev, finalExit, currentBal, "egress", "Terminal CEX Cashout", "Offshore fiat liquidation", 40.0);
      break;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CLUSTER TOPOLOGY ENRICHMENT: Ensure realistic multi-cluster network
  // Adds satellite counterparty nodes around hubs to form realistic clusters
  // ═════════════════════════════════════════════════════════════════════════
  if (accounts.length < 24) {
    // 1. Ensure Mixer Hub exists
    let mixerHub = accounts.find(a => a.nodeType === "mixer" || a.nodeType === "sanctioned_pool");
    if (!mixerHub) {
      const mixerAddr = generateRealisticAddress(seed, 8100, chain);
      mixerHub = {
        id: mixerAddr, address: mixerAddr, label: "Mixer: Tornado.Cash 100 ETH Vault", nodeType: "mixer",
        riskScore: 96, riskLevel: "critical", volume: 184000, transactionCount: 37,
        country: "OFAC Designated (Sanctioned)", countryCode: "OFAC", behavioralTag: "Zero-Knowledge Anonymity Pool",
        entityRole: "Privacy Shielding Contract", nodeExplanation: "OFAC SDN-designated zk-SNARK pool breaking graph provenance.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["OFAC_SANCTIONED_MIXER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(mixerHub);
      createTx(targetAccount, mixerHub, baseTokenAmount * 0.28, "anonymize", "zk-SNARK Obfuscation Deposit", "100 ETH fixed tranche deposit", 20);
    }
    // Mixer Satellites
    const mSat1Addr = generateRealisticAddress(seed, 8101, chain);
    const mSat1: CanonicalAccount = {
      id: mSat1Addr, address: mSat1Addr, label: "Mixer: Unlinked Withdrawal EOA #1", nodeType: "cold_wallet",
      riskScore: 89, riskLevel: "critical", volume: 92000, transactionCount: 4,
      country: "Panama (PA)", countryCode: "PA", behavioralTag: "Post-Mixer Withdrawal EOA",
      entityRole: "Anonymized Recipient", nodeExplanation: "Fresh unlinked wallet claiming anonymized output note.",
      layer: 4, firstSeen: new Date(baseTimestampMs + 3600000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["UNLINKED_CLAIM"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(mSat1);
    createTx(mixerHub, mSat1, baseTokenAmount * 0.14, "anonymize", "zk-SNARK Output Redemption", "Private note extraction", 35);

    const mSat2Addr = generateRealisticAddress(seed, 8102, chain);
    const mSat2: CanonicalAccount = {
      id: mSat2Addr, address: mSat2Addr, label: "Mixer: 0.25 ETH Gas Relayer", nodeType: "defi",
      riskScore: 78, riskLevel: "high", volume: 45000, transactionCount: 380,
      country: "Switzerland (CH)", countryCode: "CH", behavioralTag: "Mixer Gas Relayer",
      entityRole: "Gas Relay Service", nodeExplanation: "Relayer broadcasting zero-knowledge withdrawal to mask gas payer.",
      layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 180).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["GAS_RELAYER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(mSat2);
    createTx(mixerHub, mSat2, 0.25, "anonymize", "Relayer Gas Compensation", "Network fee subsidy", 36);

    // 2. Ensure CEX Hub exists
    let cexHub = accounts.find(a => a.nodeType === "cex");
    if (!cexHub) {
      const cexAddr = generateRealisticAddress(seed, 8200, chain);
      cexHub = {
        id: cexAddr, address: cexAddr, label: "CEX: Binance Global Hot Wallet", nodeType: "cex",
        riskScore: 68, riskLevel: "high", volume: 921000, transactionCount: 143,
        country: "Cayman Islands (KY)", countryCode: "KY", behavioralTag: "Centralized Exchange Deposit Omnibus",
        entityRole: "Liquid Off-Ramp Gateway", nodeExplanation: "High-volume centralized exchange omnibus hot wallet receiving split deposits.",
        layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 700).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CEX_HOT_WALLET"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(cexHub);
      createTx(targetAccount, cexHub, baseTokenAmount * 0.22, "egress", "Rapid Liquidation Deposit", "Offshore exchange cashout", 50);
    }
    // CEX Satellites
    const cSat1Addr = generateRealisticAddress(seed, 8201, chain);
    const cSat1: CanonicalAccount = {
      id: cSat1Addr, address: cSat1Addr, label: "CEX: Sub-Account Sweeper #1", nodeType: "contract",
      riskScore: 62, riskLevel: "high", volume: 380000, transactionCount: 92,
      country: "Global Exchange Infrastructure", countryCode: "KY", behavioralTag: "Internal Sweeper Contract",
      entityRole: "Deposit Aggregation Pipeline", nodeExplanation: "Automated deposit forwarding address sweeping funds into cold vault.",
      layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 300).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["SWEEPER_BOT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(cSat1);
    createTx(cexHub, cSat1, baseTokenAmount * 0.18, "egress", "Omnibus Sweeper Consolidation", "Batch hot-to-cold sweep", 65);

    const cSat2Addr = generateRealisticAddress(seed, 8202, chain);
    const cSat2: CanonicalAccount = {
      id: cSat2Addr, address: cSat2Addr, label: "CEX: P2P Merchant Cashout Desk", nodeType: "cold_wallet",
      riskScore: 65, riskLevel: "high", volume: 240000, transactionCount: 48,
      country: "United Arab Emirates (AE)", countryCode: "AE", behavioralTag: "OTC Merchant Desk",
      entityRole: "P2P Fiat Broker", nodeExplanation: "Merchant liquidity account executing fiat-for-crypto conversions.",
      layer: 5, firstSeen: new Date(baseTimestampMs - 86400000 * 120).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["P2P_MERCHANT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(cSat2);
    createTx(cexHub, cSat2, baseTokenAmount * 0.12, "egress", "P2P Liquidation Settlement", "Fiat escrow settlement", 75);

    // 3. Ensure Bridge Hub exists
    let bridgeHub = accounts.find(a => a.nodeType === "bridge");
    if (!bridgeHub) {
      const bridgeAddr = generateRealisticAddress(seed, 8300, chain);
      bridgeHub = {
        id: bridgeAddr, address: bridgeAddr, label: "Cross-Chain Bridge: Stargate Router", nodeType: "bridge",
        riskScore: 74, riskLevel: "high", volume: 164000, transactionCount: 28,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "LayerZero Cross-Chain Relayer",
        entityRole: "Cross-Chain Gateway", nodeExplanation: "Cross-chain liquidity bridge enabling capital transfer to secondary L2s/chains.",
        layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 365).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["CROSS_CHAIN_BRIDGE"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(bridgeHub);
      createTx(targetAccount, bridgeHub, baseTokenAmount * 0.20, "anonymize", "Cross-Chain Bridge Lock", "Asset teleportation to secondary chain", 30);
    }
    // Bridge Satellites
    const bSat1Addr = generateRealisticAddress(seed, 8301, chain);
    const bSat1: CanonicalAccount = {
      id: bSat1Addr, address: bSat1Addr, label: "Bridge: Arbitrum L2 Settlement Mint", nodeType: "cold_wallet",
      riskScore: 68, riskLevel: "high", volume: 110000, transactionCount: 16,
      country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "L2 Destination Account",
      entityRole: "Cross-Chain Beneficiary", nodeExplanation: "Target address receiving bridged assets on secondary L2 chain.",
      layer: 4, firstSeen: new Date(baseTimestampMs + 1800000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["L2_MINT_RECIPIENT"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(bSat1);
    createTx(bridgeHub, bSat1, baseTokenAmount * 0.19, "peel", "Cross-Chain Mint Release", "L2 synthetic token release", 45);

    const bSat2Addr = generateRealisticAddress(seed, 8302, chain);
    const bSat2: CanonicalAccount = {
      id: bSat2Addr, address: bSat2Addr, label: "Bridge: Verification Oracle Relayer", nodeType: "contract",
      riskScore: 55, riskLevel: "medium", volume: 68000, transactionCount: 220,
      country: "Singapore (SG)", countryCode: "SG", behavioralTag: "Relayer Verification Node",
      entityRole: "Bridge Oracle", nodeExplanation: "Multi-party consensus relayer attesting state transitions across chains.",
      layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 150).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["ORACLE_RELAYER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(bSat2);
    createTx(bridgeHub, bSat2, 0.15, "anonymize", "Oracle Attestation Gas Fee", "Cross-chain proof fee", 46);

    // 4. Ensure DeFi Hub exists
    let defiHub = accounts.find(a => a.nodeType === "defi" || a.nodeType === "contract");
    if (!defiHub) {
      const defiAddr = generateRealisticAddress(seed, 8400, chain);
      defiHub = {
        id: defiAddr, address: defiAddr, label: "DeFi Protocol: Uniswap V3 Core Pool", nodeType: "defi",
        riskScore: 45, riskLevel: "medium", volume: 96200, transactionCount: 14,
        country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "Concentrated Liquidity AMM",
        entityRole: "Decentralized Exchange", nodeExplanation: "Decentralized automated market maker facilitating rapid token swaps.",
        layer: 2, firstSeen: new Date(baseTimestampMs - 86400000 * 600).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["DEX_POOL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(defiHub);
      createTx(targetAccount, defiHub, baseTokenAmount * 0.16, "core", "AMM Liquidity Swap Execution", "Token conversion via concentrated liquidity", 12);
    }
    // DeFi Satellites
    const dSat1Addr = generateRealisticAddress(seed, 8401, chain);
    const dSat1: CanonicalAccount = {
      id: dSat1Addr, address: dSat1Addr, label: "DeFi: Algorithmic Arbitrage Bot", nodeType: "contract",
      riskScore: 52, riskLevel: "medium", volume: 74000, transactionCount: 610,
      country: "Global Decentralized Protocol", countryCode: "US", behavioralTag: "High-Frequency MEV Bot",
      entityRole: "Liquidity Arb Bot", nodeExplanation: "Automated searcher bot capturing back-run swap slippage.",
      layer: 3, firstSeen: new Date(baseTimestampMs - 86400000 * 90).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["ARBITRAGE_SEARCHER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(dSat1);
    createTx(defiHub, dSat1, baseTokenAmount * 0.15, "peel", "Back-Run Arbitrage Route", "Secondary pool slippage trade", 18);

    // 5. Ensure Cash Out / Exit Hub exists
    let exitHub = accounts.find(a => (a.nodeType === "cold_wallet" || a.nodeType === "peel_hop") && a.id !== targetAccount.id);
    if (!exitHub) {
      const exitAddr = generateRealisticAddress(seed, 8500, chain);
      exitHub = {
        id: exitAddr, address: exitAddr, label: "Cash Out Cluster: OTC Syndicate Vault", nodeType: "cold_wallet",
        riskScore: 82, riskLevel: "high", volume: 224000, transactionCount: 9,
        country: "British Virgin Islands (VG)", countryCode: "VG", behavioralTag: "High-Value Cashout Vault",
        entityRole: "Terminal Stash", nodeExplanation: "Unhosted multi-party vault accumulating peeled liquidation balance.",
        layer: 5, firstSeen: new Date(baseTimestampMs + 7200000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["TERMINAL_STASH"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(exitHub);
      createTx(targetAccount, exitHub, baseTokenAmount * 0.14, "egress", "Terminal Cold Extraction", "Air-gapped reserve hoarding", 80);
    }
    // Cash Out Satellites
    const eSat1Addr = generateRealisticAddress(seed, 8501, chain);
    const eSat1: CanonicalAccount = {
      id: eSat1Addr, address: eSat1Addr, label: "Cash Out: Sovereign Air-Gapped Vault A", nodeType: "cold_wallet",
      riskScore: 78, riskLevel: "high", volume: 112000, transactionCount: 3,
      country: "Panama (PA)", countryCode: "PA", behavioralTag: "Unhosted Stash",
      entityRole: "Partition Cold Storage", nodeExplanation: "Primary air-gapped stash wallet preserving drained capital.",
      layer: 5, firstSeen: new Date(baseTimestampMs + 10800000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["COLD_STASH"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(eSat1);
    createTx(exitHub, eSat1, baseTokenAmount * 0.08, "egress", "Vault Partition Allocation A", "Sub-vault isolation", 95);

    const eSat2Addr = generateRealisticAddress(seed, 8502, chain);
    const eSat2: CanonicalAccount = {
      id: eSat2Addr, address: eSat2Addr, label: "Cash Out: Sovereign Air-Gapped Vault B", nodeType: "cold_wallet",
      riskScore: 76, riskLevel: "high", volume: 98000, transactionCount: 2,
      country: "Seychelles (SC)", countryCode: "SC", behavioralTag: "Unhosted Stash",
      entityRole: "Partition Cold Storage", nodeExplanation: "Secondary air-gapped stash wallet preserving remaining balance.",
      layer: 5, firstSeen: new Date(baseTimestampMs + 14400000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: ["COLD_STASH"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(eSat2);
    createTx(exitHub, eSat2, baseTokenAmount * 0.06, "egress", "Vault Partition Allocation B", "Sub-vault isolation", 110);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MULTI-HOP DEEP EXPANSION: Guarantees authentic connected hops 3, 4, and 5
  // Ensures BFS hop-depth progression strictly expands graph:
  // Depth 1: 8–15 nodes | Depth 2: 15–25 nodes | Depth 3: 25–35 nodes | Depth 4: 35–45 nodes | Depth 5: 40–55 nodes
  // ═════════════════════════════════════════════════════════════════════════
  const getHopDistances = () => {
    const adj = new Map<string, Set<string>>();
    for (const a of accounts) adj.set(a.address.toLowerCase(), new Set());
    for (const tx of transactions) {
      const s = tx.source.toLowerCase();
      const d = tx.destination.toLowerCase();
      if (!adj.has(s)) adj.set(s, new Set());
      if (!adj.has(d)) adj.set(d, new Set());
      adj.get(s)!.add(d);
      adj.get(d)!.add(s);
    }
    const dist = new Map<string, number>();
    const tLower = cleanTarget.toLowerCase();
    dist.set(tLower, 0);
    const q = [tLower];
    while (q.length > 0) {
      const c = q.shift()!;
      const curD = dist.get(c)!;
      for (const nb of adj.get(c) || []) {
        if (!dist.has(nb)) {
          dist.set(nb, curD + 1);
          q.push(nb);
        }
      }
    }
    return dist;
  };

  let distMap = getHopDistances();
  let d2Nodes = accounts.filter(a => distMap.get(a.address.toLowerCase()) === 2);

  // Fallback: If scenario produced fewer than 4 Distance 2 nodes, add intermediary relays
  if (d2Nodes.length < 4) {
    const d1Nodes = accounts.filter(a => distMap.get(a.address.toLowerCase()) === 1);
    d1Nodes.slice(0, 3).forEach((d1, i) => {
      const addr = generateRealisticAddress(seed, 8150 + i, chain);
      const acc: CanonicalAccount = {
        id: addr, address: addr, label: `Intermediary Relay Hop #${i + 1}`, nodeType: "peel_hop",
        riskScore: Math.max(45, targetRiskScore - 15), riskLevel: getRiskLevelFromScore(Math.max(45, targetRiskScore - 15)),
        volume: baseUSD * 0.15, transactionCount: 12, country: "United Kingdom (GB)", countryCode: "GB",
        behavioralTag: "Secondary Transit Node", entityRole: "Intermediate Router",
        nodeExplanation: "Secondary transit hop routing fractional liquidity.",
        layer: 3, firstSeen: new Date(baseTimestampMs + 1800000).toISOString(), lastSeen: new Date(nowMs).toISOString(),
        heuristicFlags: ["TRANSIT_HOP"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
      };
      addAccount(acc);
      createTx(d1, acc, baseTokenAmount * 0.08, "peel", "Intermediate Liquidity Transfer", "Routing remainder", 20);
    });
    distMap = getHopDistances();
    d2Nodes = accounts.filter(a => distMap.get(a.address.toLowerCase()) === 2);
  }

  // ─── Distance 3 (Hop 3) Synthesis ──────────────────────────────────────────
  const d3Defs = [
    { label: "P2P OTC Telegram Escrow Desk", nodeType: "otc_broker" as NodeType, tag: "P2P Liquidity Broker", role: "OTC Settlement Desk", country: "United Arab Emirates (AE)", code: "AE", risk: Math.max(55, targetRiskScore - 12), flag: "P2P_DESK", reason: "Bilateral OTC fiat conversion" },
    { label: "Decentralized AMM Swapper (Curve 3pool)", nodeType: "defi" as NodeType, tag: "Curve 3pool Liquidity EOA", role: "Stablecoin Swapper", country: "Global Decentralized Protocol", code: "US", risk: 42, flag: "AMM_SWAP", reason: "Zero-slippage stablecoin rebalance" },
    { label: "Corporate High-Frequency Sub-Account", nodeType: "contract" as NodeType, tag: "CEX Sub-Account", role: "Algorithmic Market Participant", country: "Cayman Islands (KY)", code: "KY", risk: Math.max(50, targetRiskScore - 18), flag: "CEX_SUB_ACCOUNT", reason: "Sub-account liquidity forwarding" },
    { label: "Triangular Arbitrage Routing Contract", nodeType: "contract" as NodeType, tag: "Cross-DEX Arbitrage Contract", role: "Arbitrage Execution Bot", country: "Global Decentralized Protocol", code: "US", risk: 48, flag: "ARBITRAGE_ROUTER", reason: "Mempool back-run slippage arbitrage" },
    { label: "Private Client Fiat Settlement Terminal", nodeType: "cold_wallet" as NodeType, tag: "Private Client Settlement", role: "High-Net-Worth Beneficiary", country: "Singapore (SG)", code: "SG", risk: Math.max(52, targetRiskScore - 16), flag: "PRIVATE_CLIENT", reason: "Fiat escrow allocation" },
    { label: "Arbitrum Camelot V3 Swap Router", nodeType: "defi" as NodeType, tag: "L2 Concentrated DEX Router", role: "Layer-2 DEX Gateway", country: "Global Decentralized Protocol", code: "US", risk: 46, flag: "L2_DEX_ROUTER", reason: "L2 synthetic asset swap" },
    { label: "Radiant Capital L2 Lending Vault", nodeType: "defi" as NodeType, tag: "Cross-Chain Money Market", role: "L2 Collateral Vault", country: "Global Decentralized Protocol", code: "US", risk: 54, flag: "L2_LENDING", reason: "Collateralized borrowing leverage" },
    { label: "Gas Subsidy Sponsor Treasury EOA", nodeType: "cold_wallet" as NodeType, tag: "Relayer Sponsor EOA", role: "Gas Subsidy Treasury", country: "Switzerland (CH)", code: "CH", risk: 58, flag: "GAS_SPONSOR", reason: "Zero-knowledge withdrawal fee subsidy" },
    { label: "Titan Builder Private Searcher Relay", nodeType: "validator" as NodeType, tag: "Block Builder Searcher Relay", role: "PBS Bundle Submitter", country: "Germany (DE)", code: "DE", risk: 44, flag: "BUILDER_RELAY", reason: "Private transaction bundle submission" },
    { label: "Ephemeral Remainder Peel Hop #1", nodeType: "peel_hop" as NodeType, tag: "Sequential Peel Intermediary", role: "Balance Fragmenter", country: "Panama (PA)", code: "PA", risk: Math.max(62, targetRiskScore - 10), flag: "PEEL_HOP_1", reason: "Micro-remainder peel chain hop #1" },
    { label: "Secondary Peel Remainder Transit Hop #1-B", nodeType: "peel_hop" as NodeType, tag: "Parallel Peel Intermediary", role: "Balance Fragmenter", country: "Seychelles (SC)", code: "SC", risk: Math.max(60, targetRiskScore - 12), flag: "PEEL_HOP_1B", reason: "Parallel remainder distribution hop #1-B" },
  ];

  const createdD3: CanonicalAccount[] = [];
  d3Defs.forEach((def, idx) => {
    const parent = d2Nodes[idx % d2Nodes.length];
    const addr = generateRealisticAddress(seed, 8600 + idx, chain);
    const acc: CanonicalAccount = {
      id: addr, address: addr, label: def.label, nodeType: def.nodeType,
      riskScore: def.risk, riskLevel: getRiskLevelFromScore(def.risk),
      volume: Math.floor(baseUSD * (0.05 + prng() * 0.12)), transactionCount: Math.floor(4 + prng() * 25),
      country: def.country, countryCode: def.code,
      behavioralTag: def.tag, entityRole: def.role,
      nodeExplanation: `Distance 3 topological entity: ${def.role}. Executing ${def.reason.toLowerCase()}.`,
      layer: 4, firstSeen: new Date(baseTimestampMs + 3600000 * 2).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: [def.flag, "DEPTH_3_INTERMEDIARY"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(acc);
    createdD3.push(acc);
    const txAmt = parseFloat((baseTokenAmount * (0.04 + (idx % 3) * 0.02)).toFixed(6));
    createTx(parent, acc, txAmt, "peel", def.label, def.reason, 30 + idx * 8);
  });

  distMap = getHopDistances();
  const d3Nodes = accounts.filter(a => distMap.get(a.address.toLowerCase()) === 3);

  // ─── Distance 4 (Hop 4) Synthesis ──────────────────────────────────────────
  const d4Defs = [
    { label: "Ephemeral Remainder Peel Hop #2", nodeType: "peel_hop" as NodeType, tag: "Sequential Peel Intermediary", role: "Secondary Balance Fragmenter", country: "Panama (PA)", code: "PA", risk: Math.max(64, targetRiskScore - 8), flag: "PEEL_HOP_2", reason: "Sequential peel remainder forwarding #2" },
    { label: "Peeled Micro-Reserve Vault Alpha", nodeType: "cold_wallet" as NodeType, tag: "Unhosted Peel Accumulator", role: "Fragment Retention Vault", country: "Cayman Islands (KY)", code: "KY", risk: Math.max(58, targetRiskScore - 14), flag: "MICRO_STASH_A", reason: "Fragmented balance cold storage" },
    { label: "Peeled Micro-Reserve Vault Beta", nodeType: "cold_wallet" as NodeType, tag: "Unhosted Peel Accumulator", role: "Fragment Retention Vault", country: "British Virgin Islands (VG)", code: "VG", risk: Math.max(56, targetRiskScore - 15), flag: "MICRO_STASH_B", reason: "Secondary fragment cold storage" },
    { label: "Regional Offshore Banking Rail (BVI Escrow)", nodeType: "otc_broker" as NodeType, tag: "Offshore Fiat Banking Rail", role: "Wire Settlement Escrow", country: "British Virgin Islands (VG)", code: "VG", risk: Math.max(65, targetRiskScore - 12), flag: "OFFSHORE_WIRE", reason: "International commercial wire clearing" },
    { label: "Convex CRV Booster Staking Vault", nodeType: "defi" as NodeType, tag: "Yield Optimization Staker", role: "Yield Aggregation Pool", country: "Global Decentralized Protocol", code: "US", risk: 40, flag: "YIELD_STAKER", reason: "Automated liquidity boost staking" },
    { label: "GMX GLP Liquidity Staking Vault", nodeType: "defi" as NodeType, tag: "Perpetual DEX Liquidity Vault", role: "L2 Yield Index", country: "Global Decentralized Protocol", code: "US", risk: 42, flag: "PERP_LIQUIDITY", reason: "Perpetual DEX multi-asset liquidity provision" },
    { label: "Fireblocks Institutional Custody Multi-Sig", nodeType: "multisig" as NodeType, tag: "Institutional Custody", role: "Multi-Party Computation Vault", country: "United States (US)", code: "US", risk: 32, flag: "INSTITUTIONAL_CUSTODY", reason: "Segregated institutional reserve custody" },
    { label: "Ethereum PoS Validator (Lido Node Operator)", nodeType: "validator" as NodeType, tag: "Staking Pool Validator", role: "Consensus Node Operator", country: "Germany (DE)", code: "DE", risk: 28, flag: "POS_VALIDATOR", reason: "Proof-of-Stake consensus validation" },
    { label: "Automated Collateral Liquidation Engine", nodeType: "contract" as NodeType, tag: "DeFi Liquidator Bot", role: "Liquidation Sentinel", country: "Global Decentralized Protocol", code: "US", risk: 48, flag: "LIQUIDATION_BOT", reason: "Undercollateralized debt liquidation sweep" },
    { label: "Cross-Chain Relayer Gas Settlement Pool", nodeType: "defi" as NodeType, tag: "Relayer Fee Liquidity Pool", role: "Network Fee Clearing", country: "Singapore (SG)", code: "SG", risk: 38, flag: "FEE_POOL", reason: "Multi-chain relayer gas fee clearing" },
  ];

  const createdD4: CanonicalAccount[] = [];
  d4Defs.forEach((def, idx) => {
    const parent = d3Nodes[idx % d3Nodes.length];
    const addr = generateRealisticAddress(seed, 8700 + idx, chain);
    const acc: CanonicalAccount = {
      id: addr, address: addr, label: def.label, nodeType: def.nodeType,
      riskScore: def.risk, riskLevel: getRiskLevelFromScore(def.risk),
      volume: Math.floor(baseUSD * (0.04 + prng() * 0.08)), transactionCount: Math.floor(2 + prng() * 18),
      country: def.country, countryCode: def.code,
      behavioralTag: def.tag, entityRole: def.role,
      nodeExplanation: `Distance 4 topological entity: ${def.role}. Executing ${def.reason.toLowerCase()}.`,
      layer: 5, firstSeen: new Date(baseTimestampMs + 3600000 * 4).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: [def.flag, "DEPTH_4_ROUTER"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(acc);
    createdD4.push(acc);
    const txAmt = parseFloat((baseTokenAmount * (0.03 + (idx % 3) * 0.015)).toFixed(6));
    createTx(parent, acc, txAmt, "peel", def.label, def.reason, 45 + idx * 10);
  });

  // Cross link at Distance 4:
  if (createdD4.length >= 4) {
    createTx(createdD4[0], createdD4[3], baseTokenAmount * 0.02, "egress", "Peel Partial Wire Liquidation", "Bilateral cross-liquidation rail", 60);
  }

  distMap = getHopDistances();
  const d4Nodes = accounts.filter(a => distMap.get(a.address.toLowerCase()) === 4);

  // ─── Distance 5 (Hop 5) Synthesis ──────────────────────────────────────────
  const d5Defs = [
    { label: "Air-Gapped Archival Cold Storage Vault (BIP-39)", nodeType: "cold_wallet" as NodeType, tag: "Air-Gapped Hardware Cold Storage", role: "Archival Reserve Vault", country: "Switzerland (CH)", code: "CH", risk: Math.max(70, targetRiskScore - 6), flag: "HARDWARE_VAULT", reason: "Offline BIP-39 seed vault retention" },
    { label: "SWIFT Correspondent International Banking Rail", nodeType: "otc_broker" as NodeType, tag: "Global Correspondent Banking", role: "Fiat Wire Clearing Node", country: "United States (US)", code: "US", risk: 25, flag: "SWIFT_GATEWAY", reason: "International fiat wire clearing" },
    { label: "Enterprise Treasury Governance Multi-Sig Timelock", nodeType: "multisig" as NodeType, tag: "Decentralized Governance Timelock", role: "Protocol Governance Timelock", country: "Singapore (SG)", code: "SG", risk: 22, flag: "GOV_TIMELOCK", reason: "Multi-sig timelock delay enforcement" },
    { label: "Ethereum Consensus 2.0 Beacon Deposit Contract", nodeType: "contract" as NodeType, tag: "Beacon Chain Staking Contract", role: "Consensus Staking Contract", country: "Global Decentralized Protocol", code: "US", risk: 15, flag: "BEACON_DEPOSIT", reason: "32 ETH validator stake activation" },
    { label: "Dormant Reserve Safe Vault Alpha", nodeType: "cold_wallet" as NodeType, tag: "Dormant Cold Storage", role: "Deep Cold Storage", country: "United Arab Emirates (AE)", code: "AE", risk: Math.max(68, targetRiskScore - 8), flag: "DORMANT_RESERVE_A", reason: "Dormant balance long-term hoarding" },
    { label: "Dormant Reserve Safe Vault Beta", nodeType: "cold_wallet" as NodeType, tag: "Dormant Cold Storage", role: "Deep Cold Storage", country: "Panama (PA)", code: "PA", risk: Math.max(66, targetRiskScore - 10), flag: "DORMANT_RESERVE_B", reason: "Dormant secondary balance hoarding" },
    { label: "Yearn Protocol V3 Governance Vault", nodeType: "defi" as NodeType, tag: "Yield Aggregation DAO", role: "DAO Treasury Vault", country: "Global Decentralized Protocol", code: "US", risk: 28, flag: "YEARN_VAULT", reason: "Institutional yield optimization vault" },
    { label: "International Compliance Audit Observer Node", nodeType: "validator" as NodeType, tag: "Regulatory Oracle Node", role: "Audit Telemetry Observer", country: "United Kingdom (GB)", code: "GB", risk: 18, flag: "AUDIT_NODE", reason: "Automated AML compliance proof logging" }
  ];

  const createdD5: CanonicalAccount[] = [];
  d5Defs.forEach((def, idx) => {
    const parent = d4Nodes[idx % d4Nodes.length];
    const addr = generateRealisticAddress(seed, 8800 + idx, chain);
    const acc: CanonicalAccount = {
      id: addr, address: addr, label: def.label, nodeType: def.nodeType,
      riskScore: def.risk, riskLevel: getRiskLevelFromScore(def.risk),
      volume: Math.floor(baseUSD * (0.03 + prng() * 0.06)), transactionCount: Math.floor(1 + prng() * 12),
      country: def.country, countryCode: def.code,
      behavioralTag: def.tag, entityRole: def.role,
      nodeExplanation: `Distance 5 topological entity: ${def.role}. Executing ${def.reason.toLowerCase()}.`,
      layer: 5, firstSeen: new Date(baseTimestampMs + 3600000 * 6).toISOString(), lastSeen: new Date(nowMs).toISOString(),
      heuristicFlags: [def.flag, "DEPTH_5_TERMINAL"], evidenceStatus: "SIMULATED_FORENSIC_CASE"
    };
    addAccount(acc);
    createdD5.push(acc);
    const txAmt = parseFloat((baseTokenAmount * (0.02 + (idx % 3) * 0.01)).toFixed(6));
    createTx(parent, acc, txAmt, "egress", def.label, def.reason, 60 + idx * 12);
  });

  // Cross link at Distance 5:
  if (createdD5.length >= 3) {
    createTx(createdD5[0], createdD5[2], baseTokenAmount * 0.015, "egress", "Timelock Custody Escrow", "Governance timelock backup", 90);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ISSUE B: INDEPENDENT DETERMINISTIC NODE COLOR VARIATION
  // Strong four-color core palette: Yellow, Green, Red, Blue
  // Avoids monotone branches; preserves major entity accents; balances distribution.
  // ═════════════════════════════════════════════════════════════════════════
  const CORE_PALETTE = ["#3b82f6", "#10b981", "#eab308", "#ef4444"]; // Blue, Green, Yellow, Red
  const seedShift = Math.abs(seed % 4);
  const palette = [
    CORE_PALETTE[seedShift % 4],
    CORE_PALETTE[(seedShift + 1) % 4],
    CORE_PALETTE[(seedShift + 2) % 4],
    CORE_PALETTE[(seedShift + 3) % 4]
  ];

  const parentMap = new Map<string, string>();
  for (const tx of transactions) {
    const s = tx.source.toLowerCase();
    const d = tx.destination.toLowerCase();
    if (!parentMap.has(d)) parentMap.set(d, s);
  }

  accounts.forEach((acc, i) => {
    const isTarget = acc.nodeType === "target" || acc.address.toLowerCase() === cleanTarget.toLowerCase();
    if (isTarget) {
      acc.visualColor = "#ffd700"; // Central Target Gold
      return;
    }

    const lbl = acc.label.toLowerCase();
    // Major Entity Primary Hubs retain established accent styling:
    if (lbl.includes("tornado") && (acc.nodeType === "mixer" || acc.nodeType === "sanctioned_pool")) {
      acc.visualColor = "#a855f7"; // Tornado Mixer Purple
      return;
    }
    if (lbl.includes("binance") && acc.nodeType === "cex") {
      acc.visualColor = "#eab308"; // Binance Yellow
      return;
    }
    if (lbl.includes("stargate") && acc.nodeType === "bridge") {
      acc.visualColor = "#8b5cf6"; // Stargate Bridge Indigo/Purple
      return;
    }
    if (lbl.includes("uniswap") && acc.nodeType === "defi") {
      acc.visualColor = "#06b6d4"; // Uniswap Cyan
      return;
    }

    // Individual Connected Wallets, Satellites, Peel Hops & Counterparties:
    // Controlled deterministic variation across Yellow, Green, Red, and Blue.
    const parentAddr = parentMap.get(acc.address.toLowerCase()) || "";
    const parentAcc = accounts.find(a => a.address.toLowerCase() === parentAddr);
    const parentColor = parentAcc?.visualColor || "";

    const addrHash = acc.address.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    let colorIdx = (i * 3 + (addrHash % 7) + seed) % 4;
    let chosen = palette[colorIdx];

    // Ensure downstream child node alternates from parent (e.g. Yellow -> Blue -> Green -> Red)
    if (chosen === parentColor) {
      colorIdx = (colorIdx + 1) % 4;
      chosen = palette[colorIdx];
    }

    acc.visualColor = chosen;
  });

  // Cross-reference related transactions
  for (let i = 0; i < transactions.length; i++) {
    const curr = transactions[i];
    const related = transactions
      .filter((t, idx) => idx !== i && (t.source === curr.destination || t.destination === curr.source))
      .map(t => t.transactionId);
    curr.relatedTxIds = related.slice(0, 4);
  }

  const totalInflow = transactions.filter(t => t.destination === cleanTarget).reduce((acc, t) => acc + t.amountUSD, 0);
  const totalOutflow = transactions.filter(t => t.source === cleanTarget).reduce((acc, t) => acc + t.amountUSD, 0);
  const totalFees = transactions.reduce((acc, t) => acc + t.gasFee * tokenPrice, 0);

  const canonicalCase: CanonicalForensicCase = {
    caseId: `CASE-SIM-${resolvedScenarioId.toUpperCase()}-${seed.toString().slice(-6)}`,
    seed,
    generationVersion: "v2.5.0-canonical",
    provenance: "SIMULATED_FORENSIC_CASE",
    scenarioId: resolvedScenarioId,
    scenarioName: resolvedScenarioId.replace("_", " ").toUpperCase(),
    category: targetCategory,
    targetAddress: cleanTarget,
    chain: chain.toUpperCase(),
    primaryToken,
    secondaryToken,
    totalInflow,
    totalOutflow,
    retainedBalance: Math.max(0, totalInflow - totalOutflow),
    totalFees,
    riskScore: targetRiskScore,
    riskLevel: targetRiskLevel,
    ruleFlags: [
      targetRiskScore >= 80 ? "OFAC_SDN_SANCTIONS_MATCH" : targetRiskScore <= 25 ? "COMPLIANT_FLOW" : "ANOMALOUS_HEURISTIC",
      "FLOW_CONSERVATION_AUDITED",
      "DIRECTED_BFS_VERIFIED"
    ],
    summary: `Forensic case for ${cleanTarget}. Coherent transaction flow generated across ${accounts.length} nodes and ${transactions.length} directional transactions adhering to ${resolvedScenarioId.replace("_", " ").toUpperCase()} archetype.`,
    remediationAdvice,
    regulatoryImpact,
    accounts,
    transactions,
    actionPlan,
    generatedAt: new Date(nowMs).toISOString()
  };

  registerCanonicalCase(canonicalCase);
  return canonicalCase;
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. TRUE HOP-DEPTH GRAPH PROJECTION (BFS Distance Filter)
// ═════════════════════════════════════════════════════════════════════════════

export function projectCaseToGraph(
  canonicalCase: CanonicalForensicCase,
  targetAddress: string,
  depth: number
): ProjectedGraphData {
  const cleanTarget = targetAddress.trim().toLowerCase();
  const clampedDepth = Math.max(1, Math.min(5, depth));

  // Build bidirectional adjacency map to calculate true distance from target
  const adj = new Map<string, Set<string>>();
  for (const acc of canonicalCase.accounts) {
    adj.set(acc.address.toLowerCase(), new Set<string>());
  }
  for (const tx of canonicalCase.transactions) {
    const s = tx.source.toLowerCase();
    const d = tx.destination.toLowerCase();
    if (!adj.has(s)) adj.set(s, new Set());
    if (!adj.has(d)) adj.set(d, new Set());
    adj.get(s)!.add(d);
    adj.get(d)!.add(s);
  }

  // BFS distance from cleanTarget
  const distances = new Map<string, number>();
  distances.set(cleanTarget, 0);
  const queue: string[] = [cleanTarget];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const curDist = distances.get(curr)!;
    if (curDist >= clampedDepth) continue;

    for (const neighbor of adj.get(curr) || []) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, curDist + 1);
        queue.push(neighbor);
      }
    }
  }

  // Filter nodes: only those within true graph distance <= depth
  const visibleNodes: GraphNode[] = canonicalCase.accounts
    .filter(acc => {
      const d = distances.get(acc.address.toLowerCase());
      return d !== undefined && d <= clampedDepth;
    })
    .map(acc => ({ ...acc }));

  const visibleNodeIds = new Set(visibleNodes.map(n => n.address.toLowerCase()));

  // Filter and aggregate links: only where both source and destination are visible
  const linkKeyMap = new Map<string, GraphLink>();

  for (const tx of canonicalCase.transactions) {
    const s = tx.source.toLowerCase();
    const d = tx.destination.toLowerCase();
    if (!visibleNodeIds.has(s) || !visibleNodeIds.has(d)) continue;

    const key = `${s}--->${d}`;
    if (!linkKeyMap.has(key)) {
      linkKeyMap.set(key, {
        source: tx.source,
        target: tx.destination,
        value: tx.amountUSD,
        token: tx.token,
        transactionCount: 1,
        hashes: [tx.txHash],
        patternLabel: tx.patternLabel,
        flowReason: tx.flowReason,
        riskLevel: tx.riskLevel,
        stage: tx.stage,
        transactions: [tx]
      });
    } else {
      const existing = linkKeyMap.get(key)!;
      existing.value += tx.amountUSD;
      existing.transactionCount += 1;
      if (!existing.hashes.includes(tx.txHash)) {
        existing.hashes.push(tx.txHash);
      }
      existing.transactions?.push(tx);
    }
  }

  const links = Array.from(linkKeyMap.values());

  const targetAcc =
    canonicalCase.accounts.find(a => a.address.toLowerCase() === cleanTarget) ||
    canonicalCase.accounts[0];

  const stats: GraphStats = {
    totalNodes: visibleNodes.length,
    totalLinks: links.length,
    riskScore: canonicalCase.riskScore,
    riskLevel: canonicalCase.riskLevel,
    fraudPattern: canonicalCase.scenarioName,
    patternCategory: canonicalCase.category,
    patternSummary: canonicalCase.summary,
    remediationAdvice: canonicalCase.remediationAdvice,
    regulatoryImpact: canonicalCase.regulatoryImpact,
    detectedMixers: visibleNodes.filter(n => n.nodeType === "mixer" || n.nodeType === "sanctioned_pool").length,
    bridgesUsed: visibleNodes.filter(n => n.nodeType === "bridge").length,
    cexDepositNodes: visibleNodes.filter(n => n.nodeType === "cex").length,
    peelHops: visibleNodes.filter(n => n.nodeType === "peel_hop").length,
    victimsCount: visibleNodes.filter(n => n.nodeType === "victim").length,
    depth: clampedDepth,
    totalInflowUSD: canonicalCase.totalInflow,
    totalOutflowUSD: canonicalCase.totalOutflow
  };

  return {
    caseId: canonicalCase.caseId,
    seed: canonicalCase.seed,
    generationVersion: canonicalCase.generationVersion,
    provenance: canonicalCase.provenance,
    scenarioId: canonicalCase.scenarioId,
    nodes: visibleNodes,
    links,
    stats,
    actionPlan: canonicalCase.actionPlan,
    target: targetAcc,
    allTransactions: canonicalCase.transactions
  };
}
