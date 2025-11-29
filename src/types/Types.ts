export interface Tool {
  onToolSelect: (tool: string) => void;
  selectedTool: string;
}
export type RGBA = [number, number, number, number];

export interface Flood {
  imageData: ImageData;
  x: number;
  y: number;
  targetColor: RGBA;
  fillColor: RGBA;
}

export interface PaintProps {
  color: string;
  tool: string;
};

export interface Color {
    onColorSelect: (color: string) => void;
}