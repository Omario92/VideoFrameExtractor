import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_DONE: 'vfe_onboarding_done',
  SETTINGS: 'vfe_settings',
} as const;

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setHasSeenOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
  } catch {
    // silently fail
  }
}

export async function getStoredSettings<T>(defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultValue;
    return { ...defaultValue, ...JSON.parse(raw) };
  } catch {
    return defaultValue;
  }
}

export async function saveSettings<T>(settings: T): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // silently fail
  }
}
