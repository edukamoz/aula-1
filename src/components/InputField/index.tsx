import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface CustomInputProps extends TextInputProps {
  label: string;
}

export const InputField = React.forwardRef<TextInput, CustomInputProps>(
  ({ label, style, ...props }, ref) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        style={[
          styles.inputWrapper,
          props.editable === false && styles.disabledInput,
        ]}
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  ),
);

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 6 },
  inputWrapper: {
    height: 52,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  disabledInput: { backgroundColor: "#f1f5f9", color: "#64748b" },
});
