import type { GoalAccountOption, GoalDraft, GoalItem, GoalIconKey } from "@/src/features/goals/types";

export const GOAL_ICON_OPTIONS: {
  key: GoalIconKey;
  emoji: string;
  label: string;
}[] = [
  { key: "shield-outline", emoji: "🛡️", label: "Insurance / Protection" },
  { key: "laptop-outline", emoji: "💻", label: "Laptop / Tech" },
  { key: "airplane-outline", emoji: "✈️", label: "Travel" },
  { key: "home-outline", emoji: "🏠", label: "Housing / Rent" },
  { key: "car-outline", emoji: "🚗", label: "Car" },
  { key: "phone-portrait-outline", emoji: "📱", label: "Phone / Gadget" },
  { key: "diamond-outline", emoji: "💎", label: "Luxury / Jewelry" },
  { key: "school-outline", emoji: "🎓", label: "Education" },
  { key: "cash-outline", emoji: "💰", label: "Cash Buffer" },
  { key: "sunny-outline", emoji: "🏖️", label: "Lifestyle / Leisure" },
];

export const MOCK_GOALS: GoalItem[] = [
  {
    id: "goal-emergency-fund",
    name: "Emergency Fund",
    icon: "shield-outline",
    iconEmoji: "🧯",
    savedAmount: 230000,
    targetAmount: 500000,
    targetDate: "12/12/2026",
    contributions: 8,
    tone: "gradient",
  },
  {
    id: "goal-macbook",
    name: "New MacBook Pro",
    icon: "laptop-outline",
    iconEmoji: "💻",
    savedAmount: 450000,
    targetAmount: 800000,
    targetDate: "28/05/2026",
    contributions: 3,
    tone: "gradient",
  },
  {
    id: "goal-dubai",
    name: "Vacation to Dubai",
    icon: "airplane-outline",
    iconEmoji: "✈️",
    savedAmount: 190000,
    targetAmount: 1500000,
    targetDate: "16/11/2026",
    contributions: 5,
    tone: "danger",
  },
  {
    id: "goal-rent",
    name: "December Rent",
    icon: "home-outline",
    iconEmoji: "🏠",
    savedAmount: 500000,
    targetAmount: 500000,
    targetDate: "01/12/2026",
    contributions: 12,
    tone: "success",
  },
];

export const MOCK_GOAL_SOURCE_ACCOUNTS: GoalAccountOption[] = [
  {
    id: "acct-moniepoint",
    bankName: "MoniePoint",
    accountNumber: "3373733737",
    balance: 0,
  },
  {
    id: "acct-firstbank",
    bankName: "First Bank",
    accountNumber: "7738383984",
    balance: 0,
  },
  {
    id: "acct-access",
    bankName: "Access Bank",
    accountNumber: "9089672662",
    balance: 50000,
  },
  {
    id: "acct-uba",
    bankName: "UBA",
    accountNumber: "0801748680",
    balance: 0,
  },
];

export const EMPTY_GOAL_DRAFT: GoalDraft = {
  icon: GOAL_ICON_OPTIONS[0].key,
  iconEmoji: GOAL_ICON_OPTIONS[0].emoji,
  name: "",
  targetAmount: 0,
  targetDate: "",
};