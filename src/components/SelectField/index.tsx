import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BORDER_RADIUS, COLORS } from "../../constants/theme";

interface SelectFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  enabled?: boolean;
}

export const SelectField = ({
  label,
  value,
  onValueChange,
  items,
  enabled = true,
}: SelectFieldProps) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.pickerWrapper, !enabled && styles.disabledInput]}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => onValueChange(itemValue)}
          enabled={enabled}
          mode="dropdown"
          style={styles.picker}
          dropdownIconColor={enabled ? COLORS.textMuted : COLORS.textMuted}
        >
          <Picker.Item label="Selecione..." value="" color={COLORS.textMuted} />

          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              style={styles.itemText}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
  },
  pickerWrapper: {
    height: 52,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 52,
    width: "100%",
    backgroundColor: "transparent",
    color: COLORS.text,
  },
  itemText: {
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
});
