
export enum NodeType {
  SCRIPT = 'SCRIPT',
  SHOT = 'SHOT',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum NodeStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface Position {
  x: number;
  y: number;
}

export interface AppNode {
  id: string;
  type: NodeType;
  position: Position;
  data: any;
  status: NodeStatus;
  width?: number;
  height?: number;
}

export interface Edge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Keep Connection for backward compatibility or as an alias
export interface Connection extends Edge {}

export interface ScriptData {
  title: string;
  content: string;
}

export interface ShotData {
  prompt: string;
  imageUrl?: string;
  cameraAngle?: string;
  lighting?: string;
}

export interface CanvasState {
  scale: number;
  offset: Position;
}
