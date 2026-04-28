import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExtractedFrame, FilterType } from '@/types';
import { deletePersistentFrame, clearAllPersistentFrames } from '@/utils/ExportService';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { requestMediaLibraryPermission } from '@/utils/permissions';

interface FramesContextValue {
  extractedFrames: ExtractedFrame[];
  addFrame: (frame: ExtractedFrame) => void;
  removeFrame: (id: string) => void;
  clearFrames: () => void;
  updateFrameFilter: (id: string, filter: FilterType) => void;
  isLoaded: boolean;
  isMultiSelectMode: boolean;
  setIsMultiSelectMode: (mode: boolean) => void;
  selectedFrameIds: string[];
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  saveSelectedFrames: () => Promise<void>;
  shareSelectedFrames: () => Promise<void>;
  deleteSelectedFrames: () => void;
}

const FramesContext = createContext<FramesContextValue | null>(null);

const STORAGE_KEY = '@extracted_frames';

export function FramesProvider({ children }: { children: ReactNode }) {
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedFrameIds, setSelectedFrameIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ExtractedFrame[];
          // Filter out legacy v0.1 frames that lack the new required fields
          const validFrames = parsed.filter((f) => f.sourceVideoUri && f.format && f.createdAt);
          setExtractedFrames(validFrames);
          
          if (validFrames.length !== parsed.length) {
            // Save the filtered list back to storage
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validFrames));
          }
        } catch (e) {
          console.error('Failed to parse stored frames', e);
        }
      }
      setIsLoaded(true);
    });
  }, []);

  const saveFrames = (frames: ExtractedFrame[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(frames)).catch((e) => {
      console.error('Failed to save frames', e);
    });
  };

  const addFrame = useCallback((frame: ExtractedFrame) => {
    setExtractedFrames((prev) => {
      const next = [frame, ...prev];
      saveFrames(next);
      return next;
    });
  }, []);

  const removeFrame = useCallback((id: string) => {
    setExtractedFrames((prev) => {
      const frameToDelete = prev.find((f) => f.id === id);
      if (frameToDelete) {
        deletePersistentFrame(frameToDelete.uri);
      }
      const next = prev.filter((f) => f.id !== id);
      saveFrames(next);
      return next;
    });
  }, []);

  const clearFrames = useCallback(() => {
    clearAllPersistentFrames();
    setExtractedFrames([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateFrameFilter = useCallback((id: string, filter: FilterType) => {
    setExtractedFrames((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, filter } : f));
      saveFrames(next);
      return next;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedFrameIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedFrameIds(extractedFrames.map((f) => f.id));
  }, [extractedFrames]);

  const clearSelection = useCallback(() => {
    setSelectedFrameIds([]);
  }, []);

  const saveSelectedFrames = useCallback(async () => {
    const framesToSave = extractedFrames.filter((f) => selectedFrameIds.includes(f.id));
    if (framesToSave.length === 0) return;

    try {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please allow access to your photo library in Settings.');
        return;
      }

      for (const frame of framesToSave) {
        await MediaLibrary.saveToLibraryAsync(frame.uri);
      }
      Alert.alert('Saved!', `Successfully saved ${framesToSave.length} frames.`);
      setIsMultiSelectMode(false);
      clearSelection();
    } catch (_error) {
      Alert.alert('Error', 'Could not save some frames. Please try again.');
    }
  }, [extractedFrames, selectedFrameIds, clearSelection]);

  const shareSelectedFrames = useCallback(async () => {
    const framesToShare = extractedFrames.filter((f) => selectedFrameIds.includes(f.id));
    if (framesToShare.length === 0) return;

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }

    try {
      for (const frame of framesToShare) {
        await Sharing.shareAsync(frame.uri, {
          dialogTitle: 'Share Frame',
        });
      }
      setIsMultiSelectMode(false);
      clearSelection();
    } catch (_error) {
      Alert.alert('Error', 'Could not share frames.');
    }
  }, [extractedFrames, selectedFrameIds, clearSelection]);

  const deleteSelectedFrames = useCallback(() => {
    if (selectedFrameIds.length === 0) return;
    
    Alert.alert(
      'Delete Selected',
      `Delete ${selectedFrameIds.length} selected frames?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setExtractedFrames((prev) => {
              const next = prev.filter((f) => {
                if (selectedFrameIds.includes(f.id)) {
                  deletePersistentFrame(f.uri);
                  return false;
                }
                return true;
              });
              saveFrames(next);
              return next;
            });
            setIsMultiSelectMode(false);
            clearSelection();
          },
        },
      ]
    );
  }, [selectedFrameIds, clearSelection]);

  return (
    <FramesContext.Provider
      value={{
        extractedFrames,
        addFrame,
        removeFrame,
        clearFrames,
        updateFrameFilter,
        isLoaded,
        isMultiSelectMode,
        setIsMultiSelectMode,
        selectedFrameIds,
        toggleSelection,
        selectAll,
        clearSelection,
        saveSelectedFrames,
        shareSelectedFrames,
        deleteSelectedFrames,
      }}
    >
      {children}
    </FramesContext.Provider>
  );
}

export function useFrames() {
  const context = useContext(FramesContext);
  if (!context) throw new Error('useFrames must be used within a FramesProvider');
  return context;
}
