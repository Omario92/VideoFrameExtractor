import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  requestImagePickerPermission,
  requestCameraPermission,
} from '@/utils/permissions';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animated pulse for the main CTA button
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const pickVideo = useCallback(async () => {
    const { granted } = await requestImagePickerPermission();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library in Settings to select videos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      router.push({
        pathname: '/video-player',
        params: {
          uri: asset.uri,
          duration: String(asset.duration ?? 0),
          filename: asset.fileName ?? 'video',
        },
      });
    }
  }, [router]);

  const recordVideo = useCallback(async () => {
    const { granted } = await requestCameraPermission();
    if (!granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access in Settings to record videos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      videoMaxDuration: 300,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      router.push({
        pathname: '/video-player',
        params: {
          uri: asset.uri,
          duration: String(asset.duration ?? 0),
          filename: 'recorded_video',
        },
      });
    }
  }, [router]);

  const bg = isDark ? '#0F0F13' : '#F5F5FA';
  const cardBg = isDark ? '#1C1C24' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#2D2D3A' : '#E5E7EB' }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🎬</Text>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Video Frame Extractor
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: isDark ? '#2D2D3A' : '#F3F4F6' }]}
          onPress={() => router.push('/settings-modal')}
          activeOpacity={0.75}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: cardBg }]}>
          {/* Decorative gradient blob */}
          <View style={styles.blobContainer}>
            <View style={styles.blob1} />
            <View style={styles.blob2} />
          </View>

          <Text style={styles.heroIcon}>🎞️</Text>
          <Text style={[styles.heroTitle, { color: textPrimary }]}>
            Extract Frames{'\n'}from Any Video
          </Text>
          <Text style={[styles.heroSubtitle, { color: textSecondary }]}>
            Pick a video from your library, scrub to the perfect moment, and save stunning still frames.
          </Text>

          {/* Primary CTA */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={pickVideo}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnIcon}>📁</Text>
              <Text style={styles.primaryBtnText}>Choose Video from Library</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: isDark ? '#2D2D3A' : '#E5E7EB' }]} />
            <Text style={[styles.dividerText, { color: textSecondary }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: isDark ? '#2D2D3A' : '#E5E7EB' }]} />
          </View>

          {/* Secondary CTA */}
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: isDark ? '#4C1D95' : '#DDD6FE' }]}
            onPress={recordVideo}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryBtnIcon}>🎥</Text>
            <Text style={[styles.secondaryBtnText, { color: '#7C3AED' }]}>
              Record New Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature tags */}
        <View style={styles.tagsRow}>
          {['JPEG · PNG · HEIF', 'Save to Gallery', 'Share Instantly'].map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: isDark ? '#1C1C24' : '#EDE9FE' }]}
            >
              <Text style={[styles.tagText, { color: isDark ? '#A78BFA' : '#6D28D9' }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  body: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 14,
  },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    top: -80,
    right: -60,
  },
  blob2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    bottom: -50,
    left: -40,
  },
  heroIcon: {
    fontSize: 56,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B21A8',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
    width: '100%',
    shadowColor: '#6B21A8',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 20,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    width: '100%',
  },
  secondaryBtnIcon: {
    fontSize: 20,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
