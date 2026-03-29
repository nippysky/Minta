import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
import type { ThemePreference } from "@/src/providers/ThemeProvider";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ThemeSelectorItem = {
  type: "theme-selector";
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
};

type LanguageOption = {
  key: string;
  flag: string;
  label: string;
  subtitle: string;
};

type LanguageSelectorItem = {
  type: "language-selector";
  label: string;
  value: string;
  options: LanguageOption[];
  onChange: (value: string) => void;
};

type ToggleItem = {
  type: "toggle";
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  value: boolean;
  onToggle: (value: boolean) => void;
};

type LinkItem = {
  type: "link";
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  highlight?: boolean;
};

type ActionItem = {
  type: "action";
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  highlight?: boolean;
};

export type SettingsAccordionItem =
  | ThemeSelectorItem
  | LanguageSelectorItem
  | ToggleItem
  | LinkItem
  | ActionItem;

type Props = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: SettingsAccordionItem[];
};

const THEME_OPTIONS: {
  key: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "light", label: "Light", icon: "sunny-outline" },
  { key: "dark", label: "Dark", icon: "moon-outline" },
  { key: "system", label: "System", icon: "desktop-outline" },
];

export default function SettingsAccordionCard({
  title,
  subtitle,
  icon,
  items,
}: Props) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotate]);

  const cardStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.borderSoft,
    }),
    [theme.colors.borderSoft, theme.colors.surface]
  );

  const renderThemeSelector = (item: ThemeSelectorItem) => {
    return (
      <View style={styles.block}>
        <AppText variant="title" weight="bold" style={styles.blockHeading}>
          Theme
        </AppText>

        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const active = item.value === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => item.onChange(option.key)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: active ? theme.colors.tint : theme.colors.borderSoft,
                  },
                  active
                    ? {
                        shadowColor: theme.colors.tint,
                        shadowOpacity: 0.16,
                        shadowRadius: 14,
                        elevation: 4,
                      }
                    : null,
                ]}
              >
                <View
                  style={[
                    styles.themeCardInner,
                    active
                      ? {
                          backgroundColor: "rgba(77, 230, 190, 0.10)",
                        }
                      : null,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={active ? theme.colors.tint : theme.colors.textSecondary}
                  />
                  <AppText
                    variant="label"
                    weight="semibold"
                    color={active ? theme.colors.tint : theme.colors.text}
                  >
                    {option.label}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLanguageSelector = (item: LanguageSelectorItem) => {
    const selected = item.options.find((option) => option.key === item.value);

    return (
      <View style={styles.block}>
        <View style={styles.languageHeaderRow}>
          <Ionicons
            name="globe-outline"
            size={24}
            color={theme.colors.textSecondary}
          />

          <View style={styles.languageHeaderText}>
            <AppText variant="title" weight="semibold" style={styles.blockHeading}>
              {item.label}
            </AppText>
            {selected ? (
              <AppText variant="body" color={theme.colors.textSecondary}>
                {selected.flag} {selected.label}
              </AppText>
            ) : null}
          </View>
        </View>

        <View style={styles.languageList}>
          {item.options.map((option) => {
            const active = item.value === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => item.onChange(option.key)}
                style={[
                  styles.languageCard,
                  {
                    backgroundColor: active
                      ? "rgba(77, 230, 190, 0.16)"
                      : theme.colors.surfaceElevated,
                    borderColor: active ? theme.colors.tint : "transparent",
                  },
                ]}
              >
                <View style={styles.languageLeft}>
                  <AppText variant="body" style={styles.flagText}>
                    {option.flag}
                  </AppText>

                  <View style={styles.languageTextWrap}>
                    <AppText variant="label" weight="semibold">
                      {option.label}
                    </AppText>
                    <AppText variant="body" color={theme.colors.textSecondary}>
                      {option.subtitle}
                    </AppText>
                  </View>
                </View>

                {active ? (
                  <View
                    style={[
                      styles.languageCheckWrap,
                      {
                        backgroundColor: theme.colors.tint,
                      },
                    ]}
                  >
                    <Ionicons name="checkmark" size={16} color="#06110D" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderToggleItem = (item: ToggleItem, index: number, total: number) => {
    const isLast = index === total - 1;

    return (
      <View
        key={`${item.label}-${index}`}
        style={[
          styles.rowItem,
          !isLast
            ? {
                borderBottomColor: theme.colors.borderSoft,
                borderBottomWidth: 1,
              }
            : null,
        ]}
      >
        <View style={styles.rowItemLeft}>
          <Ionicons name={item.icon} size={24} color={theme.colors.textSecondary} />

          <View style={styles.rowItemText}>
            <AppText variant="title" weight="semibold" style={styles.rowTitle}>
              {item.label}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {item.subtitle}
            </AppText>
          </View>
        </View>

        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{
            false: theme.colors.border,
            true: "rgba(77, 230, 190, 0.88)",
          }}
          thumbColor="#000000"
          ios_backgroundColor={theme.colors.border}
        />
      </View>
    );
  };

  const renderLinkItem = (item: LinkItem | ActionItem, index: number, total: number) => {
    const isLast = index === total - 1;
    const highlighted = !!item.highlight;

    return (
      <Pressable
        key={`${item.label}-${index}`}
        onPress={item.onPress}
        style={[
          styles.rowItem,
          !isLast
            ? {
                borderBottomColor: theme.colors.borderSoft,
                borderBottomWidth: 1,
              }
            : null,
        ]}
      >
        <View style={styles.rowItemLeft}>
          <Ionicons
            name={item.icon}
            size={24}
            color={highlighted ? theme.colors.tint : theme.colors.textSecondary}
          />

          <View style={styles.rowItemText}>
            <AppText
              variant="title"
              weight="semibold"
              style={styles.rowTitle}
              color={highlighted ? theme.colors.tint : theme.colors.text}
            >
              {item.label}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {item.subtitle}
            </AppText>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={highlighted ? theme.colors.tint : theme.colors.textMuted}
        />
      </Pressable>
    );
  };

  return (
    <View style={[styles.card, cardStyle]}>
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded((prev) => !prev);
        }}
        style={styles.header}
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
            <Ionicons name={icon} size={22} color={theme.colors.text} />
          </View>

          <View style={styles.textWrap}>
            <AppText variant="title" weight="bold" style={styles.title}>
              {title}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {subtitle}
            </AppText>
          </View>
        </View>

        <Animated.View
          style={{
            transform: [
              {
                rotate: rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          }}
        >
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
            if (item.type === "theme-selector") {
              return <View key={`theme-${index}`}>{renderThemeSelector(item)}</View>;
            }

            if (item.type === "language-selector") {
              return (
                <View key={`language-${index}`}>
                  {renderLanguageSelector(item)}
                </View>
              );
            }

            if (item.type === "toggle") {
              const toggleItems = items.filter(
                (entry): entry is ToggleItem => entry.type === "toggle"
              );
              const toggleIndex = toggleItems.findIndex(
                (entry) => entry.label === item.label
              );
              return renderToggleItem(item, toggleIndex, toggleItems.length);
            }

            const linkItems = items.filter(
              (entry): entry is LinkItem | ActionItem =>
                entry.type === "link" || entry.type === "action"
            );
            const linkIndex = linkItems.findIndex(
              (entry) => entry.label === item.label
            );

            return renderLinkItem(item, linkIndex, linkItems.length);
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
    minHeight: 86,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  expandedBody: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  block: {
    gap: 14,
  },
  blockHeading: {
    fontSize: 16,
    lineHeight: 22,
  },
  themeRow: {
    flexDirection: "row",
    gap: 12,
  },
  themeCard: {
    flex: 1,
    minHeight: 98,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  themeCardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  languageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  languageHeaderText: {
    flex: 1,
    gap: 2,
  },
  languageList: {
    gap: 10,
  },
  languageCard: {
    minHeight: 84,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  languageLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  languageTextWrap: {
    flex: 1,
    gap: 2,
  },
  flagText: {
    fontSize: 22,
    lineHeight: 28,
  },
  languageCheckWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rowItem: {
    minHeight: 84,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  rowItemText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
});