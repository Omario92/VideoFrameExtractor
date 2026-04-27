import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterType } from '@/types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFilter: FilterType | undefined;
  onApplyFilter: (filter: FilterType) => void;
  isDark: boolean;
}

const getFilterOverlay = (filter?: string) => {
  switch (filter) {
    case 'Vivid': return { backgroundColor: 'rgba(255, 100, 100, 0.1)' };
    case 'Black & White': return null;
    case 'Warm': return { backgroundColor: 'rgba(255, 150, 0, 0.2)' };
    case 'Cool': return { backgroundColor: 'rgba(0, 150, 255, 0.2)' };
    default: return null;
  }
};

const FILTERS: FilterType[] = ['Original', 'Vivid', 'Black & White', 'Warm', 'Cool'];

export function FilterModal({ visible, onClose, selectedFilter, onApplyFilter, isDark }: FilterModalProps) {
  const surfaceBg = isDark ? '#1C1C24' : '#FFFFFF';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: surfaceBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Apply Filter</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterOption,
                  selectedFilter === f && { borderColor: '#7C3AED', borderWidth: 2 }
                ]}
                onPress={() => onApplyFilter(f)}
                activeOpacity={0.8}
              >
                <View style={[styles.filterPreview, getFilterOverlay(f)]} />
                <Text style={[styles.filterText, { color: textPrimary }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  filterOption: {
    alignItems: 'center',
    gap: 8,
    padding: 4,
    borderRadius: 12,
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
