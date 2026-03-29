import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  UIManager,
  View,
} from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type SettingsAccordionItem = {
  id: string;
  label: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type?: "link" | "toggle";
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  highlight?: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultExpanded?: boolean;
  items: SettingsAccordionItem[];
};

export default function SettingsAccordionCard({
  title,
  subtitle,
  icon,
  items,
  defaultExpanded = false,
}: Props) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotate = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [expanded, rotate]);

  const chevronStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
          }),
        },
      ],
    }),
    [rotate]
  );

  const cardStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.borderSoft,
    }),
    [theme.colors.borderSoft, theme.colors.surface]
  );

  return (
    <View style={[styles.card, cardStyle]}>
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded((prev) => !prev);
        }}
        style={({ pressed }) => [
          styles.header,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: theme.colors.surfaceElevated,
              },
            ]}
          >
            <Ionicons name={icon} size={20} color={theme.colors.text} />
          </View>

          <View style={styles.textWrap}>
            <AppText variant="title" weight="semibold" style={styles.title}>
              {title}
            </AppText>

            <AppText variant="body" color={theme.colors.textSecondary}>
              {subtitle}
            </AppText>
          </View>
        </View>

        <Animated.View style={chevronStyle}>
          <Ionicons
            name="chevron-down"
            size={18}
            color={theme.colors.textSecondary}
          />
        </Animated.View>
      </Pressable>

      {expanded ? (
        <View
          style={[
            styles.expandedBody,
            {
              borderTopColor: theme.colors.borderSoft,
            },
          ]}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const tintColor = item.danger
              ? "#EF4444"
              : item.highlight
                ? theme.colors.tint
                : theme.colors.text;

            return (
              <Pressable
                key={item.id}
                disabled={item.type === "toggle" && !item.onPress}
                onPress={item.type === "link" ? item.onPress : undefined}
                style={({ pressed }) => [
                  styles.itemRow,
                  !isLast && [
                    styles.itemBorder,
                    { borderBottomColor: theme.colors.borderSoft },
                  ],
                  pressed && item.type === "link" && styles.pressed,
                ]}
              >
                <View style={styles.itemLeft}>
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={tintColor}
                    style={styles.itemIcon}
                  />

                  <View style={styles.itemTextWrap}>
                    <AppText
                      variant="body"
                      weight={item.highlight ? "semibold" : "medium"}
                      color={tintColor}
                    >
                      {item.label}
                    </AppText>

                    {item.description ? (
                      <AppText
                        variant="caption"
                        color={theme.colors.textSecondary}
                        style={styles.itemDescription}
                      >
                        {item.description}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                {item.type === "toggle" ? (
                  <Switch
                    value={!!item.value}
                    onValueChange={item.onToggle}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.tint,
                    }}
                    thumbColor={theme.isDark ? "#050816" : "#FFFFFF"}
                    ios_backgroundColor={theme.colors.border}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    minHeight: 92,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
  },
  expandedBody: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
  },
  itemRow: {
    minHeight: 64,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemIcon: {
    width: 20,
    textAlign: "center",
  },
  itemTextWrap: {
    flex: 1,
  },
  itemDescription: {
    marginTop: 2,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  pressed: {
    opacity: 0.86,
  },
});