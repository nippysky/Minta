import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import BrandTextInput from "@/src/components/ui/BrandTextInput";
import {
  MOCK_AMOUNT_PRESETS,
  MOCK_CATEGORY_FILTERS,
  MOCK_DATE_RANGE_PRESETS,
  MOCK_LINKED_ACCOUNTS,
  MOCK_TRANSACTIONS,
} from "@/src/features/accounts/mock";
import {
  formatCurrency,
  getTransactionsByAccount,
  groupTransactionsByDate,
} from "@/src/features/accounts/utils";
import { PATHS } from "@/src/constants/paths";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import AppBackButton from "@/src/components/ui/AppBackButton";

type TransactionTypeFilter = "All" | "Income" | "Expenses";

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

function formatRelativeTime(item: unknown): string {
  const tx = item as LooseRecord;

  const existing =
    tx.relativeTime ??
    tx.timeAgo ??
    tx.relativeLabel ??
    tx.when;

  if (typeof existing === "string" && existing.trim()) {
    return existing;
  }

  const timestamp = getTransactionTimestamp(item);
  if (!timestamp) return "Recently";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(timestamp).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AccountTransactionsScreen() {
  const theme = useAppTheme();
  const { accountId } = useLocalSearchParams<{ accountId: string }>();

  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionTypeFilter>("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>("");
  const [selectedAmountPreset, setSelectedAmountPreset] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortField, setSortField] = useState<"Date" | "Amount">("Date");
  const [sortOrder, setSortOrder] = useState<"Highest First" | "Lowest First">(
    "Highest First"
  );

  const account = useMemo(
    () => MOCK_LINKED_ACCOUNTS.find((item) => item.id === accountId),
    [accountId]
  );

  const transactions = useMemo(() => {
    let items = getTransactionsByAccount(MOCK_TRANSACTIONS, accountId ?? "");

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.accountLabel.toLowerCase().includes(q)
      );
    }

    if (transactionType === "Income") {
      items = items.filter((item) => item.type === "income");
    }

    if (transactionType === "Expenses") {
      items = items.filter((item) => item.type === "expense");
    }

    if (selectedCategories.length > 0) {
      items = items.filter((item) => selectedCategories.includes(item.category));
    }

    if (selectedAccounts.length > 0) {
      items = items.filter((item) => selectedAccounts.includes(item.accountLabel));
    }

    if (selectedAmountPreset === "Under ₦5,000") {
      items = items.filter((item) => Math.abs(item.amount) < 5000);
    } else if (selectedAmountPreset === "₦5,000 - ₦20,000") {
      items = items.filter(
        (item) => Math.abs(item.amount) >= 5000 && Math.abs(item.amount) <= 20000
      );
    } else if (selectedAmountPreset === "₦20,000 - ₦100,000") {
      items = items.filter(
        (item) => Math.abs(item.amount) > 20000 && Math.abs(item.amount) <= 100000
      );
    } else if (selectedAmountPreset === "Over ₦100,000") {
      items = items.filter((item) => Math.abs(item.amount) > 100000);
    }

    const min = Number(minAmount.replace(/[^\d]/g, ""));
    const max = Number(maxAmount.replace(/[^\d]/g, ""));

    if (!Number.isNaN(min) && minAmount.trim()) {
      items = items.filter((item) => Math.abs(item.amount) >= min);
    }

    if (!Number.isNaN(max) && maxAmount.trim()) {
      items = items.filter((item) => Math.abs(item.amount) <= max);
    }

    if (selectedDatePreset === "Today") {
      const today = new Date().toDateString();
      items = items.filter((item) => {
        const ts = getTransactionTimestamp(item);
        return ts ? new Date(ts).toDateString() === today : false;
      });
    } else if (selectedDatePreset === "Last 7 days") {
      const now = Date.now();
      items = items.filter((item) => {
        const ts = getTransactionTimestamp(item);
        return ts ? now - ts <= 7 * 24 * 60 * 60 * 1000 : false;
      });
    } else if (selectedDatePreset === "This month") {
      const now = new Date();
      items = items.filter((item) => {
        const ts = getTransactionTimestamp(item);
        if (!ts) return false;
        const d = new Date(ts);
        return (
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        );
      });
    } else if (selectedDatePreset === "Last month") {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      items = items.filter((item) => {
        const ts = getTransactionTimestamp(item);
        if (!ts) return false;
        const d = new Date(ts);
        return (
          d.getMonth() === lastMonth.getMonth() &&
          d.getFullYear() === lastMonth.getFullYear()
        );
      });
    } else if (selectedDatePreset === "Last 3 months") {
      const now = Date.now();
      items = items.filter((item) => {
        const ts = getTransactionTimestamp(item);
        return ts ? now - ts <= 90 * 24 * 60 * 60 * 1000 : false;
      });
    }

    if (sortField === "Amount") {
      items = [...items].sort((a, b) =>
        sortOrder === "Highest First"
          ? Math.abs(b.amount) - Math.abs(a.amount)
          : Math.abs(a.amount) - Math.abs(b.amount)
      );
    } else {
      items = [...items].sort((a, b) => {
        const aTs = getTransactionTimestamp(a) ?? 0;
        const bTs = getTransactionTimestamp(b) ?? 0;

        return sortOrder === "Highest First" ? bTs - aTs : aTs - bTs;
      });
    }

    return items;
  }, [
    accountId,
    maxAmount,
    minAmount,
    search,
    selectedAccounts,
    selectedAmountPreset,
    selectedCategories,
    selectedDatePreset,
    sortField,
    sortOrder,
    transactionType,
  ]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  const toggleSelection = (
    current: string[],
    value: string,
    setter: (values: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  const resetFilters = () => {
    setTransactionType("All");
    setSelectedCategories([]);
    setSelectedAccounts([]);
    setSelectedDatePreset("");
    setSelectedAmountPreset("");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortField("Date");
    setSortOrder("Highest First");
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <AppBackButton/>

          <AppText variant="title" weight="bold" style={styles.headerTitle}>
            All Transactions
          </AppText>
        </View>

        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchWrap,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={theme.colors.textMuted}
            />
            <BrandTextInput
              label="Search transactions..."
              icon="search-outline"
              value={search}
              onChangeText={setSearch}
              style={styles.hiddenBrandInput}
            />
            <AppText
              variant="body"
              color={search ? theme.colors.text : theme.colors.placeholder}
              style={styles.searchOverlayText}
            >
              {search || "Search transactions..."}
            </AppText>
          </View>

          <Pressable
            onPress={() => setFilterOpen(true)}
            style={[
              styles.filterButton,
              {
                borderColor: theme.colors.borderSoft,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Ionicons
              name="filter-outline"
              size={22}
              color={theme.colors.text}
            />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {(
            [
              "All",
              "Income",
              "Transfer",
              "Shopping",
              "Entertainment",
              "Bills",
              "Transport",
            ] as const
          ).map((chip) => {
            const selected =
              chip === "All"
                ? transactionType === "All" && selectedCategories.length === 0
                : chip === "Income"
                  ? transactionType === "Income"
                  : selectedCategories.includes(chip);

            return (
              <Pressable
                key={chip}
                onPress={() => {
                  if (chip === "All") {
                    setTransactionType("All");
                    setSelectedCategories([]);
                    return;
                  }

                  if (chip === "Income") {
                    setTransactionType("Income");
                    return;
                  }

                  setTransactionType("Expenses");
                  toggleSelection(
                    selectedCategories,
                    chip,
                    setSelectedCategories
                  );
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? theme.colors.tint
                      : theme.colors.background,
                    borderColor: selected
                      ? theme.colors.tint
                      : theme.colors.borderSoft,
                  },
                ]}
              >
                <AppText
                  variant="label"
                  weight="semibold"
                  color={selected ? theme.colors.primaryText : theme.colors.text}
                >
                  {chip}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <AppText variant="body" color={theme.colors.textSecondary}>
          Showing {transactions.length} of {transactions.length} transactions
          {account ? ` • ${account.bankName}` : ""}
        </AppText>

        {groupedTransactions.length === 0 ? (
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
                { backgroundColor: theme.colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={26}
                color={theme.colors.textMuted}
              />
            </View>

            <AppText variant="title" weight="semibold" style={styles.emptyTitle}>
              No transactions found
            </AppText>

            <AppText
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.emptyText}
            >
              Try changing your search or filters to see more results.
            </AppText>
          </View>
        ) : (
          <View style={styles.groupsWrap}>
            {groupedTransactions.map((group) => (
              <View key={group.label} style={styles.groupBlock}>
                <View style={styles.groupHeader}>
                  <Ionicons
                    name="calendar-outline"
                    size={19}
                    color={theme.colors.textMuted}
                  />
                  <AppText
                    variant="body"
                    weight="medium"
                    color={theme.colors.textSecondary}
                  >
                    {group.label}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.groupCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  {group.items.map((item, index) => (
                    <Pressable
                      key={item.id}
                      onPress={() =>
                        router.push(
                          PATHS.accountTransactionDetails(
                            accountId ?? "",
                            item.id
                          )
                        )
                      }
                      style={[
                        styles.transactionRow,
                        index !== group.items.length - 1 && [
                          styles.transactionDivider,
                          { borderBottomColor: theme.colors.borderSoft },
                        ],
                      ]}
                    >
                      <View
                        style={[
                          styles.transactionIconWrap,
                          {
                            backgroundColor:
                              item.type === "income"
                                ? theme.colors.tintSoft
                                : theme.colors.surfaceElevated,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            item.type === "income"
                              ? "arrow-down-outline"
                              : "arrow-up-outline"
                          }
                          size={22}
                          color={
                            item.type === "income"
                              ? theme.colors.tint
                              : theme.colors.textMuted
                          }
                        />
                      </View>

                      <View style={styles.transactionCopy}>
                        <AppText
                          variant="title"
                          weight="semibold"
                          style={styles.transactionTitle}
                          numberOfLines={1}
                        >
                          {item.title}
                        </AppText>
                        <AppText
                          variant="body"
                          color={theme.colors.textSecondary}
                          numberOfLines={1}
                        >
                          {item.category} • {item.accountLabel} • {formatRelativeTime(item)}
                        </AppText>
                      </View>

                      <AppText
                        variant="title"
                        weight="semibold"
                        color={
                          item.type === "income"
                            ? theme.colors.tint
                            : theme.colors.text
                        }
                        style={styles.transactionAmount}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatCurrency(Math.abs(item.amount))}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomSheetModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        maxHeight="90%"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold">
              Filters
            </AppText>

            <View style={styles.sheetHeaderActions}>
              <Pressable onPress={resetFilters} style={styles.resetButton}>
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={theme.colors.text}
                />
                <AppText variant="label" weight="semibold">
                  Reset
                </AppText>
              </Pressable>

              <Pressable onPress={() => setFilterOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.sheetBlock}>
            <AppText variant="label" weight="semibold">
              Transaction Type
            </AppText>

            <View style={styles.radioRow}>
              {(["All", "Income", "Expenses"] as const).map((option) => {
                const selected = transactionType === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setTransactionType(option)}
                    style={styles.radioItem}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: theme.colors.tint },
                      ]}
                    >
                      {selected ? (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: theme.colors.tint },
                          ]}
                        />
                      ) : null}
                    </View>

                    <AppText variant="body">{option}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sheetBlock}>
            <View style={styles.sheetRowBetween}>
              <AppText variant="label" weight="semibold">
                Categories
              </AppText>

              <View style={styles.sheetInlineActions}>
                <Pressable onPress={() => setSelectedCategories([...MOCK_CATEGORY_FILTERS])}>
                  <AppText variant="body" weight="semibold">
                    Select All
                  </AppText>
                </Pressable>
                <Pressable onPress={() => setSelectedCategories([])}>
                  <AppText variant="body" weight="semibold">
                    Clear
                  </AppText>
                </Pressable>
              </View>
            </View>

            <View style={styles.wrapRow}>
              {MOCK_CATEGORY_FILTERS.map((item) => {
                const selected = selectedCategories.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() =>
                      toggleSelection(
                        selectedCategories,
                        item,
                        setSelectedCategories
                      )
                    }
                    style={[
                      styles.tagChip,
                      {
                        borderColor: selected
                          ? theme.colors.tint
                          : theme.colors.borderSoft,
                        backgroundColor: selected
                          ? theme.colors.tintSoft
                          : theme.colors.background,
                      },
                    ]}
                  >
                    <AppText variant="body">{item}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sheetBlock}>
            <AppText variant="label" weight="semibold">
              Accounts
            </AppText>

            <View style={styles.accountFilterList}>
              {MOCK_LINKED_ACCOUNTS.map((item) => {
                const selected = selectedAccounts.includes(item.bankName);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      toggleSelection(
                        selectedAccounts,
                        item.bankName,
                        setSelectedAccounts
                      )
                    }
                    style={styles.accountFilterItem}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: theme.colors.tint },
                      ]}
                    >
                      {selected ? (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: theme.colors.tint },
                          ]}
                        />
                      ) : null}
                    </View>

                    <AppText variant="body">
                      {item.icon} {item.bankName}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sheetBlock}>
            <AppText variant="label" weight="semibold">
              Date Range
            </AppText>

            <View style={styles.wrapRow}>
              {MOCK_DATE_RANGE_PRESETS.map((item) => {
                const selected = selectedDatePreset === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setSelectedDatePreset(item)}
                    style={[
                      styles.tagChip,
                      {
                        borderColor: selected
                          ? theme.colors.tint
                          : theme.colors.borderSoft,
                        backgroundColor: selected
                          ? theme.colors.tintSoft
                          : theme.colors.background,
                      },
                    ]}
                  >
                    <AppText variant="body">{item}</AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.doubleInputRow}>
              <View
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
                <AppText
                  variant="body"
                  color={fromDate ? theme.colors.text : theme.colors.placeholder}
                >
                  {fromDate || "From"}
                </AppText>
              </View>

              <View
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
                <AppText
                  variant="body"
                  color={toDate ? theme.colors.text : theme.colors.placeholder}
                >
                  {toDate || "To"}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.sheetBlock}>
            <AppText variant="label" weight="semibold">
              Amount Range
            </AppText>

            <View style={styles.wrapRow}>
              {MOCK_AMOUNT_PRESETS.map((item) => {
                const selected = selectedAmountPreset === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setSelectedAmountPreset(item)}
                    style={[
                      styles.tagChip,
                      {
                        borderColor: selected
                          ? theme.colors.tint
                          : theme.colors.borderSoft,
                        backgroundColor: selected
                          ? theme.colors.tintSoft
                          : theme.colors.background,
                      },
                    ]}
                  >
                    <AppText variant="body">{item}</AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.doubleInputRow}>
              <View style={styles.flexInput}>
                <BrandTextInput
                  label="Min amount"
                  icon="cash-outline"
                  value={minAmount}
                  onChangeText={setMinAmount}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.flexInput}>
                <BrandTextInput
                  label="Max amount"
                  icon="cash-outline"
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.sheetBlock}>
            <AppText variant="label" weight="semibold">
              Sort By
            </AppText>

            <View style={styles.doubleInputRow}>
              <Pressable
                onPress={() =>
                  setSortField((prev) => (prev === "Date" ? "Amount" : "Date"))
                }
                style={[
                  styles.selectBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <AppText variant="body">{sortField}</AppText>
                <Ionicons
                  name="chevron-down-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>

              <Pressable
                onPress={() =>
                  setSortOrder((prev) =>
                    prev === "Highest First" ? "Lowest First" : "Highest First"
                  )
                }
                style={[
                  styles.selectBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <AppText variant="body">{sortOrder}</AppText>
                <Ionicons
                  name="chevron-down-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => setFilterOpen(false)}
            style={[
              styles.applyButton,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <AppText
              variant="title"
              weight="bold"
              color={theme.colors.primaryText}
              style={styles.applyText}
            >
              Apply Filters
            </AppText>
          </Pressable>
        </ScrollView>
      </BottomSheetModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 14,
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

  searchRow: {
    flexDirection: "row",
    gap: 12,
  },
  searchWrap: {
    flex: 1,
    minHeight: 50,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  hiddenBrandInput: {
    opacity: 0,
    position: "absolute",
  },
  searchOverlayText: {
    marginLeft: 12,
    flex: 1,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  chipsRow: {
    gap: 10,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    marginTop: 12,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: "center",
    gap: 10,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    lineHeight: 25,
  },
  emptyText: {
    textAlign: "center",
    maxWidth: 260,
  },

  groupsWrap: {
    gap: 14,
  },
  groupBlock: {
    gap: 10,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  groupCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  transactionDivider: {
    borderBottomWidth: 1,
  },
  transactionIconWrap: {
    width: 45,
    height: 45,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionCopy: {
    flex: 1,
    gap: 2,
  },
  transactionTitle: {
    fontSize: 14,
    lineHeight: 23,
  },
  transactionAmount: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: "right",
  },

  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 22,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sheetBlock: {
    gap: 14,
  },
  sheetRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetInlineActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },

  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagChip: {
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  accountFilterList: {
    gap: 10,
  },
  accountFilterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  doubleInputRow: {
    flexDirection: "row",
    gap: 14,
  },
  flexInput: {
    flex: 1,
  },
  dateInput: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectBox: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  applyButton: {
    minHeight: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  applyText: {
    fontSize: 16,
    lineHeight: 22,
  },
});