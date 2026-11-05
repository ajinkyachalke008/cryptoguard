<!-- ===================================================== -->
<!--                  CRYPTOGUARD BANNER                   -->
<!-- ===================================================== -->

<p align="center">
  <img src="https://raw.githubusercontent.com/ajinkyachalke008/cryptoguard/main/public/favicon.png" alt="CryptoGuard AI Logo" width="120" />
</p>

<h1 align="center">🛡️ CryptoGuard AI</h1>

<p align="center">
  <b>Institutional-Grade Blockchain Threat Intelligence, Financial Forensics & AI Risk Scoring Platform</b>
</p>

<p align="center">
  Real-Time 3D Globe Telemetry • Multi-Hop Forensic Graph • Deterministic Risk Engine • AI Forensic Explanations
</p>

<p align="center">
  <a href="https://cryptoguard-flame.vercel.app/"><strong>🌐 Live Production Web App</strong></a> •
  <a href="https://github.com/ajinkyachalke008/cryptoguard"><strong>📦 GitHub Repository</strong></a> •
  <a href="./docs/ARCHITECTURE.md"><strong>🏛️ Architecture Docs</strong></a> •
  <a href="./docs/MVP_ROADMAP.md"><strong>🗺️ MVP Roadmap</strong></a> •
  <a href="./docs/SECURITY.md"><strong>🔒 Security Guide</strong></a>
</p>

---

<div align="center">

