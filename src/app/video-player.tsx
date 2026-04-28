import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { FilmStrip } from '@/components/FilmStrip';
import { FrameGrid } from '@/components/FrameGrid';
import { FullScreenViewer } from '@/components/FullScreenViewer';
import { FilterModal } from '@/components/FilterModal';
import { FrameActionSheet } from '@/components/FrameActionSheet';
import { MultiSelectBar } from '@/components/MultiSelectBar';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import {
  extractFrameAtTime,
  extractFirstAndLastFrames,
  generateFilmstrip,
  extractFramesAtTimestamps,
} from '@/utils/frameExtractor';
import { generateIntervalTimestamps, formatTime } from '@/utils/timeFormat';
import { requestMediaLibraryPermission } from '@/utils/permissions';
import { useSettings } from '@/context/SettingsContext';
import { useFrames } from '@/context/FramesContext';
import { ExtractedFrame, FilterType } from '@/types';

const { width: SCREEN_W } = Dimensions.get('window');
const VIDEO_HEIGHT = Math.round((SCREEN_W * 9) / 16) + 40; // slightly taller than 16:9



export default function VideoPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uri: string;
    duration: string;
    filename: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { settings } = useSettings();

  const videoUri = params.uri ?? '';
  const durationSeconds = parseFloat(params.duration ?? '0') / 1000;
  // ImagePicker returns duration in ms

  // ─── State ────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filmstrip, setFilmstrip] = useState<ExtractedFrame[]>([]);
  const [filmstripLoading, setFilmstripLoading] = useState(true);
  const [selectedFilmstripIndex, setSelectedFilmstripIndex] = useState(0);
  const { extractedFrames, addFrame, removeFrame, updateFrameFilter, clearFrames } = useFrames();
  const [intervalInput, setIntervalInput] = useState('1.0');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState({ done: 0, total: 0 });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedFrameForAction, setSelectedFrameForAction] = useState<ExtractedFrame | null>(null);
  const { setIsMultiSelectMode, toggleSelection } = useFrames();
  const [isSaving, setIsSaving] = useState(false);
  
  // Viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);

  // ─── Video player ─────────────────────────────────────────────
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
    p.volume = 1;
  });

  // Track current time via interval
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      if (player) {
        try {
          const t = player.currentTime;
          setCurrentTime(typeof t === 'number' ? t : 0);
          setIsPlaying(player.playing);
        } catch {}
      }
    }, 200);
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, [player]);

  // ─── Load filmstrip on mount ──────────────────────────────────
  useEffect(() => {
    if (!videoUri) return;
    setFilmstripLoading(true);
    const durSec = durationSeconds > 0 ? durationSeconds : 30;
    generateFilmstrip(videoUri, durSec, 12, 0.4)
      .then((frames) => {
        setFilmstrip(frames);
        setFilmstripLoading(false);
      })
      .catch(() => setFilmstripLoading(false));
  }, [videoUri, durationSeconds]);

  // ─── Controls ────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!player) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const seekByFrames = useCallback(
    (direction: 'back' | 'forward') => {
      if (!player) return;
      const step = 1 / 30; // one frame at 30fps
      player.seekBy(direction === 'forward' ? step : -step);
    },
    [player, currentTime, durationSeconds]
  );

  const handleFilmstripSelect = useCallback(
    (index: number) => {
      if (!player || !filmstrip[index]) return;
      setSelectedFilmstripIndex(index);
      const t = filmstrip[index].timestamp;
      player.currentTime = t;
      setCurrentTime(t);
    },
    [player, filmstrip]
  );

  const handleLongPressFrame = useCallback((frame: ExtractedFrame) => {
    setSelectedFrameForAction(frame);
    setActionSheetVisible(true);
  }, []);

  const applyFilter = useCallback((filter: FilterType) => {
    if (!selectedFrameForAction) return;
    updateFrameFilter(selectedFrameForAction.id, filter);
    setFilterModalVisible(false);
    setSelectedFrameForAction(null);
  }, [selectedFrameForAction, updateFrameFilter]);

  const saveCurrentFrameToGallery = useCallback(async () => {
    if (!videoUri) return;
    setIsSaving(true);
    try {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please allow access to your photo library in Settings to save frames.');
        setIsSaving(false);
        return;
      }
      const timeMs = Math.round(currentTime * 1000);
      const frame = await extractFrameAtTime(videoUri, timeMs, settings.imageFormat, settings.quality);
      if (frame) {
        await MediaLibrary.saveToLibraryAsync(frame.uri);
        Alert.alert('Success', 'Frame saved to gallery!');
      } else {
        Alert.alert('Error', 'Could not extract frame to save.');
      }
    } catch (_e) {
      Alert.alert('Error', 'Failed to save frame.');
    } finally {
      setIsSaving(false);
    }
  }, [videoUri, currentTime, settings.quality, settings.imageFormat]);

  // Viewer Handlers
  const handlePressFrame = useCallback((frame: ExtractedFrame, index: number) => {
    setCurrentViewerIndex(index);
    setViewerVisible(true);
  }, []);

  // ─── Frame extraction ─────────────────────────────────────────
  const captureCurrentFrame = useCallback(async () => {
    if (!videoUri) return;
    setIsExtracting(true);
    setExtractProgress({ done: 0, total: 1 });
    try {
      const timeMs = Math.round(currentTime * 1000);
      const frame = await extractFrameAtTime(videoUri, timeMs, settings.imageFormat, settings.quality);
      if (frame) {
        addFrame(frame);
        setExtractProgress({ done: 1, total: 1 });
      } else {
        Alert.alert('Error', 'Could not extract frame at this position.');
      }
    } catch (_e) {
      Alert.alert('Error', 'Frame extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  }, [videoUri, currentTime, settings.quality, settings.imageFormat, addFrame]);

  const captureFirstAndLast = useCallback(async () => {
    if (!videoUri) return;
    setIsExtracting(true);
    setExtractProgress({ done: 0, total: 2 });
    try {
      const frames = await extractFirstAndLastFrames(videoUri, durationSeconds, settings.imageFormat, settings.quality);
      setExtractProgress({ done: frames.length, total: 2 });
      if (frames.length > 0) {
        frames.forEach(f => addFrame(f));
      } else {
        Alert.alert('Error', 'Could not extract first/last frames.');
      }
    } catch {
      Alert.alert('Error', 'Frame extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  }, [videoUri, durationSeconds, settings.quality, settings.imageFormat, addFrame]);

  const extractByInterval = useCallback(async () => {
    if (!videoUri) return;
    const interval = parseFloat(intervalInput);
    if (isNaN(interval) || interval <= 0) {
      Alert.alert('Invalid interval', 'Please enter a positive number of seconds.');
      return;
    }
    if (durationSeconds <= 0) {
      Alert.alert('Error', 'Video duration is unknown. Cannot extract by interval.');
      return;
    }

    const timestamps = generateIntervalTimestamps(durationSeconds, interval);
    if (timestamps.length > 60) {
      Alert.alert(
        'Too many frames',
        `This would extract ${timestamps.length} frames. Try a larger interval.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsExtracting(true);
    setExtractProgress({ done: 0, total: timestamps.length });
    try {
      const frames = await extractFramesAtTimestamps(
        videoUri,
        timestamps,
        settings.imageFormat,
        settings.quality,
        (done: number, total: number) => setExtractProgress({ done, total })
      );
      if (frames.length > 0) {
        frames.forEach(f => addFrame(f));
      }
    } catch {
      Alert.alert('Error', 'Frame extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  }, [videoUri, durationSeconds, intervalInput, settings.quality, settings.imageFormat, addFrame]);

  const handleRemoveFrame = useCallback((id: string) => {
    removeFrame(id);
  }, [removeFrame]);

  // ─── Colors ───────────────────────────────────────────────────
  const bg = isDark ? '#0F0F13' : '#F5F5FA';
  const surfaceBg = isDark ? '#1C1C24' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#2D2D3A' : '#F3F4F6';
  const borderColor = isDark ? '#2D2D3A' : '#E5E7EB';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]} edges={['top']}>
      <MultiSelectBar />

      <LoadingOverlay
        visible={isExtracting}
        message="Extracting frame…"
        progress={extractProgress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={[styles.backText, { color: '#7C3AED' }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Choose Frame</Text>
          <TouchableOpacity
            style={[styles.gearBtn, { backgroundColor: isDark ? '#2D2D3A' : '#F3F4F6' }]}
            onPress={() => router.push('/settings-modal')}
            activeOpacity={0.75}
          >
            <Text style={styles.gearIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Video player ── */}
        <View style={[styles.videoContainer, { backgroundColor: '#000' }]}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />
        </View>

        {/* ── Timestamp ── */}
        <Text style={[styles.timestamp, { color: textSecondary }]}>
          {formatTime(currentTime)} / {formatTime(durationSeconds)}
        </Text>

        {/* ── Filmstrip ── */}
        <View style={[styles.filmstripCard, { backgroundColor: isDark ? '#6B21A8' : '#EDE9FE' }]}>
          <FilmStrip
            frames={filmstrip}
            selectedIndex={selectedFilmstripIndex}
            onSelectFrame={handleFilmstripSelect}
            isLoading={filmstripLoading}
          />
        </View>

        {/* ── Playback controls ── */}
        <View style={[styles.controlBar, { backgroundColor: surfaceBg, borderColor }]}>
          {/* Play / Pause */}
          <TouchableOpacity style={styles.controlBtn} onPress={togglePlay} activeOpacity={0.75}>
            <Text style={styles.controlBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          {/* Frame back */}
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => seekByFrames('back')}
            activeOpacity={0.75}
          >
            <Text style={styles.controlBtnText}>←</Text>
          </TouchableOpacity>

          {/* Frame forward */}
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => seekByFrames('forward')}
            activeOpacity={0.75}
          >
            <Text style={styles.controlBtnText}>→</Text>
          </TouchableOpacity>

          {/* Share current frame */}
          <TouchableOpacity
            style={[styles.controlBtn, styles.shareControlBtn]}
            onPress={saveCurrentFrameToGallery}
            activeOpacity={0.75}
            disabled={isSaving}
          >
            <Ionicons name="download-outline" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* ── Extraction controls ── */}
        <View style={[styles.extractionCard, { backgroundColor: surfaceBg }]}>
          <Text style={[styles.extractionTitle, { color: textPrimary }]}>Extract Frames</Text>

          {/* Interval input */}
          <View style={styles.intervalRow}>
            <Text style={[styles.intervalLabel, { color: textSecondary }]}>
              Every
            </Text>
            <TextInput
              style={[
                styles.intervalInput,
                { backgroundColor: inputBg, color: textPrimary, borderColor },
              ]}
              value={intervalInput}
              onChangeText={setIntervalInput}
              keyboardType="decimal-pad"
              returnKeyType="done"
              placeholder="1.0"
              placeholderTextColor={textSecondary}
            />
            <Text style={[styles.intervalLabel, { color: textSecondary }]}>seconds</Text>

            <TouchableOpacity
              style={styles.intervalExtractBtn}
              onPress={extractByInterval}
              activeOpacity={0.8}
              disabled={isExtracting}
            >
              <Text style={styles.intervalExtractBtnText}>Extract</Text>
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View style={styles.actionBtnsRow}>
            <TouchableOpacity
              style={[styles.captureBtn, { flex: 1 }]}
              onPress={captureCurrentFrame}
              activeOpacity={0.85}
              disabled={isExtracting}
            >
              <Text style={styles.captureBtnIcon}>📸</Text>
              <Text style={styles.captureBtnText}>Capture Current Frame</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.firstLastBtn, { borderColor: isDark ? '#4C1D95' : '#DDD6FE' }]}
            onPress={captureFirstAndLast}
            activeOpacity={0.8}
            disabled={isExtracting}
          >
            <Text style={[styles.firstLastBtnText, { color: '#7C3AED' }]}>
              ⏮ First &amp; Last Frames ⏭
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Extracted frames grid ── */}
        <View style={styles.framesSection}>
          <View style={styles.framesSectionHeader}>
            <Text style={[styles.framesSectionTitle, { color: textPrimary }]}>
              Extracted Frames
            </Text>
            {extractedFrames.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Clear All', 'Remove all extracted frames?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: () => clearFrames() },
                  ]);
                }}
              >
                <Text style={[styles.clearAllText, { color: '#EF4444' }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <FrameGrid 
            frames={extractedFrames} 
            onRemoveFrame={handleRemoveFrame} 
            onLongPressFrame={handleLongPressFrame} 
            onPressFrame={handlePressFrame}
          />
        </View>
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        selectedFilter={selectedFrameForAction?.filter}
        onApplyFilter={applyFilter}
        isDark={isDark}
      />

      <FrameActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        onApplyFilter={() => setFilterModalVisible(true)}
        onSelectMultiple={() => {
          setIsMultiSelectMode(true);
          if (selectedFrameForAction) {
            toggleSelection(selectedFrameForAction.id);
          }
        }}
      />

      <FullScreenViewer 
        visible={viewerVisible} 
        frames={extractedFrames} 
        initialIndex={currentViewerIndex} 
        onClose={() => setViewerVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 70,
  },
  backArrow: {
    fontSize: 28,
    color: '#7C3AED',
    lineHeight: 30,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 18,
  },
  // Video
  videoContainer: {
    width: SCREEN_W,
    height: VIDEO_HEIGHT,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  // Timestamp
  timestamp: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingVertical: 10,
  },
  // Filmstrip
  filmstripCard: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  // Control bar
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 20,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  controlBtnText: {
    fontSize: 22,
  },
  shareControlBtn: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    marginLeft: 8,
  },
  shareControlIcon: {
    fontSize: 22,
  },
  // Extraction card
  extractionCard: {
    margin: 12,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  extractionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  intervalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  intervalInput: {
    width: 64,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  intervalExtractBtn: {
    backgroundColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  intervalExtractBtnText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B21A8',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#6B21A8',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  captureBtnIcon: {
    fontSize: 18,
  },
  captureBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  firstLastBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 13,
  },
  firstLastBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Frames section
  framesSection: {
    marginTop: 4,
  },
  framesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  framesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
