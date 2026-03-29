import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
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

export default function BillsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [bills, setBills] = useState<BillItem[]>(mockBills);
  const [selectedBill, setSelectedBill] = useState<BillItem | null>(null);

  const [createVisible, setCreateVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

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

  const openCreate = () => {
    resetForm();
    setCreateVisible(true);
  };

  const openDetail = (item: BillItem) => {
    setSelectedBill(item);
    setDetailVisible(true);
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
    setFormAmount(String(item.amount));
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
    setEditVisible(true);
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
    setCreateVisible(false);

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

    setBills((prev) =>
      prev.map((item) =>
        item.id === selectedBill.id
          ? {
              ...item,
              name: formName.trim(),
              provider: formProvider.trim() || formCategory,
              amount,
              dueLabel: formDueDate,
              dueDate: formDueDate,
              frequency: formFrequency,
              reminder: formReminder,
              autoPay: formAutoPay,
              accountNumber: formAccount.trim() || undefined,
            }
          : item
      )
    );

    setEditVisible(false);
    setDetailVisible(false);

    showToast({
      type: "success",
      title: "Bill updated",
      message: `${formName.trim()} updated successfully.`,
    });
  };

  const deleteBill = () => {
    if (!selectedBill) return;

    setBills((prev) => prev.filter((item) => item.id !== selectedBill.id));
    setDetailVisible(false);

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
      };
    }

    if (status === "due-soon") {
      return {
        text: "Due Soon",
        color: "#F4A340",
        bg: "rgba(244,163,64,0.14)",
      };
    }

    return {
      text: "Upcoming",
      color: theme.colors.textSecondary,
      bg: theme.colors.surfaceElevated,
    };
  };

  const renderSection = (title: string, color: string, items: BillItem[]) => (
    <View style={styles.sectionWrap}>
      <AppText variant="title" weight="bold" color={color}>
        {title}
      </AppText>

      <View style={styles.billList}>
        {items.map((item) => {
          const badge = renderBadge(item.status);

          return (
            <Pressable
              key={item.id}
              onPress={() => openDetail(item)}
              style={[
                styles.billCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <View style={styles.billTop}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: theme.colors.surfaceElevated },
                    ]}
                  >
                    <AppText style={styles.emoji}>{item.icon}</AppText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <AppText variant="label" weight="bold" numberOfLines={1}>
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

                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <AppText variant="caption" weight="medium" color={badge.color}>
                    {badge.text}
                  </AppText>
                </View>
              </View>

              <View style={styles.billMetaRow}>
                <View style={styles.row}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={theme.colors.textMuted}
                  />
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {item.dueLabel}
                  </AppText>
                </View>

                <AppText variant="title" weight="bold">
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
                <View style={styles.row}>
                  <Ionicons
                    name={item.autoPay ? "toggle" : "toggle-outline"}
                    size={22}
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
          );
        })}
      </View>
    </View>
  );

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
            >
              {item}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

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
            <Ionicons name="add" size={22} color={theme.colors.primaryText} />
          </Pressable>
        </View>

        <View style={styles.topStats}>
          <View
            style={[
              styles.topStatCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={24}
              color={theme.colors.textMuted}
            />
            <AppText variant="body" color={theme.colors.textSecondary}>
              Due This Month
            </AppText>
            <AppText variant="title" weight="bold">
              {currency(stats.dueThisMonth)}
            </AppText>
          </View>

          <View
            style={[
              styles.topStatCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: "rgba(255,107,99,0.40)",
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={theme.colors.textMuted}
            />
            <AppText variant="body" color={theme.colors.textSecondary}>
              Next 7 Days
            </AppText>
            <AppText variant="title" weight="bold">
              {currency(stats.next7Days)}
            </AppText>
            <AppText variant="body" color="#FF6B63">
              {stats.overdueCount} overdue
            </AppText>
          </View>
        </View>

        {renderSection("Overdue", "#FF6B63", grouped.overdue)}
        {renderSection("Due Soon", "#F4A340", grouped.dueSoon)}
        {renderSection("Upcoming", theme.colors.textSecondary, grouped.upcoming)}
      </ScrollView>

      <BottomSheetModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {selectedBill ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.row}>
                <View
                  style={[
                    styles.iconCircleSmall,
                    { backgroundColor: theme.colors.surfaceElevated },
                  ]}
                >
                  <AppText style={styles.emoji}>{selectedBill.icon}</AppText>
                </View>
                <View>
                  <AppText variant="title" weight="bold">
                    {selectedBill.name}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {selectedBill.provider}
                  </AppText>
                </View>
              </View>

              <Pressable onPress={() => setDetailVisible(false)}>
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
                  size={20}
                  color={theme.colors.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {item.label}
                  </AppText>
                  <AppText variant="label" weight="medium">
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
                  size={18}
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
                <Ionicons name="trash-outline" size={18} color="#FF6B63" />
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
          </ScrollView>
        ) : null}
      </BottomSheetModal>

      <BottomSheetModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold">
              Add New Bill
            </AppText>
            <Pressable onPress={() => setCreateVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

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

          <AppText variant="body" color={theme.colors.textSecondary}>
            Category
          </AppText>
          {renderFormOptions(CATEGORIES, formCategory, setFormCategory)}

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

          <AppText variant="body" color={theme.colors.textSecondary}>
            Frequency
          </AppText>
          {renderFormOptions(FREQUENCIES, formFrequency, setFormFrequency)}

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

          <AppText variant="body" color={theme.colors.textSecondary}>
            Remind me
          </AppText>
          {renderFormOptions(REMINDERS, formReminder, setFormReminder)}

          <View
            style={[
              styles.autoPayRow,
              { borderTopColor: theme.colors.borderSoft },
            ]}
          >
            <View style={{ flex: 1 }}>
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
        </ScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="bold">
              Edit Bill
            </AppText>
            <Pressable onPress={() => setEditVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

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

          <AppText variant="body" color={theme.colors.textSecondary}>
            Category
          </AppText>
          {renderFormOptions(CATEGORIES, formCategory, setFormCategory)}

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

          <AppText variant="body" color={theme.colors.textSecondary}>
            Frequency
          </AppText>
          {renderFormOptions(FREQUENCIES, formFrequency, setFormFrequency)}

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

          <AppText variant="body" color={theme.colors.textSecondary}>
            Reminder
          </AppText>
          {renderFormOptions(REMINDERS, formReminder, setFormReminder)}

          <View
            style={[
              styles.autoPayRow,
              { borderTopColor: theme.colors.borderSoft },
            ]}
          >
            <View style={{ flex: 1 }}>
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
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  topStats: {
    flexDirection: "row",
    gap: 12,
  },
  topStatCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  sectionWrap: {
    gap: 12,
  },
  billList: {
    gap: 14,
  },
  billCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  billTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSmall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 22,
    lineHeight: 24,
  },
  badge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  billMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
    minHeight: 46,
    borderRadius: 999,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContent: {
    gap: 14,
    paddingBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  amountWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  amountLarge: {
    fontSize: 28,
    lineHeight: 34,
  },
  detailRowCard: {
    minHeight: 70,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bottomActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconDeleteButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullPrimaryButton: {
    minHeight: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 4,
  },
  input: {
    minHeight: 56,
    borderRadius: 18,
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
    minHeight: 42,
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
});