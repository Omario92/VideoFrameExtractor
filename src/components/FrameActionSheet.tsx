import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FrameActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: () => void;
  onSelectMultiple: () => void;
}

export function FrameActionSheet({
  visible,
  onClose,
  onApplyFilter,
  onSelectMultiple,
}: FrameActionSheetProps) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#1C1C24' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const border = isDark ? '#2D2D3A' : '#E5E7EB';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: bg }]}>
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }]} />
              </View>

              <Text style={[styles.title, { color: textPrimary }]}>Frame Options</Text>

              <TouchableOpacity
                style={[styles.option, { borderBottomColor: border, borderBottomWidth: StyleSheet.hairlineWidth }]}
                onPress={() => {
                  onClose();
                  // slight delay to allow modal to close before opening another
                  setTimeout(onApplyFilter, 100);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="color-filter-outline" size={24} color="#7C3AED" />
                <Text style={[styles.optionText, { color: textPrimary }]}>Apply Filter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onClose();
                  onSelectMultiple();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="checkbox-outline" size={24} color="#7C3AED" />
                <Text style={[styles.optionText, { color: textPrimary }]}>Select Multiple</Text>
              </TouchableOpacity>
              
              <View style={[styles.footerDivider, { backgroundColor: border }]} />
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, { color: textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30, // SafeArea roughly
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footerDivider: {
    height: 8,
    width: '100%',
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
