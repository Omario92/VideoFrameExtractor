// Types for Video Frame Extractor app

export type ImageFormat = 'JPEG' | 'PNG' | 'WEBP' | 'HEIF';
export type TimeFormat = 'Seconds' | 'Frames';
export type FilterType = 'Original' | 'Vivid' | 'Black & White' | 'Warm' | 'Cool';
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
  sourceVideoUri: string;
  timestamp: number; // seconds
  width?: number;
  height?: number;
  format: 'jpeg' | 'png' | 'webp' | 'heif';
  createdAt: number;
  filter?: FilterType;
}

export interface VideoInfo {
  uri: string;
  duration: number; // seconds
  width?: number;
  height?: number;
  filename?: string;
}
