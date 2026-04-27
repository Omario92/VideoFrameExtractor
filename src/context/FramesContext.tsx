import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExtractedFrame, FilterType } from '@/types';

interface FramesContextValue {
  extractedFrames: ExtractedFrame[];
  addFrame: (frame: ExtractedFrame) => void;
  removeFrame: (id: string) => void;
  clearFrames: () => void;
  updateFrameFilter: (id: string, filter: FilterType) => void;
  isLoaded: boolean;
}

const FramesContext = createContext<FramesContextValue | null>(null);

const STORAGE_KEY = '@extracted_frames';

export function FramesProvider({ children }: { children: ReactNode }) {
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setExtractedFrames(JSON.parse(stored));
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
      const next = prev.filter((f) => f.id !== id);
      saveFrames(next);
      return next;
    });
  }, []);

  const clearFrames = useCallback(() => {
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

  return (
    <FramesContext.Provider
      value={{
        extractedFrames,
        addFrame,
        removeFrame,
        clearFrames,
        updateFrameFilter,
        isLoaded,
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
