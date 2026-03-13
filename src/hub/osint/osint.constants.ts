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
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045': { name: 'Vitalik Buterin', type: 'whale' },
  '0x0000000000000000000000000000000000000000': { name: 'Null Address / Burn', type: 'protocol' },
  // Add more as needed
};
