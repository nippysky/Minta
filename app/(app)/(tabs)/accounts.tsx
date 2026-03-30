import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import AccountPickerSheet from "@/src/features/accounts/components/AccountPickerSheet";
import LinkNewAccountSheet from "@/src/features/accounts/components/LinkNewAccountSheet";
import { MOCK_LINKED_ACCOUNTS } from "@/src/features/accounts/mock";
import type { LinkedAccount } from "@/src/features/accounts/types";
import { getNetWorth, maskMoney } from "@/src/features/accounts/utils";
import { PATHS } from "@/src/constants/paths";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";

type PickerMode = "transfer" | "fund-general" | "fund-account";

type TransferPayload = {
  source: LinkedAccount;
  destinationType: "own" | "other-bank";
  destinationAccount?: LinkedAccount | null;
  destinationBankName?: string;
  destinationAccountNumber?: string;
  destinationAccountName?: string;
  amount: number;
  fee: number;
  category: string;
};

type LinkedAccountDraft = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

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

function buildLinkedBankAccount(
  payload: LinkedAccountDraft,
  accent: string
): LinkedAccount {
  return {
    id: `linked-${payload.bankName.toLowerCase().replace(/\s+/g, "-")}-${payload.accountNumber}`,
    kind: "bank",
    bankName: payload.bankName,
    accountType: "Savings",
    accountNumber: payload.accountNumber,
    balance: 0,
    accent,
    icon: "business-outline",
    logoColor: "#FFFFFF",
  } as LinkedAccount;
}

function accentForBank(bankName: string) {
  const map: Record<string, string> = {
    GTBank: "rgba(245,158,11,0.12)",
    UBA: "rgba(239,68,68,0.12)",
    "Access Bank": "rgba(34,197,94,0.12)",
    "Zenith Bank": "rgba(220,38,38,0.12)",
    "First Bank": "rgba(245,158,11,0.12)",
    OPay: "rgba(34,197,94,0.12)",
    Kuda: "rgba(168,85,247,0.12)",
    MoniePoint: "rgba(37,99,235,0.12)",
    PalmPay: "rgba(250,204,21,0.12)",
  };

  return map[bankName] ?? "rgba(87,242,200,0.10)";
}

