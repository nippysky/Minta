import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppText from "@/src/components/ui/AppText";
import type {
  InvestAsset,
  PerformancePeriod,
  PerformancePoint,
} from "@/src/features/invest/types";
import {
  formatCurrencyNgn,
  percentText,
} from "@/src/features/invest/utils";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  visible: boolean;
  onClose: () => void;
  totalReturns: number;
  totalReturnsPercent: number;
  period: PerformancePeriod;
  onChangePeriod: (period: PerformancePeriod) => void;
  points: PerformancePoint[];
  topGainers: InvestAsset[];
  topLosers: InvestAsset[];
  allAssets: InvestAsset[];
};

function formatPlatformName(value: string) {
  if (value === "risevest") return "Risevest";
  if (value === "cowrywise") return "Cowrywise";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function AreaChart({
  points,
  tint,
}: {
  points: PerformancePoint[];
  tint: string;
}) {
  const width = 320;
  const height = 160;
  const padding = 12;

  const safePoints = points.length
    ? points
    : [
        { x: "1", y: 0 },
        { x: "2", y: 0 },
      ];

  const minY = Math.min(...safePoints.map((p) => p.y));
  const maxY = Math.max(...safePoints.map((p) => p.y));
  const yRange = Math.max(maxY - minY, 1);

  const getX = (index: number) =>
    padding +
    (index / Math.max(safePoints.length - 1, 1)) * (width - padding * 2);

  const getY = (value: number) =>
    height - padding - ((value - minY) / yRange) * (height - padding * 2);

  const linePath = safePoints
    .map((point, index) => {
      const x = getX(index);
      const y = getY(point.y);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${getX(safePoints.length - 1)} ${
    height - padding
  } L ${getX(0)} ${height - padding} Z`;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="investAreaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={tint} stopOpacity="0.28" />
          <Stop offset="100%" stopColor={tint} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      {[0, 1, 2].map((line) => {
        const y = padding + ((height - padding * 2) / 2) * line;
        return (
          <Rect
            key={line}
            x={padding}
            y={y}
            width={width - padding * 2}
            height={1}
            fill="rgba(255,255,255,0.06)"
          />
        );
      })}

      <Path d={areaPath} fill="url(#investAreaFill)" />
      <Path d={linePath} fill="none" stroke={tint} strokeWidth={5} />
    </Svg>
  );
}

export default function PortfolioPerformanceSheet({
  visible,
  onClose,
  totalReturns,
  totalReturnsPercent,
  period,
  onChangePeriod,
  points,
  topGainers,
  topLosers,
  allAssets,
}: Props) {
  const theme = useAppTheme();

  const periods: PerformancePeriod[] = ["1W", "1M", "3M", "1Y", "All"];

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="94%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons
              name="bar-chart-outline"
              size={22}
              color={theme.colors.tint}
            />
            <AppText variant="title" weight="bold" style={styles.headerTitle}>
              Portfolio Performance
            </AppText>
          </View>

          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View style={styles.returnsBlock}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Total Returns
          </AppText>

          <AppText
            variant="hero"
            weight="bold"
            color={theme.colors.tint}
            style={styles.returnAmount}
          >
            +{formatCurrencyNgn(totalReturns)}
          </AppText>

          <AppText variant="body" color={theme.colors.tint} style={styles.returnPercent}>
            ↗ {percentText(totalReturnsPercent)}
          </AppText>
        </View>

        <View style={styles.periodRow}>
          {periods.map((item) => {
            const active = item === period;

            return (
              <Pressable
                key={item}
                onPress={() => onChangePeriod(item)}
                style={[
                  styles.periodChip,
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
                >
                  {item}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <AreaChart points={points} tint={theme.colors.tint} />
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="trending-up-outline"
              size={18}
              color={theme.colors.tint}
            />
            <AppText variant="body" weight="bold" style={styles.sectionTitle}>
              Top Gainers
            </AppText>
          </View>

          {topGainers.map((asset) => (
            <View key={asset.id} style={styles.assetRow}>
              <View style={styles.assetLeft}>
                <AppText style={styles.assetEmoji}>{asset.emoji}</AppText>

                <View>
                  <AppText variant="body" weight="bold" style={styles.assetName}>
                    {asset.name}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {asset.symbol}
                  </AppText>
                </View>
              </View>

              <AppText variant="body" weight="bold" color={theme.colors.tint}>
                {percentText(asset.changePercent)}
              </AppText>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-down-outline" size={18} color="#FF5C5C" />
            <AppText variant="body" weight="bold" style={styles.sectionTitle}>
              Top Losers
            </AppText>
          </View>

          {topLosers.map((asset) => (
            <View key={asset.id} style={styles.assetRow}>
              <View style={styles.assetLeft}>
                <AppText style={styles.assetEmoji}>{asset.emoji}</AppText>

                <View>
                  <AppText variant="body" weight="bold" style={styles.assetName}>
                    {asset.name}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {asset.symbol}
                  </AppText>
                </View>
              </View>

              <AppText variant="title" weight="bold" color="#FF5C5C">
                {percentText(asset.changePercent)}
              </AppText>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <AppText variant="body" weight="bold" style={styles.sectionTitle}>
            All Assets
          </AppText>

          {allAssets.map((asset) => (
            <View key={asset.id} style={styles.assetRow}>
              <View style={styles.assetLeft}>
                <AppText style={styles.assetEmoji}>{asset.emoji}</AppText>

                <View>
                  <AppText variant="body" weight="bold" style={styles.assetName}>
                    {asset.symbol}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {formatPlatformName(asset.platform)}
                  </AppText>
                </View>
              </View>

              <View style={styles.assetRight}>
                <AppText variant="body" weight="bold" style={styles.assetValue}>
                  {formatCurrencyNgn(asset.totalValueNgn)}
                </AppText>
                <AppText
                  variant="body"
                  color={asset.changePercent >= 0 ? theme.colors.tint : "#FF5C5C"}
                >
                  {percentText(asset.changePercent)}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <Pressable
          onPress={onClose}
          style={[styles.doneButton, { backgroundColor: theme.colors.tint }]}
        >
          <AppText
            variant="body"
            weight="bold"
            color={theme.colors.primaryText}
          >
            Done
          </AppText>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
  },
  header: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    width: "100%",
    height: 1,
  },
  returnsBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  returnAmount: {
    fontSize: 20,
    lineHeight: 30,
    textAlign: "center",
    marginTop:10
  },
  returnPercent: {
    fontSize: 14,
    lineHeight: 22,
    marginTop:10
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  periodChip: {
    minWidth: 54,
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  chartCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 10,
    overflow: "hidden",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop:10
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  assetRight: {
    alignItems: "flex-end",
    gap: 1,
  },
  assetEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  assetName: {
    fontSize: 15,
    lineHeight: 20,
  },
  assetValue: {
    fontSize: 15,
    lineHeight: 20,
  },
  doneButton: {
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});