import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import AppText from "@/src/components/ui/AppText";
import SettingsAccordionCard, {
  type SettingsAccordionItem,
} from "@/src/components/settings/SettingsAccordionCard";
import { PATHS } from "@/src/constants/paths";
import { useAppTheme } from "@/src/hooks/useAppTheme";

export default function SettingsScreen() {
  const theme = useAppTheme();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [transactionAlertsEnabled, setTransactionAlertsEnabled] =
    useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const appearanceItems: SettingsAccordionItem[] = [
    {
      id: "theme",
      label: "Theme",
      description: "Light mode, dark mode, and system preference",
      icon: "color-palette-outline",
      type: "link",
    },
    {
      id: "language",
      label: "App Language",
      description: "English, Pidgin, Français",
      icon: "language-outline",
      type: "link",
    },
  ];

  const notificationItems: SettingsAccordionItem[] = [
    {
      id: "push",
      label: "Push Notifications",
      description: "Get alerts on your device",
      icon: "notifications-outline",
      type: "toggle",
      value: pushEnabled,
      onToggle: setPushEnabled,
    },
    {
      id: "email",
      label: "Email Notifications",
      description: "Receive updates via email",
      icon: "mail-outline",
      type: "toggle",
      value: emailEnabled,
      onToggle: setEmailEnabled,
    },
    {
      id: "sms",
      label: "SMS Notifications",
      description: "Get text message alerts",
      icon: "chatbox-outline",
      type: "toggle",
      value: smsEnabled,
      onToggle: setSmsEnabled,
    },
    {
      id: "transactions",
      label: "Transaction Alerts",
      description: "Get notified for every transaction",
      icon: "swap-horizontal-outline",
      type: "toggle",
      value: transactionAlertsEnabled,
      onToggle: setTransactionAlertsEnabled,
    },
  ];

  const securityItems: SettingsAccordionItem[] = [
    {
      id: "security-center",
      label: "Security Center",
      description: "2FA, biometrics, login history",
      icon: "shield-checkmark-outline",
      type: "link",
      onPress: () => router.push(PATHS.securityCenter),
    },
    {
      id: "change-pin",
      label: "Change PIN",
      description: "Update your transaction PIN",
      icon: "key-outline",
      type: "link",
      onPress: () => router.push(PATHS.changePin),
    },
    {
      id: "biometric-login",
      label: "Biometric Login",
      description: "Use fingerprint or Face ID",
      icon: "finger-print-outline",
      type: "toggle",
      value: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
  ];

  const bankingItems: SettingsAccordionItem[] = [
    {
      id: "cards",
      label: "Card Management",
      description: "Virtual and physical cards",
      icon: "card-outline",
      type: "link",
      onPress: () => router.push(PATHS.cards),
    },
    {
      id: "automation",
      label: "Automation Rules",
      description: "Smart money management",
      icon: "flash-outline",
      type: "link",
      onPress: () => router.push(PATHS.automation),
    },
    {
      id: "budgets",
      label: "Budget Management",
      description: "Track spending by category",
      icon: "wallet-outline",
      type: "link",
      onPress: () => router.push(PATHS.budgets),
    },
    {
      id: "bills",
      label: "Bills & Reminders",
      description: "Manage recurring payments",
      icon: "calendar-outline",
      type: "link",
      onPress: () => router.push(PATHS.bills),
    },
  ];

  const legalItems: SettingsAccordionItem[] = [
    {
      id: "privacy",
      label: "Privacy Policy",
      description: "How we protect your data",
      icon: "document-text-outline",
      type: "link",
    },
    {
      id: "terms",
      label: "Terms of Service",
      description: "Our terms and conditions",
      icon: "receipt-outline",
      type: "link",
    },
    {
      id: "fees",
      label: "Fees & Pricing",
      description: "Transparent fee structure",
      icon: "cash-outline",
      type: "link",
    },
  ];

  const supportItems: SettingsAccordionItem[] = [
    {
      id: "support",
      label: "Help & Support",
      description: "FAQs, contact support",
      icon: "help-circle-outline",
      type: "link",
    },
    {
      id: "tour",
      label: "Restart Product Tour",
      description: "Walk through app features again",
      icon: "play-outline",
      type: "link",
      highlight: true,
      onPress: () => {
        router.push(PATHS.home);
      },
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 48,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
                opacity: pressed ? 0.82 : 1,
              },
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={theme.colors.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <AppText variant="hero" weight="bold" style={styles.title}>
              Settings
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Manage your preferences
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push(PATHS.profile)}
          style={({ pressed }) => [
            styles.profileCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.glow,
              },
            ]}
          >
            <AppText variant="title" weight="bold" color={theme.colors.tint}>
              S
            </AppText>
          </View>

          <View style={styles.profileInfo}>
            <AppText variant="title" weight="bold" style={styles.profileName}>
              Samuel Nwamaife
            </AppText>

            <AppText variant="body" color={theme.colors.textSecondary}>
              samuel@demo.minta.ng
            </AppText>

            <View style={styles.profileMeta}>
              <AppText variant="body" weight="semibold" color={theme.colors.tint}>
                Verified
              </AppText>
              <AppText variant="body" color={theme.colors.textMuted}>
                •
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Level 3
              </AppText>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textMuted}
          />
        </Pressable>

        <View style={styles.sections}>
          <SettingsAccordionCard
            title="Appearance & Language"
            subtitle="Theme, display preferences, app language"
            icon="color-palette-outline"
            items={appearanceItems}
          />

          <SettingsAccordionCard
            title="Notifications"
            subtitle="Push, email, SMS & transaction alerts"
            icon="notifications-outline"
            items={notificationItems}
          />

          <SettingsAccordionCard
            title="Security & Privacy"
            subtitle="PIN, biometrics, login security"
            icon="shield-outline"
            items={securityItems}
          />

          <SettingsAccordionCard
            title="Banking"
            subtitle="Cards, automation, budgets, bills"
            icon="wallet-outline"
            items={bankingItems}
          />

          <SettingsAccordionCard
            title="Legal"
            subtitle="Privacy, terms, fees & pricing"
            icon="document-text-outline"
            items={legalItems}
          />

          <SettingsAccordionCard
            title="Support"
            subtitle="Help, FAQs & product tour"
            icon="help-circle-outline"
            items={supportItems}
          />
        </View>

        <Pressable
          onPress={() => router.replace(PATHS.signIn)}
          style={({ pressed }) => [
            styles.logoutButton,
            {
              opacity: pressed ? 0.82 : 1,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={16} color="#EF4444" />
          <AppText
            variant="body"
            weight="semibold"
            color="#EF4444"
            style={styles.logoutText}
          >
            Logout
          </AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 10,
    paddingHorizontal: 18,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  profileCard: {
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 16,
    lineHeight: 21,
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sections: {
    gap: 14,
  },
  logoutButton: {
    alignSelf: "center",
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    lineHeight: 20,
  },
});