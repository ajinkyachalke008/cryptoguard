// src/hub/osint/features/F6_Forensics/ForensicsLab.tsx
import React, { useState } from 'react';
import { HubCard } from '../../../shared/HubCard';
import { HubBadge } from '../../../shared/HubBadge';
import { Search, Code, FileText, Database, Shield, Zap, AlertTriangle } from 'lucide-react';
import { EthereumOSINTService } from '../../services/blockchain/ethereum.osint.service';

const ForensicsLab: React.FC = () => {
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [decoded, setDecoded] = useState<any>(null);

  const performDecoding = async () => {
    if (!txHash) return;
    setLoading(true);
    // In a real scenario, we'd use an ABI decoder.
    // Here we provide a high-fidelity "Laboratory View" of transaction internals.
    try {
      // Mocked decoding for demo forensics
      setTimeout(() => {
        setDecoded({
          status: 'SUCCESS',
          block: '19,234,567',
          method: 'swapExactTokensForTokens',
          interactedWith: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2
          value: '0 ETH',
          gasPrice: '24 Gwei',
          logs: [
            { event: 'Swap', params: { sender: '...', amount0In: '1000 USDT', amount1Out: '0.4 ETH' } }
          ],
          forensicFlags: ['DEX_SWAP', 'HIGH_GAS_USE', 'ROUTER_INTERACTION']
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Forensics failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Advanced Forensics Lab</h1>
          <p className="text-gray-400 text-sm italic">Deconstructing raw transaction data, event logs, and state changes</p>
        </div>
        <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-gold/10">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Transaction Hash (0x...)"
            className="bg-transparent text-sm text-white px-2 outline-none w-80"
          />
          <button 
            onClick={performDecoding} 
            disabled={loading}
            className="px-4 py-1.5 bg-gold/10 text-gold text-xs font-bold rounded-lg hover:bg-gold/20 transition-all uppercase"
          >
            {loading ? 'DECODING...' : 'DECODE TX'}
          </button>
        </div>
      </div>

      {decoded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
           <HubCard title="Execution Context" resourceId="F6_EXEC" dataSource="Ethereum_Mainnet_RPC">
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-green-500/5 p-3 rounded-lg border border-green-500/20">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</span>
                    <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">{decoded.status}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/20 rounded-lg">
                       <div className="text-[9px] text-gray-500 font-bold uppercase">Block</div>
                       <div className="text-xs font-bold text-white">{decoded.block}</div>
                    </div>
                    <div className="p-3 bg-black/20 rounded-lg">
                       <div className="text-[9px] text-gray-500 font-bold uppercase">Value</div>
                       <div className="text-xs font-bold text-white">{decoded.value}</div>
                    </div>
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Interacted With (To)</div>
                    <div className="p-3 bg-gold/5 border border-gold/10 rounded-lg text-[10px] font-mono text-gold break-all">{decoded.interactedWith}</div>
                 </div>
              </div>
           </HubCard>

           <HubCard title="Functional Payload" className="lg:col-span-2" dataSource="ABI_Decoder_V2">
             <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-gold/10 rounded-xl border border-gold/20">
                   <Code className="size-5 text-gold" />
                   <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Method Called</div>
                      <div className="text-sm font-black text-white font-mono">{decoded.method}</div>
                   </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase flex items-center tracking-[0.2em]">
                      <Database className="size-3 mr-2" /> Decoded Event Logs
                   </h4>
                   {decoded.logs.map((log: any, i: number) => (
                     <div key={i} className="text-[10px] text-white font-mono bg-white/5 p-2 rounded border border-white/5">
                        <span className="text-gold">{log.event}</span>({JSON.stringify(log.params, null, 2)})
                     </div>
                   ))}
                </div>

                <div className="flex flex-wrap gap-2">
                   {decoded.forensicFlags.map((flag: string, i: number) => (
                     <HubBadge key={i} variant="gold">
                        {flag}
                     </HubBadge>
                   ))}
                </div>
             </div>
           </HubCard>
        </div>
      ) : !loading && (
        <div className="h-96 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gold/5 rounded-2xl">
          <FileText className="size-12 mb-4 opacity-20" />
          <p className="text-sm italic uppercase tracking-[.2em] font-bold text-gold/20">Transaction Forensics Simulator Ready</p>
        </div>
      )}
    </div>
  );
};

export default ForensicsLab;
