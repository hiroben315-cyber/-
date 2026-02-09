import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, MotionValue, useTransform, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { GRID_SETTINGS } from '../constants';
import { AppNode, NodeType, Edge, Position } from '../types';
import { ScriptNode } from './nodes/ScriptNode';
import { ShotNode } from './nodes/ShotNode';
import { TextNode } from './nodes/TextNode';
import { ImageNode } from './nodes/ImageNode';
import { VideoNode } from './nodes/VideoNode';

interface CanvasProps {
  nodes: AppNode[];
  edges: Edge[];
  scale: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  handleZoom: (e: React.WheelEvent) => void;
  handlePan: (dx: number, dy: number) => void;
  onNodeMove: (nodeId: string, newPosition: Position) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNodeData?: (nodeId: string, data: any) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  nodes, 
  edges, 
  scale, 
  x, 
  y, 
  viewportRef, 
  handleZoom, 
  handlePan,
  onNodeMove,
  onConnect,
  onDeleteNode,
  onUpdateNodeData
}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [activeConnectingId, setActiveConnectingId] = useState<string | null>(null);
  
  const tempLineX = useMotionValue(0);
  const tempLineY = useMotionValue(0);

  const dragRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    initialNodePos: Position;
  } | null>(null);
  
  const [displayScale, setDisplayScale] = useState(scale.get());
  useMotionValueEvent(scale, "change", (latest) => setDisplayScale(latest));

  const backgroundSize = useTransform(scale, (s) => `${GRID_SETTINGS.SIZE * s}px ${GRID_SETTINGS.SIZE * s}px`);
  const backgroundPosition = useTransform([x, y], ([vx, vy]) => `${vx}px ${vy}px`);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheelNative = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        handleZoom(e as unknown as React.WheelEvent);
      }
    };

    viewport.addEventListener('wheel', onWheelNative, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheelNative);
  }, [handleZoom, viewportRef]);

  const getNodeWidth = (type: NodeType) => {
    switch(type) {
      case NodeType.SCRIPT: return 384;
      case NodeType.SHOT: return 288;
      case NodeType.VIDEO: return 288;
      default: return 256;
    }
  };

  const getPortPosition = (node: AppNode, type: 'input' | 'output'): Position => {
    const width = getNodeWidth(node.type);
    const offsetX = type === 'input' ? -width / 2 : width / 2;
    return {
      x: node.position.x + offsetX,
      y: node.position.y
    };
  };

  const handlePortPointerDown = (e: React.PointerEvent, nodeId: string, type: 'input' | 'output') => {
    if (type === 'output') {
      setActiveConnectingId(nodeId);
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const s = scale.get();
        const vx = x.get();
        const vy = y.get();
        // Mouse coordinate normalization to canvas space
        tempLineX.set((e.clientX - rect.left - vx) / s);
        tempLineY.set((e.clientY - rect.top - vy) / s);
      }
    }
  };

  const handlePortPointerMove = (e: React.PointerEvent) => {
    if (!activeConnectingId) return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (rect) {
      const s = scale.get();
      const vx = x.get();
      const vy = y.get();
      // Precise normalization formula: (ClientPos - ViewportOffset - PanOffset) / Scale
      tempLineX.set((e.clientX - rect.left - vx) / s);
      tempLineY.set((e.clientY - rect.top - vy) / s);
    }
  };

  const handlePortPointerUp = (e: React.PointerEvent, nodeId: string, type: 'input' | 'output') => {
    if (!activeConnectingId) return;

    const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
    const targetPort = elementUnderPointer?.closest('[data-port="true"]');
    
    if (targetPort) {
      const targetId = targetPort.getAttribute('data-node-id');
      const targetType = targetPort.getAttribute('data-port-type');
      
      if (targetId && targetType === 'input' && targetId !== activeConnectingId) {
        onConnect(activeConnectingId, targetId);
      }
    }

    setActiveConnectingId(null);
  };

  const handleNodePointerDown = (e: React.PointerEvent, node: AppNode) => {
    const target = e.target as HTMLElement;
    if (target.closest('.nodrag') || target.closest('[data-port="true"]')) return;
    
    if (e.button !== 0) return;

    e.stopPropagation();
    const container = e.currentTarget as HTMLDivElement;
    container.setPointerCapture(e.pointerId);
    
    dragRef.current = {
      nodeId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodePos: { ...node.position }
    };
  };

  const handleNodePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { nodeId, startX, startY, initialNodePos } = dragRef.current;
    const currentScale = scale.get();
    const deltaX = (e.clientX - startX) / currentScale;
    const deltaY = (e.clientY - startY) / currentScale;
    const newX = initialNodePos.x + deltaX;
    const newY = initialNodePos.y + deltaY;

    const el = document.getElementById(nodeId);
    if (el) {
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    }
  };

  const handleNodePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { nodeId, startX, startY, initialNodePos } = dragRef.current;
    const currentScale = scale.get();
    const finalX = initialNodePos.x + (e.clientX - startX) / currentScale;
    const finalY = initialNodePos.y + (e.clientY - startY) / currentScale;
    onNodeMove(nodeId, { x: finalX, y: finalY });
    dragRef.current = null;
  };

  const renderEdge = (edge: Edge) => {
    const fromNode = nodes.find(n => n.id === edge.sourceNodeId);
    const toNode = nodes.find(n => n.id === edge.targetNodeId);
    if (!fromNode || !toNode) return null;

    const start = getPortPosition(fromNode, 'output');
    const end = getPortPosition(toNode, 'input');
    
    const cpX = Math.max(Math.abs(end.x - start.x) * 0.5, 50);
    const pathData = `M ${start.x} ${start.y} C ${start.x + cpX} ${start.y}, ${end.x - cpX} ${end.y}, ${end.x} ${end.y}`;

    return (
      <g key={edge.id} className="group pointer-events-none">
        <path 
          d={pathData} 
          fill="none" 
          stroke="rgba(0, 210, 255, 0.4)" 
          strokeWidth="4" 
          filter="url(#titaniumGlow)"
          className="opacity-40 group-hover:opacity-100 transition-opacity"
        />
        <path 
          d={pathData} 
          fill="none" 
          stroke="url(#lineGradient)" 
          strokeWidth="2.5" 
          strokeDasharray="10, 5"
          style={{ animation: 'dashFlow 2s linear infinite' }}
        />
        <circle cx={start.x} cy={start.y} r="4" fill="#00D2FF" filter="url(#titaniumGlow)" />
        <circle cx={end.x} cy={end.y} r="4" fill="#00D2FF" filter="url(#titaniumGlow)" />
      </g>
    );
  };

  return (
    <div 
      ref={viewportRef}
      className="relative w-full h-full overflow-hidden bg-[#121213] cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          setIsPanning(true);
        }
      }}
      onPointerMove={(e) => {
        if (isPanning) handlePan(e.movementX, e.movementY);
      }}
      onPointerUp={(e) => {
        if (e.button === 1) setIsPanning(false);
      }}
      onMouseDown={(e) => {
        if (e.button === 1) e.preventDefault();
      }}
    >
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(${GRID_SETTINGS.DOT_COLOR} 1.5px, transparent 1.5px)`,
          backgroundSize,
          backgroundPosition,
        }}
      />

      <motion.div 
        className="absolute origin-top-left z-10"
        style={{ x, y, scale }}
      >
        {/* Connection Layer - Elevated to z-9999 for visual debug and peak visibility */}
        <svg 
          className="absolute inset-0 pointer-events-none overflow-visible w-full h-full"
          style={{ zIndex: 9999 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D2FF" />
              <stop offset="100%" stopColor="#E5E4E2" />
            </linearGradient>
            <filter id="titaniumGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <style>{`
              @keyframes dashFlow { to { stroke-dashoffset: -15; } }
              @keyframes tempDash { to { stroke-dashoffset: -10; } }
            `}</style>
          </defs>
          
          {edges.map(renderEdge)}

          {activeConnectingId && (
            <TempLine 
              sourceNode={nodes.find(n => n.id === activeConnectingId)!} 
              targetX={tempLineX}
              targetY={tempLineY}
            />
          )}
        </svg>

        <div className="relative z-20">
          {nodes.map((node) => (
            <div
              id={node.id}
              key={node.id}
              onPointerDown={(e) => handleNodePointerDown(e, node)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={handleNodePointerUp}
              data-drag-block="true"
              className="absolute pointer-events-auto cursor-grab active:cursor-grabbing hover:z-[60] transition-shadow duration-300"
              style={{ 
                left: node.position.x, 
                top: node.position.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={`group relative active:scale-[1.01] transition-transform duration-200 ${activeConnectingId === node.id ? 'ring-2 ring-[#00D2FF] rounded-xl' : ''}`}>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:border-red-500/50 z-[100] pointer-events-auto nodrag shadow-xl"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-red-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                {node.type === NodeType.SCRIPT && (
                  <ScriptNode 
                    nodeId={node.id}
                    data={node.data} 
                    status={node.status} 
                    onUpdate={(d) => onUpdateNodeData?.(node.id, d)}
                    onPortPointerDown={handlePortPointerDown}
                    onPortPointerMove={handlePortPointerMove}
                    onPortPointerUp={handlePortPointerUp}
                  />
                )}
                {node.type === NodeType.SHOT && (
                  <ShotNode 
                    nodeId={node.id}
                    data={node.data} 
                    status={node.status} 
                    onPortPointerDown={handlePortPointerDown}
                    onPortPointerMove={handlePortPointerMove}
                    onPortPointerUp={handlePortPointerUp}
                  />
                )}
                {node.type === NodeType.TEXT && (
                  <TextNode 
                    nodeId={node.id}
                    data={node.data} 
                    status={node.status} 
                    onUpdate={(d) => onUpdateNodeData?.(node.id, d)}
                    onPortPointerDown={handlePortPointerDown}
                    onPortPointerMove={handlePortPointerMove}
                    onPortPointerUp={handlePortPointerUp}
                  />
                )}
                {node.type === NodeType.IMAGE && (
                  <ImageNode 
                    nodeId={node.id}
                    data={node.data} 
                    status={node.status} 
                    onPortPointerDown={handlePortPointerDown}
                    onPortPointerMove={handlePortPointerMove}
                    onPortPointerUp={handlePortPointerUp}
                  />
                )}
                {node.type === NodeType.VIDEO && (
                  <VideoNode 
                    nodeId={node.id}
                    data={node.data} 
                    status={node.status} 
                    onPortPointerDown={handlePortPointerDown}
                    onPortPointerMove={handlePortPointerMove}
                    onPortPointerUp={handlePortPointerUp}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-[#1C1C1E]/90 backdrop-blur-2xl border border-slate-700/50 p-2.5 rounded-2xl shadow-2xl pointer-events-none text-white select-none z-[70]">
        <div className="flex items-center gap-3 px-3 py-1.5 border-r border-white/10">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Scale</span>
          <span className="text-xs font-bold text-[#00D2FF]">{Math.round(displayScale * 100)}%</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-1.5 border-r border-white/10">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Nodes</span>
          <span className="text-xs font-bold text-[#E5E4E2]">{nodes.length}</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-1.5">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Links</span>
          <span className="text-xs font-bold text-[#00D2FF]">{edges.length}</span>
        </div>
      </div>
    </div>
  );
};

const TempLine = ({ sourceNode, targetX, targetY }: { sourceNode: AppNode, targetX: MotionValue<number>, targetY: MotionValue<number> }) => {
  const getNodeWidth = (type: NodeType) => {
    switch(type) {
      case NodeType.SCRIPT: return 384;
      case NodeType.SHOT: return 288;
      case NodeType.VIDEO: return 288;
      default: return 256;
    }
  };

  const start = {
    x: sourceNode.position.x + getNodeWidth(sourceNode.type) / 2,
    y: sourceNode.position.y
  };

  const path = useTransform([targetX, targetY], ([tx, ty]) => {
    const cpX = Math.max(Math.abs(tx - start.x) * 0.5, 50);
    return `M ${start.x} ${start.y} C ${start.x + cpX} ${start.y}, ${tx - cpX} ${ty}, ${tx} ${ty}`;
  });

  return (
    <motion.path 
      d={path} 
      fill="none" 
      stroke="#00FFFF" 
      strokeWidth="4" 
      strokeDasharray="8,5" 
      className="opacity-100"
      style={{ 
        animation: 'tempDash 0.2s linear infinite',
        filter: 'drop-shadow(0 0 12px #00FFFF)'
      }}
    />
  );
};