import type { GoalItem, GoalSummary } from "@/src/features/goals/types";

export function formatCurrency(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function formatCurrencyHidden() {
  return "• • • • • •";
}

export function goalProgress(goal: GoalItem) {
  if (goal.targetAmount <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
  );
}

export function buildGoalSummary(goals: GoalItem[]): GoalSummary {
  const totalSaved = goals.reduce((sum, item) => sum + item.savedAmount, 0);
  const totalTarget = goals.reduce((sum, item) => sum + item.targetAmount, 0);

  return {
    totalSaved,
    totalTarget,
    progressPercent:
      totalTarget <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((totalSaved / totalTarget) * 100))),
  };
}

export function amountInputToNumber(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function formatAmountInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

export function maskAmount(visible: boolean, value: number) {
  return visible ? formatCurrency(value) : formatCurrencyHidden();
}

export function maskGoalMeta(visible: boolean, saved: number, target: number) {
  if (!visible) return `${formatCurrencyHidden()} of ${formatCurrencyHidden()}`;
  return `${formatCurrency(saved)} of ${formatCurrency(target)}`;
}

export function remainingAmount(goal: GoalItem) {
  return Math.max(goal.targetAmount - goal.savedAmount, 0);
}

export function isValidDateInput(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

  const [dd, mm, yyyy] = value.split("/").map(Number);
  if (!dd || !mm || !yyyy) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;

  return true;
}

export function normalizeDateInput(value: string) {
  const digits = value.replace(/[^\d]/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}