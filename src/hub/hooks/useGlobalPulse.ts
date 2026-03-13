// src/hub/hooks/useGlobalPulse.ts
import { useState, useEffect } from 'react';

export interface PulseFlow {
  id: string;
  type: 'bridge' | 'cex_inflow' | 'cex_outflow';
  source: { id: string; lat: number; lng: number; label: string };
  target: { id: string; lat: number; lng: number; label: string };
  volumeUSD24h: number;
}

export const useGlobalPulse = () => {
  const [flows, setFlows] = useState<PulseFlow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        // Fetching real bridge summary from DeFiLlama
        const res = await fetch('https://bridges.llama.fi/summary');
        const data = await res.json();
        
        // Map top bridges to flow arcs
        const topBridges = data.bridges.slice(0, 5).map((b: any, i: number) => ({
          id: b.id,
          type: 'bridge',
          source: { 
            id: 'eth', 
            lat: 40 + Math.random() * 10, 
            lng: -70 - Math.random() * 20, 
            label: 'Ethereum' 
          },
          target: { 
            id: b.displayName, 
            lat: Math.random() * 140 - 70, 
            lng: Math.random() * 300 - 150, 
            label: b.displayName 
          },
          volumeUSD24h: b.lastDayVolume || 0
        }));

        setFlows(topBridges as PulseFlow[]);
      } catch (error) {
        console.error('Pulse fetch failed, using fallback', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
    const interval = setInterval(fetchFlows, 60000); // 1 minute heartbeat
    return () => clearInterval(interval);
  }, []);

  return { flows, loading };
};
