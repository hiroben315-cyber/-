
import React, { memo } from 'react';
import { NodeStatus } from '../../types';
import { STYLES } from '../../constants';
// Corrected import path from ./NodeAnchors to ./NodeAnchor
import { NodeAnchor } from './NodeAnchor';

interface VideoNodeProps {
  // Added nodeId and port handlers to fix missing prop errors and enable connectivity
  nodeId: string;
  data: { title: string; videoUrl?: string };
  status: NodeStatus;
  onPortPointerDown?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
  onPortPointerMove?: (e: React.PointerEvent) => void;
  onPortPointerUp?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
}

export const VideoNode = memo(({ 
  nodeId, 
  data, 
  status,
  onPortPointerDown,
  onPortPointerMove,
  onPortPointerUp
}: VideoNodeProps) => {
  return (
    <div className={`${STYLES.NODE_CONTAINER} w-72 relative group`}>
      {/* Remove unsupported onPointerMove and onPointerUp props to match AnchorProps interface */}
      <NodeAnchor 
        type="input" 
        nodeId={nodeId} 
        onPointerDown={onPortPointerDown}
      />
      <NodeAnchor 
        type="output" 
        nodeId={nodeId} 
        onPointerDown={onPortPointerDown}
      />
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
        <span className="text-[10px] font-bold text-[#00D2FF] uppercase tracking-widest">{data.title || 'Video Stream'}</span>
        <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /></div>
      </div>
      <div className="aspect-video bg-black flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00D2FF]/20 group-hover:border-[#00D2FF]/40 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#E5E4E2] translate-x-0.5"><path d="M5 3l14 9-14 9V3z"/></svg>
        </button>
        <div className="absolute bottom-3 left-3 right-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#00D2FF] w-1/3 shadow-[0_0_8px_#00D2FF]" />
        </div>
      </div>
      <div className="p-2 flex justify-between items-center text-[9px] font-mono text-white/30 px-4">
        <span>00:12:44</span>
        <span>REC_ACTIVE</span>
      </div>
    </div>
  );
});
