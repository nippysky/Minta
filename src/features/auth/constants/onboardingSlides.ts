import type { Ionicons } from "@expo/vector-icons";

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  gradient: readonly [string, string];
  dotColor: string;
  ctaLabel: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "money",
    title: "All Your Money,\nOne App",
    description:
      "Link all your bank accounts, cards, and investments in one beautiful dashboard.",
    icon: "wallet-outline",
    accent: "#4DE6BE",
    gradient: ["#4DE6BE", "#21D987"],
    dotColor: "#4DE6BE",
    ctaLabel: "Continue",
  },
  {
    id: "invest",
    title: "Invest &\nGrow Wealth",
    description:
      "Track your portfolio across Bamboo, Risevest, Chaka & more — all in one view.",
    icon: "trending-up-outline",
    accent: "#3B82F6",
    gradient: ["#2563EB", "#7C4DFF"],
    dotColor: "#2563EB",
    ctaLabel: "Continue",
  },
  {
    id: "security",
    title: "Bank-Grade\nSecurity",
    description:
      "256-bit encryption, biometric login, and real-time fraud detection keep you safe.",
    icon: "shield-checkmark-outline",
    accent: "#7C4DFF",
    gradient: ["#7C4DFF", "#4DE6BE"],
    dotColor: "#7C4DFF",
    ctaLabel: "Get Started",
  },
];