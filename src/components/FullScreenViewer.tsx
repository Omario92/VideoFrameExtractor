import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Grayscale } from 'react-native-color-matrix-image-filters';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExtractedFrame } from '@/types';
import { requestMediaLibraryPermission } from '@/utils/permissions';
import { formatTime } from '@/utils/timeFormat';

const { width: SCREEN_W } = Dimensions.get('window');

interface FullScreenViewerProps {
  visible: boolean;
  frames: ExtractedFrame[];
  initialIndex: number;
  onClose: () => void;
}

const getFilterOverlay = (filter?: string) => {
  switch (filter) {
    case 'Vivid': return { backgroundColor: 'rgba(255, 100, 100, 0.1)' };
    case 'Black & White': return null;
    case 'Warm': return { backgroundColor: 'rgba(255, 150, 0, 0.2)' };
    case 'Cool': return { backgroundColor: 'rgba(0, 150, 255, 0.2)' };
    default: return null;
  }
};

export function FullScreenViewer({ visible, frames, initialIndex, onClose }: FullScreenViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isSaving, setIsSaving] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setTimeout(() => {
        if (flatListRef.current && initialIndex >= 0 && initialIndex < frames.length) {
          try {
            flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
          } catch (e) {}
        }
      }, 50);
    }
  }, [visible, initialIndex, frames.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: SCREEN_W,
    offset: SCREEN_W * index,
    index,
  }), []);

  const saveViewerFrame = async () => {
    const frame = frames[currentIndex];
    if (!frame) return;
    setIsSaving(true);
    try {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please allow access to your photo library in Settings.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(frame.uri);
      Alert.alert('Success', 'Frame saved to gallery!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save frame.');
    } finally {
      setIsSaving(false);
    }
  };

  const shareViewerFrame = async () => {
    const frame = frames[currentIndex];
    if (!frame) return;
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(frame.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share Frame',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share this frame.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewerOverlay}>
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.viewerHeader}>
          <TouchableOpacity onPress={onClose} style={styles.viewerCloseBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.viewerTitleContainer}>
            <Text style={styles.viewerTitleText}>
              {frames.length > 0 ? `${currentIndex + 1} of ${frames.length}` : ''}
            </Text>
            {frames[currentIndex] && (
              <Text style={styles.viewerSubtitleText}>
                {formatTime(frames[currentIndex].timestamp)}
              </Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* List */}
        <FlatList
          ref={flatListRef}
          data={frames}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.viewerItemContainer}>
              {item.filter === 'Black & White' ? (
                <Grayscale style={styles.viewerImage}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.viewerImage}
                    resizeMode="contain"
                  />
                </Grayscale>
              ) : (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              )}
              {item.filter && item.filter !== 'Original' && item.filter !== 'Black & White' && (
                <View style={[StyleSheet.absoluteFill, getFilterOverlay(item.filter)]} pointerEvents="none" />
              )}
            </View>
          )}
        />

        {/* Footer */}
        <SafeAreaView edges={['bottom']} style={styles.viewerFooter}>
          <TouchableOpacity style={styles.viewerFooterBtn} onPress={shareViewerFrame} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={26} color="#FFF" />
            <Text style={styles.viewerFooterBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewerFooterBtn} onPress={saveViewerFrame} disabled={isSaving} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={26} color="#FFF" />
            <Text style={styles.viewerFooterBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewerCloseBtn: {
    padding: 4,
    width: 40,
  },
  viewerTitleContainer: {
    alignItems: 'center',
  },
  viewerTitleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewerSubtitleText: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 2,
  },
  viewerItemContainer: {
    width: SCREEN_W,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewerFooterBtn: {
    alignItems: 'center',
    gap: 6,
  },
  viewerFooterBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
