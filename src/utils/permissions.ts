import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request permission to access the media library (read + write).
 */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync(true);
  return {
    granted: status === 'granted',
    canAskAgain,
  };
}

/**
 * Request permission to access photos/videos for picking.
 */
export async function requestImagePickerPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return {
    granted: status === 'granted',
    canAskAgain,
  };
}

/**
 * Request camera permission for recording new video.
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
  return {
    granted: status === 'granted',
    canAskAgain,
  };
}

/**
 * Check if media library permission is already granted.
 */
export async function checkMediaLibraryPermission(): Promise<boolean> {
  const { status } = await MediaLibrary.getPermissionsAsync(true);
  return status === 'granted';
}
