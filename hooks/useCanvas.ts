import React, { useCallback, useRef } from 'react';
import { useMotionValue } from 'framer-motion';

export const useCanvas = () => {
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleZoom = useCallback((e: React.WheelEvent) => {
    // Only zoom when Ctrl key is held
    if (!e.ctrlKey) return;
    
    e.preventDefault();
    const minScale = 0.1;
    const maxScale = 5;

    const prevScale = scale.get();
    // Formula: newScale = currentScale * (e.deltaY > 0 ? 0.9 : 1.1)
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(prevScale * factor, minScale), maxScale);
    
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const prevX = x.get();
      const prevY = y.get();

      const dx = (mouseX - prevX) / prevScale;
      const dy = (mouseY - prevY) / prevScale;

      x.set(mouseX - dx * newScale);
      y.set(mouseY - dy * newScale);
      scale.set(newScale);
    }
  }, [scale, x, y]);

  const handlePan = useCallback((dx: number, dy: number) => {
    x.set(x.get() + dx);
    y.set(y.get() + dy);
  }, [x, y]);

  return {
    scale,
    x,
    y,
    handleZoom,
    handlePan,
    viewportRef
  };
};