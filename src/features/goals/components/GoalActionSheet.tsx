import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppText from "@/src/components/ui/AppText";
import { GOAL_ICON_OPTIONS } from "@/src/features/goals/mock";
import type {
  GoalAccountOption,
  GoalDraft,
  GoalItem,
} from "@/src/features/goals/types";
import {
  amountInputToNumber,
  formatAmountInput,
  formatCurrency,
  formatCurrencyHidden,
  isValidDateInput,
  maskAmount,
  normalizeDateInput,
  remainingAmount,
} from "@/src/features/goals/utils";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type GoalActionTab = "add" | "withdraw" | "details";
type GoalActionStep = "form" | "success";
type GoalDetailsMode = "view" | "edit";

type Props = {
  visible: boolean;
  goal: GoalItem | null;
  balancesVisible: boolean;
  accounts: GoalAccountOption[];
  onClose: () => void;
  onAddFunds: (payload: {
    goalId: string;
    amount: number;
    accountId?: string | null;
  }) => void;
  onWithdrawFunds: (payload: {
    goalId: string;
    amount: number;
    accountId?: string | null;
  }) => void;
  onUpdateGoal: (goalId: string, draft: GoalDraft) => void;
  onDeleteGoal: (goalId: string) => void;
};

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000] as const;