![CryptoGuard AI](https://img.shields.io/badge/CryptoGuard-AI%20Blockchain%20Security%20Platform-ffd700?style=for-the-badge&logo=shield&logoColor=black)
![Next.js 15](https://img.shields.io/badge/Next.js-15.3.6%20App%20Router-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%20Strict-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-white?style=for-the-badge&logo=three.js&logoColor=black)
![Turso DB](https://img.shields.io/badge/Database-Turso%20SQLite%20(Drizzle)-44DD77?style=for-the-badge&logo=sqlite)
![Build Status](https://img.shields.io/badge/Build-Passing%20(73%20Routes)-brightgreen?style=for-the-badge)

</div>

---

## 1. Project Overview

**CryptoGuard AI** is an AI-augmented blockchain threat-intelligence, cryptocurrency fraud-detection, and digital financial-forensics platform. It empowers security researchers, compliance officers, and financial crime investigators to trace complex money laundering networks, identify high-risk counterparties, visualize multi-hop peeling chains, and generate auditable forensic dossiers with clear evidence provenance.

---

## 2. Problem Statement

Cryptocurrency fraud, decentralized mixer obfuscation, and peeling chains allow illicit actors to launder billions annually across heterogeneous blockchains. Traditional block explorers present raw, fragmented transaction hashes that require hours of manual correlation. Existing enterprise forensic suites cost upwards of \$20,000/year and operate as opaque black boxes without transparent rule scoring or explainable reasoning.

---

## 3. Project Objectives

1. **Deterministic Risk Scoring:** Provide auditable, rule-based risk calculations (0–100 scale) where every point maps directly to verifiable indicators (sanctions match, mixer proximity, dormancy, velocity).
2. **Multi-Hop Counterparty Visualizations:** Render interactive 2D force-directed and 3D WebGL graphs showing fund flow propagation up to 5 hops deep.
3. **Decoupled AI Explanations:** Utilize Large Language Models (LLMs) strictly for executive narrative summaries while preventing generative hallucinations from mutating numerical risk scores.
4. **Data Provenance & Integrity:** Explicitly distinguish verified live on-chain evidence from simulated benchmark cases, ensuring zero fabricated records.

---

## 4. Current Implementation Status

| Capability / Module | Status | Verification & Provenance Detail |
|---|---|---|
| **Next.js 15 App Router Frontend** | **COMPLETE & VERIFIED** | 73 static and dynamic routes compiled with 0 errors via `npm run build`. |
| **Deterministic Risk Engine** | **COMPLETE & VERIFIED** | Additive weighted heuristic rules (0–100) implemented in `src/lib/services/riskEngineService.ts`. |
| **Five-Hop BFS Graph Projection** | **COMPLETE & VERIFIED** | Breadth-First-Search graph projection algorithm in `src/lib/services/canonicalCaseEngine.ts`. |
| **JWT Auth & Admin Whitelist** | **COMPLETE & VERIFIED** | Bearer JWT authentication with hardcoded admin email whitelist in `authMiddleware.ts`. |
| **Turso / SQLite Persistence** | **COMPLETE & VERIFIED** | Drizzle ORM schema defining 20 tables with indexes in `src/db/schema.ts`. |
| **AI Forensic Explanations** | **COMPLETE & VERIFIED** | OpenAI-compatible narrative service with deterministic fallback templates in `src/lib/services/aiService.ts`. |
| **Live Blockchain Data Integration** | **PARTIALLY IMPLEMENTED** | OSINT Hub has active Alchemy/Moralis fetchers; core `web3Service.ts` currently runs on simulated mock data. |
| **Multi-Chain Live Coverage** | **REQUIRES INTEGRATION** | EVM (Ethereum, Polygon, Base) ready for RPC wiring; Bitcoin/Solana adapters run in simulated demonstration mode. |
| **Automated Testing Harness** | **IN PROGRESS** | Vitest integration planned to enforce automated regression verification across all services. |

---

## 5. Main Features & Verification

### 🕸️ 5-Hop Deep Forensic Graph Explorer
* **Path:** [`/graph`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/graph/page.tsx) & [`/api/graph`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/api/graph/route.ts)
* Implements true Breadth-First Search distance filtering up to 5 hops from the investigated address.
* Features 5 visualization layouts: 3D Spatial Constellation, 2D Force-Directed, Hierarchical Tree, Radial Ego, and Risk Matrix.
* Node generation uses deterministic flow conservation ($\sum \text{Inputs} = \sum \text{Outputs} + \text{Fees}$).

### 🔍 Multi-Chain Wallet & Transaction Scanner
* **Path:** [`/wallet-scan`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/wallet-scan/page.tsx) & [`/transaction-center`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/transaction-center/page.tsx)
* Validates address checksums (`ethers.isAddress`) and 66-character transaction hashes.
* Categorizes risk into 4 strict tiers: **Safe/Low** (0–29), **Medium** (30–59), **High** (60–79), and **Critical** (80–100).

### 🌍 3D Global Telemetry & Threat Globe
* **Path:** [`/globe`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/globe/page.tsx) & [`src/components/globe`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/components/globe)
* Interactive WebGL globe powered by Three.js and `react-globe.gl` displaying cross-border transaction vectors.

### 🛡️ Institutional Admin Command Center
* **Path:** [`/admin`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/admin/page.tsx) & [`/api/admin/*`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/api/admin)
* Real-time authentication event logging, device telemetry, brute-force alert triage, and instant session termination.

### ⚡ ULTRA Intelligence Hub (F0–F14)
* **Path:** [`/hub/ultra`](file:///c:/Users/AJINKYA%20CHALKE/Desktop/CryptoGuard/src/app/hub/ultra/page.tsx)
* 15 integrated forensic suites including AML Center, OSINT Board, DeFi Explorer, DEX Analyzer, and Mempool Monitor.

---

## 6. Technology Stack

| Layer | Technologies & Version | Purpose |
|---|---|---|
| **Framework** | [Next.js 15.3.6](https://nextjs.org/) (App Router, Turbopack) | Server Components, Route Handlers, Optimization |
| **Runtime & Language** | [Node.js](https://nodejs.org/) (v20+), [TypeScript 5](https://www.typescriptlang.org/) | Strict static typing across modules |
| **Frontend UI** | [React 19.0.0](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) | Modern responsive UI with futuristic Dark & Neon Gold palette |
| **Motion & Primitives** | [Framer Motion](https://www.framer.com/motion/), [Radix UI](https://www.radix-ui.com/), [Lucide](https://lucide.dev/) | Glassmorphic HUD elements, accessible dialogs, animated metrics |
| **Visualizations** | [Three.js](https://threejs.org/), [react-globe.gl](https://globe.gl/), [D3.js](https://d3js.org/), [@xyflow/react](https://reactflow.dev/) | 3D WebGL Earth, dynamic node graphs, and interactive flow charts |
| **Database & ORM** | [Turso Database](https://turso.tech/) (libSQL / SQLite), [Drizzle ORM](https://orm.drizzle.team/) | Type-safe schema migrations and fast edge queries |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | JWT bearer token sessions with hardcoded admin whitelist |
| **AI Integration** | OpenAI GPT-4o / compatible endpoint | Contextual natural-language narrative generation |

---

## 7. Architecture Overview

Refer to [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for full architecture specifications and data flow diagrams.

```
[Client Dashboards] ──► [API Route Handlers (/api/*)] ──► [authMiddleware]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
[Risk Engine (0–100)]                    [Drizzle ORM / SQLite]
            │                                     │
            ▼                                     ▼
[AI Explanation (Read-Only)]             [Turso Cloud Persistence]
```

---

## 8. Module Descriptions

* `src/app/`: Next.js 15 page routes, layouts, and navigation bars.
* `src/app/api/`: 73 RESTful endpoint route handlers for scans, graph generation, cases, and administration.
* `src/components/`: Reusable component library (HUD cards, gauges, charts, tables).
* `src/lib/services/riskEngineService.ts`: Rule-based deterministic risk engine computing 0–100 scores.
* `src/lib/services/canonicalCaseEngine.ts`: 5-hop procedural BFS graph generation and flow conservation.
* `src/lib/services/aiService.ts`: Contextual LLM summary generator with deterministic fallback templates.
* `src/lib/services/web3Service.ts`: Blockchain interface adapter.
* `src/hub/services/`: Direct API fetchers for Alchemy, Moralis, CoinGecko, DeFiLlama, and OFAC.
* `src/db/schema.ts`: Drizzle ORM schema defining 20 relational database tables.

---

## 9. Blockchain Integrations

* **EVM Networks (Ethereum, Polygon, Base, Arbitrum, BSC):** Direct JSON-RPC support through Alchemy and Moralis.
* **Bitcoin (UTXO):** Blockstream and Mempool.space REST APIs for transaction tracing.
* **Solana:** RPC cluster connection for SPL token transfer parsing.
* **OFAC & Sanctions:** Integrated SDN address screening against known bad-actor registries.

---

## 10. Live vs. Simulated Functionality

To maintain forensic integrity, CryptoGuard strictly categorizes all outputs:

* **Live Verified:**
  - JWT authentication and session tracking.
  - SQLite/Turso database persistence for all user scans, cases, alerts, and audit logs.
  - Deterministic 0–100 risk scoring rules.
  - OSINT Hub live price feeds (CoinGecko/DeFiLlama).
* **Simulated / Demonstration:**
  - Procedural 5-hop BFS graphs generated in `canonicalCaseEngine.ts` (tagged `evidenceStatus: "SIMULATED_FORENSIC_CASE"`).
  - Default wallet balances in `web3Service.ts` when live API keys are not supplied.
  - High-frequency live mempool WebSocket stream (simulated ticker).

---

## 11. AI and Risk-Engine Explanation

1. **Algorithmic Primacy:** Numerical risk is strictly computed by the rule engine:
   $$\text{RiskScore} = \text{clamp}\left(\sum \text{Active Heuristic Rule Weights}, 0, 100\right)$$
2. **AI Decoupling:** The Large Language Model receives the final score, active tags, and transaction metadata as read-only context to generate clear, plain-English explanations.
3. **Hallucination Prevention:** The LLM is strictly prohibited from mutating, overriding, or recalculating numerical scores.

---

## 12. Installation Requirements

* **Node.js:** `v18.18+` or `v20+` (LTS recommended)
* **npm:** `v10+`
* **Git:** `v2.40+`

---

## 13. Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ajinkyachalke008/cryptoguard.git
   cd cryptoguard
   ```

2. **Install Dependencies:**
   ```bash
   npm ci
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` with your local keys.*

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 14. Environment Variable Configuration

| Variable Name | Required | Description |
|---|---|---|
| `TURSO_DATABASE_URL` | Yes | SQLite file path (`file:local.db`) or Turso connection URL |
| `JWT_SECRET` | Yes | Minimum 32-character secret key for JWT session signing |
| `ALCHEMY_API_KEY` | Optional | Alchemy API key for live EVM RPC queries |
| `MORALIS_API_KEY` | Optional | Moralis API key for token balances and NFT metadata |
| `AI_API_KEY` | Optional | OpenAI API key for natural language explanations |
| `AI_MODEL` | Optional | Model identifier (defaults to `gpt-4o`) |

*Never commit real secrets or production `.env` files to Git.*

---

## 15. Development Commands

```bash
# Start local development server on port 3000
npm run dev

# Run Next.js production build
npm run build

# Start production server after build
npm run start
```

---

## 16. Lint, Testing & Build Commands

```bash
# Execute Next.js ESLint validation
npm run lint

# Execute TypeScript strict type-checking
npx tsc --noEmit

# Compile optimized production output (73 routes)
npm run build
```

---

## 17. API Overview

Detailed API documentation is cataloged in [`API_COLLECTION.json`](./API_COLLECTION.json) and [`BACKEND.md`](./BACKEND.md).
Key route categories include:
* `/api/auth/*`: User authentication, session management, and registration.
* `/api/wallet-scan`: On-demand address risk profiling and persistence.
* `/api/transaction-scans`: Transaction hash decomposition and gas auditing.
* `/api/graph`: Multi-hop BFS graph topology generation.
* `/api/admin/*`: Enterprise administrative monitoring and audit logging.

---

## 18. Security Considerations

* **Admin Access:** Restrained to `ADMIN_WHITELIST` (`ajinkyachalke008@gmail.com`, `ajinkyachalke94@gmail.com`).
* **Session Security:** Signed JWT tokens with strict expiration and IP hashing in audit logs.
* **Boundary Validation:** Input addresses sanitized via `ethers.isAddress` to guard against injection.
* For full vulnerability management and credential policies, see [`docs/SECURITY.md`](./docs/SECURITY.md).

---

## 19. Known Limitations

* Live on-chain data retrieval currently requires configuring valid Alchemy or Moralis API keys in `.env.local`; otherwise, the platform operates in simulated demonstration mode.
* Graph projection currently synthesizes deterministic benchmark scenarios; live multi-hop extraction from on-chain event logs is in active MVP development.

---

## 20. MVP Roadmap

See [`docs/MVP_ROADMAP.md`](./docs/MVP_ROADMAP.md) for full milestone definitions:
* **Milestone 1:** Security remediation (untracking `.env`), configuration sanitization, and automated test suite.
* **Milestone 2:** Live EVM RPC integration connecting `web3Service` to Alchemy for Ethereum, Polygon, and Base.
* **Milestone 3:** Explicit data provenance indicators across all UI cards (`[VERIFIED ON-CHAIN]` vs `[SIMULATED]`).
* **Milestone 4:** Live multi-hop counterparty graph construction from on-chain transfer event logs.

---

## 21. Future Development Direction

* **Cross-Chain Bridge Tracing:** Automated correlation of Layer-1 to Layer-2 bridge hops.
* **Decentralized SIWE Auth:** Sign-in with Ethereum (EIP-4361) wallet authentication.
* **High-Throughput WebSocket Ingestion:** Live mempool threat detection with real-time alerting.

---

## 22. Contribution & Development Workflow

CryptoGuard follows a strict **Continuous Delivery Workflow**:
1. Check `git status` and pull latest changes from `main`.
2. Implement focused, test-driven changes.
3. Validate code health: `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
4. Review diff for secrets or regressions: `git diff`.
5. Stage selectively: `git add <file>`. Never use blind `git add -A`.
6. Commit with imperative message: `git commit -m "feat/fix/docs: ..."`
7. Push to `origin main`: `git push origin main`.

For comprehensive developer instructions, consult [`docs/DEVELOPMENT_GUIDE.md`](./docs/DEVELOPMENT_GUIDE.md).

---

## 📜 License & Intellectual Property

© 2026 **CryptoGuard AI** by **AJINKYA CHALKE**. All rights reserved.  
Built for blockchain threat intelligence, financial crime compliance, and digital forensics.
