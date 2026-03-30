import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import PortfolioAllocationSheet from "@/src/features/invest/components/PortfolioAllocationSheet";
import PortfolioPerformanceSheet from "@/src/features/invest/components/PortfolioPerformanceSheet";
import LinkInvestmentPlatformSheet from "@/src/features/invest/components/LinkInvestmentPlatformSheet";
import {
  ASSET_ALLOCATION,
  INVEST_ASSETS,
  INVEST_PLATFORMS,
  INVEST_PORTFOLIO_STATS,
  PERFORMANCE_POINTS,
  PLATFORM_ALLOCATION,
} from "@/src/features/invest/mock";
import type {
  InvestAsset,
  InvestPlatform,
  InvestPlatformKey,
  PerformancePeriod,
} from "@/src/features/invest/types";
import {
  formatCurrencyNgn,
  formatCurrencyUsd,
  getFilteredAssets,
  maskCurrencyNgn,
  maskCurrencyUsd,
  percentText,
} from "@/src/features/invest/utils";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { PATHS } from "@/src/constants/paths";

function FadeInUp({
  delay = 0,
  children,
}: {
  delay?: number;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

const FILTERS: InvestPlatformKey[] = [
  "all",
  "bamboo",
  "risevest",
  "chaka",
  "binance",
  "cowrywise",
];

function formatFilterLabel(filter: InvestPlatformKey) {
  if (filter === "all") return "All";
  if (filter === "risevest") return "Risevest";
  if (filter === "cowrywise") return "Cowrywise";
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}

function platformDisplayName(key: InvestPlatformKey) {
  if (key === "all") return "All";
  if (key === "risevest") return "Risevest";
  if (key === "cowrywise") return "Cowrywise";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export default function InvestScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [balancesVisible, setBalancesVisible] = useState(true);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [filter, setFilter] = useState<InvestPlatformKey>("all");
  const [platforms, setPlatforms] = useState<InvestPlatform[]>(INVEST_PLATFORMS);

  const [allocationVisible, setAllocationVisible] = useState(false);
  const [performanceVisible, setPerformanceVisible] = useState(false);
  const [linkPlatformVisible, setLinkPlatformVisible] = useState(false);
  const [period, setPeriod] = useState<PerformancePeriod>("1M");

  const linkedPlatforms = useMemo(
    () => platforms.filter((platform) => platform.status === "linked"),
    [platforms]
  );

  const linkedPlatformKeys = useMemo(
    () => new Set(linkedPlatforms.map((platform) => platform.key)),
    [linkedPlatforms]
  );

  const linkedAssets = useMemo(
    () =>
      INVEST_ASSETS.filter((asset) => linkedPlatformKeys.has(asset.platform)),
    [linkedPlatformKeys]
  );

  const filteredAssets = useMemo(
    () => getFilteredAssets(linkedAssets, filter),
    [linkedAssets, filter]
  );

  const topGainers = useMemo(
    () =>
      [...linkedAssets]
        .filter((item) => item.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 3),
    [linkedAssets]
  );

  const topLosers = useMemo(
    () =>
      [...linkedAssets]
        .filter((item) => item.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 2),
    [linkedAssets]
  );

  const handleConnectPlatform = (
    platformKey: InvestPlatform["key"],
    _credential: string
  ) => {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.key === platformKey
          ? { ...platform, status: "linked" }
          : platform
      )
    );
    setFilter(platformKey);
  };

  const renderPortfolioValue = () => {
    if (currency === "NGN") {
      return maskCurrencyNgn(
        balancesVisible,
        INVEST_PORTFOLIO_STATS.totalValueNgn
      );
    }

    return maskCurrencyUsd(
      balancesVisible,
      INVEST_PORTFOLIO_STATS.totalValueUsd
    );
  };

  const renderAssetValue = (asset: InvestAsset) => {
    if (currency === "NGN") {
      return balancesVisible
        ? formatCurrencyNgn(asset.totalValueNgn)
        : maskCurrencyNgn(false, asset.totalValueNgn);
    }

    return balancesVisible
      ? formatCurrencyUsd(asset.totalValueUsd)
      : maskCurrencyUsd(false, asset.totalValueUsd);
  };

  const openAsset = (asset: InvestAsset) => {
    router.push(PATHS.investAssetDetails(asset.id));
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom + 112, 136),
          },
        ]}
      >
        <FadeInUp delay={20}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <AppText variant="title" weight="bold" style={styles.headerTitle}>
                Investments
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Your portfolio performance
              </AppText>
            </View>

            <Pressable
              onPress={() => setBalancesVisible((prev) => !prev)}
              style={[
                styles.eyeButton,
                { backgroundColor: theme.colors.inputBackground },
              ]}
            >
              <Ionicons
                name={balancesVisible ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={theme.colors.textMuted}
              />
            </Pressable>
          </View>
        </FadeInUp>

        <FadeInUp delay={60}>
          <View
            style={[
              styles.portfolioCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: "rgba(87,242,200,0.26)",
              },
            ]}
          >
            <View
              style={[
                styles.portfolioWave,
                { backgroundColor: "rgba(87,242,200,0.07)" },
              ]}
            />

            <View style={styles.portfolioTop}>
              <View style={styles.headerCopy}>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  Portfolio Value
                </AppText>

                <AppText
                  variant="body"
                  weight="bold"
                  style={styles.portfolioAmount}
                >
                  {renderPortfolioValue()}
                </AppText>

                <View style={styles.returnsRow}>
                  <AppText
                    variant="body"
                    color={theme.colors.tint}
                    style={styles.portfolioReturns}
                  >
                    ↗ +{formatCurrencyNgn(INVEST_PORTFOLIO_STATS.totalReturnsNgn)}
                  </AppText>
                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.portfolioReturnsMuted}
                  >
                    ({percentText(INVEST_PORTFOLIO_STATS.totalReturnsPercent)} all
                    time)
                  </AppText>
                </View>
              </View>

              <View
                style={[
                  styles.currencyToggle,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                {(["NGN", "USD"] as const).map((item) => {
                  const active = currency === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setCurrency(item)}
                      style={[
                        styles.currencyPill,
                        active && {
                          backgroundColor: "rgba(87,242,200,0.12)",
                          borderColor: theme.colors.tint,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        weight="bold"
                        color={active ? theme.colors.tint : theme.colors.textMuted}
                      >
                        {item}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.portfolioActions}>
              <Pressable
                onPress={() => setAllocationVisible(true)}
                style={[
                  styles.metricAction,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: "rgba(87,242,200,0.26)",
                  },
                ]}
              >
                <Ionicons
                  name="pie-chart-outline"
                  size={18}
                  color={theme.colors.tint}
                />
                <AppText
                  variant="body"
                  weight="bold"
                  color={theme.colors.tint}
                  style={styles.metricActionText}
                >
                  Allocation
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => setPerformanceVisible(true)}
                style={[
                  styles.metricAction,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: "rgba(87,242,200,0.26)",
                  },
                ]}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={18}
                  color={theme.colors.tint}
                />
                <AppText
                  variant="body"
                  weight="bold"
                  color={theme.colors.tint}
                  style={styles.metricActionText}
                >
                  Performance
                </AppText>
              </Pressable>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={90}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((item) => {
              const active = filter === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active
                        ? theme.colors.tint
                        : theme.colors.background,
                      borderColor: active
                        ? theme.colors.tint
                        : theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    color={active ? theme.colors.primaryText : theme.colors.text}
                    style={styles.filterText}
                  >
                    {formatFilterLabel(item)}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </FadeInUp>

        {filteredAssets.length === 0 ? (
          <FadeInUp delay={120}>
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: theme.colors.inputBackground },
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={30}
                  color={theme.colors.textMuted}
                />
              </View>

              <AppText variant="title" weight="bold" style={styles.emptyTitle}>
                No Investments Yet
              </AppText>

              <AppText
                variant="body"
                color={theme.colors.textSecondary}
                style={styles.emptyText}
              >
                Start building your portfolio today
              </AppText>
            </View>
          </FadeInUp>
        ) : (
          <FadeInUp delay={120}>
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <AppText variant="title" weight="bold" style={styles.sectionTitle}>
                  Holdings
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {filter === "all"
                    ? `${filteredAssets.length} linked assets`
                    : platformDisplayName(filter)}
                </AppText>
              </View>

              <View style={styles.holdingCards}>
                {filteredAssets.map((asset) => (
                  <Pressable
                    key={asset.id}
                    onPress={() => openAsset(asset)}
                    style={[
                      styles.holdingCard,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderSoft,
                      },
                    ]}
                  >
                    <View style={styles.holdingCardLeft}>
                      <View
                        style={[
                          styles.assetIconWrap,
                          { backgroundColor: theme.colors.inputBackground },
                        ]}
                      >
                        <AppText style={styles.assetEmoji}>{asset.emoji}</AppText>
                      </View>

                      <View style={styles.assetCopy}>
                        <AppText
                          variant="body"
                          weight="bold"
                          style={styles.assetSymbol}
                        >
                          {asset.symbol}
                        </AppText>
                        <AppText
                          variant="body"
                          color={theme.colors.textSecondary}
                        >
                          {platformDisplayName(asset.platform)}
                        </AppText>
                      </View>
                    </View>

                    <View style={styles.assetRight}>
                      <AppText
                        variant="body"
                        weight="bold"
                        style={styles.assetValue}
                      >
                        {renderAssetValue(asset)}
                      </AppText>
                      <AppText
                        variant="body"
                        color={
                          asset.changePercent >= 0
                            ? theme.colors.tint
                            : "#E45A52"
                        }
                      >
                        {percentText(asset.changePercent)}
                      </AppText>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </FadeInUp>
        )}

        <FadeInUp delay={160}>
          <Pressable
            onPress={() => setLinkPlatformVisible(true)}
            style={[
              styles.linkButton,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <Ionicons name="add" size={22} color={theme.colors.primaryText} />
            <AppText
              variant="body"
              weight="bold"
              color={theme.colors.primaryText}
              style={styles.linkButtonText}
            >
              Link New Investment
            </AppText>
          </Pressable>
        </FadeInUp>
      </ScrollView>

      <PortfolioAllocationSheet
        visible={allocationVisible}
        onClose={() => setAllocationVisible(false)}
        totalValue={INVEST_PORTFOLIO_STATS.totalValueNgn}
        diversificationScore={INVEST_PORTFOLIO_STATS.diversificationScore}
        assetAllocation={ASSET_ALLOCATION}
        platformAllocation={PLATFORM_ALLOCATION}
        balancesVisible={balancesVisible}
      />

      <PortfolioPerformanceSheet
        visible={performanceVisible}
        onClose={() => setPerformanceVisible(false)}
        totalReturns={INVEST_PORTFOLIO_STATS.totalReturnsNgn}
        totalReturnsPercent={INVEST_PORTFOLIO_STATS.totalReturnsPercent}
        period={period}
        onChangePeriod={setPeriod}
        points={PERFORMANCE_POINTS[period]}
        topGainers={topGainers}
        topLosers={topLosers}
        allAssets={linkedAssets}
      />

      <LinkInvestmentPlatformSheet
        visible={linkPlatformVisible}
        onClose={() => setLinkPlatformVisible(false)}
        platforms={platforms}
        onConnect={handleConnectPlatform}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  eyeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  portfolioCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    gap: 14,
    overflow: "hidden",
    position: "relative",
  },
  portfolioWave: {
    position: "absolute",
    right: -60,
    bottom: -38,
    width: 210,
    height: 130,
    borderRadius: 999,
    opacity: 0.22,
  },
  portfolioTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  portfolioAmount: {
    fontSize: 20,
    lineHeight: 30,
  },
  returnsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 10,
  },
  portfolioReturns: {
    fontSize: 14,
    lineHeight: 20,
  },
  portfolioReturnsMuted: {
    fontSize: 14,
    lineHeight: 20,
    marginTop:10
  },
  currencyToggle: {
    minHeight: 30,
    borderRadius: 20,
    borderWidth: 1,
    padding: 5,
    flexDirection: "row",
    gap: 5,
  },
  currencyPill: {
    minWidth: 40,
    minHeight: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  portfolioActions: {
    flexDirection: "row",
    gap: 10,
    marginTop:10
  },
  metricAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  metricActionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  filterRow: {
    gap: 10,
    paddingRight: 10,
  },
  filterChip: {
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  filterText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    minHeight: 220,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  holdingCards: {
    gap: 10,
  },
  holdingCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  holdingCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  assetIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  assetEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  assetCopy: {
    flex: 1,
    minWidth: 0,
  },
  assetSymbol: {
    fontSize: 14,
    lineHeight: 20,
  },
  assetRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  assetValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkButton: {
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  linkButtonText: {
    fontSize: 14,
    lineHeight: 22,
  },
});