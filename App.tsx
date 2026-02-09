import React, { useState, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { NodeControls } from './components/NodeControls';
import { useCanvas } from './hooks/useCanvas';
import { AppNode, NodeType, NodeStatus, Edge, Position } from './types';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<AppNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const canvas = useCanvas();

  const propagateData = useCallback((sourceId: string, sourceData: any) => {
    setNodes(prevNodes => {
      // Find all target nodes connected to this source
      const connectedTargetIds = edges
        .filter(e => e.sourceNodeId === sourceId)
        .map(e => e.targetNodeId);

      if (connectedTargetIds.length === 0) return prevNodes;

      return prevNodes.map(node => {
        if (connectedTargetIds.includes(node.id)) {
          // Sync logic: source signals flow into connected targets
          const updatedData = { ...node.data };
          // If target is visual (Shot/Image/Video), it listens for content/title updates
          if (node.type === NodeType.SHOT || node.type === NodeType.IMAGE || node.type === NodeType.VIDEO) {
            updatedData.prompt = sourceData.content || sourceData.title || updatedData.prompt;
          }
          // If target is text-based, sync title
          if (node.type === NodeType.TEXT || node.type === NodeType.SCRIPT) {
            updatedData.title = sourceData.title || updatedData.title;
          }
          return { ...node, data: updatedData };
        }
        return node;
      });
    });
  }, [edges]);

  const handleUpdateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes(prev => {
      const updated = prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n);
      const node = updated.find(n => n.id === nodeId);
      if (node) propagateData(nodeId, node.data);
      return updated;
    });
  }, [propagateData]);

  const addNewNode = (type: NodeType) => {
    const id = `node-${Date.now()}`;
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    
    const currentScale = canvas.scale.get();
    const currentX = canvas.x.get();
    const currentY = canvas.y.get();
    
    const canvasX = (screenCenterX - currentX) / currentScale;
    const canvasY = (screenCenterY - currentY) / currentScale;

    const newNode: AppNode = {
      id,
      type,
      position: { x: canvasX, y: canvasY },
      status: NodeStatus.IDLE,
      data: type === NodeType.TEXT 
        ? { title: 'New Entry', content: '' } 
        : type === NodeType.IMAGE 
          ? { title: 'Image Asset', imageUrl: '' }
          : type === NodeType.VIDEO
            ? { title: 'Video Stream', videoUrl: '' }
            : type === NodeType.SCRIPT
              ? { title: 'Scene script', content: '' }
              : type === NodeType.SHOT
                ? { prompt: '', cameraAngle: 'Eye Level', lighting: 'Natural' }
                : { title: `Asset (${type})` }
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId));
  }, []);

  const handleNodeMove = useCallback((nodeId: string, newPosition: Position) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, position: newPosition } : node
      )
    );
  }, []);

  const handleConnect = useCallback((sourceId: string, targetId: string) => {
    const exists = edges.find(e => e.sourceNodeId === sourceId && e.targetNodeId === targetId);
    if (exists || sourceId === targetId) return;

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId
    };

    setEdges(prev => [...prev, newEdge]);

    // Signal burst: propagate immediately on connection
    const sourceNode = nodes.find(n => n.id === sourceId);
    if (sourceNode) {
      propagateData(sourceId, sourceNode.data);
    }
  }, [edges, nodes, propagateData]);

  return (
    <div className="relative w-screen h-screen bg-[#121213] overflow-hidden selection:bg-[#00D2FF]/30">
      <nav className="absolute top-0 left-0 w-full h-16 bg-[#121213]/80 backdrop-blur-md border-b border-white/5 z-[100] flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00D2FF] flex items-center justify-center shadow-[0_0_20px_#00D2FF99]">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
          <span className="text-xl font-black tracking-widest text-[#E5E4E2] flex items-center uppercase font-mono group cursor-default">
            <span className="group-hover:text-[#00D2FF] transition-colors drop-shadow-[0_0_12px_rgba(0,210,255,0.6)]">有光</span>
            <span className="text-[#00D2FF]/70 font-thin ml-2 text-[10px] tracking-[0.4em] italic opacity-50">Lightworks</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse"></span>
            ACTIVE SIGNAL ENGINE
          </div>
          <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#E5E4E2] hover:bg-white/10 transition-all hover:border-[#00D2FF]/40 active:scale-95 tracking-[0.1em]">
            EXPORT_MANIFEST
          </button>
        </div>
      </nav>

      <main className="w-full h-full pt-16">
        <Canvas 
          nodes={nodes} 
          edges={edges} 
          scale={canvas.scale}
          x={canvas.x}
          y={canvas.y}
          viewportRef={canvas.viewportRef}
          handleZoom={canvas.handleZoom}
          handlePan={canvas.handlePan}
          onNodeMove={handleNodeMove}
          onConnect={handleConnect}
          onDeleteNode={deleteNode}
          onUpdateNodeData={handleUpdateNodeData}
        />
      </main>

      <NodeControls onAddNode={addNewNode} />

      <div className="absolute bottom-8 right-8 w-60 p-4 bg-[#1C1C1E]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl z-40 pointer-events-none group">
        <h4 className="text-[9px] font-mono text-white/20 uppercase mb-3 tracking-[0.3em] font-bold">Workspace Protocol</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span className="font-mono">CTRL + SCROLL</span>
            <span className="text-[#00D2FF]/70">ZOOM</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span className="font-mono">MIDDLE CLICK</span>
            <span className="text-[#00D2FF]/70">PAN</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span className="font-mono">DRAG NODE</span>
            <span className="text-[#00D2FF]/70">MOVE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span className="font-mono">DRAG PORT</span>
            <span className="text-[#00D2FF]/70">CONNECT</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center">
           <span className="text-[8px] font-mono text-white/10 italic">OPTIMIZED_FOR_SIGNAL_FLOW</span>
        </div>
      </div>
    </div>
  );
};

export default App;