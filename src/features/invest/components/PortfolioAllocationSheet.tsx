import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppText from "@/src/components/ui/AppText";
import type { AllocationSlice } from "@/src/features/invest/types";
import {
  allocationPercent,
  allocationTotal,
  maskCurrencyNgn,
} from "@/src/features/invest/utils";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  visible: boolean;
  onClose: () => void;
  totalValue: number;
  diversificationScore: number;
  assetAllocation: AllocationSlice[];
  platformAllocation: AllocationSlice[];
  balancesVisible: boolean;
};

function DonutChart({
  size = 206,
  stroke = 34,
  slices,
}: {
  size?: number;
  stroke?: number;
  slices: AllocationSlice[];
}) {
  const total = allocationTotal(slices);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {slices.map((slice) => {
          const fraction = total > 0 ? slice.value / total : 0;
          const dash = circumference * fraction;
          const gap = circumference - dash;
          const rotation = total > 0 ? (cumulative / total) * 360 - 90 : -90;

          cumulative += slice.value;

          return (
            <Circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={slice.color}
              strokeWidth={stroke}
              fill="transparent"
              strokeDasharray={`${dash} ${gap}`}
              strokeLinecap="butt"
              rotation={rotation}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>
    </View>
  );
}

export default function PortfolioAllocationSheet({
  visible,
  onClose,
  totalValue,
  diversificationScore,
  assetAllocation,
  platformAllocation,
  balancesVisible,
}: Props) {
  const theme = useAppTheme();
  const assetTotal = allocationTotal(assetAllocation);
  const platformTotal = allocationTotal(platformAllocation);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="92%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons
              name="pie-chart-outline"
              size={22}
              color={theme.colors.tint}
            />
            <AppText variant="title" weight="bold" style={styles.headerTitle}>
              Portfolio Allocation
            </AppText>
          </View>

          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View style={styles.chartWrap}>
          <DonutChart slices={assetAllocation} />

          <View style={styles.chartCenter}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Total
            </AppText>
            <AppText variant="title" weight="bold" style={styles.centerValue}>
              {maskCurrencyNgn(balancesVisible, totalValue)}
            </AppText>
          </View>
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
          <AppText variant="title" weight="bold" style={styles.sectionTitle}>
            By Asset Type
          </AppText>

          {assetAllocation.map((item) => (
            <View key={item.label} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <AppText variant="body" style={styles.rowLabel}>
                  {item.label}
                </AppText>
              </View>

              <View style={styles.rowRight}>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {allocationPercent(item.value, assetTotal).toFixed(1)}%
                </AppText>
                <AppText variant="body" weight="bold" style={styles.rowValue}>
                  {maskCurrencyNgn(balancesVisible, item.value)}
                </AppText>
              </View>
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
          <AppText variant="title" weight="bold" style={styles.sectionTitle}>
            By Platform
          </AppText>

          {platformAllocation.map((item) => (
            <View key={item.label} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.platformDot} />
                <AppText variant="body" style={styles.rowLabel}>
                  {item.label}
                </AppText>
              </View>

              <View style={styles.rowRight}>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {allocationPercent(item.value, platformTotal).toFixed(1)}%
                </AppText>
                <AppText variant="body" weight="bold" style={styles.rowValue}>
                  {maskCurrencyNgn(balancesVisible, item.value)}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.scoreCard,
            {
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.scoreCopy}>
            <AppText variant="body" weight="bold" style={styles.scoreTitle}>
              Diversification Score
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Based on asset distribution
            </AppText>
          </View>

          <View style={styles.scoreRight}>
            <AppText
              variant="hero"
              weight="bold"
              color={theme.colors.tint}
              style={styles.scoreValue}
            >
              {diversificationScore}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Good
            </AppText>
          </View>
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
            style={styles.doneText}
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
  chartWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 34,
  },
  centerValue: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 1,
  },
  rowLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
  rowValue: {
    fontSize: 15,
    lineHeight: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  platformDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#23262F",
  },
  scoreCard: {
    minHeight: 90,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(32,115,255,0.10)",
  },
  scoreCopy: {
    gap: 3,
    flex: 1,
  },
  scoreRight: {
    alignItems: "flex-end",
  },
  scoreTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  scoreValue: {
    fontSize: 20,
    lineHeight: 34,
  },
  doneButton: {
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    fontSize: 14,
    lineHeight: 24,
  },
});