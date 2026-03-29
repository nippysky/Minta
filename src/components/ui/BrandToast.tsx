import { Ionicons } from "@expo/vector-icons";
import { Animated, StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

export type ToastType = "success" | "error" | "info";

export type ToastPayload = {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
};

type Props = {
  toast: ToastPayload | null;
  animatedValue: Animated.Value;
};

export default function BrandToast({ toast, animatedValue }: Props) {
  const theme = useAppTheme();

  if (!toast) return null;

  const tone = {
    success: {
      icon: "checkmark-circle" as const,
      iconColor: theme.colors.tint,
      borderColor: "rgba(77, 230, 190, 0.30)",
      backgroundColor: theme.isDark ? "rgba(13, 18, 20, 0.96)" : "rgba(255,255,255,0.98)",
    },
    error: {
      icon: "alert-circle" as const,
      iconColor: "#FF5A5F",
      borderColor: "rgba(255, 90, 95, 0.26)",
      backgroundColor: theme.isDark ? "rgba(22, 13, 15, 0.98)" : "rgba(255,255,255,0.98)",
    },
    info: {
      icon: "information-circle" as const,
      iconColor: theme.colors.textSecondary,
      borderColor: theme.colors.borderSoft,
      backgroundColor: theme.isDark ? "rgba(13, 16, 20, 0.96)" : "rgba(255,255,255,0.98)",
    },
  }[toast.type];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, 0],
              }),
            },
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: tone.backgroundColor,
            borderColor: tone.borderColor,
            shadowColor: theme.isDark ? "#000000" : theme.colors.shadow,
          },
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={tone.icon} size={18} color={tone.iconColor} />
        </View>

        <View style={styles.textWrap}>
          {toast.title ? (
            <AppText variant="label" weight="semibold" style={styles.title}>
              {toast.title}
            </AppText>
          ) : null}

          <AppText
            variant="caption"
            color={theme.colors.textSecondary}
            style={styles.message}
          >
            {toast.message}
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  card: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  iconWrap: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    lineHeight: 16,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
});