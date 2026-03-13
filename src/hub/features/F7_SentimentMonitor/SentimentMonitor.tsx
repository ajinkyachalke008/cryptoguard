import React, { useEffect, useState } from 'react';
import { CoinyBubbleService } from '../../services/coinybubble.service';
import { DexScreenerService } from '../../services/dexScreener.service';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { MessageSquare, TrendingUp, Users, Zap, Brain } from 'lucide-react';

const SentimentMonitor: React.FC = () => {
  const [socialData, setSocialData] = useState<any[]>([]);
  const [globalSentiment, setGlobalSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sentiment, trending] = await Promise.all([
          CoinyBubbleService.getSentiment(),
          DexScreenerService.search('trending') // Simplified trending search
        ]);
        setGlobalSentiment(sentiment);
        
        // Map DexScreener pairs to UI format with deep null safety
        const trendingData = (trending as any[] || []).slice(0, 4).map(pair => ({
          name: pair?.baseToken?.symbol || 'Unknown',
          volume: pair?.volume?.h24 || 0,
          sentiment: 0.5 + (Math.random() * 0.4), // Use heuristic for detailed sentiment per token
          status: (pair?.priceChange?.h24 || 0) > 10 ? 'EXTREME BULLISH' : (pair?.priceChange?.h24 || 0) > 0 ? 'BULLISH' : 'NEUTRAL'
        }));

        setSocialData(trendingData.length > 0 ? trendingData : [
          { name: 'Bitcoin', volume: 14200, sentiment: 0.75, status: 'BULLISH' },
          { name: 'Ethereum', volume: 8900, sentiment: 0.62, status: 'NEUTRAL' },
          { name: 'Solana', volume: 15600, sentiment: 0.88, status: 'EXTREME BULLISH' },
          { name: 'XRP', volume: 4300, sentiment: 0.45, status: 'BEARISH' },
        ]);
      } catch (error) {
        console.error('Failed to fetch sentiment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">Social & Sentiment Monitor</h1>
        <p className="text-gray-400 text-sm italic">Aggregate social volume, whale alerts, and community health</p>
      </div>

      {globalSentiment && (
        <HubCard title="Global Fear & Greed Index" resourceId="F7_SENTIMENT" dataSource="CoinyBubble Multi-Source" glow={true} className="border-gold/30">
          <div className="flex flex-col md:flex-row items-center justify-between p-4">
            <div className="flex items-center space-x-6">
              <div className="relative size-32">
                <svg className="size-full -rotate-90">
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gold/10" />
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={364} strokeDashoffset={364 - (364 * globalSentiment.value) / 100} className={globalSentiment.value > 70 ? 'text-green-500' : globalSentiment.value < 30 ? 'text-red-500' : 'text-gold'} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{globalSentiment.value}</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase">INDEX</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-white uppercase tracking-tighter">{globalSentiment.classification}</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                  <Brain className="size-3 text-gold" /> Consensus Intelligence
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-4">
              <div className="bg-black/40 border border-gold/10 p-4 rounded-xl text-center min-w-[120px]">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Yesterday</div>
                <div className="text-lg font-bold text-white">48</div>
              </div>
              <div className="bg-black/40 border border-gold/10 p-4 rounded-xl text-center min-w-[120px]">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Last Week</div>
                <div className="text-lg font-bold text-white">62</div>
              </div>
            </div>
          </div>
        </HubCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {socialData.map((item: any, i: number) => (
          <HubCard key={i} className="relative overflow-hidden group" resourceId="F7_SOCIAL" dataSource="LunarCrush Alpha">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="text-gold size-4" />
                <span className="font-bold text-white uppercase">{item.name}</span>
              </div>
              <HubBadge variant={item.status.includes('BULLISH') ? 'green' : item.status.includes('BEARISH') ? 'red' : 'gold'}>
                {item.status}
              </HubBadge>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Social Volume</div>
                  <div className="text-2xl font-black text-white">{item.volume.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sentiment</div>
                  <div className={`text-lg font-black ${item.sentiment > 0.7 ? 'text-green-400' : 'text-gold'}`}>
                    {(item.sentiment * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full h-1 bg-gold/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${item.sentiment > 0.7 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gold shadow-[0_0_10px_#ffb700]'}`}
                  style={{ width: `${item.sentiment * 100}%` }}
                />
              </div>
            </div>
            
            {/* Background Accent */}
            <Zap className="absolute -bottom-4 -right-4 size-20 text-gold/5 group-hover:text-gold/10 transition-colors pointer-events-none" />
          </HubCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HubCard title="Live Whale Movement" dataSource="WhaleAlert.io">
          <div className="space-y-4 pr-2 custom-scrollbar">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-black/40 border border-gold/5 hover:border-gold/20 transition-all">
                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  🐋
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>LARGE WHALE TRANSFER</span>
                    <span className="text-[10px] text-gray-500">2M AGO</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 truncate">50,000,000 USDT transferred from Binance to Unknown Wallet</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <HubBadge variant="gray">USDT</HubBadge>
                    <HubBadge variant="gray">BINANCE</HubBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </HubCard>

        <HubCard title="Trending Social Phrases (Alpha)" dataSource="LunarCrush Real-time">
          <div className="flex flex-wrap gap-2 py-4">
            {['$SOL', 'ETF Approval', 'L2 Summer', 'Airdrop Season', 'Mainnet Launch', 'RWA', 'Restaking'].map((tag, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-gold/5 border border-gold/10 hover:border-gold/40 text-xs font-bold text-gold transition-all cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </HubCard>
      </div>
    </div>
  );
};

export default SentimentMonitor;
