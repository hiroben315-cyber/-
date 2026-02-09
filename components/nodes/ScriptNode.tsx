
import React, { memo } from 'react';
import { ScriptData, NodeStatus } from '../../types';
import { STYLES } from '../../constants';
// Corrected import path from ./NodeAnchors to ./NodeAnchor
import { NodeAnchor } from './NodeAnchor';

interface ScriptNodeProps {
  // Added nodeId and port handlers to fix missing prop errors and enable connectivity
  nodeId: string;
  data: ScriptData;
  status: NodeStatus;
  onUpdate?: (data: Partial<ScriptData>) => void;
  onPortPointerDown?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
  onPortPointerMove?: (e: React.PointerEvent) => void;
  onPortPointerUp?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
}

export const ScriptNode = memo(({ 
  nodeId, 
  data, 
  status, 
  onUpdate,
  onPortPointerDown,
  onPortPointerMove,
  onPortPointerUp
}: ScriptNodeProps) => {
  return (
    <div className={`${STYLES.NODE_CONTAINER} w-96 relative group`}>
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
      <div className="p-1 h-1 w-full bg-[#1C1C1E]">
        {status === NodeStatus.LOADING && (
          <div className="h-full bg-[#00D2FF] animate-pulse rounded-full" style={{ width: '60%' }} />
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase text-[#E5E4E2]/60 font-mono">Script Master</h3>
          <div className="px-2 py-0.5 rounded border border-[#00D2FF]/30 text-[10px] text-[#00D2FF]">PROMPT ENGINE</div>
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            value={data.title} 
            onChange={(e) => onUpdate?.({ title: e.target.value })}
            placeholder="Scene Title..." 
            className="w-full bg-black/30 border border-white/5 rounded-md px-3 py-2 text-[#E5E4E2] focus:outline-none focus:border-[#00D2FF]/50 transition-colors" 
          />
          <textarea 
            value={data.content} 
            onChange={(e) => onUpdate?.({ content: e.target.value })}
            className="w-full h-48 bg-black/30 border border-white/5 rounded-md px-3 py-2 text-[#E5E4E2]/80 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#00D2FF]/50 transition-colors" 
            placeholder="Write the future..." 
          />
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#00D2FF]/10 border border-[#00D2FF]/30 rounded-lg text-[#00D2FF] text-xs font-semibold hover:bg-[#00D2FF]/20 transition-all active:scale-95">
            <span>GENERATE SHOTS</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2 9 9-9 9"/><path d="M3 11h19"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
});
