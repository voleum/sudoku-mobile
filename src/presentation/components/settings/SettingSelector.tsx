import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface SelectorOption<T> {
  value: T;
  label: string;
  description?: string;
}

interface SettingSelectorProps<T> {
  title: string;
  description?: string;
  value: T;
  options: SelectorOption<T>[];
  onValueChange: (value: T) => void;
  disabled?: boolean;
  testID?: string;
}

export const SettingSelector = <T extends string | number>({
  title,
  description,
  value,
  options,
  onValueChange,
  disabled = false,
  testID,
}: SettingSelectorProps<T>) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const selectedLabel = selectedOption?.label || String(value);

  const handleSelect = (optionValue: T) => {
    onValueChange(optionValue);
    setIsModalVisible(false);
  };

  const renderOption = ({ item }: { item: SelectorOption<T> }) => {
    const isSelected = item.value === value;

    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.selectedOption]}
        onPress={() => handleSelect(item.value)}
        testID={`${testID}-option-${item.value}`}
      >
        <View style={styles.optionContent}>
          <Text
            style={[styles.optionLabel, isSelected && styles.selectedOptionText]}
            allowFontScaling={true}
          >
            {item.label}
          </Text>
          {item.description && (
            <Text
              style={[styles.optionDescription, isSelected && styles.selectedOptionDescription]}
              allowFontScaling={true}
            >
              {item.description}
            </Text>
          )}
        </View>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View testID={testID}>
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled]}
        onPress={() => !disabled && setIsModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${selectedLabel}`}
        accessibilityHint={description}
        accessibilityState={{ disabled }}
      >
        <View style={styles.content}>
          <Text
            style={[styles.title, disabled && styles.disabledText]}
            allowFontScaling={true}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={[styles.description, disabled && styles.disabledText]}
              allowFontScaling={true}
            >
              {description}
            </Text>
          )}
        </View>
        <View style={styles.valueContainer}>
          <Text
            style={[styles.selectedValue, disabled && styles.disabledText]}
            allowFontScaling={true}
          >
            {selectedLabel}
          </Text>
          <Text
            style={[styles.arrow, disabled && styles.disabledText]}
            allowFontScaling={true}
          >
            ›
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} allowFontScaling={true}>
                {title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
                testID={`${testID}-close`}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={renderOption}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    minHeight: Spacing.touchTarget + Spacing.md,
  },

  content: {
    flex: 1,
    marginRight: Spacing.md,
  },

  title: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },

  description: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedValue: {
    ...Typography.body1,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },

  arrow: {
    ...Typography.heading3,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.normal,
  },

  disabled: {
    opacity: 0.5,
  },

  disabledText: {
    color: Colors.text.tertiary,
  },

  // Modal стили
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.shadow + '80',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  modalTitle: {
    ...Typography.heading3,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.bold,
  },

  optionsList: {
    maxHeight: 300,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },

  selectedOption: {
    backgroundColor: Colors.primaryLight + '15',
  },

  optionContent: {
    flex: 1,
  },

  optionLabel: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },

  selectedOptionText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },

  optionDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  selectedOptionDescription: {
    color: Colors.primaryDark,
  },

  checkmark: {
    ...Typography.heading3,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.md,
  },
});