export default function AccountsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [accounts, setAccounts] =
    useState<LinkedAccount[]>(MOCK_LINKED_ACCOUNTS);
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [netWorthExpanded, setNetWorthExpanded] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>("transfer");
  const [pickerSourceAccount, setPickerSourceAccount] =
    useState<LinkedAccount | null>(null);
  const [linkSheetVisible, setLinkSheetVisible] = useState(false);

  const chevron = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: netWorthExpanded ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [chevron, netWorthExpanded]);

  const wallet = accounts.find((item) => item.kind === "wallet") ?? null;
  const linkedAccounts = accounts.filter((item) => item.kind === "bank");
  const netWorth = useMemo(() => getNetWorth(accounts), [accounts]);

  const chevronStyle = {
    transform: [
      {
        rotate: chevron.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const openPicker = (
    mode: PickerMode,
    sourceAccount: LinkedAccount | null = null
  ) => {
    setPickerMode(mode);
    setPickerSourceAccount(sourceAccount);
    setPickerVisible(true);
  };

  const handlePickerSelect = (account: LinkedAccount) => {
    setPickerVisible(false);

    if (pickerMode === "fund-general") {
      showToast({
        type: "success",
        title: "Fund flow",
        message: `Funding ${account.bankName}.`,
      });
      return;
    }

    showToast({
      type: "success",
      title: "Fund MiNTA Wallet",
      message: `Transfer from ${account.bankName} selected.`,
    });
  };

  const handleTransferComplete = (payload: TransferPayload) => {
    setPickerVisible(false);

    const destinationLabel =
      payload.destinationType === "own"
        ? payload.destinationAccount?.bankName ?? "your account"
        : payload.destinationAccountName && payload.destinationBankName
          ? `${payload.destinationAccountName} (${payload.destinationBankName})`
          : payload.destinationBankName ?? "external account";

    showToast({
      type: "success",
      title: "Transfer queued",
      message: `₦${payload.amount.toLocaleString("en-NG")} from ${payload.source.bankName} to ${destinationLabel}.`,
    });
  };

  const handleLinkAccountComplete = (payload: LinkedAccountDraft) => {
    const exists = accounts.some(
      (item) =>
        item.kind === "bank" &&
        item.bankName === payload.bankName &&
        item.accountNumber === payload.accountNumber
    );

    if (!exists) {
      const nextAccount = buildLinkedBankAccount(
        payload,
        accentForBank(payload.bankName)
      );

      setAccounts((prev) => {
        const walletEntry = prev.find((item) => item.kind === "wallet") ?? null;
        const bankEntries = prev.filter((item) => item.kind === "bank");

        if (!walletEntry) {
          return [nextAccount, ...bankEntries];
        }

        return [walletEntry, nextAccount, ...bankEntries];
      });
    }

    showToast({
      type: "success",
      title: "Account linked",
      message: `${payload.bankName} • ${payload.accountNumber} has been added.`,
    });
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom + 88, 112),
          },
        ]}
      >
        <FadeInUp delay={20}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <AppText variant="title" weight="bold" style={styles.headerTitle}>
                Accounts
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                All your linked accounts
              </AppText>
            </View>

            <Pressable
              onPress={() => setBalancesVisible((prev) => !prev)}
              style={styles.eyeButton}
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
              styles.netWorthCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.netWorthTop}>
              <View style={styles.headerCopy}>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  Total Net Worth
                </AppText>
                <AppText
                  variant="title"
                  weight="bold"
                  style={styles.netWorthAmount}
                >
                  {maskMoney(balancesVisible, netWorth.total)}
                </AppText>
              </View>

              <Pressable
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setNetWorthExpanded((prev) => !prev);
                }}
                style={styles.chevronTap}
              >
                <Animated.View style={chevronStyle}>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </Animated.View>
              </Pressable>
            </View>

            <View style={styles.syncRow}>
              <Ionicons
                name="sync-outline"
                size={16}
                color={theme.colors.textMuted}
              />
              <AppText variant="body" color={theme.colors.textSecondary}>
                Last synced just now
              </AppText>
            </View>

            {netWorthExpanded ? (
              <>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.borderSoft },
                  ]}
                />

                <View style={styles.breakdownList}>
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLeft}>
                      <Ionicons
                        name="business-outline"
                        size={16}
                        color="#60A5FA"
                      />
                      <AppText variant="body" color={theme.colors.textSecondary}>
                        Bank Accounts
                      </AppText>
                    </View>
                    <AppText variant="body" weight="semibold">
                      {maskMoney(balancesVisible, netWorth.bankAccounts)}
                    </AppText>
                  </View>

                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLeft}>
                      <Ionicons
                        name="radio-button-on-outline"
                        size={16}
                        color="#2DD4BF"
                      />
                      <AppText variant="body" color={theme.colors.textSecondary}>
                        Savings Goals
                      </AppText>
                    </View>
                    <AppText variant="body" weight="semibold">
                      {maskMoney(balancesVisible, netWorth.savingsGoals)}
                    </AppText>
                  </View>

                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLeft}>
                      <Ionicons
                        name="trending-up-outline"
                        size={16}
                        color="#C084FC"
                      />
                      <AppText variant="body" color={theme.colors.textSecondary}>
                        Investments
                      </AppText>
                    </View>
                    <AppText variant="body" weight="semibold">
                      {maskMoney(balancesVisible, netWorth.investments)}
                    </AppText>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </FadeInUp>

        <FadeInUp delay={90}>
          <View style={styles.quickActions}>
            <Pressable
              onPress={() => openPicker("transfer")}
              style={[
                styles.quickActionBtn,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <Ionicons
                name="arrow-up-outline"
                size={18}
                color={theme.colors.text}
              />
              <AppText variant="label" weight="semibold">
                Transfer
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => openPicker("fund-general")}
              style={[
                styles.quickActionBtn,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <Ionicons name="add" size={18} color={theme.colors.text} />
              <AppText variant="label" weight="semibold">
                Fund
              </AppText>
            </Pressable>
          </View>
        </FadeInUp>

        {wallet ? (
          <FadeInUp delay={120}>
            <View
              style={[
                styles.walletCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: "rgba(87,242,200,0.20)",
                },
              ]}
            >
              <View
                style={[styles.walletGlow, { backgroundColor: wallet.accent }]}
              />

              <View style={styles.walletHeader}>
                <View style={styles.walletIdentity}>
                  <View
                    style={[
                      styles.walletIconWrap,
                      { backgroundColor: theme.colors.tint },
                    ]}
                  >
                    <Ionicons
                      name={wallet.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={theme.colors.primaryText}
                    />
                  </View>

                  <View style={styles.headerCopy}>
                    <AppText
                      variant="body"
                      weight="bold"
                      style={styles.walletTitle}
                    >
                      MiNTA Wallet
                    </AppText>
                    <AppText variant="body" color={theme.colors.textSecondary}>
                      Primary • {wallet.accountNumber}
                    </AppText>
                  </View>
                </View>
              </View>

              <AppText
                variant="title"
                weight="bold"
                style={styles.walletAmount}
              >
                {maskMoney(balancesVisible, wallet.balance)}
              </AppText>

              <AppText variant="body" color={theme.colors.textSecondary}>
                This week&apos;s spending
              </AppText>

              <View style={styles.weekBars}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <View key={day} style={styles.weekBarCol}>
                    <View
                      style={[
                        styles.weekBar,
                        { backgroundColor: theme.colors.tint },
                      ]}
                    />
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      {day}
                    </AppText>
                  </View>
                ))}
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => openPicker("fund-account")}
                  style={[
                    styles.primaryCardBtn,
                    { backgroundColor: theme.colors.tint },
                  ]}
                >
                  <Ionicons
                    name="arrow-down-outline"
                    size={18}
                    color={theme.colors.primaryText}
                  />
                  <AppText
                    variant="label"
                    weight="bold"
                    color={theme.colors.primaryText}
                  >
                    Fund
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => openPicker("transfer", wallet)}
                  style={[
                    styles.secondaryCardBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="arrow-up-outline"
                    size={17}
                    color={theme.colors.text}
                  />
                  <AppText variant="label" weight="semibold">
                    Transfer
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => router.push(PATHS.accountDetails(wallet.id))}
                  style={[
                    styles.secondaryCardBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="eye-outline"
                    size={17}
                    color={theme.colors.text}
                  />
                  <AppText variant="label" weight="semibold">
                    View
                  </AppText>
                </Pressable>
              </View>
            </View>
          </FadeInUp>
        ) : null}

        <FadeInUp delay={150}>
          <AppText
            variant="label"
            weight="bold"
            color={theme.colors.textSecondary}
            style={styles.sectionLabel}
          >
            LINKED ACCOUNTS
          </AppText>
        </FadeInUp>

        <View style={styles.linkedList}>
          {linkedAccounts.map((item, index) => (
            <FadeInUp key={item.id} delay={170 + index * 40}>
              <View
                style={[
                  styles.bankCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <View
                  style={[styles.bankCardGlow, { backgroundColor: item.accent }]}
                />

                <View style={styles.bankTop}>
                  <View style={styles.bankIdentity}>
                    <View style={styles.bankIconWrap}>
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={item.logoColor}
                      />
                    </View>

                    <View style={styles.headerCopy}>
                      <AppText
                        variant="body"
                        weight="bold"
                        style={styles.bankName}
                      >
                        {item.bankName}
                      </AppText>
                      <AppText variant="body" color={theme.colors.textSecondary}>
                        {item.accountType} • {item.accountNumber}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    variant="body"
                    weight="bold"
                    style={styles.bankBalance}
                  >
                    {maskMoney(balancesVisible, item.balance)}
                  </AppText>
                </View>

                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => openPicker("transfer", item)}
                    style={[
                      styles.secondaryCardBtn,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderSoft,
                      },
                    ]}
                  >
                    <Ionicons
                      name="arrow-up-outline"
                      size={17}
                      color={theme.colors.text}
                    />
                    <AppText variant="label" weight="semibold">
                      Transfer
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => openPicker("fund-general")}
                    style={[
                      styles.secondaryCardBtn,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderSoft,
                      },
                    ]}
                  >
                    <Ionicons name="add" size={17} color={theme.colors.text} />
                    <AppText variant="label" weight="semibold">
                      Fund
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push(PATHS.accountDetails(item.id))}
                    style={[
                      styles.secondaryCardBtn,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderSoft,
                      },
                    ]}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={17}
                      color={theme.colors.text}
                    />
                    <AppText variant="label" weight="semibold">
                      View
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </FadeInUp>
          ))}
        </View>

        <FadeInUp delay={380}>
          <Pressable
            onPress={() => setLinkSheetVisible(true)}
            style={[styles.linkBtn, { backgroundColor: theme.colors.tint }]}
          >
            <Ionicons name="add" size={20} color={theme.colors.primaryText} />
            <AppText
              variant="body"
              weight="bold"
              color={theme.colors.primaryText}
            >
              Link New Account
            </AppText>
          </Pressable>
        </FadeInUp>
      </ScrollView>

      <AccountPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        mode={pickerMode}
        title={
          pickerMode === "transfer"
            ? "Transfer"
            : pickerMode === "fund-account"
              ? "Fund MiNTA Wallet"
              : "Select Account to Fund"
        }
        accounts={accounts}
        targetAccount={pickerMode === "fund-account" ? wallet : null}
        sourceAccount={pickerMode === "transfer" ? pickerSourceAccount : null}
        onSelectAccount={handlePickerSelect}
        onTransferComplete={handleTransferComplete}
      />

      <LinkNewAccountSheet
        visible={linkSheetVisible}
        onClose={() => setLinkSheetVisible(false)}
        onComplete={handleLinkAccountComplete}
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
    lineHeight: 30,
  },
  eyeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  netWorthCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  netWorthTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  netWorthAmount: {
    fontSize: 20,
    lineHeight: 28,
  },
  chevronTap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  breakdownList: {
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  walletCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    overflow: "hidden",
    position: "relative",
  },
  walletGlow: {
    position: "absolute",
    top: 0,
    right: -44,
    width: 150,
    height: 150,
    borderRadius: 999,
    opacity: 0.2,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  walletIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  walletIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  walletTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  walletAmount: {
    fontSize: 20,
    lineHeight: 28,
  },
  weekBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  weekBarCol: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  weekBar: {
    width: "100%",
    height: 4,
    borderRadius: 999,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  primaryCardBtn: {
    flex: 1.08,
    minHeight: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },
  secondaryCardBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
  },
  sectionLabel: {
    letterSpacing: 1.1,
    fontSize: 13,
    lineHeight: 18,
  },
  linkedList: {
    gap: 14,
  },
  bankCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    overflow: "hidden",
    position: "relative",
  },
  bankCardGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  bankTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent : "space-between",
    gap: 10,
  },
  bankIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  bankIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  bankName: {
    fontSize: 16,
    lineHeight: 22,
  },
  bankBalance: {
    fontSize: 16,
    lineHeight: 22,
  },
  linkBtn: {
    minHeight: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
});