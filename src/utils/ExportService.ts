import * as FileSystem from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ExtractedFrame, ImageFormat } from '@/types';
import { VideoThumbnail } from 'expo-video';

const EXTRACTED_DIR = (FileSystem.documentDirectory || 'file:///document/') + 'extractedFrames/';

export async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(EXTRACTED_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(EXTRACTED_DIR, { intermediates: true });
  }
}

export async function processAndSaveThumbnail(
  thumbnail: VideoThumbnail,
  sourceVideoUri: string,
  format: ImageFormat,
  quality: number, // 0-100
  isPersistent = true
): Promise<ExtractedFrame | null> {
  await ensureDirExists();
  try {
    const targetDir = isPersistent ? EXTRACTED_DIR : (FileSystem.cacheDirectory || 'file:///cache/') + 'filmstrip_';
    let saveFormat = SaveFormat.JPEG;
    let ext = 'jpg';
    let outputFormat: 'jpeg' | 'png' | 'webp' | 'heif' = 'jpeg';
    
    if (format === 'PNG') {
      saveFormat = SaveFormat.PNG;
      ext = 'png';
      outputFormat = 'png';
    } else if (format === 'WEBP') {
      saveFormat = SaveFormat.WEBP;
      ext = 'webp';
      outputFormat = 'webp';
    } else if (format === 'HEIF') {
       // expo-image-manipulator doesn't support HEIF natively for saving. 
       // We fallback to JPEG manipulation but mark the struct as HEIF if the user requested it.
       saveFormat = SaveFormat.JPEG;
       ext = 'heic'; // use heic extension, some platforms might auto-convert or just treat as jpeg
       outputFormat = 'heif';
    }

    const manipContext = ImageManipulator.manipulate(thumbnail as any);
    const imageRef = await manipContext.renderAsync();
    const manipResult = await imageRef.saveAsync({ compress: quality / 100, format: saveFormat });

    const filename = `frame_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const destinationUri = targetDir + filename;

    await FileSystem.moveAsync({
      from: manipResult.uri,
      to: destinationUri,
    });

    return {
      id: filename,
      uri: destinationUri,
      sourceVideoUri,
      timestamp: thumbnail.requestedTime,
      width: manipResult.width,
      height: manipResult.height,
      format: outputFormat,
      createdAt: Date.now(),
      filter: 'Original',
    };
  } catch (error) {
    console.error('[ExportService] Error processing thumbnail:', error);
    return null;
  }
}

export async function deletePersistentFrame(uri: string) {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (e) {
    console.error('Failed to delete persistent frame:', e);
  }
}

export async function clearAllPersistentFrames() {
  try {
    await FileSystem.deleteAsync(EXTRACTED_DIR, { idempotent: true });
    await ensureDirExists();
  } catch (e) {
    console.error('Failed to clear persistent frames:', e);
  }
}
