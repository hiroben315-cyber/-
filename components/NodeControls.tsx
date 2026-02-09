import React from 'react';
import { NodeType } from '../types';

interface NodeControlsProps {
  onAddNode: (type: NodeType) => void;
}

export const NodeControls: React.FC<NodeControlsProps> = ({ onAddNode }) => {
  const buttons = [
    { type: NodeType.TEXT, label: '文字', icon: <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/> },
    { type: NodeType.IMAGE, label: '圖片', icon: <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/> },
    { type: NodeType.VIDEO, label: '影片', icon: <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/> },
  ];

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-6 flex flex-col gap-4 z-50">
      <div className="bg-[#1C1C1E]/80 backdrop-blur-xl border border-slate-700/50 p-3 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] flex flex-col gap-3">
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] px-2 mb-1 text-center">Assets</div>
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => onAddNode(btn.type)}
            className="group relative flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-[#1C1C1E] border border-white/5 hover:border-[#00D2FF]/40 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="text-[#E5E4E2]/50 group-hover:text-[#00D2FF] transition-colors"
            >
              {btn.icon}
            </svg>
            <span className="mt-1.5 text-[10px] font-bold text-[#E5E4E2]/40 group-hover:text-[#E5E4E2] transition-colors">
              {btn.label}
            </span>
            <div className="absolute inset-0 rounded-xl bg-[#00D2FF]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
};