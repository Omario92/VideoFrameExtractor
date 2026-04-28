import React, { useState } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Grayscale } from 'react-native-color-matrix-image-filters';
import { ExtractedFrame } from '@/types';
import { formatTime } from '@/utils/timeFormat';
import { requestMediaLibraryPermission } from '@/utils/permissions';
import { useFrames } from '@/context/FramesContext';

interface FrameGridProps {
  frames: ExtractedFrame[];
  onRemoveFrame: (id: string) => void;
  onLongPressFrame?: (frame: ExtractedFrame) => void;
  onPressFrame?: (frame: ExtractedFrame, index: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLS = 2;
const CELL_SIZE = (SCREEN_WIDTH - 48) / GRID_COLS;

const getFilterOverlay = (filter?: string) => {
  switch (filter) {
    case 'Vivid': return { backgroundColor: 'rgba(255, 100, 100, 0.1)' };
    case 'Black & White': return null; // Handled directly on the Image component via style
    case 'Warm': return { backgroundColor: 'rgba(255, 150, 0, 0.2)' };
    case 'Cool': return { backgroundColor: 'rgba(0, 150, 255, 0.2)' };
    default: return null;
  }
};

export function FrameGrid({ frames, onRemoveFrame, onLongPressFrame, onPressFrame }: FrameGridProps) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const { isMultiSelectMode, selectedFrameIds, toggleSelection } = useFrames();

  const handlePress = (item: ExtractedFrame, index: number) => {
    if (isMultiSelectMode) {
      toggleSelection(item.id);
    } else {
      onPressFrame?.(item, index);
    }
  };

  const handleSave = async (frame: ExtractedFrame) => {
    setSavingId(frame.id);
    try {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please allow access to your photo library in Settings.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(frame.uri);
      Alert.alert('Saved!', 'Frame saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Could not save frame. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleShare = async (frame: ExtractedFrame) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(frame.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share Frame',
        });
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Error', 'Could not share this frame.');
    }
  };

  if (frames.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎞️</Text>
        <Text style={styles.emptyTitle}>No Frames Extracted</Text>
        <Text style={styles.emptySubtitle}>
          Use the controls above to capture frames from the video.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={frames}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLS}
      scrollEnabled={false}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.columnWrapper}
      renderItem={({ item, index }) => (
        <TouchableOpacity 
          style={styles.cell} 
          activeOpacity={0.8}
          onPress={() => handlePress(item, index)}
          onLongPress={() => !isMultiSelectMode && onLongPressFrame?.(item)}
          delayLongPress={300}
        >
          <View style={styles.imageContainer}>
            {item.filter === 'Black & White' ? (
              <Grayscale style={styles.cellImage}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.cellImage}
                  resizeMode="cover"
                />
              </Grayscale>
            ) : (
              <Image
                source={{ uri: item.uri }}
                style={styles.cellImage}
                resizeMode="cover"
              />
            )}
            {item.filter && item.filter !== 'Original' && item.filter !== 'Black & White' && (
               <View style={[StyleSheet.absoluteFill, getFilterOverlay(item.filter)]} pointerEvents="none" />
            )}
            {/* Multi-select overlay */}
            {isMultiSelectMode && (
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, selectedFrameIds.includes(item.id) && styles.checkboxSelected]}>
                  {selectedFrameIds.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            )}
          </View>
          {/* Timestamp badge */}
          <View style={styles.timestampBadge}>
            <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
          </View>

          {/* Action row (hidden in multi-select) */}
          {!isMultiSelectMode && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => handleShare(item)}
                activeOpacity={0.75}
              >
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => handleSave(item)}
                activeOpacity={0.75}
                disabled={savingId === item.id}
              >
                {savingId === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemoveFrame(item.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  gridContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cell: {
    width: CELL_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C24',
  },
  imageContainer: {
    width: '100%',
    height: CELL_SIZE * 0.65,
    position: 'relative',
  },
  cellImage: {
    width: '100%',
    height: '100%',
  },
  timestampBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timestampText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 6,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
