import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useTabBarVisual } from "@/src/providers/TabBarVisualProvider";

const TAB_META: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  home: { label: "Home", icon: "home-outline" },
  accounts: { label: "Accounts", icon: "wallet-outline" },
  goals: { label: "Goals", icon: "radio-button-on-outline" },
  invest: { label: "Invest", icon: "trending-up-outline" },
  "minta-ai": { label: "MiNTA AI", icon: "sparkles-outline" },
};

export default function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { scrollY } = useTabBarVisual();

  const clamped = Math.max(0, Math.min(scrollY, 140));
  const darkOpacity = 0.78 + (clamped / 140) * 0.16;
  const lightOpacity = 0.94 + (clamped / 140) * 0.04;
  const blurIntensity = 22 + Math.round((clamped / 140) * 18);

  const iosBackgroundColor = theme.isDark
    ? `rgba(9,11,16,${darkOpacity})`
    : `rgba(255,255,255,${lightOpacity})`;

  const androidBackgroundColor = theme.isDark
    ? "#0B0D11"
    : "#F7F8FA";

  const borderColor = theme.isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(10,13,20,0.06)";

  const visibleRoutes = state.routes.filter((route) => TAB_META[route.name]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <View
        style={[
          styles.barWrap,
          {
            backgroundColor:
              Platform.OS === "ios" ? iosBackgroundColor : androidBackgroundColor,
            borderTopColor: borderColor,
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={blurIntensity}
            tint={theme.isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <View style={styles.barContent}>
          {visibleRoutes.map((route) => {
            const originalIndex = state.routes.findIndex((r) => r.key === route.key);
            const isFocused = state.index === originalIndex;
            const meta = TAB_META[route.name];

            if (!meta) return null;

            return (
              <Pressable
                key={route.key}
                style={styles.item}
                android_ripple={{
                  color: theme.isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(10,13,20,0.05)",
                  borderless: false,
                }}
                onPress={() => {
                  if (!isFocused) {
                    navigation.navigate(route.name);
                  }
                }}
              >
                <View style={styles.inner}>
                  {isFocused ? (
                    <LinearGradient
                      colors={
                        theme.isDark
                          ? [
                              "rgba(87,242,200,0.18)",
                              "rgba(87,242,200,0.08)",
                              "rgba(71,199,255,0.06)",
                            ]
                          : [
                              "rgba(49,230,183,0.16)",
                              "rgba(49,230,183,0.08)",
                              "rgba(71,199,255,0.05)",
                            ]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeTile}
                    />
                  ) : null}

                  <Ionicons
                    name={meta.icon}
                    size={21}
                    color={isFocused ? theme.colors.tint : theme.colors.textMuted}
                  />

                  <AppText
                    variant="caption"
                    weight={isFocused ? "semibold" : "medium"}
                    color={isFocused ? theme.colors.tint : theme.colors.textMuted}
                    style={styles.label}
                    numberOfLines={1}
                  >
                    {meta.label}
                  </AppText>

                  <View
                    style={[
                      styles.dot,
                      {
                        opacity: isFocused ? 1 : 0,
                        backgroundColor: theme.colors.tint,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 6,
    backgroundColor: "transparent",
  },
  barWrap: {
    minHeight: 82,
    borderTopWidth: 1,
    overflow: "hidden",
  },
  barContent: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  item: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  inner: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 14,
    paddingVertical: 4,
    overflow: "hidden",
  },
  activeTile: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 2,
  },
});