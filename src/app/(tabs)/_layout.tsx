import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  // Single-tab layout — tabs bar hidden
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="home" />
    </Tabs>
  );
}
