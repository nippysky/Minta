export type AccountKind = "wallet" | "bank";
export type AccountType = "Primary" | "Savings" | "Current";

export type LinkedAccount = {
  id: string;
  bankName: string;
  icon: string;
  logoColor: string;
  accountType: AccountType;
  accountNumber: string;
  balance: number;
  availableBalance?: number;
  weekSpending?: number;
  kind: AccountKind;
  accent: string;
  accentSoft: string;
  syncedAtLabel: string;
  totalIn: number;
  totalOut: number;
  canUnlink?: boolean;
};

export type Institution = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type TransactionCategory =
  | "Income"
  | "Transfer"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Transport"
  | "Food & Dining"
  | "Refund"
  | "Subscription"
  | "Other";

export type TransactionType = "income" | "expense";

export type AccountTransaction = {
  id: string;
  accountId: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  status: "completed" | "pending" | "failed";
  reference: string;
  accountLabel: string;
  accountIcon: string;
  accountIconColor: string;
  occurredAt: string;
  relativeLabel: string;
  merchant?: string;
};