export type HomeTourStep = {
  id: string;
  targetId: string;
  title: string;
  description: string;
};

export const HOME_TOUR_STEPS: HomeTourStep[] = [
  {
    id: "balance",
    targetId: "balance-card",
    title: "Your Net Worth",
    description:
      "See all your account balances consolidated in one glance. Track your total net worth and monthly growth.",
  },
  {
    id: "quick-actions",
    targetId: "quick-actions",
    title: "Quick Actions",
    description:
      "Send money, receive payments, manage cards, and pay bills — all in one tap.",
  },
  {
    id: "insights",
    targetId: "insights",
    title: "AI-Powered Insights",
    description:
      "MiNTA analyzes your spending patterns and gives you personalized tips to save more.",
  },
  {
    id: "budget-bills",
    targetId: "budget-bills",
    title: "Budget Tracking",
    description:
      "Set spending limits by category and monitor them in real-time. Get alerts before you overspend.",
  },
  {
    id: "transactions",
    targetId: "transactions",
    title: "Transaction History",
    description:
      "Every transaction is categorized and searchable. Tap any transaction for full details and receipts.",
  },
  {
    id: "tab-accounts",
    targetId: "tab-accounts",
    title: "Multi-Bank Accounts",
    description:
      "Link all your Nigerian bank accounts in one place. View balances across GTBank, Access, Kuda, and more.",
  },
  {
    id: "tab-goals",
    targetId: "tab-goals",
    title: "Savings Goals",
    description:
      "Set goals, automate contributions, and watch your progress. Save for rent, trips, or emergencies.",
  },
  {
    id: "tab-invest",
    targetId: "tab-invest",
    title: "Investments",
    description:
      "Track your investment portfolio across platforms — stocks, crypto, and mutual funds in one view.",
  },
  {
    id: "tab-ai",
    targetId: "tab-ai",
    title: "MiNTA AI Assistant",
    description:
      "Chat with MiNTA to get financial advice, analyze spending, or set up automations using natural language.",
  },
];