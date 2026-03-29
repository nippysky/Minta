export type BudgetCategory =
  | "Food & Dining"
  | "Transport"
  | "Entertainment"
  | "Shopping"
  | "Bills & Utilities"
  | "Health"
  | "Education"
  | "Subscriptions";

export type BudgetTransaction = {
  id: string;
  title: string;
  date: string;
  amount: number;
};

export type BudgetItem = {
  id: string;
  icon: string;
  category: BudgetCategory;
  limit: number;
  spent: number;
  alertAt: number;
  transactions: BudgetTransaction[];
};

export const mockBudgets: BudgetItem[] = [
  {
    id: "food",
    icon: "🍕",
    category: "Food & Dining",
    limit: 50000,
    spent: 29200,
    alertAt: 80,
    transactions: [
      { id: "f1", title: "Chicken Republic", date: "Today", amount: 6200 },
      { id: "f2", title: "Domino’s Pizza", date: "Yesterday", amount: 9800 },
      { id: "f3", title: "Kilimanjaro", date: "3 days ago", amount: 4500 },
    ],
  },
  {
    id: "transport",
    icon: "🚗",
    category: "Transport",
    limit: 30000,
    spent: 31300,
    alertAt: 80,
    transactions: [
      { id: "t1", title: "Uber Trip", date: "Yesterday", amount: 3500 },
      { id: "t2", title: "Bolt Ride", date: "7 days ago", amount: 2800 },
      { id: "t3", title: "Fuel - Total Station", date: "18 days ago", amount: 25000 },
    ],
  },
  {
    id: "entertainment",
    icon: "🎮",
    category: "Entertainment",
    limit: 25000,
    spent: 31500,
    alertAt: 80,
    transactions: [
      { id: "e1", title: "Netflix", date: "2 days ago", amount: 4500 },
      { id: "e2", title: "Cinema", date: "5 days ago", amount: 12000 },
      { id: "e3", title: "PSN Top Up", date: "8 days ago", amount: 15000 },
    ],
  },
  {
    id: "shopping",
    icon: "🛍️",
    category: "Shopping",
    limit: 40000,
    spent: 70000,
    alertAt: 80,
    transactions: [
      { id: "s1", title: "Zara", date: "Today", amount: 18000 },
      { id: "s2", title: "Shoprite", date: "2 days ago", amount: 15000 },
      { id: "s3", title: "Nike", date: "5 days ago", amount: 37000 },
    ],
  },
  {
    id: "bills",
    icon: "📄",
    category: "Bills & Utilities",
    limit: 60000,
    spent: 15000,
    alertAt: 80,
    transactions: [
      { id: "b1", title: "IKEDC", date: "4 days ago", amount: 15000 },
    ],
  },
];