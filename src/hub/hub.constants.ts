// src/hub/hub.constants.ts
import { ChainId, ChainConfig, RiskLevel, RiskThreshold } from './hub.types';

export const HUB_ROUTES = {
  ROOT:       "/hub",
  MARKET:     "/hub/market",
  WALLET:     "/hub/wallet",
  DEFI:       "/hub/defi",
  DEX:        "/hub/dex",
  AML:        "/hub/aml",
  OSINT:      "/hub/osint",
  SENTIMENT:  "/hub/sentiment",
  PULSE:      "/hub/pulse",
  API_HEALTH: "/hub/api-health",
  RESOURCES:  "/hub/resources",
  CHAIN:      "/hub/chain",
  INVESTIGATOR: "/hub/investigator",
} as const;

export const SUPPORTED_CHAINS: Record<ChainId, ChainConfig> = {
  eth:       { name: "Ethereum",  symbol: "ETH",   decimals: 18, explorer: "api.etherscan.io" },
  bsc:       { name: "BNB Chain", symbol: "BNB",   decimals: 18, explorer: "api.bscscan.com" },
  polygon:   { name: "Polygon",   symbol: "MATIC", decimals: 18, explorer: "api.polygonscan.com" },
  arbitrum:  { name: "Arbitrum",  symbol: "ETH",   decimals: 18, explorer: "api.arbiscan.io" },
  optimism:  { name: "Optimism",  symbol: "ETH",   decimals: 18, explorer: "api-optimistic.etherscan.io" },
  avalanche: { name: "Avalanche", symbol: "AVAX",  decimals: 18, explorer: "api.snowtrace.io" },
  fantom:    { name: "Fantom",    symbol: "FTM",   decimals: 18, explorer: "api.ftmscan.com" },
  bitcoin:   { name: "Bitcoin",   symbol: "BTC",   decimals: 8,  explorer: "blockstream.info/api" },
};

export const RISK_THRESHOLDS: Record<RiskLevel, RiskThreshold> = {
  LOW:    { min: 0,  max: 29,  color: "#00C853", action: "PASS",   label: "Low Risk" },
  MEDIUM: { min: 30, max: 59,  color: "#FF8F00", action: "REVIEW", label: "Enhanced Due Diligence Required" },
  HIGH:   { min: 60, max: 79,  color: "#E65100", action: "BLOCK",  label: "High Risk — Manual Review" },
  SEVERE: { min: 80, max: 100, color: "#C62828", action: "BLOCK",  label: "Severe — Reject Transaction" },
};

export const HUB_CACHE_TTL = {
  PRICES:    30,     // 30 seconds
  PROTOCOLS: 300,    // 5 minutes
  WALLET:    120,    // 2 minutes
  OHLCV:     3600,   // 1 hour
  ENS:       86400,  // 24 hours
  OFAC:      86400,  // 24 hours
} as const;

export const API_NAMES = {
  DEFILLAMA:       "DeFiLlama",
  GECKO_TERMINAL:  "GeckoTerminal",
  DEX_SCREENER:    "DexScreener",
  BLOCKSTREAM:     "Blockstream",
  THE_GRAPH:       "TheGraph",
  PARASWAP:        "Paraswap",
  OFAC:            "OFAC SDN",
  WALLET_EXPLORER: "WalletExplorer",
  ENS:             "ENS",
  ETHERSCAN:       "Etherscan",
  COINGECKO:       "CoinGecko",
  MORALIS:         "Moralis",
  ALCHEMY:         "Alchemy",
  ANKR:            "Ankr",
  CMC:             "CoinMarketCap",
  CRYPTOCOMPARE:   "CryptoCompare",
  BINANCE:         "Binance",
  MESSARI:         "Messari",
  BLOCKCYPHER:     "BlockCypher",
  NOWNODES:        "NOWNodes",
  AMLBOT:          "AMLBot",
  SANTIMENT:       "Santiment",
  TRANSPOSE:       "Transpose",
  LUNARCRUSH:      "LunarCrush",
  TENDERLY:        "Tenderly",
} as const;
