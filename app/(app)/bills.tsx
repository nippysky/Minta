import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import {
  mockBills,
  type BillItem,
  type BillStatus,
} from "@/src/features/bills/data/mockBills";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";
import AppBackButton from "@/src/components/ui/AppBackButton";

function currency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

const CATEGORIES = [
  "Internet",
  "Electricity",
  "TV",
  "Streaming",
  "Gym",
  "Other",
] as const;

const FREQUENCIES = ["Monthly", "Weekly", "Quarterly", "Yearly"] as const;

const REMINDERS = [
  "1 day before",
  "2 days before",
  "3 days before",
  "7 days before",
] as const;

type SheetMode = "none" | "create" | "detail" | "edit";

type FadeInProps = {
  delay?: number;
  children: React.ReactNode;
  style?: object;
};

function FadeInUp({ delay = 0, children, style }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
export default function BillsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [bills, setBills] = useState<BillItem[]>(mockBills);
  const [selectedBill, setSelectedBill] = useState<BillItem | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetMode>("none");

  const [formName, setFormName] = useState("");
  const [formProvider, setFormProvider] = useState("");
  const [formCategory, setFormCategory] =
    useState<(typeof CATEGORIES)[number]>("Internet");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formFrequency, setFormFrequency] =
    useState<(typeof FREQUENCIES)[number]>("Monthly");
  const [formReminder, setFormReminder] =
    useState<(typeof REMINDERS)[number]>("3 days before");
  const [formAccount, setFormAccount] = useState("");
  const [formAutoPay, setFormAutoPay] = useState(false);

  const stats = useMemo(() => {
    const dueThisMonth = bills.reduce((sum, item) => sum + item.amount, 0);
    const next7Days = bills
      .filter((item) => item.status !== "upcoming" || item.name === "DStv Premium")
      .reduce((sum, item) => sum + item.amount, 0);
    const overdueCount = bills.filter((item) => item.status === "overdue").length;

    return { dueThisMonth, next7Days, overdueCount };
  }, [bills]);

  const grouped = useMemo(
    () => ({
      overdue: bills.filter((item) => item.status === "overdue"),
      dueSoon: bills.filter((item) => item.status === "due-soon"),
      upcoming: bills.filter((item) => item.status === "upcoming"),
    }),
    [bills]
  );

  const resetForm = () => {
    setFormName("");
    setFormProvider("");
    setFormCategory("Internet");
    setFormAmount("");
    setFormDueDate("");
    setFormFrequency("Monthly");
    setFormReminder("3 days before");
    setFormAccount("");
    setFormAutoPay(false);
  };

  const closeSheet = () => {
    setActiveSheet("none");
  };

  const openCreate = () => {
    resetForm();
    setSelectedBill(null);
    setActiveSheet("create");
  };

  const openDetail = (item: BillItem) => {
    setSelectedBill(item);
    setActiveSheet("detail");
  };

  const openEdit = (item: BillItem) => {
    setSelectedBill(item);
    setFormName(item.name);
    setFormProvider(item.provider);
    setFormCategory(
      (CATEGORIES.find((category) =>
        item.provider.toLowerCase().includes(category.toLowerCase())
      ) as (typeof CATEGORIES)[number] | undefined) ?? "Other"
    );
    setFormAmount(item.amount.toLocaleString("en-NG"));
    setFormDueDate(item.dueDate);
    setFormFrequency(
      (FREQUENCIES.find((freq) => freq === item.frequency) as
        | (typeof FREQUENCIES)[number]
        | undefined) ?? "Monthly"
    );
    setFormReminder(
      (REMINDERS.find((reminder) => reminder === item.reminder) as
        | (typeof REMINDERS)[number]
        | undefined) ?? "3 days before"
    );
    setFormAccount(item.accountNumber ?? "");
    setFormAutoPay(item.autoPay);
    setActiveSheet("edit");
  };

  const createBill = () => {
    if (!formName.trim() || !formAmount.trim() || !formDueDate.trim()) {
      showToast({
        type: "error",
        title: "Missing bill details",
        message: "Bill name, amount and due date are required.",
      });
      return;
    }

    const amount = Number(formAmount.replace(/,/g, ""));
    if (!amount || amount <= 0) {
      showToast({
        type: "error",
        title: "Invalid amount",
        message: "Enter a valid bill amount.",
      });
      return;
    }

    const newBill: BillItem = {
      id: `${formName}-${Date.now()}`,
      icon: "🧾",
      name: formName.trim(),
      provider: formProvider.trim() || formCategory,
      amount,
      dueLabel: formDueDate,
      dueDate: formDueDate,
      frequency: formFrequency,
      reminder: formReminder,
      autoPay: formAutoPay,
      accountNumber: formAccount.trim() || undefined,
      status: "upcoming",
    };

    setBills((prev) => [newBill, ...prev]);
    setActiveSheet("none");

    showToast({
      type: "success",
      title: "Bill added",
      message: `${newBill.name} reminder created.`,
    });
  };

  const updateBill = () => {
    if (!selectedBill) return;

    const amount = Number(formAmount.replace(/,/g, ""));
    if (!formName.trim() || !amount || !formDueDate.trim()) {
      showToast({
        type: "error",
        title: "Missing bill details",
        message: "Fill the required fields before saving.",
      });
      return;
    }

    const updatedBill: BillItem = {
      ...selectedBill,
      name: formName.trim(),
      provider: formProvider.trim() || formCategory,
      amount,
      dueLabel: formDueDate,
      dueDate: formDueDate,
      frequency: formFrequency,
      reminder: formReminder,
      autoPay: formAutoPay,
      accountNumber: formAccount.trim() || undefined,
    };

    setBills((prev) =>
      prev.map((item) => (item.id === selectedBill.id ? updatedBill : item))
    );
    setSelectedBill(updatedBill);
    setActiveSheet("detail");

    showToast({
      type: "success",
      title: "Bill updated",
      message: `${updatedBill.name} updated successfully.`,
    });
  };

  const deleteBill = () => {
    if (!selectedBill) return;

    setBills((prev) => prev.filter((item) => item.id !== selectedBill.id));
    setActiveSheet("none");

    showToast({
      type: "success",
      title: "Bill deleted",
      message: `${selectedBill.name} removed.`,
    });
  };

  const payBill = (item: BillItem) => {
    showToast({
      type: "success",
      title: "Payment flow started",
      message: `Opening payment for ${item.name}.`,
    });
  };

  const renderBadge = (status: BillStatus) => {
    if (status === "overdue") {
      return {
        text: "Overdue",
        color: "#FF6B63",
        bg: "rgba(255,107,99,0.14)",
        border: "rgba(255,107,99,0.24)",
      };
    }

    if (status === "due-soon") {
      return {
        text: "Due Soon",
        color: "#F4A340",
        bg: "rgba(244,163,64,0.14)",
        border: "rgba(244,163,64,0.22)",
      };
    }

    return {
      text: "Upcoming",
      color: theme.colors.textSecondary,
      bg: theme.colors.surfaceElevated,
      border: theme.colors.borderSoft,
    };
  };

  const renderFormOptions = <T extends readonly string[]>(
    items: T,
    selectedValue: string,
    onSelect: (value: T[number]) => void
  ) => (
    <View style={styles.optionGrid}>
      {items.map((item) => {
        const selected = selectedValue === item;

        return (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            style={[
              styles.optionChip,
              {
                borderColor: selected
                  ? theme.colors.borderFocus
                  : theme.colors.borderSoft,
                backgroundColor: theme.colors.surfaceElevated,
              },
            ]}
          >
            <AppText
              variant="body"
              weight={selected ? "semibold" : "medium"}
              color={selected ? theme.colors.tint : theme.colors.text}
              numberOfLines={1}
            >
              {item}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  const renderSection = (
    title: string,
    color: string,
    items: BillItem[],
    startDelay: number
  ) => {
    if (!items.length) return null;

    return (
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold" color={color} style={styles.sectionTitle}>
            {title}
          </AppText>
        </View>

        <View style={styles.billList}>
          {items.map((item, index) => {
            const badge = renderBadge(item.status);

            return (
              <FadeInUp key={item.id} delay={startDelay + index * 60}>
                <Pressable
                  onPress={() => openDetail(item)}
                  style={[
                    styles.billCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor:
                        item.status === "overdue"
                          ? "rgba(255,107,99,0.28)"
                          : theme.colors.borderSoft,
                    },
                  ]}
                >
                  <View style={styles.billTop}>
                    <View style={styles.billIdentity}>
                      <View
                        style={[
                          styles.iconCircle,
                          { backgroundColor: theme.colors.surfaceElevated },
                        ]}
                      >
                        <AppText style={styles.emoji}>{item.icon}</AppText>
                      </View>

                      <View style={styles.billIdentityText}>
                        <AppText
                          variant="label"
                          weight="bold"
                          numberOfLines={1}
                          style={styles.billTitle}
                        >
                          {item.name}
                        </AppText>
                        <AppText
                          variant="body"
                          color={theme.colors.textSecondary}
                          numberOfLines={1}
                        >
                          {item.provider}
                        </AppText>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: badge.bg,
                          borderColor: badge.border,
                        },
                      ]}
                    >
                      <AppText variant="caption" weight="medium" color={badge.color}>
                        {badge.text}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.billMetaRow}>
                    <View style={styles.metaLeft}>
                      <Ionicons
                        name="calendar-outline"
                        size={17}
                        color={theme.colors.textMuted}
                      />
                      <AppText
                        variant="body"
                        color={theme.colors.textSecondary}
                        numberOfLines={1}
                        style={styles.metaLeftText}
                      >
                        {item.dueLabel}
                      </AppText>
                    </View>

                    <AppText variant="title" weight="bold" style={styles.amountText}>
                      {currency(item.amount)}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: theme.colors.borderSoft },
                    ]}
                  />

                  <View style={styles.billBottomRow}>
                    <View style={styles.metaLeft}>
                      <Ionicons
                        name={item.autoPay ? "toggle" : "toggle-outline"}
                        size={21}
                        color={item.autoPay ? theme.colors.tint : theme.colors.textMuted}
                      />
                      <AppText
                        variant="body"
                        color={
                          item.autoPay ? theme.colors.tint : theme.colors.textSecondary
                        }
                      >
                        Auto-pay {item.autoPay ? "on" : "off"}
                      </AppText>
                    </View>

                    <Pressable
                      onPress={() => payBill(item)}
                      style={[
                        styles.payButton,
                        { backgroundColor: theme.colors.tint },
                      ]}
                    >
                      <AppText
                        variant="label"
                        weight="bold"
                        color={theme.colors.primaryText}
                      >
                        Pay Now
                      </AppText>
                    </Pressable>
                  </View>
                </Pressable>
              </FadeInUp>
            );
          })}
        </View>
      </View>
    );
  };

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
              Bills & Reminders
            </AppText>
          </View>

          <Pressable
            onPress={openCreate}
            style={[
              styles.addButton,
              {
                borderColor: theme.colors.borderFocus,
                backgroundColor: theme.colors.tint,
              },
            ]}
          >
            <Ionicons name="add" size={20} color={theme.colors.primaryText} />
          </Pressable>
        </View>

        <View style={styles.topStats}>
          <FadeInUp delay={40} style={styles.topStatCol}>
            <View
              style={[
                styles.topStatCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconWrap,
                  { backgroundColor: theme.colors.surfaceElevated },
                ]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </View>

              <AppText variant="body" color={theme.colors.textSecondary}>
                Due This Month
              </AppText>

              <AppText variant="title" weight="bold" style={styles.statAmount}>
                {currency(stats.dueThisMonth)}
              </AppText>
            </View>
          </FadeInUp>

          <FadeInUp delay={110} style={styles.topStatCol}>
            <View
              style={[
                styles.topStatCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: "rgba(255,107,99,0.28)",
                },
              ]}
            >
              <View
                style={[
                  styles.statIconWrap,
                  { backgroundColor: theme.colors.surfaceElevated },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </View>

              <AppText variant="body" color={theme.colors.textSecondary}>
                Next 7 Days
              </AppText>

              <AppText variant="title" weight="bold" style={styles.statAmount}>
                {currency(stats.next7Days)}
              </AppText>

              <AppText variant="body" color="#FF6B63">
                {stats.overdueCount} overdue
              </AppText>
            </View>
          </FadeInUp>
        </View>

        {renderSection("Overdue", "#FF6B63", grouped.overdue, 160)}
        {renderSection("Due Soon", "#F4A340", grouped.dueSoon, 240)}
        {renderSection("Upcoming", theme.colors.textSecondary, grouped.upcoming, 320)}
      </ScrollView>

      <BottomSheetModal
        visible={activeSheet === "detail"}
        onClose={closeSheet}
        maxHeight="88%"
      >
        {selectedBill && (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIdentity}>
                <View
                  style={[
                    styles.iconCircleSmall,
                    { backgroundColor: theme.colors.surfaceElevated },
                  ]}
                >
                  <AppText style={styles.emoji}>{selectedBill.icon}</AppText>
                </View>

                <View style={styles.sheetIdentityText}>
                  <AppText variant="title" weight="bold" numberOfLines={1}>
                    {selectedBill.name}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {selectedBill.provider}
                  </AppText>
                </View>
              </View>

              <Pressable onPress={closeSheet} hitSlop={10}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View
              style={[
                styles.amountWrap,
                {
                  borderTopColor: theme.colors.borderSoft,
                  borderBottomColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText variant="body" color={theme.colors.textSecondary}>
                Amount Due
              </AppText>
              <AppText variant="title" weight="bold" style={styles.amountLarge}>
                {currency(selectedBill.amount)}
              </AppText>
              <AppText
                variant="body"
                color={
                  selectedBill.status === "overdue"
                    ? "#FF6B63"
                    : selectedBill.status === "due-soon"
                    ? "#F4A340"
                    : theme.colors.textSecondary
                }
              >
                {selectedBill.status === "overdue"
                  ? "Overdue"
                  : selectedBill.status === "due-soon"
                  ? "Due Soon"
                  : "Upcoming"}
              </AppText>
            </View>

            {[
              {
                label: "Due Date",
                value: selectedBill.dueDate,
                icon: "calendar-outline",
              },
              {
                label: "Frequency",
                value: selectedBill.frequency,
                icon: "refresh-outline",
              },
              {
                label: "Reminder",
                value: selectedBill.reminder,
                icon: "notifications-outline",
              },
              {
                label: "Auto-pay",
                value: selectedBill.autoPay ? "Enabled" : "Disabled",
                icon: "card-outline",
              },
              {
                label: "Account Number",
                value: selectedBill.accountNumber ?? "—",
                icon: "apps-outline",
              },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.detailRowCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={theme.colors.textMuted}
                />
                <View style={styles.detailTextWrap}>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {item.label}
                  </AppText>
                  <AppText variant="label" weight="medium" numberOfLines={1}>
                    {item.value}
                  </AppText>
                </View>
              </View>
            ))}

            <View style={styles.bottomActionRow}>
              <Pressable
                onPress={() => openEdit(selectedBill)}
                style={[
                  styles.secondaryAction,
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
                onPress={deleteBill}
                style={[
                  styles.iconDeleteButton,
                  { borderColor: "rgba(255,107,99,0.28)" },
                ]}
              >
                <Ionicons name="trash-outline" size={17} color="#FF6B63" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => payBill(selectedBill)}
              style={[
                styles.fullPrimaryButton,
                { backgroundColor: theme.colors.tint },
              ]}
            >
              <AppText
                variant="label"
                weight="bold"
                color={theme.colors.primaryText}
              >
                Pay Now
              </AppText>
            </Pressable>
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeSheet === "create"}
        onClose={closeSheet}
        maxHeight="90%"
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold" style={styles.sheetTitle}>
              Add New Bill
            </AppText>
            <Pressable onPress={closeSheet} hitSlop={10}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Bill Name *
            </AppText>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g., Netflix, Electricity"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Category *
            </AppText>
            {renderFormOptions(CATEGORIES, formCategory, setFormCategory)}
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Amount (₦) *
            </AppText>
            <TextInput
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="number-pad"
              placeholder="0"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Due Date *
            </AppText>
            <TextInput
              value={formDueDate}
              onChangeText={setFormDueDate}
              placeholder="e.g., 8 Apr 2026"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Frequency
            </AppText>
            {renderFormOptions(FREQUENCIES, formFrequency, setFormFrequency)}
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Provider (optional)
            </AppText>
            <TextInput
              value={formProvider}
              onChangeText={setFormProvider}
              placeholder="e.g., DSTV, IKEDC"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Account/Meter Number (optional)
            </AppText>
            <TextInput
              value={formAccount}
              onChangeText={setFormAccount}
              placeholder="Your account number"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Remind me
            </AppText>
            {renderFormOptions(REMINDERS, formReminder, setFormReminder)}
          </View>

          <View
            style={[
              styles.autoPayRow,
              { borderTopColor: theme.colors.borderSoft },
            ]}
          >
            <View style={styles.autoPayTextWrap}>
              <AppText variant="label" weight="semibold">
                Auto-pay
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Automatically pay when due
              </AppText>
            </View>

            <Switch
              value={formAutoPay}
              onValueChange={setFormAutoPay}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.tint,
              }}
              thumbColor={theme.colors.background}
            />
          </View>

          <Pressable
            onPress={createBill}
            style={[
              styles.fullPrimaryButton,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <AppText
              variant="label"
              weight="bold"
              color={theme.colors.primaryText}
            >
              Add Bill
            </AppText>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeSheet === "edit"}
        onClose={closeSheet}
        maxHeight="90%"
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold" style={styles.sheetTitle}>
              Edit Bill
            </AppText>
            <Pressable onPress={closeSheet} hitSlop={10}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Bill Name *
            </AppText>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="Bill name"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Category *
            </AppText>
            {renderFormOptions(CATEGORIES, formCategory, setFormCategory)}
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Amount (₦) *
            </AppText>
            <TextInput
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="number-pad"
              placeholder="0"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Due Date *
            </AppText>
            <TextInput
              value={formDueDate}
              onChangeText={setFormDueDate}
              placeholder="Due date"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Frequency
            </AppText>
            {renderFormOptions(FREQUENCIES, formFrequency, setFormFrequency)}
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Provider
            </AppText>
            <TextInput
              value={formProvider}
              onChangeText={setFormProvider}
              placeholder="Provider"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Account Number
            </AppText>
            <TextInput
              value={formAccount}
              onChangeText={setFormAccount}
              placeholder="Account number"
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
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="body" weight="medium">
              Reminder
            </AppText>
            {renderFormOptions(REMINDERS, formReminder, setFormReminder)}
          </View>

          <View
            style={[
              styles.autoPayRow,
              { borderTopColor: theme.colors.borderSoft },
            ]}
          >
            <View style={styles.autoPayTextWrap}>
              <AppText variant="label" weight="semibold">
                Auto-pay
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Automatically pay this bill when due
              </AppText>
            </View>

            <Switch
              value={formAutoPay}
              onValueChange={setFormAutoPay}
              trackColor={{
                false: theme.colors.surfaceElevated,
                true: theme.colors.tint,
              }}
              thumbColor={theme.colors.background}
            />
          </View>

          <Pressable
            onPress={updateBill}
            style={[
              styles.fullPrimaryButton,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <AppText
              variant="label"
              weight="bold"
              color={theme.colors.primaryText}
            >
              Save Changes
            </AppText>
          </Pressable>
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
    fontSize: 18,
    lineHeight: 24,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
topStats: {
  flexDirection: "row",
  gap: 12,
  width: "100%",
},
topStatCol: {
  flex: 1,
  minWidth: 0,
},
topStatCard: {
  minHeight: 112,
  borderRadius: 22,
  borderWidth: 1,
  paddingHorizontal: 14,
  paddingVertical: 14,
  gap: 8,
},
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  statAmount: {
    fontSize: 17,
    lineHeight: 22,
  },

  sectionWrap: {
    gap: 10,
  },
  sectionHeader: {
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
  },

  billList: {
    gap: 12,
  },
  billCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  billTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  billIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  billIdentityText: {
    flex: 1,
    minWidth: 0,
  },
  billTitle: {
    fontSize: 15,
    lineHeight: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaLeftText: {
    flex: 1,
    minWidth: 0,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconCircleSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: {
    fontSize: 19,
    lineHeight: 21,
  },

  badge: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  billMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  amountText: {
    fontSize: 18,
    lineHeight: 24,
  },

  divider: {
    height: 1,
    width: "100%",
  },

  billBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  payButton: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
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

  amountWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  amountLarge: {
    fontSize: 25,
    lineHeight: 31,
  },

  detailRowCard: {
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  bottomActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconDeleteButton: {
    width: 50,
    height: 50,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullPrimaryButton: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 2,
  },

  fieldBlock: {
    gap: 8,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  autoPayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  autoPayTextWrap: {
    flex: 1,
    minWidth: 0,
  },
});