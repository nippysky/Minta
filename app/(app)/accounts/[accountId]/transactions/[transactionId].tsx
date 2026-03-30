import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import { MOCK_TRANSACTIONS } from "@/src/features/accounts/mock";
import { formatCurrency } from "@/src/features/accounts/utils";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";
import AppBackButton from "@/src/components/ui/AppBackButton";

type LooseRecord = Record<string, unknown>;

function getTransactionTimestamp(item: unknown): number | null {
  const tx = item as LooseRecord;

  const candidate =
    tx.dateTime ??
    tx.timestamp ??
    tx.createdAt ??
    tx.date ??
    tx.transactionDate ??
    tx.postedAt;

  if (!candidate) return null;

  if (typeof candidate === "number") {
    return Number.isFinite(candidate) ? candidate : null;
  }

  if (typeof candidate === "string") {
    const parsed = new Date(candidate).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function getTransactionDateLabel(item: unknown): string {
  const tx = item as LooseRecord;

  const existing =
    tx.fullDate ??
    tx.dateLabel ??
    tx.displayDate;

  if (typeof existing === "string" && existing.trim()) {
    return existing;
  }

  const timestamp = getTransactionTimestamp(item);
  if (!timestamp) return "—";

  return new Date(timestamp).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTransactionTimeLabel(item: unknown): string {
  const tx = item as LooseRecord;

  const existing =
    tx.time ??
    tx.timeLabel ??
    tx.displayTime;

  if (typeof existing === "string" && existing.trim()) {
    return existing;
  }

  const timestamp = getTransactionTimestamp(item);
  if (!timestamp) return "—";

  return new Date(timestamp).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function TransactionDetailsScreen() {
  const theme = useAppTheme();
  const { showToast } = useToast();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

  const transaction = MOCK_TRANSACTIONS.find((item) => item.id === transactionId);

  if (!transaction) {
    return (
      <AppScreen>
        <View style={styles.missingWrap}>
          <AppText variant="title" weight="bold">
            Transaction not found
          </AppText>
          <Pressable onPress={() => router.back()} style={styles.missingBtn}>
            <AppText variant="body" weight="semibold" color={theme.colors.tint}>
              Go Back
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  const isIncome = transaction.type === "income";

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
      <AppBackButton/>
          <AppText variant="title" weight="bold" style={styles.headerTitle}>
            Transaction Details
          </AppText>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View
            style={[
              styles.heroIconWrap,
              {
                backgroundColor: theme.colors.surfaceElevated,
              },
            ]}
          >
            <Ionicons
              name={isIncome ? "arrow-down-outline" : "arrow-up-outline"}
              size={34}
              color={isIncome ? theme.colors.tint : theme.colors.textMuted}
            />
          </View>

          <AppText variant="hero" weight="bold" style={styles.amountText}>
            {isIncome ? "+" : "-"}
            {formatCurrency(Math.abs(transaction.amount))}
          </AppText>

          <AppText variant="title" weight="medium" style={styles.heroTitle}>
            {transaction.title}
          </AppText>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: theme.colors.tintSoft,
              },
            ]}
          >
            <Ionicons name="checkmark" size={18} color={theme.colors.tint} />
            <AppText variant="body" weight="semibold" color={theme.colors.tint}>
              Completed
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <AppText variant="title" weight="bold" style={styles.blockTitle}>
            Transaction Details
          </AppText>

          <View style={styles.detailRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Reference
            </AppText>

            <View style={styles.refWrap}>
              <AppText variant="body" weight="medium">
                {transaction.reference}
              </AppText>
              <Pressable
                onPress={() =>
                  showToast({
                    type: "success",
                    title: "Copied",
                    message: "Reference copied.",
                  })
                }
              >
                <Ionicons
                  name="copy-outline"
                  size={21}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Category
            </AppText>
            <AppText variant="body" weight="medium">
              {transaction.category}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Account
            </AppText>
            <AppText variant="body" weight="medium">
              {transaction.accountLabel}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Date
            </AppText>
            <AppText variant="body" weight="medium">
              {getTransactionDateLabel(transaction)}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Time
            </AppText>
            <AppText variant="body" weight="medium">
              {getTransactionTimeLabel(transaction)}
            </AppText>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() =>
              showToast({
                type: "success",
                title: "Coming soon",
                message: "Receipt sharing is not ready yet.",
              })
            }
            style={[
              styles.actionBtn,
              {
                borderColor: theme.colors.borderSoft,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={theme.colors.text}
            />
            <AppText variant="title" weight="semibold" style={styles.actionText}>
              Share Receipt
            </AppText>
          </Pressable>

          <Pressable
            onPress={() =>
              showToast({
                type: "success",
                title: "Coming soon",
                message: "Download is not ready yet.",
              })
            }
            style={[
              styles.actionBtn,
              {
                borderColor: theme.colors.borderSoft,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={20}
              color={theme.colors.text}
            />
            <AppText variant="title" weight="semibold" style={styles.actionText}>
              Download
            </AppText>
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            showToast({
              type: "error",
              title: "Report submitted",
              message: "We’ve logged your issue for review.",
            })
          }
          style={styles.reportButton}
        >
          <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />
          <AppText variant="body" weight="semibold" color="#EF4444">
            Report an Issue
          </AppText>
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 34,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 26,
    alignItems: "center",
    gap: 14,
  },
  heroIconWrap: {
    width: 69,
    height: 69,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  amountText: {
    fontSize: 25,
    lineHeight: 42,
  },
  heroTitle: {
    fontSize: 14,
    lineHeight: 25,
  },
  statusPill: {
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  detailsCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 18,
  },
  blockTitle: {
    fontSize: 16,
    lineHeight: 25,
  },
  detailRow: {
    gap: 10,
  },
  refWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 22,
  },

  reportButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 6,
  },

  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  missingBtn: {
    minHeight: 40,
    justifyContent: "center",
  },
});