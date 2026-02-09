import React from 'react';

interface AnchorProps {
  type: 'input' | 'output';
  nodeId: string;
  onPointerDown?: (e: React.PointerEvent, nodeId: string, type: 'input' | 'output') => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent, nodeId: string, type: 'input' | 'output') => void;
}

export const NodeAnchor: React.FC<AnchorProps> = ({ 
  type, 
  nodeId, 
  onPointerDown,
  onPointerMove,
  onPointerUp
}) => {
  const isInput = type === 'input';
  
  return (
    <div 
      data-port="true"
      data-node-id={nodeId}
      data-port-type={type}
      className={`node-port nodrag absolute top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-crosshair group/port`}
      style={{ 
        [isInput ? 'left' : 'right']: '-20px',
        zIndex: 1000,
        pointerEvents: 'all',
        touchAction: 'none'
      }}
      // Forced Capture Phase: Stop node drag from starting and take over mouse control
      onPointerDownCapture={(e) => {
        e.stopPropagation();
        const el = e.currentTarget as HTMLDivElement;
        el.setPointerCapture(e.pointerId);
        onPointerDown?.(e, nodeId, type);
      }}
      onPointerMove={(e) => {
        if (onPointerMove) {
          e.stopPropagation();
          onPointerMove(e);
        }
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const el = e.currentTarget as HTMLDivElement;
        el.releasePointerCapture(e.pointerId);
        onPointerUp?.(e, nodeId, type);
      }}
    >
      <div className={`w-4 h-4 rounded-full border-2 border-slate-600 bg-[#1C1C1E] transition-all duration-300
        group-hover/port:scale-125 group-hover/port:border-[#00D2FF] group-hover/port:shadow-[0_0_20px_rgba(0,210,255,0.9)] 
        pointer-events-none`} 
        style={{ pointerEvents: 'none !important' as any }}
      />
    </div>
  );
};