// src/hub/services/apiHealthChecker.ts
import { HealthResult } from '../hub.types';

async function ping(url: string, opts = {}, method = "GET"): Promise<HealthResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { ...opts, method, signal: controller.signal });
    clearTimeout(timeoutId);
    return {
      status: res.ok ? "UP" : "DEGRADED",
      latencyMs: Date.now() - start,
      httpCode: res.status
    };
  } catch {
    return { status: "DOWN", latencyMs: Date.now() - start, httpCode: 0 };
  }
}

export const APIHealthChecker = {
  async checkAll() {
    const checks: Record<string, () => Promise<HealthResult>> = {
      "DeFiLlama":     () => ping("https://api.llama.fi/protocols"),
      "GeckoTerminal": () => ping("https://api.geckoterminal.com/api/v2/networks"),
      "DexScreener":   () => ping("https://api.dexscreener.com/latest/dex/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
      "Blockstream":   () => ping("https://blockstream.info/api/blocks/tip/height"),
      "Binance":       () => ping("https://api.binance.com/api/v3/ping"),
      "CoinGecko":     () => ping("https://api.coingecko.com/api/v3/ping"),
      "Mempool.space": () => ping("https://mempool.space/api/v1/fees/recommended"),
      "Moralis":       () => ping("https://deep-index.moralis.io/api/v2.2/health"),
      "Alchemy":       () => ping("https://eth-mainnet.g.alchemy.com/v2/demo"),
      "Blockchair":    () => ping("https://api.blockchair.com/bitcoin/stats"),
      "WhaleAlert":    () => ping("https://api.whale-alert.io/v1/status"),
      "AMLBot":        () => ping("https://amlbot.com/api", {}, "POST"),
      "TRM Labs":      () => ping("https://api.trmlabs.com/health"),
      "Etherscan":     () => ping("https://api.etherscan.io/api?module=stats&action=ethprice"),
      "Infura":        () => ping("https://status.infura.io/api/v2/status.json"),
      "Chainlink":     () => ping("https://status.chain.link/api/v2/status.json"),
      "CoinPaprika":   () => ping("https://api.coinpaprika.com/v1/global"),
      "Bitquery":      () => ping("https://graphql.bitquery.io"),
      "Glassnode":     () => ping("https://api.glassnode.com/v1/metrics/market/price_usd"),
      "Messari":       () => ping("https://data.messari.io/api/v1/assets/bitcoin/metrics"),
      "CryptoQuant":   () => ping("https://api.cryptoquant.com/v1/ping"),
      "Nansen":        () => ping("https://api.nansen.ai/v1/health"),
      "Dune":          () => ping("https://api.dune.com/api/v1/status"),
      "Santiment":     () => ping("https://api.santiment.net/health"),
      "CryptoPanic":   () => ping("https://cryptopanic.com/api/v1/posts/"),
    };

    const results: Record<string, HealthResult> = {};
    for (const [name, check] of Object.entries(checks)) {
      results[name] = await check();
    }
    return results;
  }
};
