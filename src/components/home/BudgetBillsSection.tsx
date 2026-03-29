import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/src/components/ui/AppText";
import BrandCard from "@/src/components/ui/BrandCard";
import TourTarget from "@/src/components/ui/TourTarget";
import { formatNaira } from "@/src/features/home/lib/currency";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Bill = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  tone: "danger" | "default";
  tag?: string;
};

type BudgetItem = {
  id: string;
  title: string;
  spent: number;
  limit: number;
  icon: string;
  tone: "warning" | "danger" | "healthy";
};

type Props = {
  activeTab: "budgets" | "bills";
  onChangeTab: (tab: "budgets" | "bills") => void;
  budgets: BudgetItem[];
  bills: Bill[];
};

function BudgetProgressBar({
  progress,
  fillColor,
  trackColor,
  active,
}: {
  progress: number;
  fillColor: string;
  trackColor: string;
  active: boolean;
}) {
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      animated.setValue(0);
      return;
    }

    Animated.timing(animated, {
      toValue: Math.min(progress, 1),
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active, animated, progress]);

  const width = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: trackColor,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.progressFill,
          {
            width,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

export default function BudgetBillsSection({
  activeTab,
  budgets,
  bills,
  onChangeTab,
}: Props) {
  const theme = useAppTheme();

  const overdueRowBg = theme.isDark
    ? "rgba(111, 10, 20, 0.28)"
    : "rgba(191, 63, 74, 0.10)";

  const overdueRowBorder = theme.isDark
    ? "rgba(239, 68, 68, 0.24)"
    : "rgba(191, 63, 74, 0.16)";

  const overdueIconBg = theme.isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(191, 63, 74, 0.10)";

  return (
    <TourTarget id="budget-bills">
      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.segment,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <Pressable
              onPress={() => onChangeTab("budgets")}
              style={[
                styles.segmentItem,
                activeTab === "budgets"
                  ? { backgroundColor: theme.colors.surfaceElevated }
                  : null,
              ]}
            >
              <AppText
                variant="label"
                weight="semibold"
                color={
                  activeTab === "budgets"
                    ? theme.colors.text
                    : theme.colors.textSecondary
                }
              >
                Budgets
              </AppText>
              <View style={[styles.dot, { backgroundColor: "#F9A44B" }]} />
            </Pressable>

            <Pressable
              onPress={() => onChangeTab("bills")}
              style={[
                styles.segmentItem,
                activeTab === "bills"
                  ? { backgroundColor: theme.colors.surfaceElevated }
                  : null,
              ]}
            >
              <AppText
                variant="label"
                weight="semibold"
                color={
                  activeTab === "bills"
                    ? theme.colors.text
                    : theme.colors.textSecondary
                }
              >
                Bills
              </AppText>
              <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
            </Pressable>
          </View>

          <Pressable style={styles.seeAllRow}>
            <AppText variant="label" weight="bold" color={theme.colors.tint}>
              See All
            </AppText>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={theme.colors.tint}
            />
          </Pressable>
        </View>

        <BrandCard style={styles.listCard}>
          {activeTab === "budgets" ? (
            <View style={styles.list}>
              {budgets.map((item) => {
                const progress = item.limit > 0 ? item.spent / item.limit : 0;

                const fillColor =
                  item.tone === "warning"
                    ? "#F4C21D"
                    : item.tone === "danger"
                    ? "#FF5A5F"
                    : theme.colors.tint;

                const trackColor =
                  item.tone === "warning"
                    ? "rgba(244, 194, 29, 0.22)"
                    : item.tone === "danger"
                    ? "rgba(255, 90, 95, 0.18)"
                    : "rgba(77, 230, 190, 0.16)";

                return (
                  <View key={item.id} style={styles.budgetRow}>
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetTitleWrap}>
                        <AppText variant="body" style={styles.budgetEmoji}>
                          {item.icon}
                        </AppText>

                        <AppText
                          variant="label"
                          weight="semibold"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.budgetTitle}
                        >
                          {item.title}
                        </AppText>
                      </View>

                      <AppText
                        variant="body"
                        color={theme.colors.textSecondary}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.budgetAmount}
                      >
                        {formatNaira(item.spent)} / {formatNaira(item.limit)}
                      </AppText>
                    </View>

                    <BudgetProgressBar
                      progress={progress}
                      fillColor={fillColor}
                      trackColor={trackColor}
                      active={activeTab === "budgets"}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.list}>
              {bills.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.billRow,
                    {
                      backgroundColor:
                        item.tone === "danger"
                          ? overdueRowBg
                          : theme.colors.surfaceElevated,
                      borderColor:
                        item.tone === "danger"
                          ? overdueRowBorder
                          : "transparent",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.billIcon,
                      {
                        backgroundColor:
                          item.tone === "danger"
                            ? overdueIconBg
                            : item.id === "ikedc"
                            ? "rgba(255, 184, 0, 0.14)"
                            : item.id === "dstv"
                            ? "rgba(120, 160, 255, 0.12)"
                            : "rgba(255,255,255,0.06)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.id === "ikedc"
                          ? "flash-outline"
                          : item.id === "dstv"
                          ? "tv-outline"
                          : "planet-outline"
                      }
                      size={18}
                      color={
                        item.id === "ikedc"
                          ? "#FFB800"
                          : item.id === "dstv"
                          ? "#A5C1FF"
                          : theme.colors.textSecondary
                      }
                    />
                  </View>

                  <View style={styles.billTextWrap}>
                    <AppText
                      variant="label"
                      weight="semibold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </AppText>

                    <AppText
                      variant="body"
                      color={
                        item.tone === "danger"
                          ? "#FF5A5A"
                          : theme.colors.textSecondary
                      }
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.subtitle}
                    </AppText>
                  </View>

                  <View style={styles.billAmountWrap}>
                    <AppText
                      variant="label"
                      weight="bold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {formatNaira(item.amount)}
                    </AppText>

                    {item.tag ? (
                      <AppText
                        variant="body"
                        color={theme.colors.tint}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.tag}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </BrandCard>
      </View>
    </TourTarget>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  segment: {
    flexDirection: "row",
    padding: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  segmentItem: {
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  listCard: {
    padding: 12,
  },
  list: {
    gap: 14,
  },
  budgetRow: {
    gap: 10,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  budgetTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  budgetEmoji: {
    width: 24,
  },
  budgetTitle: {
    flex: 1,
  },
  budgetAmount: {
    flexShrink: 1,
    textAlign: "right",
  },
  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  billRow: {
    minHeight: 74,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  billIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  billTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  billAmountWrap: {
    alignItems: "flex-end",
    gap: 4,
    maxWidth: 120,
  },
});