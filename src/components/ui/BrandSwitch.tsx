import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function BrandSwitch({
  label,
  value,
  onChange,
  disabled = false,
}: Props) {
  const theme = useAppTheme();
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  const trackBackgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.tint],
  });

  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  const thumbScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  const handlePress = () => {
    if (disabled) return;
    onChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        disabled && styles.disabled,
        pressed && !disabled ? styles.pressed : null,
      ]}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackBackgroundColor,
            borderColor: value ? theme.colors.tint : theme.colors.borderSoft,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: value ? "#06110D" : "#FFFFFF",
              transform: [{ translateX: thumbTranslateX }, { scale: thumbScale }],
            },
          ]}
        />
      </Animated.View>

      {label ? (
        <AppText variant="label" color={theme.colors.textSecondary} weight="medium">
          {label}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  track: {
    width: 50,
    height: 30,
    borderRadius: 999,
    padding: 3,
    justifyContent: "center",
    borderWidth: 1,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.9,
  },
});