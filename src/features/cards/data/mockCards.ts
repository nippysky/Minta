import { Ionicons } from "@expo/vector-icons";

export type CardKind = "virtual" | "physical";

export type CardControlItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type CardRecord = {
  kind: CardKind;
  title: string;
  typeLabel: string;
  last4: string;
  holderName: string;
  expiry: string;
  cvv: string;
  monthlySpent: number;
  monthlyLimit: number;
  controls: CardControlItem[];
};

export const mockCards: Record<CardKind, CardRecord> = {
  virtual: {
    kind: "virtual",
    title: "MiNTA",
    typeLabel: "VIRTUAL CARD",
    last4: "4532",
    holderName: "SAMUEL NWAMAIFE",
    expiry: "12/27",
    cvv: "482",
    monthlySpent: 125000,
    monthlyLimit: 500000,
    controls: [
      {
        id: "freeze",
        label: "Freeze Card",
        icon: "lock-closed-outline",
      },
      {
        id: "limits",
        label: "Spending Limits",
        icon: "options-outline",
      },
      {
        id: "details",
        label: "View Details",
        icon: "eye-outline",
      },
      {
        id: "pin",
        label: "Change PIN",
        icon: "key-outline",
      },
    ],
  },
  physical: {
    kind: "physical",
    title: "MiNTA",
    typeLabel: "PHYSICAL CARD",
    last4: "7891",
    holderName: "SAMUEL NWAMAIFE",
    expiry: "08/28",
    cvv: "913",
    monthlySpent: 320000,
    monthlyLimit: 1000000,
    controls: [
      {
        id: "freeze",
        label: "Freeze Card",
        icon: "lock-closed-outline",
      },
      {
        id: "limits",
        label: "Spending Limits",
        icon: "options-outline",
      },
      {
        id: "replace",
        label: "Order / Replace",
        icon: "cube-outline",
      },
      {
        id: "pin",
        label: "Change PIN",
        icon: "key-outline",
      },
      {
        id: "details",
        label: "View Details",
        icon: "eye-outline",
      },
    ],
  },
};