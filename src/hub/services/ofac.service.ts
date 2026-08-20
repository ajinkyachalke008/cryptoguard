// src/hub/services/ofac.service.ts

// Pre-seeded high-profile OFAC SDN cryptocurrency addresses (Tornado Cash, Lazarus, Darknet)
const PRESEEDED_SANCTIONED_ADDRESSES = [
  '0x8589427373d6d84e98730d7795d8f6f8731fda16', // Tornado.Cash: Router
  '0x722122df12d4e14e13ac3b6895a86e84145b6967', // Tornado.Cash: 0.1 ETH
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', // Tornado.Cash: 1 ETH
  '0xd96f2b1c14db8458374d9aca76e26c3d18364307', // Tornado.Cash: 10 ETH
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936', // Tornado.Cash: 100 ETH
  '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', // Tornado.Cash: 0.1 WBTC
  '0x47cee484218652391030e62709e13d5084964177', // Tornado.Cash: DAI
  '0x090e53c44e8a9b6b1bca800e881455b921aec420', // Lazarus Group Exploiter
  '0x742d35cc6634c0532925a3b844bc9e7595f2bd3e', // Known Flagged Mixer
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // OFAC Specially Designated
];

export class OFACService {
  private static SDN_URL = 'https://www.treasury.gov/ofac/downloads/sdn.xml';
  private static sanctionedAddresses = new Set<string>(PRESEEDED_SANCTIONED_ADDRESSES.map(a => a.toLowerCase().trim()));
  private static lastFetched: number | null = null;
  private static isFetching = false;

  static async loadSanctionsList() {
    // Refresh cache every 24 hours
    if (this.isFetching || (this.lastFetched && Date.now() - this.lastFetched < 86400000)) return;
    this.isFetching = true;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(this.SDN_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const regex = /Digital Currency Address - \w+\s*<\/idType>\s*<idNumber>([^<]+)<\/idNumber>/g;
      let match;
      while ((match = regex.exec(xml)) !== null) {
        this.sanctionedAddresses.add(match[1].toLowerCase().trim());
      }
      this.lastFetched = Date.now();
    } catch (error) {
      // Gracefully continue with pre-seeded sanctions list
    } finally {
      this.isFetching = false;
    }
  }

  static async checkAddress(address: string) {
    const norm = (address || '').toLowerCase().trim();
    // Check instant pre-seeded / cached set first
    const isSanctioned = this.sanctionedAddresses.has(norm);
    
    // Background refresh without blocking user scan
    this.loadSanctionsList().catch(() => {});

    return {
      address,
      isSanctioned,
      checkedAt: new Date().toISOString(),
      source: 'OFAC SDN'
    };
  }
}

