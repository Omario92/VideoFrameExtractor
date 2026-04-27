import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: { done: number; total: number };
}

export function LoadingOverlay({ visible, message, progress }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.message}>{message ?? 'Processing…'}</Text>
        {progress && progress.total > 0 && (
          <>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(progress.done / progress.total) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress.done} / {progress.total}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: '#1C1C24',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    minWidth: 200,
    gap: 14,
  },
  message: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressTrack: {
    width: 160,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});
