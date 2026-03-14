// src/hub/osint/osint.constants.ts

export const OSINT_CONFIG = {
  REFRESH_INTERVALS: {
    TRACE: 30000,
    FLOWS: 60000,
    SIGNALS: 120000,
  },
  DEFAULT_DEPTH: 3,
};

export const SANCTION_PROGRAMS = [
  'SDGT', 'NPWMD', 'CYBER', 'DPRK', 'RUSSIA', 'IRAN', 'CUBA'
];

export const OSINT_API_ENDPOINTS = {
  BLOCKSTREAM: 'https://blockstream.info/api',
  BLOCKCHAIN_INFO: 'https://blockchain.info',
  ETHERSCAN: 'https://api.etherscan.io/api',
  SOLSCAN: 'https://public-api.solscan.io',
  BLOCKCHAIR: 'https://api.blockchair.com',
  WALLET_EXPLORER: 'https://www.walletexplorer.com/api/1',
  RANSOMWHERE: 'https://api.ransomwhe.re',
  GOPLUS: 'https://api.gopluslabs.io/api/v1',
  DEFI_LLAMA: 'https://api.llama.fi',
};

// Common Labels for manual fallback or key entities
export const KNOWN_ENTITIES: Record<string, { name: string; type: string }> = {
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045': { name: 'Vitalik Buterin (Whale)', type: 'WALLET' },
  '0x0000000000000000000000000000000000000000': { name: 'Null Address / Burn', type: 'WALLET' },
  '0x28C6c06290CC322016463714888EE94142643E0E': { name: 'Binance: Hot Wallet', type: 'WALLET' },
  '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B': { name: 'VB 2: Secondary', type: 'WALLET' },
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e': { name: 'Bitfinex: Hot Wallet', type: 'WALLET' },
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': { name: 'Satoshi Nakamoto (Genesis)', type: 'WALLET' },
  'SRMuS5PPe3oz9Z9v7398V9W2C9rG89c25': { name: 'Serum DEX: Project Serum', type: 'WALLET' },
  '0x1111111254fb6c44bac0bed2854e76f90643097d': { name: '1inch v4: Router', type: 'CONTRACT' },
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap v2: Router', type: 'CONTRACT' },
  '0x83e295964af9d7eed9e03e53415d37aa96045145': { name: 'OFAC: Sanctioned Entity', type: 'WALLET' },
  // Add more as needed
};
