
import React, { memo } from 'react';
import { ShotData, NodeStatus } from '../../types';
import { STYLES } from '../../constants';
// Corrected import path from ./NodeAnchors to ./NodeAnchor
import { NodeAnchor } from './NodeAnchor';

interface ShotNodeProps {
  // Added nodeId and port handlers to fix missing prop errors and enable connectivity
  nodeId: string;
  data: ShotData;
  status: NodeStatus;
  onPortPointerDown?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
  onPortPointerMove?: (e: React.PointerEvent) => void;
  onPortPointerUp?: (e: React.PointerEvent, id: string, type: 'input' | 'output') => void;
}

export const ShotNode = memo(({ 
  nodeId, 
  data, 
  status,
  onPortPointerDown,
  onPortPointerMove,
  onPortPointerUp
}: ShotNodeProps) => {
  return (
    <div className={`${STYLES.NODE_CONTAINER} w-72 relative group transition-all duration-500`}>
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
      <div className="aspect-video relative overflow-hidden bg-black/40">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt="Shot Visual" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
             <div className="w-8 h-8 rounded-full border-2 border-[#00D2FF]/20 border-t-[#00D2FF] animate-spin" />
             <span className="text-[10px] font-mono text-[#E5E4E2]/40 tracking-wider">AWAITING RENDERING</span>
          </div>
        )}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-[#E5E4E2]">SHOT 01</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
           <div className="px-2 py-1.5 bg-white/5 border border-white/5 rounded text-[10px]">
             <span className="block text-white/30 uppercase font-mono mb-0.5">Angle</span>
             <span className="text-[#E5E4E2]">{data.cameraAngle || 'Dynamic'}</span>
           </div>
           <div className="px-2 py-1.5 bg-white/5 border border-white/5 rounded text-[10px]">
             <span className="block text-white/30 uppercase font-mono mb-0.5">Light</span>
             <span className="text-[#E5E4E2]">{data.lighting || 'Cinematic'}</span>
           </div>
        </div>
        <div className="bg-black/20 p-2 rounded border border-white/5">
          <p className="text-[11px] leading-relaxed text-[#E5E4E2]/70 italic line-clamp-2">"{data.prompt}"</p>
        </div>
      </div>

      <div className="h-1 bg-[#00D2FF]/20">
        <div className="h-full bg-[#00D2FF] transition-all duration-300 shadow-[0_0_8px_#00D2FF]" style={{ width: status === NodeStatus.COMPLETED ? '100%' : '30%' }} />
      </div>
    </div>
  );
});
