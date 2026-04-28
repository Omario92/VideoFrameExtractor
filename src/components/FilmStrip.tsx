import React, { useRef } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ExtractedFrame } from '@/types';
import { formatTime } from '@/utils/timeFormat';

interface FilmStripProps {
  frames: ExtractedFrame[];
  selectedIndex: number;
  onSelectFrame: (index: number) => void;
  isLoading?: boolean;
}

const THUMB_SIZE = 72;
const THUMB_MARGIN = 4;

export function FilmStrip({
  frames,
  selectedIndex,
  onSelectFrame,
  isLoading,
}: FilmStripProps) {
  const flatRef = useRef<FlatList>(null);

  const scrollToIndex = (index: number) => {
    flatRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  };

  const handleSelect = (index: number) => {
    onSelectFrame(index);
    scrollToIndex(index);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7C3AED" />
        <Text style={styles.loadingText}>Generating filmstrip…</Text>
      </View>
    );
  }

  if (frames.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No frames yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatRef}
      data={frames}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      onScrollToIndexFailed={() => {}}
      renderItem={({ item, index }) => {
        const isSelected = index === selectedIndex;
        return (
          <TouchableOpacity
            onPress={() => handleSelect(index)}
            activeOpacity={0.8}
            style={[styles.thumbContainer, isSelected && styles.thumbSelected]}
          >
            <Image
              source={{ uri: item.uri }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
            {isSelected && <View style={styles.selectedOverlay} />}
            <Text style={styles.thumbTime} numberOfLines={1}>
              {formatTime(item.timestamp)}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  thumbContainer: {
    width: THUMB_SIZE,
    height: THUMB_SIZE + 20,
    marginHorizontal: THUMB_MARGIN,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbSelected: {
    borderColor: '#7C3AED',
  },
  thumbImage: {
    width: '100%',
    height: THUMB_SIZE,
    borderRadius: 6,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: THUMB_SIZE,
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
    borderRadius: 6,
  },
  thumbTime: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  loadingContainer: {
    height: THUMB_SIZE + 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    height: THUMB_SIZE + 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
