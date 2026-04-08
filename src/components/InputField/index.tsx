import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { BORDER_RADIUS, COLORS } from "../../constants/theme";

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
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
    </View>
  ),
);

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 15 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 52,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  disabledInput: { backgroundColor: COLORS.surface, color: COLORS.textMuted },
});
