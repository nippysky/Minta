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

  privacyPolicy: "/(app)/privacy-policy" as Href,
  termsOfService: "/(app)/terms-of-service" as Href,
  feeTransparency: "/(app)/fee-transparency" as Href,

  accountDetails: (accountId: string) =>
    `/(app)/accounts/${accountId}` as Href,

  accountTransactions: (accountId: string) =>
    `/(app)/accounts/${accountId}/transactions` as Href,

  accountTransactionDetails: (accountId: string, transactionId: string) =>
    `/(app)/accounts/${accountId}/transactions/${transactionId}` as Href,

  investAssetDetails: (assetId: string) =>
    `/(app)/invest/${assetId}` as Href,
} as const;