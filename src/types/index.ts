// Types for Video Frame Extractor app

export type ImageFormat = 'JPEG' | 'PNG' | 'HEIF';
export type TimeFormat = 'Seconds' | 'Frames';
export type FilterType = 'No Filter' | 'Vivid' | 'Matte' | 'Noir' | 'Warm';
export type SharingAction = 'Open share sheet' | 'Save only';

export interface AppSettings {
  imageFormat: ImageFormat;
  quality: number; // 0–100
  includeMetadata: boolean;
  sharingAction: SharingAction;
  timeFormat: TimeFormat;
  filter: FilterType;
}

export interface ExtractedFrame {
  id: string;
  uri: string;
  timestamp: number; // seconds
  width?: number;
  height?: number;
}

export interface VideoInfo {
  uri: string;
  duration: number; // seconds
  width?: number;
  height?: number;
  filename?: string;
}
