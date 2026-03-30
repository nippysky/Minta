import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import AccountPickerSheet from "@/src/features/accounts/components/AccountPickerSheet";
import UnlinkAccountSheet from "@/src/features/accounts/components/UnlinkAccountSheet";
import {
  MOCK_LINKED_ACCOUNTS,
  MOCK_TRANSACTIONS,
} from "@/src/features/accounts/mock";
import {
  getAccountById,
  getTransactionsByAccount,
  maskMoney,
} from "@/src/features/accounts/utils";
import { PATHS } from "@/src/constants/paths";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";
import AppBackButton from "@/src/components/ui/AppBackButton";

export default function AccountDetailsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { accountId } = useLocalSearchParams<{ accountId: string }>();

  const account = getAccountById(MOCK_LINKED_ACCOUNTS, accountId ?? "");
  const transactions = getTransactionsByAccount(MOCK_TRANSACTIONS, accountId ?? "").slice(0, 3);

  const [balancesVisible, setBalancesVisible] = useState(true);
  const [pickerMode, setPickerMode] = useState<"transfer" | "fund-account" | null>(null);
  const [unlinkVisible, setUnlinkVisible] = useState(false);
  const [unlinkPin, setUnlinkPin] = useState("");

  if (!account) {
    return (
      <AppScreen>
        <View style={styles.emptyPage}>
          <AppText variant="title" weight="bold">
            Account not found
          </AppText>
        </View>
      </AppScreen>
    );
  }

  const handleAccountPickerSelect = (selected: (typeof MOCK_LINKED_ACCOUNTS)[number]) => {
    setPickerMode(null);

    showToast({
      type: "success",
      title: pickerMode === "transfer" ? "Transfer flow" : "Fund flow",
      message:
        pickerMode === "transfer"
          ? `Using ${selected.bankName} as source account.`
          : `Transfer from ${selected.bankName} selected.`,
    });
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 10, paddingBottom: Math.max(insets.bottom + 30, 48) },
        ]}
      >
        <View style={styles.headerRow}>
        <AppBackButton/>

          <View style={styles.headerCopy}>
            <View style={styles.headerBrand}>
              <Ionicons
                name={account.icon as keyof typeof Ionicons.glyphMap}
                size={28}
                color={account.logoColor}
              />
              <AppText variant="title" weight="bold" style={styles.headerTitle}>
                {account.bankName}
              </AppText>
            </View>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {account.accountType} Account
            </AppText>
          </View>

          <Pressable
            onPress={() => setUnlinkVisible(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="unlink-outline" size={22} color={theme.colors.text} />
          </Pressable>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(87,242,200,0.22)",
            },
          ]}
        >
          <View
            style={[
              styles.heroGlow,
              { backgroundColor: account.accent },
            ]}
          />

          <View style={styles.heroHeader}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Available Balance
            </AppText>

            <Pressable onPress={() => setBalancesVisible((prev) => !prev)}>
              <Ionicons
                name={balancesVisible ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <AppText variant="title" weight="bold" style={styles.balance}>
            {maskMoney(balancesVisible, account.availableBalance ?? account.balance)}
          </AppText>

          <View style={styles.metaRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Account:
            </AppText>
            <AppText variant="body" weight="semibold">
              {account.accountNumber}
            </AppText>
            <Ionicons name="copy-outline" size={18} color={theme.colors.text} />
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="sync-outline" size={16} color={theme.colors.textSecondary} />
            <AppText variant="body" color={theme.colors.textSecondary}>
              Last synced {account.syncedAtLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.topActions}>
          <Pressable
            onPress={() => setPickerMode("transfer")}
            style={[
              styles.actionTile,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.borderSoft },
            ]}
          >
            <Ionicons name="arrow-up-outline" size={20} color={theme.colors.text} />
            <AppText variant="body" weight="bold">
              Transfer
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setPickerMode("fund-account")}
            style={[
              styles.actionTile,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.borderSoft },
            ]}
          >
            <Ionicons name="add" size={20} color={theme.colors.text} />
            <AppText variant="body" weight="bold">
              Fund
            </AppText>
          </Pressable>

          <Pressable
            onPress={() =>
              showToast({
                type: "success",
                title: "Coming soon",
                message: "Statement export is not available yet.",
              })
            }
            style={[
              styles.actionTile,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.borderSoft },
            ]}
          >
            <Ionicons name="download-outline" size={20} color={theme.colors.text} />
            <AppText variant="body" weight="bold">
              Statement
            </AppText>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View
              style={[styles.statIconWrap, { backgroundColor: theme.colors.tintSoft }]}
            >
              <Ionicons name="arrow-down-outline" size={20} color={theme.colors.tint} />
            </View>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Total In
            </AppText>
            <AppText variant="body" weight="bold" color={theme.colors.tint}>
              {maskMoney(balancesVisible, account.totalIn)}
            </AppText>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View
              style={[styles.statIconWrap, { backgroundColor: theme.colors.surfaceElevated }]}
            >
              <Ionicons name="arrow-up-outline" size={20} color={theme.colors.textSecondary} />
            </View>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Total Out
            </AppText>
            <AppText variant="body" weight="bold">
              {maskMoney(balancesVisible, account.totalOut)}
            </AppText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold" style={styles.sectionTitle}>
            Recent Transactions
          </AppText>

          <Pressable
            onPress={() => router.push(PATHS.accountTransactions(account.id))}
          >
            <AppText variant="body" weight="bold" color={theme.colors.tint}>
              See All
            </AppText>
          </Pressable>
        </View>

        {transactions.length === 0 ? (
          <View
            style={[
              styles.emptyStateCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: theme.colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="arrow-up-outline"
                size={24}
                color={theme.colors.textSecondary}
              />
            </View>

            <AppText variant="body" weight="medium" color={theme.colors.textSecondary}>
              No transactions yet
            </AppText>
            <AppText variant="body" color={theme.colors.textMuted} style={styles.emptyHint}>
              Your transaction history will appear here
            </AppText>
          </View>
        ) : (
          <View
            style={[
              styles.listCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            {transactions.map((txn, index) => (
              <Pressable
                key={txn.id}
                onPress={() =>
                  router.push(PATHS.accountTransactionDetails(account.id, txn.id))
                }
                style={[
                  styles.txnRow,
                  index !== transactions.length - 1 && [
                    styles.txnRowBorder,
                    { borderBottomColor: theme.colors.borderSoft },
                  ],
                ]}
              >
                <View
                  style={[
                    styles.txnIcon,
                    { backgroundColor: theme.colors.surfaceElevated },
                  ]}
                >
                  <Ionicons
                    name="arrow-up-outline"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </View>

                <View style={styles.txnCopy}>
                  <AppText variant="body" weight="bold">
                    {txn.title}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {txn.category} • {txn.accountLabel} • {txn.relativeLabel}
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  weight="bold"
                  color={txn.amount > 0 ? theme.colors.tint : theme.colors.text}
                >
                  {txn.amount > 0
                    ? `+${txn.amount.toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      })}`
                    : `-${Math.abs(txn.amount).toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      })}`}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <AccountPickerSheet
        visible={pickerMode !== null}
        onClose={() => setPickerMode(null)}
        mode={pickerMode === "fund-account" ? "fund-account" : "transfer"}
        title={pickerMode === "fund-account" ? `Fund ${account.bankName} Wallet` : "Select Source Account"}
        accounts={MOCK_LINKED_ACCOUNTS}
        targetAccount={pickerMode === "fund-account" ? account : null}
        onSelectAccount={handleAccountPickerSelect}
      />

      <UnlinkAccountSheet
        visible={unlinkVisible}
        onClose={() => {
          setUnlinkVisible(false);
          setUnlinkPin("");
        }}
        account={account}
        pin={unlinkPin}
        onChangePin={setUnlinkPin}
        onConfirm={() => {
          if (unlinkPin.length !== 4) {
            showToast({
              type: "error",
              title: "PIN required",
              message: "Enter your 4-digit PIN to continue.",
            });
            return;
          }

          setUnlinkVisible(false);
          setUnlinkPin("");

          showToast({
            type: "success",
            title: "Account unlinked",
            message: `${account.bankName} has been unlinked.`,
          });

          router.back();
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  emptyPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    overflow: "hidden",
    position: "relative",
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.16,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balance: {
    fontSize: 20,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionTile: {
    flex: 1,
    minHeight: 70,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
  emptyStateCard: {
    minHeight: 220,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHint: {
    textAlign: "center",
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  txnRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  txnRowBorder: {
    borderBottomWidth: 1,
  },
  txnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  txnCopy: {
    flex: 1,
    gap: 2,
  },
});