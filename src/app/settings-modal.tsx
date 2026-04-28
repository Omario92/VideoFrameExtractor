import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import {
  SectionHeader,
  SettingsRow,
  ToggleRow,
  SegmentedControl,
  QualityStepper,
} from '@/components/SettingsComponents';
import { ImageFormat, TimeFormat, SharingAction } from '@/types';

type ModalTab = 'Settings' | 'Metadata';

export default function SettingsModal() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<ModalTab>('Settings');

  const bg = isDark ? '#0F0F13' : '#F2F2F7';
  const cardBg = isDark ? '#1C1C24' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      {/* Handle bar */}
      <View style={styles.handleBar}>
        <View style={[styles.handle, { backgroundColor: isDark ? '#4B5563' : '#CBD5E1' }]} />
      </View>

      {/* Tab switcher + close */}
      <View style={styles.topRow}>
        <View style={[styles.tabSwitcher, { backgroundColor: isDark ? '#2D2D3A' : '#E5E7EB' }]}>
          {(['Settings', 'Metadata'] as ModalTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && [
                  styles.tabBtnActive,
                  { backgroundColor: isDark ? '#3B3B4F' : '#FFFFFF' },
                ],
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                  activeTab === tab && { color: textPrimary, fontWeight: '700' },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: isDark ? '#2D2D3A' : '#E5E7EB' }]}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Text style={[styles.closeBtnText, { color: textPrimary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Settings' ? (
          <>
            {/* IMAGE FORMAT */}
            <SectionHeader title="Image Format" />
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.cardRow}>
                <Text style={[styles.cardRowLabel, { color: textPrimary }]}>Format</Text>
                <SegmentedControl<ImageFormat>
                  options={['JPEG', 'PNG', 'WEBP']}
                  selected={settings.imageFormat}
                  onSelect={(val) => updateSettings({ imageFormat: val })}
                />
              </View>
              <View style={[styles.cardDivider, { backgroundColor: isDark ? '#2D2D3A' : '#F3F4F6' }]} />
              <View style={styles.cardRow}>
                <Text style={[styles.cardRowLabel, { color: textPrimary }]}>Quality</Text>
                <QualityStepper
                  value={settings.quality}
                  onChange={(val) => updateSettings({ quality: val })}
                  min={5}
                  max={100}
                  step={5}
                />
              </View>
              <View style={[styles.cardHint, { backgroundColor: isDark ? '#2D2D3A' : '#F9FAFB' }]}>
                <Text style={[styles.hintText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  A smaller compression quality results in a smaller file size with a slightly degraded photo quality.
                </Text>
              </View>
            </View>

            {/* METADATA */}
            <SectionHeader title="Metadata" />
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <ToggleRow
                label="Include Metadata"
                value={settings.includeMetadata}
                onValueChange={(val) => updateSettings({ includeMetadata: val })}
                description="Adds creation date, GPS location and other metadata to exported images, if available."
              />
            </View>

            {/* SHARING */}
            <SectionHeader title="Sharing" />
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <SettingsRow
                label="Action"
                value={settings.sharingAction}
                onPress={() => {
                  const next: SharingAction =
                    settings.sharingAction === 'Open share sheet' ? 'Save only' : 'Open share sheet';
                  updateSettings({ sharingAction: next });
                }}
              />
            </View>

            {/* EDITOR */}
            <SectionHeader title="Editor" />
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <SettingsRow
                label="Time Format"
                value={settings.timeFormat}
                onPress={() => {
                  const next: TimeFormat =
                    settings.timeFormat === 'Seconds' ? 'Frames' : 'Seconds';
                  updateSettings({ timeFormat: next });
                }}
              />
            </View>

            {/* FILTERS (Removed) */}

            <View style={{ height: 40 }} />
          </>
        ) : (
          // METADATA TAB
          <>
            <SectionHeader title="Metadata Info" />
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <ToggleRow
                label="Include Metadata"
                value={settings.includeMetadata}
                onValueChange={(val) => updateSettings({ includeMetadata: val })}
                description="When enabled, extracted frames will include creation date, GPS location and other EXIF metadata from the original video, if available."
              />
            </View>

            <SectionHeader title="What is included" />
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              {['Creation Date', 'GPS Location', 'Device Model', 'Camera Settings'].map(
                (item, i, arr) => (
                  <React.Fragment key={item}>
                    <SettingsRow
                      label={item}
                      showChevron={false}
                    />
                    {i < arr.length - 1 && (
                      <View
                        style={[styles.cardDivider, { backgroundColor: isDark ? '#2D2D3A' : '#F3F4F6' }]}
                      />
                    )}
                  </React.Fragment>
                )
              )}
            </View>
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  tabSwitcher: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardRowLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  cardDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  cardHint: {
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
