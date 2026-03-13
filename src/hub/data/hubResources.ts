// src/hub/data/hubResources.ts

export interface HubResource {
  featureId: string;
  title: string;
  description: string;
  details: string[];
  resources: {
    name: string;
    url: string;
    purpose: string;
  }[];
  technicalNotes?: string;
}

export const HUB_RESOURCES: Record<string, HubResource> = {
  F1_MARKET: {
    featureId: 'F1',
    title: 'Market Intelligence Dashboard',
    description: 'Real-time global market health and dominance metrics.',
    details: [
      'Global Market Cap (USD/BTC)',
      '24h Volume tracking across 300+ exchanges',
      'Market Dominance (BTC/ETH)',
      'GeckoTerminal Ticker Streams',
      'Real-time Top Gainers/Losers'
    ],
    resources: [
      { name: 'CoinGecko API', url: 'https://www.coingecko.com', purpose: 'Standard market data & icons' },
      { name: 'GeckoTerminal', url: 'https://www.geckoterminal.com', purpose: 'On-chain price streams' },
      { name: 'Binance API', url: 'https://binance.com', purpose: 'CEX price parity verification' }
    ]
  },
  F2_WALLET: {
    featureId: 'F2',
    title: 'Wallet Intelligence Scanner',
    description: 'Deep-dive forensics for individual wallet addresses.',
    details: [
      'Multi-chain Asset Aggregation',
      'USD Net Worth Valuation',
      'Transaction Timeline Analytics',
      'OFAC Sanctions Screening',
      'Entity Label Attribution'
    ],
    resources: [
      { name: 'Moralis Streams', url: 'https://moralis.io', purpose: 'Real-time balance & history' },
      { name: 'Alchemy NFT API', url: 'https://alchemy.com', purpose: 'Cross-chain portfolio resolution' },
      { name: 'OFAC SDN XML', url: 'https://treasury.gov', purpose: 'US Sanctions List ingestion' }
    ]
  },
  F3_DEFI: {
    featureId: 'F3',
    title: 'DeFi Protocol Explorer',
    description: 'Ecosystem-wide TVL and yield tracking.',
    details: [
      'Total Value Locked (TVL) per protocol',
      'Yield farming rate aggregation',
      'Protocol Category Dominance',
      'Ecosystem Health Metrics'
    ],
    resources: [
      { name: 'DeFiLlama API', url: 'https://defillama.com', purpose: 'TVL & Protocol metrics' },
      { name: 'The Graph', url: 'https://thegraph.com', purpose: 'EVM-based TVL verification' }
    ]
  },
  F4_DEX: {
    featureId: 'F4',
    title: 'DEX & Token Analyzer',
    description: 'On-chain liquidity and risk profiling.',
    details: [
      'Liquidity Pool Depth',
      'Price Impact Estimates',
      'Fully Diluted Valuation (FDV)',
      'Honeypot/Risk Contract Flags',
      '24h Buy/Sell Ratios'
    ],
    resources: [
      { name: 'DexScreener API', url: 'https://dexscreener.com', purpose: 'Pair discovery & liquidity' },
      { name: 'GeckoTerminal API', url: 'https://geckoterminal.com', purpose: 'Token risk profiling' }
    ]
  },
  F5_AML: {
    featureId: 'F5',
    title: 'AML & Compliance Center',
    description: 'Institutional-grade risk scoring and attribution.',
    details: [
      'Percentage Risk Attribution',
      'Illicit Signal Detection (Darknet, Mixing, etc.)',
      'Compliance Verdicts (Pass/Review/Block)',
      'Audit-ready Forensics Log'
    ],
    resources: [
      { name: 'AMLBot API', url: 'https://amlbot.com', purpose: 'Institutional risk scoring' },
      { name: 'Chainalysis (Mock)', url: 'https://chainalysis.com', purpose: 'Extended forensics logic' }
    ]
  },
  F6_OSINT: {
    featureId: 'F6',
    title: 'OSINT Investigation Board',
    description: 'Visual relationship mapping for entities.',
    details: [
      'Recursive Entity Relationship Mapping',
      'Visual Flow Graph (XYFlow)',
      'Entity Grouping & Tagging',
      'Social/Manual Attribution Logs'
    ],
    resources: [
      { name: 'XYFlow', url: 'https://xyflow.com', purpose: 'React-native node graph' },
      { name: 'Block Explorer APIs', url: 'https://etherscan.io', purpose: 'Entity relationship discovery' }
    ],
    technicalNotes: 'Uses React Flow for high-performance node rendering and relationship bridging.'
  },
  F7_SOCIAL: {
    featureId: 'F7',
    title: 'Social & Sentiment Monitor',
    description: 'Aggregating community health and whale activity.',
    details: [
      'Social Volume Trends (Twitter/Discord/Reddit)',
      'Bullish/Bearish Sentiment Analysis',
      'Whale Alert Transfer Monitoring',
      'Alpha Group Keyword Tracking'
    ],
    resources: [
      { name: 'Santiment API', url: 'https://santiment.net', purpose: 'Social/Dev activity metrics' },
      { name: 'LunarCrush API', url: 'https://lunarcrush.com', purpose: 'Community engagement intelligence' }
    ]
  },
  F8_HEALTH: {
    featureId: 'F8',
    title: 'API Health Panel',
    description: 'Operational status of all 25 backends.',
    details: [
      'Endpoint Uptime (UP/DOWN/DEGRADED)',
      'Request Latency (ms)',
      'HTTP Status Code Monitoring',
      'System-wide Reliability Score'
    ],
    resources: [
      { name: 'CryptoGuard Ping Service', url: '#', purpose: 'Custom uptime checks' }
    ]
  }
};
