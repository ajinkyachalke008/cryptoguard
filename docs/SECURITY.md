# CryptoGuard AI — Security Architecture & Vulnerability Management

This document outlines the security architecture, authentication boundaries, credential hygiene policies, and vulnerability response procedures for **CryptoGuard AI**.

---

## 1. Authentication & Authorization Boundaries

### JWT Session Authentication
* **Standard Access:** Users authenticate via `/api/auth/login` or `/api/auth/register`, receiving a signed JSON Web Token (JWT) using HMAC SHA-256 (`JWT_SECRET`).
* **Token Lifetime:** Configured for 7 days (`authMiddleware.ts`).
* **Transport:** Client requests pass the token in the `Authorization: Bearer <TOKEN>` header.

### Admin Authorization Whitelist & Environment Override
Administrative endpoints under `/api/admin/*` and the frontend dashboard at `/admin` enforce strict double-validation:
1. The user must present a valid JWT token where `user.role === 'admin'`.
2. The user's lowercase email address **must** match the authorized admin whitelist:
   - Configurable dynamically via the `ADMIN_WHITELIST` environment variable (comma-separated list of emails).
   - In production or local setups without `ADMIN_WHITELIST` set, safely defaults to:
     - `ajinkyachalke008@gmail.com`
     - `ajinkyachalke94@gmail.com`
3. Any attempt by an unauthorized or non-whitelisted account to access administrative endpoints results in an HTTP 403 Forbidden response (`ADMIN_REQUIRED`) and generates a security audit record in the `adminAuditLogs` table.

---

## 2. Critical Security Advisory: Exposed Credential Remediation

> [!WARNING]
> **COMPROMISED CREDENTIAL REMEDIATION PROCEDURE**
> In previous commits, a root-level `.env` file containing live/test API keys and database connection strings was committed to Git history.
> 
> **Immediate User Action Required:**
> 1. **Rotate Credentials:** Immediately regenerate and rotate all keys listed below in their respective third-party developer consoles:
>    - Database: Turso Cloud auth token and database URL (`TURSO_DATABASE_URL`)
>    - Authentication: `JWT_SECRET`, `BETTER_AUTH_SECRET`, `AUTUMN_SECRET_KEY`
>    - Payment Gateway: Stripe Secret, Test, and Live keys (`STRIPE_SECRET_KEY`, `STRIPE_LIVE_KEY`)
>    - Blockchain & Explorers: Etherscan, Moralis, Alchemy, BlockCypher, NowNodes, Tenderly API keys
>    - Market Data: CoinGecko, CoinMarketCap, CryptoCompare, Messari, AMLBot, Santiment API keys
> 2. **Untrack from Git:** Execute `git rm --cached .env` to drop the file from the Git index while keeping your local configuration intact.
> 3. **Verify Gitignore:** Ensure `.env`, `.env.local`, and `.env*.local` remain in `.gitignore`.
> 4. **History Scrubbing:** Before publishing the repository publicly, use `git-filter-repo` to permanently erase previous commit revisions that held secret values.

---

## 3. Defense-in-Depth & Boundary Hardening

### Input Validation
* **Blockchain Addresses:** Validated using `ethers.isAddress(address)` before triggering RPC or database queries.
* **Transaction Hashes:** Validated using strict 66-character hexadecimal regex (`^0x[a-fA-F0-9]{64}$`).
* **Controller Payloads:** External API payloads are defensive and sanitized to prevent SQL injection or prototype pollution.

### Rate Limiting
* Implemented via `rateLimitMiddleware.ts` using an in-memory token-bucket sliding window algorithm.
* Default limits: 100 requests per 15-minute window for unauthenticated users, with higher limits for authenticated accounts.

### Data Provenance & Anti-Fabrication
* All forensic findings must carry cryptographic provenance (`txHash`, `chainId`, `blockNumber`).
* Synthetic demonstration cases must be explicitly annotated as `evidenceStatus: "SIMULATED_FORENSIC_CASE"`.
* Simulated or inferred geographic data must never be presented as verified legal identity.
