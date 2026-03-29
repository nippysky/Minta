import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";
import { BudgetCategory, BudgetItem, mockBudgets } from "@/src/features/budget/data/mockBudgets";

const CATEGORY_OPTIONS: { label: BudgetCategory; icon: string }[] = [
  { label: "Food & Dining", icon: "🍽️" },
  { label: "Entertainment", icon: "🎬" },
  { label: "Transport", icon: "🚗" },
  { label: "Shopping", icon: "🛍️" },
  { label: "Bills & Utilities", icon: "💡" },
  { label: "Health", icon: "🏥" },
  { label: "Education", icon: "📚" },
  { label: "Subscriptions", icon: "📱" },
];

function currency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export default function BudgetsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState<BudgetItem[]>(mockBudgets);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);

  const [createVisible, setCreateVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [formCategory, setFormCategory] = useState<BudgetCategory>("Food & Dining");
  const [formLimit, setFormLimit] = useState("");
  const [formAlertAt, setFormAlertAt] = useState(70);

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, item) => sum + item.limit, 0);
    const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
    const remaining = Math.max(totalBudget - totalSpent, 0);
    const daysRemaining = 2;
    const daily = daysRemaining > 0 ? Math.floor(remaining / daysRemaining) : 0;

    return { totalBudget, totalSpent, remaining, daysRemaining, daily };
  }, [budgets]);

  const alerts = useMemo(
    () => budgets.filter((item) => item.spent > item.limit),
    [budgets]
  );

  const openCreate = () => {
    setFormCategory("Food & Dining");
    setFormLimit("");
    setFormAlertAt(70);
    setCreateVisible(true);
  };

  const openDetail = (item: BudgetItem) => {
    setSelectedBudget(item);
    setDetailVisible(true);
  };

  const openEdit = (item: BudgetItem) => {
    setSelectedBudget(item);
    setFormCategory(item.category);
    setFormLimit(String(item.limit));
    setFormAlertAt(item.alertAt);
    setEditVisible(true);
  };

  const handleCreateBudget = () => {
    const parsedLimit = Number(formLimit.replace(/,/g, ""));
    if (!parsedLimit || parsedLimit <= 0) {
      showToast({
        type: "error",
        title: "Invalid budget amount",
        message: "Enter a valid monthly limit.",
      });
      return;
    }

    const foundIcon =
      CATEGORY_OPTIONS.find((item) => item.label === formCategory)?.icon ?? "💼";

    const newItem: BudgetItem = {
      id: `${formCategory}-${Date.now()}`,
      category: formCategory,
      icon: foundIcon,
      limit: parsedLimit,
      spent: 0,
      alertAt: formAlertAt,
      transactions: [],
    };

    setBudgets((prev) => [newItem, ...prev]);
    setCreateVisible(false);

    showToast({
      type: "success",
      title: "Budget created",
      message: `${formCategory} budget added successfully.`,
    });
  };

  const handleUpdateBudget = () => {
    if (!selectedBudget) return;

    const parsedLimit = Number(formLimit.replace(/,/g, ""));
    if (!parsedLimit || parsedLimit <= 0) {
      showToast({
        type: "error",
        title: "Invalid budget amount",
        message: "Enter a valid monthly limit.",
      });
      return;
    }

    setBudgets((prev) =>
      prev.map((item) =>
        item.id === selectedBudget.id
          ? {
              ...item,
              category: formCategory,
              limit: parsedLimit,
              alertAt: formAlertAt,
              icon:
                CATEGORY_OPTIONS.find((entry) => entry.label === formCategory)?.icon ??
                item.icon,
            }
          : item
      )
    );

    setEditVisible(false);
    setDetailVisible(false);

    showToast({
      type: "success",
      title: "Budget updated",
      message: `${formCategory} budget updated.`,
    });
  };

  const handleDeleteBudget = () => {
    if (!selectedBudget) return;

    setBudgets((prev) => prev.filter((item) => item.id !== selectedBudget.id));
    setDetailVisible(false);

    showToast({
      type: "success",
      title: "Budget deleted",
      message: `${selectedBudget.category} budget removed.`,
    });
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom + 28, 36),
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <AppText variant="title" weight="bold" style={styles.headerTitle}>
              Budgets
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              March
            </AppText>
          </View>

          <Pressable
            onPress={openCreate}
            style={[
              styles.addButton,
              {
                borderColor: theme.colors.borderFocus,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Ionicons name="add" size={22} color={theme.colors.tint} />
          </Pressable>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.summaryTop}>
            <View
              style={[
                styles.summaryIconWrap,
                { backgroundColor: "rgba(87,242,200,0.14)" },
              ]}
            >
              <Ionicons name="wallet-outline" size={24} color={theme.colors.tint} />
            </View>

            <View style={styles.summaryTextWrap}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Total Budget
              </AppText>
              <AppText variant="title" weight="bold" style={styles.moneyLarge}>
                {currency(totals.totalBudget)}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.colors.inputBackground },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${clampPercent(
                    (totals.totalSpent / Math.max(totals.totalBudget, 1)) * 100
                  )}%`,
                  backgroundColor: "#F6C453",
                },
              ]}
            />
          </View>

          <View style={styles.summaryStats}>
            <View>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Spent
              </AppText>
              <AppText variant="label" weight="bold">
                {currency(totals.totalSpent)}
              </AppText>
            </View>

            <View style={styles.alignRight}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Remaining
              </AppText>
              <AppText variant="label" weight="bold" color={theme.colors.tint}>
                {currency(totals.remaining)}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.borderSoft },
            ]}
          />

          <View style={styles.summaryFooter}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {totals.daysRemaining} days remaining
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              ~{currency(totals.daily)}/day
            </AppText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Ionicons name="trending-down-outline" size={18} color="#F4A340" />
            <AppText variant="title" weight="bold">
              Budget Alerts
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.alertsWrap,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          {alerts.map((item) => {
            const percent = (item.spent / item.limit) * 100;
            return (
              <Pressable
                key={item.id}
                onPress={() => openDetail(item)}
                style={styles.alertItem}
              >
                <View style={styles.alertTop}>
                  <View style={styles.row}>
                    <AppText style={styles.emoji}>{item.icon}</AppText>
                    <AppText variant="label" weight="bold">
                      {item.category}
                    </AppText>
                  </View>

                  <AppText variant="body" color="#FF6B63" weight="semibold">
                    {percent.toFixed(0)}%
                  </AppText>
                </View>

                <View
                  style={[
                    styles.progressTrackThin,
                    { backgroundColor: "rgba(255,107,99,0.16)" },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFillThin,
                      {
                        width: `${clampPercent(percent)}%`,
                        backgroundColor: "#FF6B63",
                      },
                    ]}
                  />
                </View>

                <View style={styles.alertBottom}>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Spent: {currency(item.spent)}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    of {currency(item.limit)}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.borderSoft },
                  ]}
                />

                <AppText variant="body" color="#FF6B63" weight="medium">
                  {currency(item.spent - item.limit)} over budget!
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText variant="title" weight="bold">
          All Budgets
        </AppText>

        <View style={styles.cardList}>
          {budgets.map((item) => {
            const percent = (item.spent / item.limit) * 100;
            const overBudget = item.spent > item.limit;

            return (
              <Pressable
                key={item.id}
                onPress={() => openDetail(item)}
                style={[
                  styles.budgetCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: overBudget ? "rgba(255,107,99,0.50)" : theme.colors.borderSoft,
                  },
                ]}
              >
                <View style={styles.alertTop}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.roundIcon,
                        {
                          backgroundColor: overBudget
                            ? "rgba(255,107,99,0.10)"
                            : "rgba(87,242,200,0.10)",
                        },
                      ]}
                    >
                      <AppText style={styles.emoji}>{item.icon}</AppText>
                    </View>

                    <View style={{ flex: 1 }}>
                      <AppText variant="label" weight="bold">
                        {item.category}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    variant="body"
                    color={overBudget ? "#FF6B63" : theme.colors.textSecondary}
                    weight="medium"
                  >
                    {percent.toFixed(0)}%
                  </AppText>
                </View>

                <View
                  style={[
                    styles.progressTrackThin,
                    {
                      backgroundColor: overBudget
                        ? "rgba(255,107,99,0.16)"
                        : "rgba(246,196,83,0.16)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFillThin,
                      {
                        width: `${clampPercent(percent)}%`,
                        backgroundColor: overBudget ? "#FF6B63" : "#F6C453",
                      },
                    ]}
                  />
                </View>

                <View style={styles.alertBottom}>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Spent: {currency(item.spent)}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    of {currency(item.limit)}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.borderSoft },
                  ]}
                />

                <AppText
                  variant="body"
                  color={overBudget ? "#FF6B63" : theme.colors.tint}
                  weight="medium"
                >
                  {overBudget
                    ? `${currency(item.spent - item.limit)} over budget!`
                    : `${currency(item.limit - item.spent)} remaining this month`}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <BottomSheetModal visible={createVisible} onClose={() => setCreateVisible(false)}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold">
              Add Budget
            </AppText>
            <Pressable onPress={() => setCreateVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <AppText variant="body" color={theme.colors.textSecondary}>
            Category
          </AppText>

          <View style={styles.categoryGrid}>
            {CATEGORY_OPTIONS.map((item) => {
              const selected = formCategory === item.label;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => setFormCategory(item.label)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: selected
                        ? theme.colors.borderFocus
                        : theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText style={styles.emoji}>{item.icon}</AppText>
                  <AppText
                    variant="body"
                    weight={selected ? "semibold" : "medium"}
                    color={selected ? theme.colors.tint : theme.colors.text}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="body" color={theme.colors.textSecondary}>
            Monthly Limit
          </AppText>

          <TextInput
            value={formLimit}
            onChangeText={setFormLimit}
            keyboardType="number-pad"
            placeholder="₦ 0"
            placeholderTextColor={theme.colors.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
                color: theme.colors.text,
              },
            ]}
          />

          <AppText variant="body" color={theme.colors.textSecondary}>
            Alert me at {formAlertAt}% spent
          </AppText>

          <View style={styles.sliderRow}>
            <Pressable
              onPress={() => setFormAlertAt((prev) => Math.max(50, prev - 10))}
              style={[
                styles.sliderButton,
                {
                  borderColor: theme.colors.borderSoft,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Ionicons name="remove" size={20} color={theme.colors.text} />
            </Pressable>

            <View
              style={[
                styles.sliderTrack,
                { backgroundColor: theme.colors.inputBackground },
              ]}
            >
              <View
                style={[
                  styles.sliderFill,
                  {
                    width: `${((formAlertAt - 50) / 50) * 100}%`,
                    backgroundColor: theme.colors.tint,
                  },
                ]}
              />
            </View>

            <Pressable
              onPress={() => setFormAlertAt((prev) => Math.min(100, prev + 10))}
              style={[
                styles.sliderButton,
                {
                  borderColor: theme.colors.borderSoft,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.sheetActions}>
            <Pressable
              onPress={() => setCreateVisible(false)}
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText variant="label" weight="semibold">
                Cancel
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleCreateBudget}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.colors.tint,
                },
              ]}
            >
              <AppText
                variant="label"
                weight="bold"
                color={theme.colors.primaryText}
              >
                Create Budget
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </BottomSheetModal>

      <BottomSheetModal visible={detailVisible} onClose={() => setDetailVisible(false)}>
        {selectedBudget ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.row}>
                <View
                  style={[
                    styles.roundIcon,
                    { backgroundColor: "rgba(87,242,200,0.10)" },
                  ]}
                >
                  <AppText style={styles.emoji}>{selectedBudget.icon}</AppText>
                </View>
                <View>
                  <AppText variant="title" weight="bold">
                    {selectedBudget.category}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Monthly Budget
                  </AppText>
                </View>
              </View>

              <Pressable onPress={() => setDetailVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <View style={styles.alertTop}>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  Progress
                </AppText>
                <AppText
                  variant="label"
                  weight="bold"
                  color={
                    selectedBudget.spent > selectedBudget.limit
                      ? "#FF6B63"
                      : theme.colors.text
                  }
                >
                  {((selectedBudget.spent / selectedBudget.limit) * 100).toFixed(1)}%
                </AppText>
              </View>

              <View
                style={[
                  styles.progressTrackThin,
                  { backgroundColor: theme.colors.inputBackground },
                ]}
              >
                <View
                  style={[
                    styles.progressFillThin,
                    {
                      width: `${clampPercent(
                        (selectedBudget.spent / selectedBudget.limit) * 100
                      )}%`,
                      backgroundColor:
                        selectedBudget.spent > selectedBudget.limit
                          ? "#FF6B63"
                          : "#F6C453",
                    },
                  ]}
                />
              </View>

              <View style={styles.detailGrid}>
                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Spent
                  </AppText>
                  <AppText variant="label" weight="bold">
                    {currency(selectedBudget.spent)}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {selectedBudget.spent > selectedBudget.limit ? "Over by" : "Remaining"}
                  </AppText>
                  <AppText
                    variant="label"
                    weight="bold"
                    color={
                      selectedBudget.spent > selectedBudget.limit
                        ? "#FF6B63"
                        : theme.colors.tint
                    }
                  >
                    {currency(Math.abs(selectedBudget.limit - selectedBudget.spent))}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Budget Limit
                  </AppText>
                  <AppText variant="label" weight="bold">
                    {currency(selectedBudget.limit)}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Alert at
                  </AppText>
                  <AppText variant="label" weight="bold">
                    {selectedBudget.alertAt}%
                  </AppText>
                </View>
              </View>
            </View>

            <AppText variant="title" weight="bold">
              Recent Transactions
            </AppText>

            <View
              style={[
                styles.transactionsWrap,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              {selectedBudget.transactions.map((tx) => (
                <View key={tx.id} style={styles.txRow}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.txIcon,
                        { backgroundColor: theme.colors.surfaceElevated },
                      ]}
                    >
                      <Ionicons
                        name="arrow-up-outline"
                        size={16}
                        color={theme.colors.textMuted}
                      />
                    </View>
                    <View>
                      <AppText variant="label" weight="medium">
                        {tx.title}
                      </AppText>
                      <AppText variant="body" color={theme.colors.textSecondary}>
                        {tx.date}
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="label" weight="semibold">
                    -{currency(tx.amount)}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => openEdit(selectedBudget)}
                style={[
                  styles.secondaryButton,
                  {
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <Ionicons name="create-outline" size={18} color={theme.colors.text} />
                <AppText variant="label" weight="semibold">
                  Edit
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleDeleteBudget}
                style={[
                  styles.secondaryButton,
                  {
                    borderColor: "rgba(255,107,99,0.32)",
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={18} color="#FF6B63" />
                <AppText variant="label" weight="semibold" color="#FF6B63">
                  Delete
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        ) : null}
      </BottomSheetModal>

      <BottomSheetModal visible={editVisible} onClose={() => setEditVisible(false)}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold">
              Edit Budget
            </AppText>
            <Pressable onPress={() => setEditVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <AppText variant="body" color={theme.colors.textSecondary}>
            Category
          </AppText>

          <View style={styles.categoryGrid}>
            {CATEGORY_OPTIONS.map((item) => {
              const selected = formCategory === item.label;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => setFormCategory(item.label)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: selected
                        ? theme.colors.borderFocus
                        : theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText style={styles.emoji}>{item.icon}</AppText>
                  <AppText
                    variant="body"
                    weight={selected ? "semibold" : "medium"}
                    color={selected ? theme.colors.tint : theme.colors.text}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="body" color={theme.colors.textSecondary}>
            Monthly Limit
          </AppText>

          <TextInput
            value={formLimit}
            onChangeText={setFormLimit}
            keyboardType="number-pad"
            placeholder="₦ 0"
            placeholderTextColor={theme.colors.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
                color: theme.colors.text,
              },
            ]}
          />

          <AppText variant="body" color={theme.colors.textSecondary}>
            Alert me at {formAlertAt}% spent
          </AppText>

          <View style={styles.sliderRow}>
            <Pressable
              onPress={() => setFormAlertAt((prev) => Math.max(50, prev - 10))}
              style={[
                styles.sliderButton,
                {
                  borderColor: theme.colors.borderSoft,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Ionicons name="remove" size={20} color={theme.colors.text} />
            </Pressable>

            <View
              style={[
                styles.sliderTrack,
                { backgroundColor: theme.colors.inputBackground },
              ]}
            >
              <View
                style={[
                  styles.sliderFill,
                  {
                    width: `${((formAlertAt - 50) / 50) * 100}%`,
                    backgroundColor: theme.colors.tint,
                  },
                ]}
              />
            </View>

            <Pressable
              onPress={() => setFormAlertAt((prev) => Math.min(100, prev + 10))}
              style={[
                styles.sliderButton,
                {
                  borderColor: theme.colors.borderSoft,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.sheetActions}>
            <Pressable
              onPress={() => setEditVisible(false)}
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText variant="label" weight="semibold">
                Cancel
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleUpdateBudget}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.colors.tint,
                },
              ]}
            >
              <AppText
                variant="label"
                weight="bold"
                color={theme.colors.primaryText}
              >
                Update Budget
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </BottomSheetModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextWrap: {
    flex: 1,
    gap: 4,
  },
  moneyLarge: {
    fontSize: 18,
    lineHeight: 24,
  },
  progressTrack: {
    height: 16,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionHeader: {
    marginTop: 2,
  },
  alertsWrap: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  alertItem: {
    padding: 18,
    gap: 12,
  },
  alertTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  alertBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  progressTrackThin: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFillThin: {
    height: "100%",
    borderRadius: 999,
  },
  cardList: {
    gap: 14,
  },
  budgetCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  roundIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 22,
    lineHeight: 24,
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    width: "48.5%",
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 999,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48.5%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  transactionsWrap: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  txRow: {
    minHeight: 66,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});