# CryptoGuard AI — Real MVP Definition & Product Roadmap

---

## 1. Executive Product Vision

CryptoGuard AI is an **AI-driven blockchain threat-intelligence and digital financial-forensics platform**.

The objective of the Minimum Viable Product (MVP) is **not** to display dozens of simulated dashboards or speculative geographical pins. The core MVP value proposition is:
> **Enable a fraud investigator, security analyst, or crypto user to enter an on-chain address or transaction hash, retrieve verifiable blockchain data from live RPC providers, calculate an explainable rule-based risk score, and trace connected counterparties with clear evidence provenance.**

---

## 2. Target User & Primary Problem

* **Primary User:** Blockchain Security Analysts, Compliance Officers, Fraud Investigators, and Web3 Traders.
* **Core Problem:** When illicit funds move across wallets, mixers, or decentralized protocols, victims and analysts struggle to distinguish clean counterparties from money-laundering hops. Most existing tools are either closed enterprise black boxes ($20,000+/year) or simplistic single-address block explorers with no risk attribution.

---

## 3. Core MVP User Journey

1. **Input:** User submits an EVM address (`0x...`) or transaction hash on the scanner interface.
2. **Live Data Ingestion:** System queries live JSON-RPC (Alchemy / Etherscan) to retrieve verified balance, transaction count, contract status, and recent counterparties.
3. **Data Normalization:** Raw RPC payloads are parsed into standard CryptoGuard types with timestamp, block number, and gas metrics.
4. **Transparent Risk Scoring:** `RiskEngineService` evaluates deterministic rules (sanctions match, mixer proximity, age, transaction ratio) and assigns an auditable score from 0 to 100.
5. **AI Contextual Narrative:** `AIService` translates the computed score and active heuristic flags into an executive forensic summary without mutating the score.
6. **Provenance Tagging:** Evidence is tagged as `VERIFIED_ON_CHAIN` (backed by RPC receipt) or `SIMULATED_DEMO` (if offline fallback was active).
7. **Graph Visualizer:** User explores immediate 1-hop and 2-hop connected counterparties, color-coded by risk severity.
8. **Dossier Export:** User downloads a timestamped, signed PDF or JSON investigation report with complete provenance metadata.

---

## 4. MVP Inclusions vs. Deferred Features

| Feature Area | In MVP (Must-Have) | Deferred to v1.5+ (Future Roadmap) |
|---|---|---|
| **Supported Chains** | Ethereum Mainnet, Polygon PoS, Base (EVM RPC verified) | Bitcoin UTXO, Solana, Tron, Non-EVM networks |
| **Data Ingestion** | Live Alchemy/Etherscan RPC queries with graceful fallback | High-frequency live mempool WebSocket ingestion |
| **Risk Engine** | Deterministic rule-based scoring (0–100) with visible factor weights | Complex black-box machine learning clustering models |
| **Forensic Graph** | 1-hop and 2-hop verified counterparty graph from live transfer events | Procedural 5-hop synthetic cases (retained for demo/sandbox only) |
| **AI Narrative** | Contextual LLM summary citing active risk flags and balances | Simulated voice agent with speech synthesis |
| **Evidence Provenance** | Explicit `VERIFIED_ON_CHAIN` vs `SIMULATED` badge on all pages | Automated legal subpoena generation |
| **Security & Auth** | JWT auth, rate limiting, secure env configuration, sanitized `.env` | Decentralized SIWE (Sign-in with Ethereum) wallet auth |
| **Testing** | Automated regression test suite (Vitest) for risk engine & auth | Automated end-to-end Cypress/Playwright browser tests |

---

## 5. Development Milestones & Measurable Success Metrics

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MVP IMPLEMENTATION MILESTONES                         │
├───────────────────┬─────────────────────────────────┬───────────────────────────┤
│ Milestone         │ Scope & Deliverable             │ Success Metric            │
├───────────────────┼─────────────────────────────────┼───────────────────────────┤
│ M1: Security      │ Untrack .env, sanitize configs, │ 0 committed secrets in git│
│     & Testing     │ install Vitest test harness.    │ 100% tests passing in CI. │
├───────────────────┼─────────────────────────────────┼───────────────────────────┤
│ M2: Live RPC      │ Wire web3Service to Alchemy     │ Real balances & tx counts │
│     Integration   │ for Ethereum, Polygon & Base.   │ returned for live addrs.  │
├───────────────────┼─────────────────────────────────┼───────────────────────────┤
│ M3: Provenance    │ Add explicit [VERIFIED] vs      │ Zero ambiguity between    │
│     Architecture  │ [SIMULATED] badges in UI & API. │ real and synthetic data.  │
├───────────────────┼─────────────────────────────────┼───────────────────────────┤
│ M4: Live Graph    │ Construct real counterparty     │ Graph renders verified    │
│     Projection    │ graph from live transfer logs.  │ on-chain token flows.     │
├───────────────────┼─────────────────────────────────┼───────────────────────────┤
│ M5: Production    │ Final build, security audit,    │ Clean npm run build,      │
│     Readiness     │ and Vercel production deploy.   │ sub-second scan response. │
└───────────────────┴─────────────────────────────────┴───────────────────────────┘
```
