
import React, { memo } from 'react';
import { NodeStatus } from '../../types';
import { STYLES } from '../../constants';
// Corrected import path from ./NodeAnchors to ./NodeAnchor
import { NodeAnchor } from './NodeAnchor';

interface TextNodeProps {
  nodeId?: string;
  data: { title: string; content: string };
  status: NodeStatus;
  onUpdate?: (data: Partial<{ title: string; content: string }>) => void;
  onPortPointerDown?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
  onPortPointerMove?: (e: React.PointerEvent) => void;
  onPortPointerUp?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
}

export const TextNode = memo(({ 
  nodeId = '', 
  data, 
  status, 
  onUpdate,
  onPortPointerDown,
  onPortPointerMove,
  onPortPointerUp
}: TextNodeProps) => {
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
      
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D2FF] shadow-[0_0_8px_#00D2FF]" />
          <input 
            type="text" 
            value={data.title} 
            onChange={(e) => onUpdate?.({ title: e.target.value })}
            className="bg-transparent text-xs font-bold text-[#E5E4E2] focus:outline-none w-full placeholder-white/20" 
            placeholder="Text Title" 
          />
        </div>
        <textarea 
          value={data.content} 
          onChange={(e) => onUpdate?.({ content: e.target.value })}
          className="w-full h-32 bg-black/20 border border-white/5 rounded p-2 text-[11px] text-[#E5E4E2]/70 focus:outline-none focus:border-[#00D2FF]/30 transition-all resize-none placeholder-white/10 scrollbar-hide" 
          placeholder="Enter text payload..." 
        />
      </div>
      <div className="h-0.5 w-full bg-[#00D2FF]/10 overflow-hidden">
         <div className="h-full bg-[#00D2FF]/40 w-full animate-pulse" />
      </div>
    </div>
  );
});
