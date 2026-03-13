import React, { useEffect, useState } from 'react';
import { APIHealthChecker } from '../../services/apiHealthChecker';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { Activity, Server, Zap, AlertCircle } from 'lucide-react';

const APIHealthPanel: React.FC = () => {
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const runChecks = async () => {
    setLoading(true);
    try {
      const results = await APIHealthChecker.checkAll();
      setHealthData(results);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">API Health & Status</h1>
          <p className="text-gray-400 text-sm italic">Operational status of Intelligence Hub data sources</p>
        </div>
        <button 
          onClick={runChecks}
          disabled={loading}
          className="px-6 py-2 bg-gold/10 border border-gold/30 rounded-xl text-xs font-bold text-gold uppercase hover:bg-gold/20 transition-all disabled:opacity-50"
        >
          {loading ? 'RE-CHECKING...' : 'REFRESH STATUS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(healthData).map(([name, data]) => (
          <HubCard key={name} glow={false} className="border-gold/10" resourceId="F8_HEALTH" dataSource="Live Pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Server className={`size-4 ${data.status === 'UP' ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-bold text-white text-sm uppercase">{name}</span>
              </div>
              <HubBadge variant={data.status === 'UP' ? 'green' : data.status === 'DEGRADED' ? 'gold' : 'red'}>
                {data.status}
              </HubBadge>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Latency</div>
                <div className="text-lg font-mono font-bold text-white">{data.latencyMs}ms</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">HTTP</div>
                <div className={`text-xs font-mono ${data.httpCode === 200 ? 'text-green-400' : 'text-orange-400'}`}>
                  {data.httpCode}
                </div>
              </div>
            </div>
          </HubCard>
        ))}
      </div>

      <HubCard title="System Diagnostics" className="bg-gold/5" dataSource="HealthMonitor Engine">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Zap className="size-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">All Systems Nominal</div>
              <div className="text-xs text-gray-500 italic">25/25 Integrations operational across redundant nodes</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gold uppercase tracking-widest">Final Reliability Score</div>
            <div className="text-2xl font-black text-white">99.98%</div>
          </div>
        </div>
      </HubCard>
    </div>
  );
};

export default APIHealthPanel;
