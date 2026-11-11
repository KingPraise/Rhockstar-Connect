export type EditorTool =
  | "select"
  | "crop"
  | "draw"
  | "blur"
  | "text"
  | "adjust";

export type CropPreset =
  | "free"
  | "original"
  | "1:1"
  | "4:5"
  | "16:9"
  | "9:16";

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface OutputSize {
  width: number;
  height: number;
  lockAspectRatio: boolean;
}

export interface EditorHistoryEntry {
  id: string;
  label: string;
}