export default function GoalActionSheet({
  visible,
  goal,
  balancesVisible,
  accounts,
  onClose,
  onAddFunds,
  onWithdrawFunds,
  onUpdateGoal,
  onDeleteGoal,
}: Props) {
  const theme = useAppTheme();
  const initializedGoalIdRef = useRef<string | null>(null);

  const [tab, setTab] = useState<GoalActionTab>("add");
  const [step, setStep] = useState<GoalActionStep>("form");
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [detailsMode, setDetailsMode] = useState<GoalDetailsMode>("view");

  const [editIcon, setEditIcon] = useState(GOAL_ICON_OPTIONS[0].key);
  const [editEmoji, setEditEmoji] = useState(GOAL_ICON_OPTIONS[0].emoji);
  const [editName, setEditName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");

  useEffect(() => {
    if (!visible) {
      initializedGoalIdRef.current = null;
      return;
    }

    if (!goal) return;

    const isFreshOpenForGoal = initializedGoalIdRef.current !== goal.id;

    if (!isFreshOpenForGoal) return;

    initializedGoalIdRef.current = goal.id;

    setTab("add");
    setStep("form");
    setAmount("");
    setSelectedAccountId(accounts[0]?.id ?? null);
    setDetailsMode("view");

    setEditIcon(goal.icon);
    setEditEmoji(goal.iconEmoji);
    setEditName(goal.name);
    setEditTargetAmount(goal.targetAmount.toLocaleString("en-NG"));
    setEditTargetDate(goal.targetDate);
  }, [visible, accounts, goal]);

  const numericAmount = amountInputToNumber(amount);
  const remaining = goal ? remainingAmount(goal) : 0;

  const currentBalanceText = useMemo(() => {
    if (!goal) return "";
    return maskAmount(balancesVisible, goal.savedAmount);
  }, [balancesVisible, goal]);

  const remainingText = useMemo(() => {
    if (!goal) return "";
    return balancesVisible
      ? `${formatCurrency(remaining)} remaining`
      : `${formatCurrencyHidden()} remaining`;
  }, [balancesVisible, remaining, goal]);

  const canSubmitAdd = !!goal && numericAmount > 0;
  const canSubmitWithdraw =
    !!goal && numericAmount > 0 && numericAmount <= (goal?.savedAmount ?? 0);

  const canSaveEdit =
    !!goal &&
    editName.trim().length > 1 &&
    amountInputToNumber(editTargetAmount) > 0 &&
    isValidDateInput(editTargetDate);

  const title = goal?.name ?? "Goal";

  const handleClose = () => {
    onClose();
  };

  const handleSubmitAdd = () => {
    if (!goal || !canSubmitAdd) return;

    onAddFunds({
      goalId: goal.id,
      amount: numericAmount,
      accountId: selectedAccountId,
    });

    setStep("success");
  };

  const handleSubmitWithdraw = () => {
    if (!goal || !canSubmitWithdraw) return;

    onWithdrawFunds({
      goalId: goal.id,
      amount: numericAmount,
      accountId: selectedAccountId,
    });

    setStep("success");
  };

  const handleSaveEdit = () => {
    if (!goal || !canSaveEdit) return;

    onUpdateGoal(goal.id, {
      icon: editIcon,
      iconEmoji: editEmoji,
      name: editName.trim(),
      targetAmount: amountInputToNumber(editTargetAmount),
      targetDate: editTargetDate,
    });

    setDetailsMode("view");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.goalEmojiWrap}>
          <AppText style={styles.goalEmoji}>{goal?.iconEmoji ?? "🎯"}</AppText>
        </View>

        <AppText variant="title" weight="bold" style={styles.headerTitle}>
          {title}
        </AppText>
      </View>

      <Pressable onPress={handleClose} hitSlop={10}>
        <Ionicons name="close" size={24} color={theme.colors.text} />
      </Pressable>
    </View>
  );

  const renderTabSwitch = () => {
    const items: {
      key: GoalActionTab;
      label: string;
      icon: keyof typeof Ionicons.glyphMap;
    }[] = [
      { key: "add", label: "Add", icon: "arrow-down-outline" },
      { key: "withdraw", label: "Withdraw", icon: "arrow-up-outline" },
      { key: "details", label: "Details", icon: "calendar-outline" },
    ];

    return (
      <View style={styles.tabRow}>
        {items.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                setTab(item.key);
                setStep("form");
              }}
              style={[
                styles.tabButton,
                {
                  backgroundColor: active
                    ? theme.colors.tint
                    : theme.colors.background,
                  borderColor: active
                    ? theme.colors.tint
                    : theme.colors.borderSoft,
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? theme.colors.primaryText : theme.colors.text}
              />
              <AppText
                variant="label"
                weight="bold"
                color={active ? theme.colors.primaryText : theme.colors.text}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderBalanceBlock = () => (
    <View style={styles.balanceBlock}>
      <AppText
        variant="title"
        color={theme.colors.textSecondary}
        style={styles.balanceLabel}
      >
        Current Balance
      </AppText>

      <AppText
        variant="hero"
        weight="bold"
        color={theme.colors.tint}
        style={styles.balanceAmount}
      >
        {currentBalanceText}
      </AppText>

      <AppText variant="body" color={theme.colors.textSecondary}>
        {remainingText}
      </AppText>
    </View>
  );

  const renderQuickAmountChips = () => (
    <View style={styles.quickRow}>
      {QUICK_AMOUNTS.map((value) => (
        <Pressable
          key={value}
          onPress={() => setAmount(value.toLocaleString("en-NG"))}
          style={[
            styles.quickChip,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <AppText variant="label" weight="bold">
            ₦{value >= 1000 ? `${value / 1000}k` : value}
          </AppText>
        </Pressable>
      ))}
    </View>
  );

  const renderAccountGrid = (label: string) => (
    <View style={styles.section}>
      <AppText
        variant="title"
        color={theme.colors.textSecondary}
        style={styles.fieldLabel}
      >
        {label}
      </AppText>

      <View style={styles.accountGrid}>
        {accounts.map((account) => {
          const active = selectedAccountId === account.id;

          return (
            <Pressable
              key={account.id}
              onPress={() => setSelectedAccountId(account.id)}
              style={[
                styles.accountCard,
                {
                  backgroundColor: active
                    ? "rgba(87,242,200,0.14)"
                    : theme.colors.inputBackground,
                  borderColor: active
                    ? theme.colors.tint
                    : theme.colors.borderSoft,
                },
              ]}
            >
              <AppText variant="body" weight="bold" style={styles.accountBank}>
                {account.bankName}
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {balancesVisible
                  ? formatCurrency(account.balance)
                  : formatCurrencyHidden()}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderAmountField = (label: string) => (
    <View style={styles.section}>
      <AppText
        variant="title"
        color={theme.colors.textSecondary}
        style={styles.fieldLabel}
      >
        {label}
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
        <AppText variant="hero" weight="bold" style={styles.amountCurrency}>
          ₦
        </AppText>

        <BottomSheetTextInput
          value={amount}
          onChangeText={(text) => setAmount(formatAmountInput(text))}
          keyboardType="number-pad"
          style={[
            styles.amountInput,
            {
              color: theme.colors.text,
              fontFamily: theme.fonts.headingBold,
            },
          ]}
          selectionColor={theme.colors.tint}
          placeholder="0"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>
    </View>
  );

  const renderAddOrWithdrawForm = () => {
    const isAdd = tab === "add";
    const buttonTitle = isAdd
      ? `Add ${formatCurrency(numericAmount)}`
      : `Withdraw ${formatCurrency(numericAmount)}`;
    const disabled = isAdd ? !canSubmitAdd : !canSubmitWithdraw;

    return (
      <>
        {renderTabSwitch()}
        {renderBalanceBlock()}
        {renderAmountField(isAdd ? "Amount to Add" : "Amount to Withdraw")}
        {renderQuickAmountChips()}
        {renderAccountGrid(
          isAdd
            ? "Source Account (Optional)"
            : "Destination Account (Optional)"
        )}

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <Pressable
          onPress={isAdd ? handleSubmitAdd : handleSubmitWithdraw}
          disabled={disabled}
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.colors.tint,
              borderColor: theme.colors.tint,
              opacity: disabled ? 0.45 : 1,
            },
          ]}
        >
          <AppText
            variant="title"
            weight="bold"
            color={theme.colors.primaryText}
            style={styles.primaryButtonText}
          >
            {buttonTitle}
          </AppText>
        </Pressable>
      </>
    );
  };

  const renderSuccessState = () => {
    const isAdd = tab === "add";

    return (
      <>
        <View style={styles.successWrap}>
          <View style={styles.successOrbWrap}>
            <View style={styles.successGlow} />
            <View style={styles.successOrb}>
              <Ionicons name="checkmark" size={36} color="#07110E" />
            </View>
          </View>

          <AppText variant="hero" weight="bold" style={styles.successTitle}>
            {isAdd ? "Funds Added!" : "Withdrawal Complete!"}
          </AppText>

          <AppText
            variant="title"
            color={theme.colors.textSecondary}
            style={styles.successCopy}
          >
            {formatCurrency(numericAmount)} has been{" "}
            {isAdd ? "added to" : "withdrawn from"} {goal?.name}
          </AppText>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <Pressable
          onPress={onClose}
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.colors.tint,
              borderColor: theme.colors.tint,
            },
          ]}
        >
          <AppText
            variant="title"
            weight="bold"
            color={theme.colors.primaryText}
            style={styles.primaryButtonText}
          >
            Done
          </AppText>
        </Pressable>
      </>
    );
  };

  const renderDetailsView = () => {
    if (!goal) return null;

    return (
      <>
        {renderTabSwitch()}

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.detailsRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Target Amount
            </AppText>
            <AppText variant="body" weight="bold">
              {maskAmount(balancesVisible, goal.targetAmount)}
            </AppText>
          </View>

          <View style={styles.detailsRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Amount Saved
            </AppText>
            <AppText variant="body" weight="bold" color={theme.colors.tint}>
              {maskAmount(balancesVisible, goal.savedAmount)}
            </AppText>
          </View>

          <View style={styles.detailsRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Remaining
            </AppText>
            <AppText variant="body" weight="bold">
              {maskAmount(balancesVisible, remainingAmount(goal))}
            </AppText>
          </View>

          <View style={styles.detailsRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Target Date
            </AppText>
            <AppText variant="body" weight="bold">
              {goal.targetDate}
            </AppText>
          </View>

          <View style={styles.detailsRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Contributions
            </AppText>
            <AppText variant="body" weight="bold">
              {goal.contributions}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => setDetailsMode("edit")}
          style={[
            styles.secondaryLargeButton,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <Ionicons name="create-outline" size={22} color={theme.colors.text} />
          <AppText
            variant="title"
            weight="bold"
            style={styles.secondaryLargeButtonText}
          >
            Edit Goal
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!goal) return;
            onDeleteGoal(goal.id);
            onClose();
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={22} color="#FF4D4F" />
          <AppText
            variant="title"
            weight="bold"
            color="#FF4D4F"
            style={styles.secondaryLargeButtonText}
          >
            Delete Goal
          </AppText>
        </Pressable>
      </>
    );
  };

  const renderIconPicker = () => (
    <View style={styles.iconGrid}>
      {GOAL_ICON_OPTIONS.map((item) => {
        const active = item.key === editIcon;

        return (
          <Pressable
            key={item.key}
            onPress={() => {
              setEditIcon(item.key);
              setEditEmoji(item.emoji);
            }}
            style={[
              styles.iconChip,
              {
                backgroundColor: theme.colors.background,
                borderColor: active ? theme.colors.tint : "transparent",
              },
            ]}
          >
            <AppText style={styles.iconChipEmoji}>{item.emoji}</AppText>
          </Pressable>
        );
      })}
    </View>
  );

  const renderEditField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "number-pad";
  }) => (
    <View style={styles.section}>
      <AppText
        variant="title"
        color={theme.colors.textSecondary}
        style={styles.fieldLabel}
      >
        {label}
      </AppText>

      <BottomSheetTextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={[
          styles.textInput,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.borderSoft,
            color: theme.colors.text,
            fontFamily: theme.fonts.bodyMedium,
          },
        ]}
        selectionColor={theme.colors.tint}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
      />
    </View>
  );

  const renderDetailsEdit = () => (
    <>
      {renderTabSwitch()}

      <View
        style={[
          styles.editCard,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.borderSoft,
          },
        ]}
      >
        <View style={styles.section}>
          <AppText
            variant="title"
            color={theme.colors.textSecondary}
            style={styles.fieldLabel}
          >
            Icon
          </AppText>

          {renderIconPicker()}

          <AppText variant="body" color={theme.colors.textSecondary}>
            {GOAL_ICON_OPTIONS.find((item) => item.key === editIcon)?.label ?? ""}
          </AppText>
        </View>

        {renderEditField({
          label: "Goal Name",
          value: editName,
          onChangeText: setEditName,
          placeholder: "e.g., New Car Fund",
        })}

        {renderEditField({
          label: "Target Amount",
          value: editTargetAmount,
          onChangeText: (text) => setEditTargetAmount(formatAmountInput(text)),
          placeholder: "0",
          keyboardType: "number-pad",
        })}

        {renderEditField({
          label: "Target Date",
          value: editTargetDate,
          onChangeText: (text) => setEditTargetDate(normalizeDateInput(text)),
          placeholder: "dd/mm/yyyy",
        })}
      </View>

      <View style={styles.editFooterRow}>
        <Pressable
          onPress={() => setDetailsMode("view")}
          style={[
            styles.halfButton,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <AppText variant="title" weight="bold" style={styles.halfButtonText}>
            Cancel
          </AppText>
        </Pressable>

        <Pressable
          onPress={handleSaveEdit}
          disabled={!canSaveEdit}
          style={[
            styles.halfButton,
            {
              backgroundColor: theme.colors.tint,
              borderColor: theme.colors.tint,
              opacity: canSaveEdit ? 1 : 0.45,
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={22}
            color={theme.colors.primaryText}
          />
          <AppText
            variant="title"
            weight="bold"
            color={theme.colors.primaryText}
            style={styles.halfButtonText}
          >
            Save
          </AppText>
        </Pressable>
      </View>
    </>
  );

  if (!goal) return null;

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="92%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderHeader()}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        {(tab === "add" || tab === "withdraw") && step === "form"
          ? renderAddOrWithdrawForm()
          : null}

        {(tab === "add" || tab === "withdraw") && step === "success"
          ? renderSuccessState()
          : null}

        {tab === "details" && detailsMode === "view" ? renderDetailsView() : null}
        {tab === "details" && detailsMode === "edit" ? renderDetailsEdit() : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 22,
    gap: 16,
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  goalEmojiWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  goalEmoji: {
    fontSize: 20,
    lineHeight: 28,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
  },
  divider: {
    width: "100%",
    height: 1,
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
  },
  tabButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  balanceBlock: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 14,
    lineHeight: 28,
  },
  balanceAmount: {
    fontSize: 20,
    lineHeight: 40,
  },
  section: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 28,
  },
  amountField: {
    minHeight: 88,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  amountCurrency: {
    fontSize: 20,
    lineHeight: 36,
  },
  amountInput: {
    flex: 1,
    minHeight: 88,
    fontSize: 20,
    lineHeight: 25,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickChip: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  accountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  accountCard: {
    width: "48%",
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    justifyContent: "center",
    gap: 4,
  },
  accountBank: {
    fontSize: 14,
    lineHeight: 24,
  },
  primaryButton: {
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    lineHeight: 28,
  },
  successWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    gap: 14,
  },
  successOrbWrap: {
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  successGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(87,242,200,0.14)",
  },
  successOrb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FC3F7",
  },
  successTitle: {
    fontSize: 20,
    lineHeight: 34,
    textAlign: "center",
  },
  successCopy: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
    maxWidth: 330,
  },
  detailsCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryLargeButton: {
    minHeight: 64,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  deleteButton: {
    minHeight: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  secondaryLargeButtonText: {
    fontSize: 14,
    lineHeight: 28,
  },
  editCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 18,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconChip: {
    width: 62,
    height: 62,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChipEmoji: {
    fontSize: 20,
    lineHeight: 30,
  },
  textInput: {
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    fontSize: 14,
    lineHeight: 24,
  },
  editFooterRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfButton: {
    flex: 1,
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  halfButtonText: {
    fontSize: 14,
    lineHeight: 28,
  },
});