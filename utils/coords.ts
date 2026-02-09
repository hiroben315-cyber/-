
/**
 * Utility function to convert screen coordinates to canvas coordinates
 * Formula: Xc = (Xs - OffsetX) / Scale
 */
export const toCanvasCoords = (
  screenX: number, 
  screenY: number, 
  scale: number, 
  offsetX: number, 
  offsetY: number
) => {
  return {
    x: (screenX - offsetX) / scale,
    y: (screenY - offsetY) / scale,
  };
};
