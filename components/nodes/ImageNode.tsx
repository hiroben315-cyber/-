
import React, { memo } from 'react';
import { NodeStatus } from '../../types';
import { STYLES } from '../../constants';
// Corrected import path from ./NodeAnchors to ./NodeAnchor
import { NodeAnchor } from './NodeAnchor';

interface ImageNodeProps {
  // Added nodeId and port handlers to fix missing prop errors and enable connectivity
  nodeId: string;
  data: { title: string; imageUrl?: string };
  status: NodeStatus;
  onPortPointerDown?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
  onPortPointerMove?: (e: React.PointerEvent) => void;
  onPortPointerUp?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
}

export const ImageNode = memo(({ 
  nodeId, 
  data, 
  status,
  onPortPointerDown,
  onPortPointerMove,
  onPortPointerUp
}: ImageNodeProps) => {
  return (
    <div className={`${STYLES.NODE_CONTAINER} w-64 relative group`}>
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
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#E5E4E2]/60 uppercase tracking-widest">{data.title || 'Image Asset'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#00D2FF]/50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      </div>
      <div className="aspect-video bg-black/40 relative flex items-center justify-center overflow-hidden">
        {data.imageUrl ? (
          <img src={data.imageUrl} className="w-full h-full object-cover" alt="Node Asset" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" y1="5" x2="22" y2="5"/><line x1="19" y1="2" x2="19" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <span className="text-[9px] font-mono tracking-tighter">NO ASSET FOUND</span>
          </div>
        )}
      </div>
    </div>
  );
});
