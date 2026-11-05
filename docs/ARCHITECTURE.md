# CryptoGuard AI — System Architecture & Data Flow

This document details the architectural design, module dependencies, component hierarchy, and data flows of **CryptoGuard AI**.

---

## 1. High-Level Architecture Overview

CryptoGuard AI is architected as a modern, unified Next.js 15 full-stack application leveraging the App Router, React 19 Server/Client Components, Tailwind CSS v4, and LibSQL (Turso Cloud SQLite) with Drizzle ORM.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Client Presentation Tier                              │
│   Next.js 15 App Router (/app)                                                  │
│   • Core Dashboards: /dashboard, /scanner, /wallet-scan, /transaction-center    │
│   • Visual Forensics: /graph (D3 & @xyflow), /globe (Three.js WebGL Earth)      │
│   • OSINT & Threat Hub: /hub/ultra, /hub/[[...slug]] (F0–F14 Feature Modules)   │
│   • Case Management: /cases, /reports, /alerts, /watchlist                      │
│   • Admin Control: /admin (Forensic telemetry, Session revocation)              │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ JSON HTTP / RESTful API
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                             API & Middleware Tier                               │
│   Next.js Route Handlers (/app/api/* — 73 Endpoints)                            │
│   • authMiddleware: JWT verification + Hardcoded Admin Whitelist enforcement    │
│   • rateLimitMiddleware: Token-bucket IP & route rate limiting                  │
│   • errorMiddleware: Structured JSON error responses with logging               │
└───────────────────┬─────────────────────────────────────────┬───────────────────┘
                    │                                         │
┌───────────────────▼─────────────────────┐ ┌─────────────────▼───────────────────┐
│         Analytics & Forensics           │ │               Persistence           │
│ • RiskEngineService: Rule-based 0–100   │ │ Turso Cloud / Local SQLite          │
│ • CanonicalCaseEngine: 5-Hop BFS Graph  │ │ Drizzle ORM Models                  │
│ • ForensicEngine: Procedural Scenarios  │ │ • users, user_sessions, auth_logs   │
│ • AIService: Read-only LLM Narratives   │ │ • wallet_scans, transaction_scans   │
└───────────────────┬─────────────────────┘ │ • cases, case_items, alerts         │
                    │                       └─────────────────────────────────────┘
┌───────────────────▼─────────────────────────────────────────────────────────────┐
│                       External Blockchain & OSINT Layer                         │
│ • EVM RPCs: Alchemy, Moralis, Etherscan API wrappers                            │
│ • UTXO / Non-EVM: Mempool.space, Blockstream, Solana RPC adapters               │
│ • Threat & Sanctions: OFAC SDN, ChainAbuse, GoPlus, ScamSniffer, AMLBot         │
│ • Procedural Fallback: Elite Synthetic Intelligence (ESI) Deterministic Data    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core End-to-End Data Flows

### A. Wallet Investigation Workflow
```
[User Input: Address] 
       │
       ▼
[/api/wallet-scan] (POST) ───► [authMiddleware] (Optional Auth)
       │
       ▼
[ethers.isAddress Validation] ───► Invalid? ──► Return HTTP 400
       │
       ▼ Valid
[web3Service.getWalletActivity] 
       │  (Queries Alchemy/Moralis RPC or generates synthetic fallback)
       ▼
[riskEngineService.analyzeWallet]
       │  • Blacklist check (+70)
       │  • Wallet age analysis (+15 / -5)
       │  • Mixer / Privacy tools (+40)
       │  • Tx velocity and ratio (+10)
       │  • Result: riskScore (0-100), riskLevel (low/medium/high/critical), tags, flags
       ▼
[aiService.generateWalletRiskExplanation]
       │  (Calls OpenAI LLM or generates deterministic narrative based on score)
       ▼
[Database Persistence]
       ├── db.insert(walletScans)
       └── db.insert(scanLogs)
       ▼
[Client Response JSON] ───► Rendered on [/wallet-scan] & [/dashboard]
```

### B. Transaction Investigation Workflow
```
[User Input: Tx Hash] 
       │
       ▼
[/api/transaction-scans] (POST)
       │
       ▼
[web3Service.getTransactionDetails]
       │  (Retrieves status, gasUsed, gasPrice, value, tokenTransfers, methodId)
       ▼
[riskEngineService.analyzeTransaction]
       │  • Failed status (+15)
       │  • Large transfer / Dust transfer (+15 / +5)
       │  • Token transfer count (>5 tokens: +10)
       │  • Unrestricted approval methodId 0x095ea7b3 (+10)
       ▼
[aiService.generateTransactionRiskExplanation]
       │  (Passes score and flags to LLM for plain-language narrative)
       ▼
[Database Persistence] ───► db.insert(transactionScans)
       ▼
[Client Response JSON] ───► Rendered on [/transaction-center]
```

### C. Multi-Hop BFS Forensic Graph Workflow
```
[User Input: Target Address, Depth (1–5)]
       │
       ▼
[/api/graph] (GET/POST)
       │
       ▼
[canonicalCaseEngine.generateSyntheticCase]
       │  • Computes deterministic seed from targetAddress
       │  • Generates multi-hop network (Hop 1 direct, Hop 2 relayers,
       │    Hop 3 mixers, Hop 4 peel hops, Hop 5 cold vaults)
       │  • Preserves flow conservation: Σ Inputs = Σ Outputs + Fees
       │  • Tags nodes with evidenceStatus: "SIMULATED_FORENSIC_CASE"
       ▼
[canonicalCaseEngine.projectCaseToGraph]
       │  • Builds bidirectional adjacency map
       │  • Runs FIFO BFS distance traversal starting at target (dist = 0)
       │  • Clamps maximum traversal to requested depth (1–5)
       │  • Filters visible nodes and interconnecting edges
       ▼
[Client Response JSON] ───► Rendered on [/graph] via D3 / 3D WebGL Canvas
```

---

## 3. Module Hierarchy & Responsibilities

| Path | Purpose & Responsibilities |
|---|---|
| `src/app/` | Page controllers, nested layouts, client dashboard interfaces, and route transitions. |
| `src/app/api/` | 73 RESTful API route handlers implementing JSON request validation and DB queries. |
| `src/components/` | Modular UI library built with Tailwind CSS, Lucide icons, Radix UI primitives, and Framer Motion. |
| `src/components/globe/` | Three.js WebGL interactive 3D earth globe with orbital arcs and satellite points. |
| `src/lib/services/riskEngineService.ts` | Pure rule-based, deterministic numerical scoring engine (0–100 scale). |
| `src/lib/services/canonicalCaseEngine.ts` | 5-hop procedural BFS graph synthesis and flow conservation engine. |
| `src/lib/services/aiService.ts` | LLM narrative generation service using OpenAI-compatible completion APIs. |
| `src/lib/services/web3Service.ts` | Blockchain interface adapter abstracting wallet and transaction retrieval. |
| `src/lib/middleware/authMiddleware.ts` | JWT bearer token decoding, user context attachment, and admin whitelist check. |
| `src/hub/` | Unified Threat Intelligence Hub containing features `F0` through `F14`. |
| `src/hub/services/` | Real API clients for Alchemy, Moralis, CoinGecko, DeFiLlama, and OFAC sanctions. |
| `src/db/` | Drizzle ORM database client configuration and SQLite table schemas. |

---

## 4. Security & Isolation Boundaries

1. **Deterministic vs. Generative Boundary:**
   - Numerical risk scores are strictly calculated by deterministic rules in `riskEngineService.ts`.
   - The AI service (`aiService.ts`) receives already-computed scores and flags as read-only inputs to generate explanations.
   - AI outputs **never** mutate or recalculate numerical risk scores.

2. **Admin Privilege Boundary:**
   - Enforced by `requireAdmin` middleware checking `ADMIN_WHITELIST`.
   - Hardcoded whitelist: `ajinkyachalke008@gmail.com` and `ajinkyachalke94@gmail.com`.
   - Admin routes (`/api/admin/*` and `/admin`) reject non-whitelisted users with HTTP 403.

3. **Data Provenance Boundary:**
   - Real on-chain data records should be marked `evidenceStatus: "VERIFIED_ON_CHAIN"`.
   - Procedural benchmark records are explicitly marked `evidenceStatus: "SIMULATED_FORENSIC_CASE"`.
