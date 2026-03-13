import React, { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { HubCard } from '../../shared/HubCard';
import { HubBadge } from '../../shared/HubBadge';
import { Search, Database, Share2, PlusCircle } from 'lucide-react';

const initialNodes = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Target Wallet' }, type: 'input', style: { background: '#000', color: '#ffb700', border: '1px solid #ffb700' } },
];
const initialEdges: any[] = [];

const OSINTBoard: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [inputVal, setInputVal] = useState('');

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addEntity = () => {
    if (!inputVal) return;
    const newNode = {
      id: (nodes.length + 1).toString(),
      data: { label: inputVal },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      style: { background: '#000', color: '#fff', border: '1px solid #333' }
    };
    setNodes((nds) => nds.concat(newNode as any));
    setInputVal('');
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold tracking-tighter uppercase">OSINT Investigation Board</h1>
          <p className="text-gray-400 text-sm italic">Visual link analysis and entity relationship mapping</p>
        </div>
        <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-gold/10">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Entity Label..."
            className="bg-transparent text-sm text-white px-2 outline-none w-40"
          />
          <button onClick={addEntity} className="text-gold hover:text-white transition-colors">
            <PlusCircle className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 border border-gold/10 rounded-2xl overflow-hidden bg-[#050505] relative shadow-inner">
        <HubCard className="absolute top-4 right-4 z-40 w-64 bg-black/80 backdrop-blur-md" title="OSINT Intelligence" resourceId="F6_OSINT" dataSource="Entity_Graph_Indexer_v2">
          <p className="text-[10px] text-gray-400 italic">Tracking entity movements and social signals in real-time space.</p>
        </HubCard>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          colorMode="dark"
        >
          <Background color="#ffb700" gap={20} size={1} />
          <Controls className="bg-black border border-gold/20" />
          <MiniMap 
            nodeColor={(node: any) => node.type === 'input' ? '#ffb700' : '#333'}
            maskColor="rgba(0,0,0,0.5)"
            className="rounded-lg border border-gold/10 !bg-black"
          />
        </ReactFlow>
        
        {/* Hub Legend */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-2">
          <div className="flex items-center space-x-2">
            <div className="size-3 rounded-full bg-gold shadow-[0_0_5px_#ffb700]" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Entity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="size-3 rounded-full bg-gray-600" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Related Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSINTBoard;
