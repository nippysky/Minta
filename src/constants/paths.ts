import type { Href } from "expo-router";

export const PATHS = {
  index: "/" as Href,

  onboarding: "/onboarding" as Href,

  signIn: "/(auth)/sign-in" as Href,
  signUp: "/(auth)/sign-up" as Href,
  forgotPassword: "/(auth)/forgot-password" as Href,
  verifyEmail: "/(auth)/verify-email" as Href,

  home: "/(app)/(tabs)/home" as Href,
  accounts: "/(app)/(tabs)/accounts" as Href,
  goals: "/(app)/(tabs)/goals" as Href,
  invest: "/(app)/(tabs)/invest" as Href,
  mintaAi: "/(app)/(tabs)/minta-ai" as Href,

  settings: "/(app)/settings" as Href,
  notifications: "/(app)/notifications" as Href,
  profile: "/(app)/profile" as Href,

  securityCenter: "/(app)/security-center" as Href,
  changePin: "/(app)/change-pin" as Href,
  cards: "/(app)/cards" as Href,
  automation: "/(app)/automation" as Href,
  budgets: "/(app)/budgets" as Href,
  bills: "/(app)/bills" as Href,
} as const;