import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import {
  mockCards,
  type CardControlItem,
  type CardKind,
} from "@/src/features/cards/data/mockCards";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";
import AppBackButton from "@/src/components/ui/AppBackButton";

function formatMoney(value: number) {
  return `₦${value.toLocaleString()}`;
}

function sanitizeAmount(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString();
}

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function CardsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [selectedKind, setSelectedKind] = useState<CardKind>("virtual");
  const [isFrozen, setIsFrozen] = useState<Record<CardKind, boolean>>({
    virtual: false,
    physical: false,
  });
  const [flipped, setFlipped] = useState<Record<CardKind, boolean>>({
    virtual: false,
    physical: false,
  });
  const [showFullDetails, setShowFullDetails] = useState<Record<CardKind, boolean>>({
    virtual: false,
    physical: false,
  });
  const [monthlyLimits, setMonthlyLimits] = useState<Record<CardKind, number>>({
    virtual: mockCards.virtual.monthlyLimit,
    physical: mockCards.physical.monthlyLimit,
  });

  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [limitInput, setLimitInput] = useState("");

  const flipVirtual = useRef(new Animated.Value(0)).current;
  const flipPhysical = useRef(new Animated.Value(0)).current;
  const spendingProgress = useRef(new Animated.Value(0)).current;

  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(24)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const currentCard = mockCards[selectedKind];
  const currentFlip = selectedKind === "virtual" ? flipVirtual : flipPhysical;
  const currentLimit = monthlyLimits[selectedKind];
  const currentSpent = currentCard.monthlySpent;
  const detailsVisible = showFullDetails[selectedKind];

  const fullCardNumber =
    selectedKind === "virtual"
      ? "5412 7534 45•• 4532"
      : "5399 7712 66•• 7891";

  useEffect(() => {
    Animated.timing(currentFlip, {
      toValue: flipped[selectedKind] ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [currentFlip, flipped, selectedKind]);

  useEffect(() => {
    spendingProgress.setValue(0);

    Animated.timing(spendingProgress, {
      toValue: Math.min(currentSpent / currentLimit, 1),
      duration: 650,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentLimit, currentSpent, selectedKind, spendingProgress]);

  useEffect(() => {
    if (limitModalVisible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [backdropOpacity, limitModalVisible, modalOpacity, modalTranslateY]);

  const closeLimitModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: 18,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLimitModalVisible(false);
      setLimitInput("");
    });
  };

  const openLimitModal = () => {
    setLimitInput(String(currentLimit));
    setLimitModalVisible(true);
  };

  const frontRotate = currentFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = currentFlip.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const progressWidth = spendingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const controls = useMemo<CardControlItem[]>(() => {
    return currentCard.controls.map((item) => {
      if (item.id === "details") {
        return {
          ...item,
          label: detailsVisible ? "Hide Details" : "View Details",
        };
      }
      return item;
    });
  }, [currentCard.controls, detailsVisible]);

  const handleControlPress = (id: string) => {
    if (id === "freeze") {
      const next = !isFrozen[selectedKind];

      setIsFrozen((prev) => ({
        ...prev,
        [selectedKind]: next,
      }));

      showToast({
        type: "success",
        title: next ? "Card frozen" : "Card unfrozen",
        message: next
          ? `${selectedKind === "virtual" ? "Virtual" : "Physical"} card has been frozen.`
          : `${selectedKind === "virtual" ? "Virtual" : "Physical"} card is active again.`,
      });
      return;
    }

    if (id === "pin") {
      router.push("/change-pin");
      return;
    }

    if (id === "replace") {
      showToast({
        type: "success",
        title: "Replacement flow next",
        message: "Order / Replace flow will be connected next.",
      });
      return;
    }

    if (id === "limits") {
      openLimitModal();
      return;
    }

    if (id === "details") {
      const next = !showFullDetails[selectedKind];
      setShowFullDetails((prev) => ({
        ...prev,
        [selectedKind]: next,
      }));

      showToast({
        type: "success",
        title: next ? "Card details visible" : "Card details hidden",
        message: next
          ? "Sensitive card information is now visible."
          : "Sensitive card information is now hidden.",
      });
    }
  };

  const applyQuickLimit = (amount: number) => {
    setLimitInput(String(amount));
  };

  const handleUpdateLimit = () => {
    const raw = Number(digitsOnly(limitInput));

    if (!raw || raw < 10000) {
      showToast({
        type: "error",
        title: "Invalid limit",
        message: "Enter a valid spending limit amount.",
      });
      return;
    }

    setMonthlyLimits((prev) => ({
      ...prev,
      [selectedKind]: raw,
    }));

    closeLimitModal();

    showToast({
      type: "success",
      title: "Limit updated",
      message: `${selectedKind === "virtual" ? "Virtual" : "Physical"} card spending limit updated.`,
    });
  };

  return (
    <AppScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: 10,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: insets.bottom + 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppBackButton />
            <View style={styles.headerText}>
              <AppText variant="hero" weight="bold" style={styles.headerTitle}>
                Cards
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Manage your virtual & physical cards
              </AppText>
            </View>
          </View>

          <View style={styles.topSelectors}>
            <Pressable
              onPress={() => setSelectedKind("virtual")}
              style={[
                styles.cardTypeButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    selectedKind === "virtual"
                      ? theme.colors.tint
                      : theme.colors.borderSoft,
                },
              ]}
            >
              {selectedKind === "virtual" ? (
                <LinearGradient
                  colors={["rgba(87,242,200,0.14)", "rgba(87,242,200,0.05)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}

              <Ionicons
                name="card-outline"
                size={20}
                color={theme.colors.text}
                style={styles.cardTypeIcon}
              />

              <View style={styles.cardTypeTextWrap}>
                <AppText variant="title" weight="semibold" style={styles.cardTypeTitle}>
                  Virtual
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  •••• 4532
                </AppText>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSelectedKind("physical")}
              style={[
                styles.cardTypeButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    selectedKind === "physical"
                      ? theme.colors.tint
                      : theme.colors.borderSoft,
                },
              ]}
            >
              {selectedKind === "physical" ? (
                <LinearGradient
                  colors={["rgba(87,242,200,0.14)", "rgba(87,242,200,0.05)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}

              <Ionicons
                name="card-outline"
                size={20}
                color={theme.colors.text}
                style={styles.cardTypeIcon}
              />

              <View style={styles.cardTypeTextWrap}>
                <AppText variant="title" weight="semibold" style={styles.cardTypeTitle}>
                  Physical
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  •••• 7891
                </AppText>
              </View>
            </Pressable>
          </View>

          <View style={styles.cardShell}>
            <Pressable
              onPress={() =>
                setFlipped((prev) => ({
                  ...prev,
                  [selectedKind]: !prev[selectedKind],
                }))
              }
              style={styles.cardPressable}
            >
              <Animated.View
                style={[
                  styles.cardFace,
                  {
                    opacity: currentFlip.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0, 0],
                    }),
                    transform: [{ rotateY: frontRotate }],
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    theme.isDark
                      ? [
                          "rgba(255,255,255,0.16)",
                          "rgba(255,255,255,0.08)",
                          "rgba(87,242,200,0.05)",
                          "rgba(255,255,255,0.03)",
                        ]
                      : [
                          "rgba(11,15,19,0.10)",
                          "rgba(11,15,19,0.04)",
                          "rgba(87,242,200,0.08)",
                          "rgba(255,255,255,0.70)",
                        ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardTopRow}>
                  <View style={styles.brandWrap}>
                    <View
                      style={[
                        styles.brandBadge,
                        {
                          backgroundColor: "rgba(87,242,200,0.14)",
                          borderColor: "rgba(87,242,200,0.24)",
                        },
                      ]}
                    >
                      <AppText variant="title" weight="bold" color={theme.colors.tint}>
                        M
                      </AppText>
                    </View>

                    <View style={styles.brandTextWrap}>
                      <AppText variant="title" weight="bold" style={styles.brandTitle}>
                        MiNTA
                      </AppText>
                      <AppText variant="caption" color={theme.colors.textSecondary}>
                        {currentCard.typeLabel}
                      </AppText>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.chip,
                    {
                      borderColor: "rgba(255,255,255,0.10)",
                      backgroundColor: theme.isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(11,15,19,0.06)",
                    },
                  ]}
                />

                <View style={styles.cardMiddle}>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Card Number
                  </AppText>

                  <AppText
                    variant="hero"
                    weight="medium"
                    style={styles.cardNumber}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {detailsVisible
                      ? fullCardNumber
                      : `•••• •••• •••• ${currentCard.last4}`}
                  </AppText>
                </View>

                <View style={styles.cardBottomRow}>
                  <View style={styles.cardMetaBlockLeft}>
                    <AppText variant="body" color={theme.colors.textSecondary}>
                      Card Holder
                    </AppText>
                    <AppText
                      variant="title"
                      weight="semibold"
                      style={styles.metaStrong}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {currentCard.holderName}
                    </AppText>
                  </View>

                  <View style={styles.cardMetaBlockRight}>
                    <AppText variant="body" color={theme.colors.textSecondary}>
                      Expires
                    </AppText>
                    <AppText
                      variant="title"
                      weight="medium"
                      style={styles.metaStrong}
                    >
                      {currentCard.expiry}
                    </AppText>
                  </View>

                  <View style={styles.mastercardBlock}>
                    <View style={styles.mastercardWrap}>
                      <View style={[styles.mcCircle, styles.mcLeft]} />
                      <View style={[styles.mcCircle, styles.mcRight]} />
                    </View>
                    <AppText
                      variant="caption"
                      color={theme.colors.textSecondary}
                      style={styles.mastercardLabel}
                    >
                      mastercard
                    </AppText>
                  </View>
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardBackFace,
                  {
                    opacity: currentFlip.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0, 1],
                    }),
                    transform: [{ rotateY: backRotate }],
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    theme.isDark
                      ? [
                          "rgba(255,255,255,0.16)",
                          "rgba(255,255,255,0.08)",
                          "rgba(87,242,200,0.05)",
                          "rgba(255,255,255,0.03)",
                        ]
                      : [
                          "rgba(11,15,19,0.10)",
                          "rgba(11,15,19,0.04)",
                          "rgba(87,242,200,0.08)",
                          "rgba(255,255,255,0.70)",
                        ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <View
                  style={[
                    styles.magStripe,
                    {
                      backgroundColor: theme.isDark
                        ? "rgba(0,0,0,0.65)"
                        : "rgba(11,15,19,0.78)",
                    },
                  ]}
                />

                <View
                  style={[
                    styles.signatureStrip,
                    {
                      backgroundColor: theme.isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.80)",
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    CVV
                  </AppText>
                  <AppText variant="title" weight="bold">
                    {detailsVisible ? currentCard.cvv : "•••"}
                  </AppText>
                </View>

                <View style={styles.backMeta}>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Status
                  </AppText>
                  <AppText
                    variant="title"
                    weight="medium"
                    style={styles.backStatus}
                    color={isFrozen[selectedKind] ? "#FF6B6B" : theme.colors.tint}
                  >
                    {isFrozen[selectedKind] ? "Frozen" : "Active"}
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  color={theme.colors.textSecondary}
                  style={styles.backHint}
                >
                  This card is property of MiNTA. Tap to flip back.
                </AppText>
              </Animated.View>
            </Pressable>
          </View>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.tapHint}
          >
            Tap card to flip
          </AppText>

          <View
            style={[
              styles.spendingCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.spendingTop}>
              <AppText
                variant="title"
                weight="medium"
                color={theme.colors.textSecondary}
                style={styles.spendingTitle}
              >
                Monthly Spending
              </AppText>

              <AppText
                variant="label"
                weight="bold"
                style={styles.spendingValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatMoney(currentSpent)} / {formatMoney(currentLimit)}
              </AppText>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor: theme.isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(11,15,19,0.10)",
                },
              ]}
            >
              <Animated.View style={[styles.progressFillWrap, { width: progressWidth }]}>
                <LinearGradient
                  colors={["#57F2C8", "#2F8DFF"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.progressFill}
                />
              </Animated.View>
            </View>
          </View>

          <View style={styles.controlsSection}>
            <AppText variant="hero" weight="bold" style={styles.controlsHeading}>
              Card Controls
            </AppText>

            <View style={styles.controlsGrid}>
              {controls.map((item: CardControlItem) => (
                <Pressable
                  key={`${selectedKind}-${item.id}`}
                  onPress={() => handleControlPress(item.id)}
                  style={[
                    styles.controlCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={theme.colors.text}
                    style={styles.controlIcon}
                  />

                  <AppText
                    variant="title"
                    weight="semibold"
                    style={styles.controlLabel}
                    numberOfLines={2}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={limitModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeLimitModal}
        >
          <View style={styles.modalRoot}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={closeLimitModal} />
            </Animated.View>

            <Animated.View
              style={[
                styles.modalCard,
                {
                  opacity: modalOpacity,
                  transform: [{ translateY: modalTranslateY }],
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText variant="hero" weight="bold" style={styles.modalTitle}>
                Set Spending Limit
              </AppText>

              <AppText variant="body" color={theme.colors.textSecondary}>
                Current limit: {formatMoney(currentLimit)}
              </AppText>

              <TextInput
                value={sanitizeAmount(limitInput)}
                onChangeText={(text) => setLimitInput(digitsOnly(text))}
                keyboardType="number-pad"
                placeholder="Enter new limit"
                placeholderTextColor={theme.colors.placeholder}
                style={[
                  styles.limitInput,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderSoft,
                    color: theme.colors.text,
                  },
                ]}
              />

              <View style={styles.quickPills}>
                {[100000, 250000, 500000, 1000000].map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => applyQuickLimit(amount)}
                    style={[
                      styles.quickPill,
                      {
                        borderColor: theme.colors.borderSoft,
                        backgroundColor: theme.colors.surfaceElevated,
                      },
                    ]}
                  >
                    <AppText variant="label" weight="semibold">
                      {amount >= 1000000 ? "1M" : `${Math.round(amount / 1000)}K`}
                    </AppText>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleUpdateLimit} style={styles.modalButtonWrap}>
                <LinearGradient
                  colors={["#57F2C8", "#31E6B7"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.modalButton}
                >
                  <AppText variant="title" weight="bold" color="#06110D">
                    Update Limit
                  </AppText>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  header: {
    gap: 10,
  },
  headerText: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  topSelectors: {
    flexDirection: "row",
    gap: 12,
  },
  cardTypeButton: {
    flex: 1,
    minHeight: 86,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  cardTypeIcon: {
    marginBottom: 4,
  },
  cardTypeTextWrap: {
    gap: 2,
    alignItems: "center",
  },
  cardTypeTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  cardShell: {
    height: 274,
  },
  cardPressable: {
    flex: 1,
  },
  cardFace: {
    position: "absolute",
    inset: 0,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    backfaceVisibility: "hidden",
  },
  cardBackFace: {
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextWrap: {
    gap: 2,
  },
  brandTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  chip: {
    width: 52,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 18,
  },
  cardMiddle: {
    gap: 8,
  },
  cardNumber: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 1,
  },
  cardBottomRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  cardMetaBlockLeft: {
    flex: 1.35,
    gap: 3,
    minWidth: 0,
    paddingRight: 4,
  },
  cardMetaBlockRight: {
    width: 78,
    gap: 3,
  },
  metaStrong: {
    fontSize: 11,
    lineHeight: 15,
  },
  mastercardBlock: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    width: 58,
  },
  mastercardWrap: {
    width: 46,
    height: 28,
    position: "relative",
  },
  mastercardLabel: {
    fontSize: 9,
    lineHeight: 11,
    textTransform: "lowercase",
  },
  mcCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: "absolute",
    top: 0,
  },
  mcLeft: {
    left: 0,
    backgroundColor: "#E24B47",
  },
  mcRight: {
    right: 0,
    backgroundColor: "#E4B326",
  },
  magStripe: {
    height: 40,
    borderRadius: 10,
    marginTop: 16,
  },
  signatureStrip: {
    marginTop: 22,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backMeta: {
    gap: 4,
  },
  backStatus: {
    fontSize: 14,
    lineHeight: 18,
  },
  backHint: {
    textAlign: "center",
    marginTop: 8,
  },
  tapHint: {
    textAlign: "center",
    marginTop: -2,
  },
  spendingCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  spendingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  spendingTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  spendingValue: {
    fontSize: 11,
    lineHeight: 15,
    flexShrink: 1,
  },
  progressTrack: {
    height: 11,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFillWrap: {
    height: "100%",
  },
  progressFill: {
    flex: 1,
    borderRadius: 999,
  },
  controlsSection: {
    gap: 14,
  },
  controlsHeading: {
    fontSize: 18,
    lineHeight: 24,
  },
  controlsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  controlCard: {
    width: "48.2%",
    minHeight: 102,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 10,
  },
  controlIcon: {
    marginBottom: 2,
  },
  controlLabel: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  limitInput: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 17,
  },
  quickPills: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  quickPill: {
    minWidth: 72,
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  modalButtonWrap: {
    marginTop: 2,
  },
  modalButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});