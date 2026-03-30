import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppText from "@/src/components/ui/AppText";
import type { InvestAsset } from "@/src/features/invest/types";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type TradeMode = "buy" | "sell";
type TradeStep = "input" | "confirm" | "success";

type Props = {
  visible: boolean;
  mode: TradeMode;
  asset: InvestAsset | null;
  onClose: () => void;
};

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

function wholeAmountText(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

function amountTextToNumber(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function unitText(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 2) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function randomReference() {
  return `TXN${Date.now()}${Math.random()
    .toString(36)
    .slice(2, 10)
    .toUpperCase()}`;
}

export default function InvestTradeSheet({
  visible,
  mode,
  asset,
  onClose,
}: Props) {
  const theme = useAppTheme();

  const [step, setStep] = useState<TradeStep>("input");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellUnits, setSellUnits] = useState("");
  const [pin, setPin] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (!visible) {
      setStep("input");
      setBuyAmount("");
      setSellUnits("");
      setPin("");
      setReference("");
    }
  }, [visible, mode, asset?.id]);

  const buyNgnValue = amountTextToNumber(buyAmount);
  const estimatedBuyUnits =
    asset && asset.currentPriceNgn > 0 ? buyNgnValue / asset.currentPriceNgn : 0;

  const sellUnitsValue = Number(sellUnits || "0");
  const estimatedSellNgn =
    asset && asset.currentPriceNgn > 0 ? sellUnitsValue * asset.currentPriceNgn : 0;

  const canContinueBuy = !!asset && buyNgnValue > 0;
  const canContinueSell =
    !!asset && sellUnitsValue > 0 && sellUnitsValue <= Number(asset.quantity);
  const canConfirm = pin.length === 4;

  const title = useMemo(() => {
    if (!asset) return mode === "buy" ? "Buy Asset" : "Sell Asset";
    return mode === "buy" ? `Buy ${asset.symbol}` : `Sell ${asset.symbol}`;
  }, [asset, mode]);

  if (!asset) return null;

  const isBuy = mode === "buy";

  const handleContinue = () => {
    if (isBuy && !canContinueBuy) return;
    if (!isBuy && !canContinueSell) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setReference(randomReference());
    setStep("success");
  };

  const renderHeader = (showBack = false) => (
    <View style={styles.header}>
      {showBack ? (
        <Pressable onPress={() => setStep("input")} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}

      <AppText variant="title" weight="bold" style={styles.headerTitle}>
        {step === "confirm"
          ? isBuy
            ? "Confirm Purchase"
            : "Confirm Sale"
          : step === "success"
            ? isBuy
              ? "Purchase Complete"
              : "Sale Complete"
            : title}
      </AppText>

      <Pressable onPress={onClose} hitSlop={10}>
        <Ionicons name="close" size={24} color={theme.colors.text} />
      </Pressable>
    </View>
  );

  const renderPinBoxes = () => (
    <View style={styles.pinRow}>
      {[0, 1, 2, 3].map((index) => {
        const filled = pin[index];
        const active = pin.length === index;

        return (
          <View
            key={index}
            style={[
              styles.pinBox,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: active ? theme.colors.tint : theme.colors.borderSoft,
              },
            ]}
          >
            <AppText style={styles.pinDot}>{filled ? "•" : ""}</AppText>
          </View>
        );
      })}
    </View>
  );

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="88%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {step === "input" ? (
          <>
            {renderHeader(false)}

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <View
              style={[
                styles.assetHero,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText style={styles.assetEmoji}>{asset.emoji}</AppText>

              <View style={styles.assetHeroCopy}>
                <AppText variant="body" weight="bold" style={styles.assetName}>
                  {asset.name}
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {isBuy
                    ? formatUsdCompact(asset.currentPriceUsd)
                    : asset.category === "crypto"
                      ? `You own: ${formatAssetUnits(asset, Number(asset.quantity))} ${asset.symbol}`
                      : `You own: ${Number(asset.quantity).toLocaleString("en-US")} shares`}
                </AppText>
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="body" weight="bold" color={theme.colors.textSecondary}>
                {isBuy
                  ? "Amount to Invest (NGN)"
                  : asset.category === "crypto"
                    ? "Amount to Sell"
                    : "Shares to Sell"}
              </AppText>

              <View
                style={[
                  styles.amountField,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                {isBuy ? (
                  <AppText
                    variant="hero"
                    weight="bold"
                    style={styles.amountPrefix}
                  >
                    ₦
                  </AppText>
                ) : null}

                <BottomSheetTextInput
                  value={isBuy ? buyAmount : sellUnits}
                  onChangeText={(text) => {
                    if (isBuy) {
                      setBuyAmount(wholeAmountText(text));
                    } else {
                      setSellUnits(unitText(text));
                    }
                  }}
                  keyboardType={isBuy ? "number-pad" : "decimal-pad"}
                  selectionColor={theme.colors.tint}
                  placeholder="0"
                  placeholderTextColor={theme.colors.placeholder}
                  style={[
                    styles.amountInput,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.fonts.headingBold,
                      textAlign: isBuy ? "left" : "center",
                    },
                  ]}
                />
              </View>

              <AppText
                variant="body"
                color={isBuy ? theme.colors.textSecondary : theme.colors.tint}
              >
                {isBuy
                  ? `≈ ${formatAssetUnits(asset, estimatedBuyUnits)} ${asset.symbol}`
                  : `≈ ${formatNgnCompact(estimatedSellNgn)}`}
              </AppText>
            </View>

            <View style={styles.quickRow}>
              {isBuy
                ? [10000, 25000, 50000, 100000].map((value) => (
                    <Pressable
                      key={value}
                      onPress={() => setBuyAmount(value.toLocaleString("en-NG"))}
                      style={[
                        styles.quickChip,
                        { backgroundColor: theme.colors.inputBackground },
                      ]}
                    >
                      <AppText variant="body" weight="bold">
                        ₦{value >= 1000 ? `${value / 1000}k` : value}
                      </AppText>
                    </Pressable>
                  ))
                : [25, 50, 75, 100].map((percent) => (
                    <Pressable
                      key={percent}
                      onPress={() =>
                        setSellUnits(
                          (
                            (Number(asset.quantity) * percent) /
                            100
                          ).toFixed(asset.category === "crypto" ? 4 : 4)
                        )
                      }
                      style={[
                        styles.quickChip,
                        { backgroundColor: theme.colors.inputBackground },
                      ]}
                    >
                      <AppText variant="body" weight="bold">
                        {percent}%
                      </AppText>
                    </Pressable>
                  ))}
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <Pressable
              onPress={handleContinue}
              disabled={isBuy ? !canContinueBuy : !canContinueSell}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: isBuy ? theme.colors.tint : "#E14D48",
                  opacity:
                    isBuy ? (canContinueBuy ? 1 : 0.45) : canContinueSell ? 1 : 0.45,
                },
              ]}
            >
              <AppText
                variant="body"
                weight="bold"
                color={isBuy ? theme.colors.primaryText : "#FFFFFF"}
              >
                Continue
              </AppText>
            </Pressable>
          </>
        ) : null}

        {step === "confirm" ? (
          <>
            {renderHeader(true)}

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <View style={styles.confirmWrap}>
              <View
                style={[
                  styles.confirmOrb,
                  { backgroundColor: isBuy ? theme.colors.tint : "#E14D48" },
                ]}
              >
                <Ionicons
                  name={isBuy ? "arrow-down-outline" : "arrow-up-outline"}
                  size={34}
                  color={isBuy ? theme.colors.primaryText : "#FFFFFF"}
                />
              </View>

              <AppText variant="hero" weight="bold" style={styles.confirmTitle}>
                {isBuy ? "Confirm Purchase" : "Confirm Sale"}
              </AppText>

              <AppText variant="title" weight="bold" color={theme.colors.tint}>
                {isBuy ? formatNgnCompact(buyNgnValue) : formatNgnCompact(estimatedSellNgn)}
              </AppText>

              <AppText variant="body" color={theme.colors.textSecondary}>
                {isBuy
                  ? `≈ ${formatAssetUnits(asset, estimatedBuyUnits)} ${asset.symbol}`
                  : `Selling ${formatAssetUnits(asset, sellUnitsValue)} ${asset.symbol}`}
              </AppText>

              <AppText
                variant="body"
                color={theme.colors.textSecondary}
                style={styles.pinLabel}
              >
                Enter your 4-digit PIN
              </AppText>

              {renderPinBoxes()}

              <BottomSheetTextInput
                value={pin}
                onChangeText={(text) =>
                  setPin(text.replace(/[^\d]/g, "").slice(0, 4))
                }
                keyboardType="number-pad"
                autoFocus
                style={styles.hiddenInput}
              />
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <Pressable
              onPress={handleConfirm}
              disabled={!canConfirm}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: isBuy ? theme.colors.tint : "#E14D48",
                  opacity: canConfirm ? 1 : 0.45,
                },
              ]}
            >
              <AppText
                variant="body"
                weight="bold"
                color={isBuy ? theme.colors.primaryText : "#FFFFFF"}
              >
                {isBuy ? "Confirm Purchase" : "Confirm Sale"}
              </AppText>
            </Pressable>
          </>
        ) : null}

        {step === "success" ? (
          <>
            {renderHeader(false)}

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <View style={styles.successWrap}>
              <View style={styles.successGlow} />
              <View style={styles.successOrb}>
                <Ionicons name="checkmark" size={38} color="#081014" />
              </View>

              <AppText variant="hero" weight="bold" style={styles.successTitle}>
                {isBuy ? "Purchase Successful!" : "Sale Complete!"}
              </AppText>

              <AppText
                variant="title"
                color={theme.colors.textSecondary}
                style={styles.successText}
              >
                {isBuy
                  ? `You bought ${formatAssetUnits(asset, estimatedBuyUnits)} ${asset.symbol}`
                  : `You sold ${formatAssetUnits(asset, sellUnitsValue)} ${asset.symbol} for ${formatNgnCompact(
                      estimatedSellNgn
                    )}`}
              </AppText>

              <View
                style={[
                  styles.referenceCard,
                  { backgroundColor: theme.colors.inputBackground },
                ]}
              >
                <AppText variant="body" color={theme.colors.textSecondary}>
                  Reference
                </AppText>
                <AppText variant="body" weight="bold" style={styles.referenceText}>
                  {reference}
                </AppText>
              </View>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <Pressable
              onPress={onClose}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.tint },
              ]}
            >
              <AppText
                variant="body"
                weight="bold"
                color={theme.colors.primaryText}
              >
                Done
              </AppText>
            </Pressable>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  header: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    width: "100%",
    height: 1,
  },
  assetHero: {
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assetEmoji: {
    fontSize: 20,
    lineHeight: 28,
  },
  assetHeroCopy: {
    flex: 1,
    gap: 2,
  },
  assetName: {
    fontSize: 16,
    lineHeight: 24,
  },
  fieldBlock: {
    gap: 10,
  },
  amountField: {
    minHeight: 76,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amountPrefix: {
    fontSize: 20,
    lineHeight: 30,
  },
  amountInput: {
    flex: 1,
    minHeight: 76,
    fontSize: 20,
    lineHeight: 25,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickChip: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    minHeight: 55,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop:20
  },
  confirmWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 8,
  },
  confirmOrb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
  },
  pinLabel: {
    marginTop: 16,
  },
  pinRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  pinBox: {
    width: 70,
    height: 70,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDot: {
    fontSize: 20,
    lineHeight: 34,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  successWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
  },
  successGlow: {
    position: "absolute",
    top: 36,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(87,242,200,0.16)",
  },
  successOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#4FC3F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
  },
  successText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 24,
    maxWidth: 320,
  },
  referenceCard: {
    minWidth: 220,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 6,
  },
  referenceText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});