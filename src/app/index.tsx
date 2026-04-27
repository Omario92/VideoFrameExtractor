import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getHasSeenOnboarding } from '@/utils/storage';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    getHasSeenOnboarding().then((seen) => {
      setHasSeenOnboarding(seen);
      setIsChecking(false);
    });
  }, []);

  if (isChecking) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
