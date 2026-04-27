import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';

// ─── Generic row ────────────────────────────────────────────────
interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

export function SettingsRow({ label, value, onPress, showChevron = true }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      disabled={!onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {showChevron && onPress && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── Toggle row ─────────────────────────────────────────────────
interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  description?: string;
}

export function ToggleRow({ label, value, onValueChange, description }: ToggleRowProps) {
  return (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleRow}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#374151', true: '#7C3AED' }}
          thumbColor={value ? '#fff' : '#9CA3AF'}
          ios_backgroundColor="#374151"
        />
      </View>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

// ─── Section header ─────────────────────────────────────────────
export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Segmented control ──────────────────────────────────────────
interface SegmentedControlProps<T extends string> {
  options: T[];
  selected: T;
  onSelect: (val: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.segment, selected === opt && styles.segmentActive]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.75}
        >
          <Text style={[styles.segmentText, selected === opt && styles.segmentTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Quality stepper ────────────────────────────────────────────
interface QualityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function QualityStepper({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 5,
}: QualityStepperProps) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperValue}>{value}%</Text>
      <View style={styles.stepperButtons}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.max(min, value - step))}
          activeOpacity={0.75}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.min(max, value + step))}
          activeOpacity={0.75}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 15,
    color: '#6B7280',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  // Toggle
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  // Segmented
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    alignSelf: 'flex-start',
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    minWidth: 48,
  },
  stepperButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 22,
  },
});
