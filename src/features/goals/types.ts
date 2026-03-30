export type GoalIconKey =
  | "shield-outline"
  | "laptop-outline"
  | "airplane-outline"
  | "home-outline"
  | "car-outline"
  | "phone-portrait-outline"
  | "diamond-outline"
  | "school-outline"
  | "cash-outline"
  | "sunny-outline";

export type GoalStatusTone = "gradient" | "danger" | "success";

export type GoalAccountOption = {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
};

export type GoalItem = {
  id: string;
  name: string;
  icon: GoalIconKey;
  iconEmoji: string;
  savedAmount: number;
  targetAmount: number;
  targetDate: string;
  contributions: number;
  tone: GoalStatusTone;
};

export type GoalDraft = {
  icon: GoalIconKey;
  iconEmoji: string;
  name: string;
  targetAmount: number;
  targetDate: string;
};

export type GoalContributionPayload = {
  goalId: string;
  amount: number;
  accountId?: string | null;
};

export type GoalWithdrawPayload = {
  goalId: string;
  amount: number;
  accountId?: string | null;
};

export type GoalSummary = {
  totalSaved: number;
  totalTarget: number;
  progressPercent: number;
};