import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import InvestTradeSheet from "@/src/features/invest/components/InvestTradeSheet";
import { INVEST_ASSETS } from "@/src/features/invest/mock";
import type { InvestAsset } from "@/src/features/invest/types";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import AppBackButton from "@/src/components/ui/AppBackButton";

function formatUsdCompact(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: value < 1000 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatNgnCompact(value: number) {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}

function formatAssetUnits(asset: InvestAsset, value: number) {
  const isCrypto = asset.category === "crypto";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: isCrypto ? 4 : 0,
    maximumFractionDigits: isCrypto ? 4 : 4,
  });
}

function formatPlatformName(value: string) {
  if (value === "risevest") return "Risevest";
  if (value === "cowrywise") return "Cowrywise";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function InvestAssetDetailsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { assetId } = useLocalSearchParams<{ assetId: string }>();

  const asset = useMemo(
    () => INVEST_ASSETS.find((item) => item.id === assetId) ?? null,
    [assetId]
  );

  const [buyVisible, setBuyVisible] = useState(false);
  const [sellVisible, setSellVisible] = useState(false);

  if (!asset) {
    return (
      <AppScreen>
        <View style={styles.missingWrap}>
          <AppText variant="title" weight="bold">
            Asset not found
          </AppText>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backToInvestButton,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <AppText
              variant="title"
              weight="bold"
              color={theme.colors.primaryText}
            >
              Go Back
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  const holdingLabel = asset.category === "crypto" ? "Amount" : "Shares";
  const quantityText =
    asset.category === "crypto"
      ? formatAssetUnits(asset, Number(asset.quantity))
      : Number(asset.quantity).toLocaleString("en-US");

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 32, 40) },
        ]}
      >
        <View style={styles.topRow}>
         <AppBackButton/>

          <View
            style={[
              styles.assetIconWrap,
              { backgroundColor: theme.colors.inputBackground },
            ]}
          >
            <AppText style={styles.assetEmoji}>{asset.emoji}</AppText>
          </View>

          <View style={styles.headerCopy}>
            <AppText variant="body" weight="bold" style={styles.assetName}>
              {asset.name}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {asset.symbol} • {formatPlatformName(asset.platform)}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.priceCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(87,242,200,0.25)",
            },
          ]}
        >
          <View style={styles.priceTop}>
            <View style={styles.headerCopy}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Current Price
              </AppText>
              <AppText
                variant="hero"
                weight="bold"
                style={styles.priceValue}
              >
                {formatUsdCompact(asset.currentPriceUsd)}
              </AppText>
            </View>

            <View
              style={[
                styles.changePill,
                {
                  backgroundColor:
                    asset.changePercent >= 0
                      ? "rgba(87,242,200,0.14)"
                      : "rgba(239,68,68,0.14)",
                },
              ]}
            >
              <Ionicons
                name={
                  asset.changePercent >= 0
                    ? "trending-up-outline"
                    : "trending-down-outline"
                }
                size={18}
                color={asset.changePercent >= 0 ? theme.colors.tint : "#F04E4E"}
              />
              <AppText
                variant="body"
                weight="bold"
                color={asset.changePercent >= 0 ? theme.colors.tint : "#F04E4E"}
              >
                {asset.changePercent >= 0 ? "+" : ""}
                {asset.changePercent.toFixed(2)}%
              </AppText>
            </View>
          </View>

          <View style={styles.tradeRow}>
            <Pressable
              onPress={() => setBuyVisible(true)}
              style={[
                styles.tradeButton,
                { backgroundColor: theme.colors.tint },
              ]}
            >
              <Ionicons
                name="add"
                size={22}
                color={theme.colors.primaryText}
              />
              <AppText
                variant="body"
                weight="bold"
                color={theme.colors.primaryText}
              >
                Buy
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setSellVisible(true)}
              style={[
                styles.tradeButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <Ionicons
                name="remove"
                size={22}
                color={theme.colors.text}
              />
              <AppText variant="body" weight="bold">
                Sell
              </AppText>
            </Pressable>
          </View>
        </View>

        <AppText variant="body" weight="bold" color={theme.colors.textSecondary} style={{fontSize:16}}>
          Your Holdings
        </AppText>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {holdingLabel}
            </AppText>
            <AppText variant="body" weight="bold">
              {quantityText}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Average Price
            </AppText>
            <AppText variant="body" weight="bold">
              {formatUsdCompact(asset.averagePriceUsd)}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Total Value (USD)
            </AppText>
            <AppText variant="body" weight="bold">
              {formatUsdCompact(asset.totalValueUsd)}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Total Value (NGN)
            </AppText>
            <AppText
              variant="body"
              weight="bold"
              color={theme.colors.tint}
            >
              {formatNgnCompact(asset.totalValueNgn)}
            </AppText>
          </View>

          <View
            style={[
              styles.infoDivider,
              { backgroundColor: theme.colors.borderSoft },
            ]}
          />

          <View style={styles.infoRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Profit/Loss
            </AppText>
            <AppText
              variant="body"
              weight="bold"
              color={asset.profitLossNgn >= 0 ? theme.colors.tint : "#F04E4E"}
            >
              {asset.profitLossNgn >= 0 ? "+" : ""}
              {formatNgnCompact(asset.profitLossNgn)}
            </AppText>
          </View>
        </View>

        <AppText variant="body" weight="bold" style={{fontSize:16}} color={theme.colors.textSecondary}>
          Recent Activity
        </AppText>

        <View
          style={[
            styles.activityCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          {asset.activity.map((item, index) => (
            <View key={item.id}>
              <View style={styles.activityRow}>
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityIconWrap,
                      {
                        backgroundColor:
                          item.type === "buy"
                            ? "rgba(87,242,200,0.14)"
                            : "rgba(239,68,68,0.14)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.type === "buy"
                          ? "arrow-down-outline"
                          : "arrow-up-outline"
                      }
                      size={18}
                      color={item.type === "buy" ? theme.colors.tint : "#F04E4E"}
                    />
                  </View>

                  <View style={styles.activityCopy}>
                    <AppText variant="body" weight="bold">
                      {item.label}
                    </AppText>
                    <AppText
                      variant="body"
                      color={theme.colors.textSecondary}
                    >
                      {item.date}
                    </AppText>
                  </View>
                </View>

                <AppText
                  variant="body"
                  weight="bold"
                  color={item.type === "buy" ? theme.colors.tint : "#F04E4E"}
                >
                  {formatNgnCompact(item.amountNgn)}
                </AppText>
              </View>

              {index < asset.activity.length - 1 ? (
                <View
                  style={[
                    styles.activityDivider,
                    { backgroundColor: theme.colors.borderSoft },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <InvestTradeSheet
        visible={buyVisible}
        mode="buy"
        asset={asset}
        onClose={() => setBuyVisible(false)}
      />

      <InvestTradeSheet
        visible={sellVisible}
        mode="sell"
        asset={asset}
        onClose={() => setSellVisible(false)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
  },
  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  backToInvestButton: {
    minHeight: 56,
    minWidth: 160,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  assetIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  assetEmoji: {
    fontSize: 20,
    lineHeight: 30,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  assetName: {
    fontSize: 20,
    lineHeight: 24,
  },
  priceCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    gap: 14,
  },
  priceTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  priceValue: {
    fontSize: 20,
    lineHeight: 34,
  },
  changePill: {
    minHeight: 40,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tradeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop:10
  },
  tradeButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoDivider: {
    width: "100%",
    height: 1,
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCopy: {
    flex: 1,
  },
  activityDivider: {
    width: "100%",
    height: 1,
    marginTop: 10,
  },
});