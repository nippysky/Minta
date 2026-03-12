import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  value: string;
  onChangeValue: (value: string) => void;
  length?: number;
  error?: string;
};

export default function OtpCodeInput({
  value,
  onChangeValue,
  length = 6,
  error,
}: Props) {
  const theme = useAppTheme();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const digits = useMemo(() => {
    const chars = value.split("").slice(0, length);
    return Array.from({ length }, (_, index) => chars[index] ?? "");
  }, [length, value]);

  useEffect(() => {
    if (focusedIndex !== null) {
      inputRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const updateDigit = (text: string, index: number) => {
    const clean = text.replace(/\D/g, "");

    if (!clean) {
      const next = [...digits];
      next[index] = "";
      onChangeValue(next.join(""));
      return;
    }

    const next = [...digits];
    next[index] = clean.slice(-1);
    onChangeValue(next.join(""));

    if (index < length - 1) {
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (event.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      onChangeValue(next.join(""));
      setFocusedIndex(index - 1);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {digits.map((digit, index) => {
          const isFocused = focusedIndex === index;
          const hasError = Boolean(error);

          return (
            <Pressable
              key={index}
              onPress={() => setFocusedIndex(index)}
              style={[
                styles.box,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: hasError
                    ? "#EF4444"
                    : isFocused
                    ? theme.colors.borderFocus
                    : theme.colors.borderSoft,
                  shadowColor:
                    isFocused && !hasError ? theme.colors.glow : "transparent",
                },
              ]}
            >
              <TextInput
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => updateDigit(text, index)}
                onFocus={() => setFocusedIndex(index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                caretHidden
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts.headingSemiBold,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <AppText variant="caption" color="#EF4444" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  box: {
    flex: 1,
    minWidth: 0,
    height: 64,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 2,
  },
  input: {
    width: "100%",
    textAlign: "center",
    fontSize: 24,
    lineHeight: 28,
  },
  errorText: {
    textAlign: "center",
  },
});