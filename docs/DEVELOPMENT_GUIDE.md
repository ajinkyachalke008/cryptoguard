# CryptoGuard AI — Developer & Contributor Guide

This guide describes the local development setup, environment configuration, testing procedures, and the continuous GitHub delivery protocol for **CryptoGuard AI**.

---

## 1. Prerequisites & Tooling

* **Node.js:** Node.js 18.18+ or 20+ (Active LTS recommended; tested on v26.13.0)
* **npm:** npm 10+ (tested on v11.20.0)
* **Git:** Git 2.40+
* **Operating System:** Windows, macOS, or Linux

---

## 2. Local Environment Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ajinkyachalke008/cryptoguard.git
   cd cryptoguard
   ```

2. **Install Dependencies:**
   Use clean install to enforce lockfile integrity:
   ```bash
   npm ci
   ```

3. **Configure Environment Variables:**
   Copy the example template to a local private file:
   ```bash
   cp .env.example .env.local
   ```
   *Never commit `.env` or `.env.local` to version control.*

   **Essential Variables for Local Development:**
   ```env
   # Database (Local SQLite or Turso)
   TURSO_DATABASE_URL=file:local.db
   
   # JWT Secret (Minimum 32 characters)
   JWT_SECRET=development_only_secret_change_in_production_32chars!

   # Optional: Live EVM RPC Key
   ALCHEMY_API_KEY=your_alchemy_key_here
   
   # Optional: LLM Explanation API
   AI_API_KEY=your_ai_key_here
   AI_API_URL=https://api.openai.com/v1/chat/completions
   AI_MODEL=gpt-4o
   ```

4. **Launch Local Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 3. Build & Quality Verification Commands

Always run quality checks before staging changes:

```bash
# 1. Run ESLint checks (Next.js config)
npm run lint

# 2. Run TypeScript strict type-checking
npx tsc --noEmit

# 3. Compile optimized production build
npm run build
```

---

## 4. Continuous GitHub Delivery Protocol

CryptoGuard enforces a **continuous delivery workflow**. Every completed, logical engineering task must be verified, reviewed, committed, and pushed to GitHub independently.

### The 12-Step Delivery Checklist:
1. **Inspect Working Tree:** Run `git status` before beginning work.
2. **Review Scope:** Understand affected modules and isolate the change.
3. **Plan Implementation:** Write a concise plan before modifying code.
4. **Implement Incrementally:** Keep changes minimal and focused.
5. **Execute Verification:** Run `npm run lint`, `npx tsc --noEmit`, and tests.
6. **Review Diff:** Run `git diff` to confirm zero unintended changes or formatting leaks.
7. **Verify Secrets:** Confirm no `.env` files, API keys, or raw tokens are in the diff.
8. **Stage Selectively:** Stage only intended files with `git add <file>`. Never use blind `git add -A`.
9. **Imperative Commit Message:** Write a clear imperative subject line (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
10. **Push to Remote:** Push to `origin main` using authenticated Git credentials.
11. **Verify Remote Status:** Check `git status` to ensure branch is clean and up to date.
12. **Document Delivery:** Report the commit SHA and verification outputs.
