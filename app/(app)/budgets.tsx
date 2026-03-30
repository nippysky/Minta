import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import AppBackButton from "@/src/components/ui/AppBackButton";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";
import {
  BudgetCategory,
  BudgetItem,
  mockBudgets,
} from "@/src/features/budget/data/mockBudgets";

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

type SheetMode = "none" | "create" | "detail" | "edit";

function currency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function formatBudgetInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

type AnimatedProgressProps = {
  progress: number;
  height: number;
  backgroundColor: string;
  fillColor: string;
};

function AnimatedProgress({
  progress,
  height,
  backgroundColor,
  fillColor,
}: AnimatedProgressProps) {
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clampPercent(progress),
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animated, progress]);

  const width = animated.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.animatedTrack,
        {
          height,
          backgroundColor,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.animatedFill,
          {
            width,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

export default function BudgetsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState<BudgetItem[]>(mockBudgets);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetMode>("none");

  const [formCategory, setFormCategory] =
    useState<BudgetCategory>("Food & Dining");
  const [formLimit, setFormLimit] = useState("");
  const [formAlertAt, setFormAlertAt] = useState(70);

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, item) => sum + item.limit, 0);
    const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
    const remaining = Math.max(totalBudget - totalSpent, 0);
    const daysRemaining = 1;
    const daily = daysRemaining > 0 ? Math.floor(remaining / daysRemaining) : 0;

    return { totalBudget, totalSpent, remaining, daysRemaining, daily };
  }, [budgets]);

  const alerts = useMemo(
    () => budgets.filter((item) => item.spent > item.limit),
    [budgets]
  );

  const openCreate = () => {
    setSelectedBudget(null);
    setFormCategory("Food & Dining");
    setFormLimit("");
    setFormAlertAt(70);
    setActiveSheet("create");
  };

  const openDetail = (item: BudgetItem) => {
    setSelectedBudget(item);
    setActiveSheet("detail");
  };

  const openEdit = (item: BudgetItem) => {
    setSelectedBudget(item);
    setFormCategory(item.category);
    setFormLimit(String(item.limit.toLocaleString("en-NG")));
    setFormAlertAt(item.alertAt);
    setActiveSheet("edit");
  };

  const closeSheet = () => {
    setActiveSheet("none");
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
    setActiveSheet("none");

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

    const updatedIcon =
      CATEGORY_OPTIONS.find((entry) => entry.label === formCategory)?.icon ??
      selectedBudget.icon;

    const nextSelected: BudgetItem = {
      ...selectedBudget,
      category: formCategory,
      limit: parsedLimit,
      alertAt: formAlertAt,
      icon: updatedIcon,
    };

    setBudgets((prev) =>
      prev.map((item) => (item.id === selectedBudget.id ? nextSelected : item))
    );
    setSelectedBudget(nextSelected);
    setActiveSheet("detail");

    showToast({
      type: "success",
      title: "Budget updated",
      message: `${formCategory} budget updated.`,
    });
  };

  const handleDeleteBudget = () => {
    if (!selectedBudget) return;

    setBudgets((prev) => prev.filter((item) => item.id !== selectedBudget.id));
    setActiveSheet("none");

    showToast({
      type: "success",
      title: "Budget deleted",
      message: `${selectedBudget.category} budget removed.`,
    });
  };

  const summaryProgress = clampPercent(
    (totals.totalSpent / Math.max(totals.totalBudget, 1)) * 100
  );

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
      >
        <View style={styles.headerRow}>
          <AppBackButton />

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
            <Ionicons name="add" size={20} color={theme.colors.tint} />
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
              <Ionicons
                name="wallet-outline"
                size={22}
                color={theme.colors.tint}
              />
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

          <AnimatedProgress
            progress={summaryProgress}
            height={13}
            backgroundColor={theme.colors.inputBackground}
            fillColor="#F6C453"
          />

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Spent
              </AppText>
              <AppText variant="label" weight="bold">
                {currency(totals.totalSpent)}
              </AppText>
            </View>

            <View style={[styles.statItem, styles.alignRight]}>
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
              {totals.daysRemaining} day remaining
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              ~{currency(totals.daily)}/day
            </AppText>
          </View>
        </View>

        {!!alerts.length && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.row}>
                <Ionicons
                  name="trending-down-outline"
                  size={16}
                  color="#F4A340"
                />
                <AppText variant="title" weight="bold" style={styles.sectionTitle}>
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
              {alerts.map((item, index) => {
                const percent = (item.spent / item.limit) * 100;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => openDetail(item)}
                    style={[
                      styles.alertItem,
                      index !== alerts.length - 1 && [
                        styles.alertItemBorder,
                        { borderBottomColor: theme.colors.borderSoft },
                      ],
                    ]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardIdentity}>
                        <AppText style={styles.alertEmoji}>{item.icon}</AppText>
                        <AppText
                          variant="label"
                          weight="bold"
                          style={styles.cardTitle}
                          numberOfLines={1}
                        >
                          {item.category}
                        </AppText>
                      </View>

                      <AppText
                        variant="body"
                        color="#FF6B63"
                        weight="semibold"
                        style={styles.percentText}
                      >
                        {percent.toFixed(0)}%
                      </AppText>
                    </View>

                    <AnimatedProgress
                      progress={percent}
                      height={10}
                      backgroundColor="rgba(255,107,99,0.16)"
                      fillColor="#FF6B63"
                    />

                    <View style={styles.cardValueRow}>
                      <AppText
                        variant="body"
                        color={theme.colors.textSecondary}
                        numberOfLines={1}
                        style={styles.valueTextLeft}
                      >
                        Spent: {currency(item.spent)}
                      </AppText>

                      <AppText
                        variant="body"
                        color={theme.colors.textSecondary}
                        numberOfLines={1}
                        style={styles.valueTextRight}
                      >
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
          </>
        )}

        <AppText variant="title" weight="bold" style={styles.sectionTitle}>
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
                    borderColor: overBudget
                      ? "rgba(255,107,99,0.40)"
                      : theme.colors.borderSoft,
                  },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardIdentity}>
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

                    <AppText
                      variant="label"
                      weight="bold"
                      style={styles.cardTitle}
                      numberOfLines={1}
                    >
                      {item.category}
                    </AppText>
                  </View>

                  <AppText
                    variant="body"
                    color={overBudget ? "#FF6B63" : theme.colors.textSecondary}
                    weight="medium"
                    style={styles.percentText}
                  >
                    {percent.toFixed(0)}%
                  </AppText>
                </View>

                <AnimatedProgress
                  progress={percent}
                  height={10}
                  backgroundColor={
                    overBudget
                      ? "rgba(255,107,99,0.16)"
                      : "rgba(246,196,83,0.16)"
                  }
                  fillColor={overBudget ? "#FF6B63" : "#F6C453"}
                />

                <View style={styles.cardValueRow}>
                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    numberOfLines={1}
                    style={styles.valueTextLeft}
                  >
                    Spent: {currency(item.spent)}
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    numberOfLines={1}
                    style={styles.valueTextRight}
                  >
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

      <BottomSheetModal
        visible={activeSheet === "create"}
        onClose={closeSheet}
        maxHeight="88%"
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold" style={styles.sheetTitle}>
              Add Budget
            </AppText>

            <Pressable onPress={closeSheet} hitSlop={10}>
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
                  <AppText style={styles.categoryEmoji}>{item.icon}</AppText>
                  <AppText
                    variant="body"
                    weight={selected ? "semibold" : "medium"}
                    color={selected ? theme.colors.tint : theme.colors.text}
                    numberOfLines={1}
                    style={styles.categoryChipText}
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
            onChangeText={(value) => setFormLimit(formatBudgetInput(value))}
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
              <Ionicons name="remove" size={18} color={theme.colors.text} />
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
              <Ionicons name="add" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.sheetActions}>
            <Pressable
              onPress={closeSheet}
              style={[
                styles.secondaryButton,
                { borderColor: theme.colors.borderSoft },
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
                { backgroundColor: theme.colors.tint },
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
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeSheet === "detail"}
        onClose={closeSheet}
        maxHeight="86%"
      >
        {selectedBudget && (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIdentity}>
                <View
                  style={[
                    styles.roundIconLarge,
                    { backgroundColor: "rgba(87,242,200,0.10)" },
                  ]}
                >
                  <AppText style={styles.emoji}>{selectedBudget.icon}</AppText>
                </View>

                <View style={styles.sheetIdentityText}>
                  <AppText variant="title" weight="bold" numberOfLines={1}>
                    {selectedBudget.category}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    Monthly Budget
                  </AppText>
                </View>
              </View>

              <Pressable onPress={closeSheet} hitSlop={10}>
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
              <View style={styles.cardHeaderRow}>
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
                  {(
                    (selectedBudget.spent / selectedBudget.limit) *
                    100
                  ).toFixed(1)}
                  %
                </AppText>
              </View>

              <AnimatedProgress
                progress={(selectedBudget.spent / selectedBudget.limit) * 100}
                height={10}
                backgroundColor={theme.colors.inputBackground}
                fillColor={
                  selectedBudget.spent > selectedBudget.limit
                    ? "#FF6B63"
                    : "#F6C453"
                }
              />

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
                  <AppText variant="label" weight="bold" numberOfLines={1}>
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
                    {selectedBudget.spent > selectedBudget.limit
                      ? "Over by"
                      : "Remaining"}
                  </AppText>
                  <AppText
                    variant="label"
                    weight="bold"
                    color={
                      selectedBudget.spent > selectedBudget.limit
                        ? "#FF6B63"
                        : theme.colors.tint
                    }
                    numberOfLines={1}
                  >
                    {currency(
                      Math.abs(selectedBudget.limit - selectedBudget.spent)
                    )}
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
                  <AppText variant="label" weight="bold" numberOfLines={1}>
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

            <AppText variant="title" weight="bold" style={styles.sectionTitle}>
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
              {selectedBudget.transactions.map((tx, index) => (
                <View
                  key={tx.id}
                  style={[
                    styles.txRow,
                    index !== selectedBudget.transactions.length - 1 && [
                      styles.alertItemBorder,
                      { borderBottomColor: theme.colors.borderSoft },
                    ],
                  ]}
                >
                  <View style={styles.txLeft}>
                    <View
                      style={[
                        styles.txIcon,
                        { backgroundColor: theme.colors.surfaceElevated },
                      ]}
                    >
                      <Ionicons
                        name="arrow-up-outline"
                        size={15}
                        color={theme.colors.textMuted}
                      />
                    </View>

                    <View style={styles.txTextWrap}>
                      <AppText variant="label" weight="medium" numberOfLines={1}>
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
                  { borderColor: theme.colors.borderSoft },
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={17}
                  color={theme.colors.text}
                />
                <AppText variant="label" weight="semibold">
                  Edit
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleDeleteBudget}
                style={[
                  styles.secondaryButton,
                  { borderColor: "rgba(255,107,99,0.32)" },
                ]}
              >
                <Ionicons name="trash-outline" size={17} color="#FF6B63" />
                <AppText variant="label" weight="semibold" color="#FF6B63">
                  Delete
                </AppText>
              </Pressable>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeSheet === "edit"}
        onClose={closeSheet}
        maxHeight="88%"
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold" style={styles.sheetTitle}>
              Edit Budget
            </AppText>

            <Pressable onPress={closeSheet} hitSlop={10}>
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
                  <AppText style={styles.categoryEmoji}>{item.icon}</AppText>
                  <AppText
                    variant="body"
                    weight={selected ? "semibold" : "medium"}
                    color={selected ? theme.colors.tint : theme.colors.text}
                    numberOfLines={1}
                    style={styles.categoryChipText}
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
            onChangeText={(value) => setFormLimit(formatBudgetInput(value))}
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
              <Ionicons name="remove" size={18} color={theme.colors.text} />
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
              <Ionicons name="add" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.sheetActions}>
            <Pressable
              onPress={() => setActiveSheet("detail")}
              style={[
                styles.secondaryButton,
                { borderColor: theme.colors.borderSoft },
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
                { backgroundColor: theme.colors.tint },
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
        </BottomSheetScrollView>
      </BottomSheetModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  moneyLarge: {
    fontSize: 17,
    lineHeight: 22,
  },

  animatedTrack: {
    borderRadius: 999,
    overflow: "hidden",
  },
  animatedFill: {
    height: "100%",
    borderRadius: 999,
  },

  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: 0,
  },
  summaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
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
  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
  },

  alertsWrap: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  alertItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  alertItemBorder: {
    borderBottomWidth: 1,
  },

  cardList: {
    gap: 12,
  },
  budgetCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
    overflow: "hidden",
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 20,
  },
  percentText: {
    flexShrink: 0,
  },

  cardValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  valueTextLeft: {
    flex: 1,
    minWidth: 0,
  },
  valueTextRight: {
    flexShrink: 0,
    textAlign: "right",
  },

  roundIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  roundIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: {
    fontSize: 20,
    lineHeight: 22,
  },
  alertEmoji: {
    fontSize: 19,
    lineHeight: 21,
  },

  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 2,
  },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  sheetIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetIdentityText: {
    flex: 1,
    minWidth: 0,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    width: "48.3%",
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryEmoji: {
    fontSize: 19,
    lineHeight: 21,
  },
  categoryChipText: {
    flex: 1,
    minWidth: 0,
  },

  input: {
    height: 54,
    borderRadius: 16,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    flex: 1,
    height: 10,
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
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  detailCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48.3%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 13,
    gap: 4,
  },

  transactionsWrap: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  txRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  txLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  txTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});