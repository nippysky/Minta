import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = Omit<TextInputProps, "placeholder"> & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
};

export default function BrandTextInput({
  value = "",
  onChangeText,
  onBlur,
  label,
  icon,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  ...rest
}: Props) {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));
  const inputRef = useRef<TextInput>(null);

  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;
  const active = isFocused || String(value).length > 0;
  const hasError = Boolean(error);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: active ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [active, animated]);

  const labelStyle = useMemo(
    () => ({
      left: animated.interpolate({
        inputRange: [0, 1],
        outputRange: [52, 52],
      }),
      top: animated.interpolate({
        inputRange: [0, 1],
        outputRange: [22, 9],
      }),
      fontSize: animated.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      color: hasError
        ? "#EF4444"
        : active
        ? theme.colors.iconFocused
        : theme.colors.placeholder,
    }),
    [
      active,
      animated,
      hasError,
      theme.colors.iconFocused,
      theme.colors.placeholder,
    ]
  );

  const borderColor = hasError
    ? "#EF4444"
    : active
    ? theme.colors.borderFocus
    : theme.colors.borderSoft;

  const iconColor = hasError
    ? "#EF4444"
    : active
    ? theme.colors.iconFocused
    : theme.colors.icon;

  return (
    <View style={styles.fieldWrap}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.wrapper,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor,
            shadowColor: active && !hasError ? theme.colors.glow : "transparent",
          },
        ]}
      >
        <View style={styles.leftIconWrap}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>

        <Animated.Text
          pointerEvents="none"
          style={[
            styles.label,
            {
              fontFamily: active ? theme.fonts.bodyMedium : theme.fonts.bodyRegular,
            },
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={isHidden}
          selectionColor={theme.colors.tint}
          placeholder=""
          onFocus={() => setIsFocused(true)}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontFamily: theme.fonts.bodyRegular,
            },
          ]}
          {...rest}
        />

        {secureTextEntry ? (
          <Pressable onPress={() => setIsHidden((prev) => !prev)} hitSlop={10}>
            <Ionicons
              name={isHidden ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={iconColor}
            />
          </Pressable>
        ) : null}
      </Pressable>

      {hasError ? (
        <AppText variant="caption" color="#EF4444" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    gap: 8,
  },
  wrapper: {
    minHeight: 72,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingLeft: 16,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 2,
  },
  leftIconWrap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  label: {
    position: "absolute",
  },
  input: {
    flex: 1,
    height: 72,
    paddingTop: 18,
    fontSize: 16,
  },
  errorText: {
    paddingLeft: 6,
  },
});