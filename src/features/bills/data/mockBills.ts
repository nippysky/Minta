export type BillStatus = "overdue" | "due-soon" | "upcoming";

export type BillItem = {
  id: string;
  icon: string;
  name: string;
  provider: string;
  amount: number;
  dueLabel: string;
  dueDate: string;
  frequency: string;
  reminder: string;
  autoPay: boolean;
  accountNumber?: string;
  status: BillStatus;
};

export const mockBills: BillItem[] = [
  {
    id: "spectranet",
    icon: "📡",
    name: "Spectranet Internet",
    provider: "Spectranet",
    amount: 18000,
    dueLabel: "2 days overdue",
    dueDate: "Friday, 27 March 2026",
    frequency: "Every month",
    reminder: "3 days before due",
    autoPay: false,
    accountNumber: "SP123456789",
    status: "overdue",
  },
  {
    id: "ikedc",
    icon: "⚡",
    name: "IKEDC Electricity",
    provider: "IKEDC",
    amount: 15000,
    dueLabel: "Due in 2 days",
    dueDate: "Monday, 30 March 2026",
    frequency: "Every month",
    reminder: "2 days before due",
    autoPay: true,
    accountNumber: "IK998234",
    status: "due-soon",
  },
  {
    id: "dstv",
    icon: "📺",
    name: "DStv Premium",
    provider: "Multichoice",
    amount: 24500,
    dueLabel: "Due in 5 days",
    dueDate: "Thursday, 2 April 2026",
    frequency: "Every month",
    reminder: "2 days before due",
    autoPay: true,
    accountNumber: "DSTV18892",
    status: "upcoming",
  },
  {
    id: "netflix",
    icon: "🎬",
    name: "Netflix Premium",
    provider: "Netflix",
    amount: 4500,
    dueLabel: "8 Apr",
    dueDate: "Wednesday, 8 April 2026",
    frequency: "Every month",
    reminder: "1 day before due",
    autoPay: true,
    accountNumber: "NFX-009",
    status: "upcoming",
  },
  {
    id: "gym",
    icon: "🏋️",
    name: "Gym Membership",
    provider: "Virgin Active",
    amount: 35000,
    dueLabel: "13 Apr",
    dueDate: "Monday, 13 April 2026",
    frequency: "Every month",
    reminder: "3 days before due",
    autoPay: false,
    accountNumber: "GYM-332",
    status: "upcoming",
  },
];