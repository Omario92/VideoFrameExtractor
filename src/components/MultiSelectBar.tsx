import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFrames } from '@/context/FramesContext';
import { Ionicons } from '@expo/vector-icons';

export function MultiSelectBar() {
  const { 
    isMultiSelectMode, 
    selectedFrameIds, 
    extractedFrames,
    setIsMultiSelectMode,
    selectAll,
    clearSelection,
    saveSelectedFrames,
    shareSelectedFrames,
    deleteSelectedFrames
  } = useFrames();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  if (!isMultiSelectMode) return null;

  const bg = isDark ? '#1C1C24' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const border = isDark ? '#2D2D3A' : '#E5E7EB';

  const isAllSelected = selectedFrameIds.length === extractedFrames.length && extractedFrames.length > 0;

  return (
    <>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: bg, borderBottomColor: border, paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={isAllSelected ? clearSelection : selectAll} style={styles.topBtn} activeOpacity={0.7}>
          <Text style={styles.topBtnText}>{isAllSelected ? 'Deselect All' : 'Select All'}</Text>
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: textPrimary }]}>{selectedFrameIds.length} Selected</Text>
        
        <TouchableOpacity onPress={() => {
          setIsMultiSelectMode(false);
          clearSelection();
        }} style={styles.topBtn} activeOpacity={0.7}>
          <Text style={styles.topBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: bg, borderTopColor: border, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.bottomBtn} onPress={shareSelectedFrames} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={24} color="#7C3AED" />
          <Text style={styles.bottomBtnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBtn} onPress={saveSelectedFrames} activeOpacity={0.7}>
          <Ionicons name="download-outline" size={24} color="#7C3AED" />
          <Text style={styles.bottomBtnText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBtn} onPress={deleteSelectedFrames} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
          <Text style={[styles.bottomBtnText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  topBtn: {
    padding: 8,
  },
  topBtnText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  bottomBtn: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  bottomBtnText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '600',
  },
});
