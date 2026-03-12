import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
          dropdownIconColor={enabled ? "#64748b" : "#cbd5e1"}
        >
          <Picker.Item label="Selecione..." value="" color="#94a3b8" />

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
    color: "#475569",
    marginBottom: 6,
  },
  pickerWrapper: {
    height: 52,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 52,
    width: "100%",
    backgroundColor: "transparent",
    color: "#1e293b",
  },
  itemText: {
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
});
