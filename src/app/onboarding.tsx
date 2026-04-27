import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setHasSeenOnboarding } from '@/utils/storage';
import {
  requestImagePickerPermission,
  requestMediaLibraryPermission,
} from '@/utils/permissions';

const { width } = Dimensions.get('window');

interface Step {
  icon: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: 'ℹ️',
    title: 'Allow Access',
    description: 'Get started by allowing access to your videos and photos.',
  },
  {
    icon: '👆',
    title: 'Choose Video or Live Photo',
    description: 'Select a video or live photo from your camera roll.',
  },
  {
    icon: '🖼️',
    title: 'Grab a Frame',
    description: 'Move the slider to the desired point in the video to capture an image.',
  },
  {
    icon: '✨',
    title: 'Add a Filter',
    description: 'Elevate your new photo to the next level by applying a stunning filter.',
  },
  {
    icon: '⬇️',
    title: 'Save and Share',
    description: 'Save your new photo to your camera roll or share it with your friends!',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    // Request permissions upfront
    await requestImagePickerPermission();
    await requestMediaLibraryPermission();
    // Mark onboarding as done
    await setHasSeenOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How To Use</Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              {/* Icon */}
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>{step.icon}</Text>
              </View>
              {/* Text */}
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom fixed area */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.getStartedBtn}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedText}>GET STARTED</Text>
        </TouchableOpacity>

        <View style={styles.privacyRow}>
          <Text style={styles.privacyEmoji}>👍</Text>
          <Text style={styles.privacyText}> Your videos remain private.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  stepsContainer: {
    gap: 28,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 24,
  },
  stepTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  spacer: {
    height: 32,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  getStartedBtn: {
    backgroundColor: '#6B21A8',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#6B21A8',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 16,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyEmoji: {
    fontSize: 14,
    color: '#7C3AED',
  },
  privacyText: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '500',
  },
});
