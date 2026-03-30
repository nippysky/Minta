import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import GoalActionSheet from "@/src/features/goals/components/GoalActionSheet";
import {
  EMPTY_GOAL_DRAFT,
  GOAL_ICON_OPTIONS,
  MOCK_GOALS,
  MOCK_GOAL_SOURCE_ACCOUNTS,
} from "@/src/features/goals/mock";
import type { GoalDraft, GoalItem } from "@/src/features/goals/types";
import {
  amountInputToNumber,
  buildGoalSummary,
  formatCurrency,
  formatCurrencyHidden,
  goalProgress,
  isValidDateInput,
  maskAmount,
  maskGoalMeta,
  normalizeDateInput,
} from "@/src/features/goals/utils";
import { useAppTheme } from "@/src/hooks/useAppTheme";

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

function ProgressRing({
  size = 128,
  stroke = 12,
  progress,
  tintColor,
  trackColor,
}: {
  size?: number;
  stroke?: number;
  progress: number;
  tintColor: string;
  trackColor: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * progress) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tintColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.ringCenter}>
        <AppText variant="title" weight="bold" style={styles.ringPercent}>
          {progress}%
        </AppText>
      </View>
    </View>
  );
}

export default function GoalsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [balancesVisible, setBalancesVisible] = useState(true);
  const [goals, setGoals] = useState<GoalItem[]>(MOCK_GOALS);

  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
  const [goalSheetVisible, setGoalSheetVisible] = useState(false);

  const [createSheetVisible, setCreateSheetVisible] = useState(false);
  const [draft, setDraft] = useState<GoalDraft>(EMPTY_GOAL_DRAFT);

  const summary = useMemo(() => buildGoalSummary(goals), [goals]);

  const canCreateGoal =
    draft.name.trim().length > 1 &&
    draft.targetAmount > 0 &&
    isValidDateInput(draft.targetDate);

  const openGoalSheet = (goal: GoalItem) => {
    setSelectedGoal(goal);
    setGoalSheetVisible(true);
  };

  const resetDraft = () => {
    setDraft({
      ...EMPTY_GOAL_DRAFT,
      icon: GOAL_ICON_OPTIONS[0].key,
      iconEmoji: GOAL_ICON_OPTIONS[0].emoji,
    });
  };

  const createGoal = () => {
    if (!canCreateGoal) return;

    const nextGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      name: draft.name.trim(),
      icon: draft.icon,
      iconEmoji: draft.iconEmoji,
      savedAmount: 0,
      targetAmount: draft.targetAmount,
      targetDate: draft.targetDate,
      contributions: 0,
      tone: "gradient",
    };

    setGoals((prev) => [nextGoal, ...prev]);
    setCreateSheetVisible(false);
    resetDraft();
  };

  const handleAddFunds = ({
    goalId,
    amount,
  }: {
    goalId: string;
    amount: number;
    accountId?: string | null;
  }) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              savedAmount: goal.savedAmount + amount,
              contributions: goal.contributions + 1,
            }
          : goal
      )
    );
  };

  const handleWithdrawFunds = ({
    goalId,
    amount,
  }: {
    goalId: string;
    amount: number;
    accountId?: string | null;
  }) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              savedAmount: Math.max(goal.savedAmount - amount, 0),
            }
          : goal
      )
    );
  };

  const handleUpdateGoal = (goalId: string, nextDraft: GoalDraft) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              name: nextDraft.name,
              icon: nextDraft.icon,
              iconEmoji: nextDraft.iconEmoji,
              targetAmount: nextDraft.targetAmount,
              targetDate: nextDraft.targetDate,
            }
          : goal
      )
    );

    setSelectedGoal((prev) =>
      prev && prev.id === goalId
        ? {
            ...prev,
            name: nextDraft.name,
            icon: nextDraft.icon,
            iconEmoji: nextDraft.iconEmoji,
            targetAmount: nextDraft.targetAmount,
            targetDate: nextDraft.targetDate,
          }
        : prev
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    setGoalSheetVisible(false);
    setSelectedGoal(null);
  };

  useEffect(() => {
    if (!selectedGoal) return;

    const latest = goals.find((item) => item.id === selectedGoal.id) ?? null;
    if (latest) setSelectedGoal(latest);
  }, [goals, selectedGoal]);

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom + 110, 132),
          },
        ]}
      >
        <FadeInUp delay={20}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <AppText variant="title" weight="bold" style={styles.headerTitle}>
                Goals & Savings
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Track your financial goals
              </AppText>
            </View>

            <Pressable
              onPress={() => setBalancesVisible((prev) => !prev)}
              style={[
                styles.eyeButton,
                { backgroundColor: theme.colors.inputBackground },
              ]}
            >
              <Ionicons
                name={balancesVisible ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={theme.colors.textMuted}
              />
            </Pressable>
          </View>
        </FadeInUp>

        <FadeInUp delay={60}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
                shadowColor: theme.colors.glow ?? "#57F2C8",
              },
            ]}
          >
            <View style={styles.summaryGlow} />

            <View style={styles.summaryLeft}>
              <ProgressRing
                progress={summary.progressPercent}
                tintColor={theme.colors.tint}
                trackColor={theme.colors.borderSoft}
              />
            </View>

            <View style={styles.summaryRight}>
              <AppText
                variant="title"
                color={theme.colors.textSecondary}
                style={styles.summaryLabel}
              >
                Total Saved
              </AppText>

              <AppText
                variant="hero"
                weight="bold"
                color={theme.colors.tint}
                style={styles.summaryAmount}
              >
                {maskAmount(balancesVisible, summary.totalSaved)}
              </AppText>

              <AppText
                variant="title"
                color={theme.colors.textSecondary}
                style={styles.summaryMeta}
              >
                of{" "}
                {balancesVisible
                  ? formatCurrency(summary.totalTarget)
                  : formatCurrencyHidden()}{" "}
                goal
              </AppText>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={100}>
          <AppText variant="title" weight="bold" style={styles.sectionTitle}>
            Your Goals
          </AppText>
        </FadeInUp>

        <View style={styles.goalsList}>
          {goals.map((goal, index) => {
            const progress = goalProgress(goal);

            return (
              <FadeInUp key={goal.id} delay={120 + index * 50}>
                <Pressable
                  onPress={() => openGoalSheet(goal)}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <View style={styles.goalTop}>
                    <View style={styles.goalIdentity}>
                      <View
                        style={[
                          styles.goalIconWrap,
                          { backgroundColor: theme.colors.inputBackground },
                        ]}
                      >
                        <AppText style={styles.goalEmoji}>{goal.iconEmoji}</AppText>
                      </View>

                      <View style={styles.goalCopy}>
                        <AppText
                          variant="title"
                          weight="bold"
                          style={styles.goalName}
                        >
                          {goal.name}
                        </AppText>
                        <AppText
                          variant="title"
                          color={theme.colors.textSecondary}
                          style={styles.goalMeta}
                        >
                          {maskGoalMeta(
                            balancesVisible,
                            goal.savedAmount,
                            goal.targetAmount
                          )}
                        </AppText>
                      </View>
                    </View>

                    <AppText
                      variant="title"
                      weight="bold"
                      style={styles.goalPercent}
                    >
                      {progress}%
                    </AppText>
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
                          width: `${progress}%`,
                          backgroundColor:
                            goal.tone === "danger"
                              ? "#FF6262"
                              : theme.colors.tint,
                        },
                      ]}
                    />
                  </View>
                </Pressable>
              </FadeInUp>
            );
          })}
        </View>

        <FadeInUp delay={360}>
          <Pressable
            onPress={() => setCreateSheetVisible(true)}
            style={[
              styles.createGoalButton,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <Ionicons name="add" size={24} color={theme.colors.primaryText} />
            <AppText
              variant="body"
              weight="bold"
              color={theme.colors.primaryText}
              style={styles.createGoalText}
            >
              Create New Goal
            </AppText>
          </Pressable>
        </FadeInUp>
      </ScrollView>

      <GoalActionSheet
        visible={goalSheetVisible}
        goal={selectedGoal}
        balancesVisible={balancesVisible}
        accounts={MOCK_GOAL_SOURCE_ACCOUNTS}
        onClose={() => {
          setGoalSheetVisible(false);
          setSelectedGoal(null);
        }}
        onAddFunds={handleAddFunds}
        onWithdrawFunds={handleWithdrawFunds}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />

      <BottomSheetModal
        visible={createSheetVisible}
        onClose={() => {
          setCreateSheetVisible(false);
          resetDraft();
        }}
        maxHeight="92%"
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderSpacer} />
            <AppText variant="title" weight="bold" style={styles.sheetTitle}>
              New Goal
            </AppText>
            <Pressable
              onPress={() => {
                setCreateSheetVisible(false);
                resetDraft();
              }}
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
          />

          <View style={styles.sheetSection}>
            <AppText
              variant="title"
              weight="bold"
              color={theme.colors.textSecondary}
              style={styles.fieldLabel}
            >
              Choose Icon
            </AppText>

            <View style={styles.iconGrid}>
              {GOAL_ICON_OPTIONS.map((item) => {
                const active = draft.icon === item.key;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() =>
                      setDraft((prev) => ({
                        ...prev,
                        icon: item.key,
                        iconEmoji: item.emoji,
                      }))
                    }
                    style={[
                      styles.iconChip,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: active ? theme.colors.tint : "transparent",
                      },
                    ]}
                  >
                    <AppText style={styles.iconChipEmoji}>{item.emoji}</AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="body" color={theme.colors.textSecondary}>
              {GOAL_ICON_OPTIONS.find((item) => item.key === draft.icon)?.label ??
                ""}
            </AppText>
          </View>

          <View style={styles.sheetSection}>
            <AppText
              variant="title"
              color={theme.colors.textSecondary}
              style={styles.fieldLabel}
            >
              Goal Name
            </AppText>

            <BottomSheetTextInput
              value={draft.name}
              onChangeText={(text) =>
                setDraft((prev) => ({
                  ...prev,
                  name: text,
                }))
              }
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
              placeholder="e.g., New Car Fund"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.sheetSection}>
            <AppText
              variant="title"
              color={theme.colors.textSecondary}
              style={styles.fieldLabel}
            >
              Target Amount
            </AppText>

            <View
              style={[
                styles.createAmountWrap,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText
                variant="hero"
                weight="bold"
                style={styles.createAmountCurrency}
              >
                ₦
              </AppText>

              <BottomSheetTextInput
                value={
                  draft.targetAmount
                    ? draft.targetAmount.toLocaleString("en-NG")
                    : ""
                }
                onChangeText={(text) =>
                  setDraft((prev) => ({
                    ...prev,
                    targetAmount: amountInputToNumber(text),
                  }))
                }
                keyboardType="number-pad"
                style={[
                  styles.createAmountInput,
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

          <View style={styles.sheetSection}>
            <AppText
              variant="title"
              color={theme.colors.textSecondary}
              style={styles.fieldLabel}
            >
              Target Date
            </AppText>

            <View
              style={[
                styles.dateField,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <BottomSheetTextInput
                value={draft.targetDate}
                onChangeText={(text) =>
                  setDraft((prev) => ({
                    ...prev,
                    targetDate: normalizeDateInput(text),
                  }))
                }
                style={[
                  styles.dateInput,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bodyMedium,
                  },
                ]}
                selectionColor={theme.colors.tint}
                placeholder="dd/mm/yyyy"
                placeholderTextColor={theme.colors.placeholder}
              />

              <Ionicons
                name="calendar-outline"
                size={22}
                color={theme.colors.text}
              />
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
          />

          <Pressable
            onPress={createGoal}
            disabled={!canCreateGoal}
            style={[
              styles.primaryCreateButton,
              {
                backgroundColor: theme.colors.tint,
                opacity: canCreateGoal ? 1 : 0.45,
              },
            ]}
          >
            <AppText
              variant="body"
              weight="bold"
              color={theme.colors.primaryText}
              style={styles.primaryCreateText}
            >
              Create Goal
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
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 32,
  },
  eyeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
    shadowOpacity: 0.16,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  summaryGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    backgroundColor: "#57F2C8",
  },
  summaryLeft: {
    width: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRight: {
    flex: 1,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    lineHeight: 28,
  },
  summaryAmount: {
    fontSize: 20,
    lineHeight: 38,
  },
  summaryMeta: {
    fontSize: 14,
    lineHeight: 28,
  },
  ringCenter: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercent: {
    fontSize: 16,
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 30,
  },
  goalsList: {
    gap: 14,
  },
  goalCard: {
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  goalTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  goalIdentity: {
    flexDirection: "row",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  goalIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  goalEmoji: {
    fontSize: 20,
    lineHeight: 30,
  },
  goalCopy: {
    flex: 1,
    gap: 2,
  },
  goalName: {
    fontSize: 14,
    lineHeight: 28,
  },
  goalMeta: {
    fontSize: 14,
    lineHeight: 28,
  },
  goalPercent: {
    fontSize: 14,
    lineHeight: 28,
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  createGoalButton: {
    minHeight: 62,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  createGoalText: {
    fontSize: 14,
    lineHeight: 28,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 22,
    gap: 16,
  },
  sheetHeader: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetHeaderSpacer: {
    width: 24,
  },
  sheetTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  sheetSection: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 28,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconChip: {
    width: 50,
    height: 50,
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
  createAmountWrap: {
    minHeight: 78,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  createAmountCurrency: {
    fontSize: 20,
    lineHeight: 32,
  },
  createAmountInput: {
    flex: 1,
    minHeight: 50,
    fontSize: 20,
    lineHeight: 25,
  },
  dateField: {
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInput: {
    flex: 1,
    minHeight: 62,
    fontSize: 14,
    lineHeight: 24,
  },
  primaryCreateButton: {
    minHeight: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  primaryCreateText: {
    fontSize: 14,
    lineHeight: 28,
  },
});