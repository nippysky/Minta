import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useTabBarVisual } from "@/src/providers/TabBarVisualProvider";

export default function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { scrollY } = useTabBarVisual();
  const { t } = useLanguage();

  const TAB_META: Record<
    string,
    { label: string; icon: keyof typeof Ionicons.glyphMap }
  > = {
    home: { label: t("nav.home"), icon: "home-outline" },
    accounts: { label: t("nav.accounts"), icon: "wallet-outline" },
    goals: { label: t("nav.goals"), icon: "radio-button-on-outline" },
    invest: { label: t("nav.invest"), icon: "trending-up-outline" },
    "minta-ai": { label: t("nav.ai"), icon: "sparkles-outline" },
  };

  const clamped = Math.max(0, Math.min(scrollY, 140));
  const backgroundOpacity = theme.isDark
    ? 0.72 + (clamped / 140) * 0.18
    : 0.86 + (clamped / 140) * 0.10;

  const blurIntensity = 22 + Math.round((clamped / 140) * 18);

  const barBackground = theme.isDark
    ? `rgba(9, 11, 16, ${backgroundOpacity})`
    : `rgba(255, 255, 255, ${backgroundOpacity})`;

  const activeGradientColors: [string, string, string] = theme.isDark
    ? ["rgba(77,230,190,0.20)", "rgba(77,230,190,0.10)", "rgba(120,110,255,0.08)"]
    : ["rgba(77,230,190,0.18)", "rgba(77,230,190,0.10)", "rgba(71,199,255,0.08)"];

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
            borderTopColor: theme.colors.borderSoft,
            backgroundColor: barBackground,
          },
        ]}
      >
        <BlurView
          intensity={blurIntensity}
          tint={theme.isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.barContent}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const meta = TAB_META[route.name];

            return (
              <Pressable
                key={route.key}
                onPress={() => {
                  if (!isFocused) {
                    navigation.navigate(route.name);
                  }
                }}
                style={styles.item}
              >
                <View style={styles.inner}>
                  {isFocused ? (
                    <LinearGradient
                      colors={activeGradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeTile}
                    />
                  ) : null}

                  <Ionicons
                    name={meta.icon}
                    size={22}
                    color={isFocused ? theme.colors.tint : theme.colors.textMuted}
                  />

                  <AppText
                    variant="caption"
                    weight={isFocused ? "semibold" : "medium"}
                    color={isFocused ? theme.colors.tint : theme.colors.textMuted}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.label}
                  >
                    {meta.label}
                  </AppText>

                  {isFocused ? (
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: theme.colors.tint,
                        },
                      ]}
                    />
                  ) : (
                    <View style={styles.dotPlaceholder} />
                  )}
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
    minHeight: 84,
    borderTopWidth: 1,
    overflow: "hidden",
  },
  barContent: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  item: {
    flex: 1,
  },
  inner: {
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
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
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 6,
    height: 6,
    marginTop: 2,
  },
});