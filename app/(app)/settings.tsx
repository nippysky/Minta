import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/src/components/ui/AppText";
import SettingsAccordionCard, {
  type SettingsAccordionItem,
} from "@/src/components/settings/SettingsAccordionCard";
import { PATHS } from "@/src/constants/paths";
import { STORAGE_KEYS } from "@/src/constants/storage";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  type ThemePreference,
  useThemeMode,
} from "@/src/providers/ThemeProvider";
import { useToast } from "@/src/providers/ToastProvider";

type LanguageOption = {
  value: "en" | "pidgin" | "fr";
  title: string;
  subtitle: string;
  flag: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "en", title: "English", subtitle: "English", flag: "🇬🇧" },
  { value: "pidgin", title: "Pidgin", subtitle: "Nigerian Pidgin", flag: "🇳🇬" },
  { value: "fr", title: "Français", subtitle: "French", flag: "🇫🇷" },
];

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
  { value: "system", label: "System", icon: "desktop-outline" },
];

export default function SettingsScreen() {
  const theme = useAppTheme();
  const { themePreference, setThemePreference } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { showToast } = useToast();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [transactionAlertsEnabled, setTransactionAlertsEnabled] =
    useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const didMountRef = useRef(false);
  const prevPushRef = useRef(pushEnabled);
  const prevEmailRef = useRef(emailEnabled);
  const prevSmsRef = useRef(smsEnabled);
  const prevTxnRef = useRef(transactionAlertsEnabled);
  const prevBioRef = useRef(biometricEnabled);

  useEffect(() => {
    if (!didMountRef.current) return;
    if (prevPushRef.current !== pushEnabled) {
      prevPushRef.current = pushEnabled;
      showToast({
        type: "success",
        title: "Push notifications",
        message: pushEnabled
          ? "Push notifications enabled."
          : "Push notifications disabled.",
      });
    }
  }, [pushEnabled, showToast]);

  useEffect(() => {
    if (!didMountRef.current) return;
    if (prevEmailRef.current !== emailEnabled) {
      prevEmailRef.current = emailEnabled;
      showToast({
        type: "success",
        title: "Email notifications",
        message: emailEnabled
          ? "Email notifications enabled."
          : "Email notifications disabled.",
      });
    }
  }, [emailEnabled, showToast]);

  useEffect(() => {
    if (!didMountRef.current) return;
    if (prevSmsRef.current !== smsEnabled) {
      prevSmsRef.current = smsEnabled;
      showToast({
        type: "success",
        title: "SMS notifications",
        message: smsEnabled
          ? "SMS notifications enabled."
          : "SMS notifications disabled.",
      });
    }
  }, [smsEnabled, showToast]);

  useEffect(() => {
    if (!didMountRef.current) return;
    if (prevTxnRef.current !== transactionAlertsEnabled) {
      prevTxnRef.current = transactionAlertsEnabled;
      showToast({
        type: "success",
        title: "Transaction alerts",
        message: transactionAlertsEnabled
          ? "Transaction alerts enabled."
          : "Transaction alerts disabled.",
      });
    }
  }, [transactionAlertsEnabled, showToast]);

  useEffect(() => {
    if (!didMountRef.current) return;
    if (prevBioRef.current !== biometricEnabled) {
      prevBioRef.current = biometricEnabled;
      showToast({
        type: "success",
        title: "Biometric login",
        message: biometricEnabled
          ? "Biometric login enabled."
          : "Biometric login disabled.",
      });
    }
  }, [biometricEnabled, showToast]);

  useEffect(() => {
    didMountRef.current = true;
  }, []);

  const selectedLanguageMeta = useMemo(
    () =>
      LANGUAGE_OPTIONS.find((item) => item.value === language) ??
      LANGUAGE_OPTIONS[0],
    [language]
  );

  const handleThemeChange = async (value: ThemePreference) => {
    if (value === themePreference) return;

    await setThemePreference(value);

    showToast({
      type: "success",
      title: "Theme updated",
      message:
        value === "system"
          ? "App theme now follows your device preference."
          : `${value[0].toUpperCase()}${value.slice(1)} mode selected.`,
    });
  };

  const handleLanguageChange = async (value: "en" | "pidgin" | "fr") => {
    if (value === language) return;

    await setLanguage(value);

    const option = LANGUAGE_OPTIONS.find((item) => item.value === value);

    showToast({
      type: "success",
      title: "Language updated",
      message: `${option?.title ?? "Language"} selected.`,
    });
  };

  const handleRestartTour = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.hasSeenHomeTour);
    await AsyncStorage.setItem(STORAGE_KEYS.restartHomeTour, "true");

    showToast({
      type: "success",
      title: "Tour restarting",
      message: "Taking you back home to start the guide again.",
    });

    router.replace(PATHS.home);
  };

  const appearanceContent = (
    <View style={styles.appearancePanel}>
      <View style={styles.panelSection}>
        <AppText variant="title" weight="bold" style={styles.panelTitle}>
          Theme
        </AppText>

        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const selected = themePreference === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleThemeChange(option.value)}
                style={({ pressed }) => [
                  styles.themeCard,
                  {
                    backgroundColor: selected
                      ? theme.colors.tintSoft
                      : theme.colors.surfaceElevated,
                    borderColor: selected
                      ? theme.colors.tint
                      : theme.colors.borderSoft,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={26}
                  color={selected ? theme.colors.tint : theme.colors.textMuted}
                />

                <AppText
                  variant="body"
                  weight={selected ? "semibold" : "medium"}
                  color={selected ? theme.colors.tint : theme.colors.text}
                  style={styles.themeLabel}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.panelDivider,
          {
            backgroundColor: theme.colors.borderSoft,
          },
        ]}
      />

      <View style={styles.panelSection}>
        <View style={styles.languageHeader}>
          <Ionicons
            name="globe-outline"
            size={21}
            color={theme.colors.textMuted}
          />

          <View style={styles.languageHeaderText}>
            <AppText variant="title" weight="bold" style={styles.languageTitle}>
              App Language
            </AppText>

            <AppText variant="body" color={theme.colors.textSecondary}>
              {selectedLanguageMeta.flag} {selectedLanguageMeta.title}
            </AppText>
          </View>
        </View>

        <View style={styles.languageList}>
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = option.value === language;

            return (
              <Pressable
                key={option.value}
                onPress={() => handleLanguageChange(option.value)}
                style={({ pressed }) => [
                  styles.languageCard,
                  {
                    backgroundColor: selected
                      ? theme.colors.tintSoft
                      : theme.colors.surfaceElevated,
                    borderColor: selected
                      ? theme.colors.tint
                      : "transparent",
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <View style={styles.languageLeft}>
                  <AppText variant="title" style={styles.flagText}>
                    {option.flag}
                  </AppText>

                  <View style={styles.languageCopy}>
                    <AppText
                      variant="body"
                      weight={selected ? "semibold" : "medium"}
                      color={theme.colors.text}
                      style={styles.languageCardTitle}
                    >
                      {option.title}
                    </AppText>

                    <AppText
                      variant="caption"
                      color={theme.colors.textSecondary}
                      style={styles.languageCardSubtitle}
                    >
                      {option.subtitle}
                    </AppText>
                  </View>
                </View>

                {selected ? (
                  <View
                    style={[
                      styles.checkWrap,
                      {
                        backgroundColor: theme.colors.tint,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color={theme.colors.primaryText}
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

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
      onPress: () => router.push(PATHS.privacyPolicy),
    },
    {
      id: "terms",
      label: "Terms of Service",
      description: "Our terms and conditions",
      icon: "receipt-outline",
      type: "link",
      onPress: () => router.push(PATHS.termsOfService),
    },
    {
      id: "fees",
      label: "Fees & Pricing",
      description: "Transparent fee structure",
      icon: "cash-outline",
      type: "link",
      onPress: () => router.push(PATHS.feeTransparency),
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
      description: "Go back home and start the guide again",
      icon: "play-outline",
      type: "link",
      highlight: true,
      onPress: handleRestartTour,
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
            paddingTop: 10,
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
              <AppText
                variant="body"
                weight="semibold"
                color={theme.colors.tint}
              >
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
            defaultExpanded
            customContent={appearanceContent}
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
  appearancePanel: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
  },
  panelSection: {
    gap: 14,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  themeRow: {
    flexDirection: "row",
    gap: 12,
  },
  themeCard: {
    flex: 1,
    minHeight: 132,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  themeLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  panelDivider: {
    height: 1,
    marginVertical: 16,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  languageHeaderText: {
    flex: 1,
    gap: 2,
  },
  languageTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  languageList: {
    gap: 12,
  },
  languageCard: {
    minHeight: 86,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  languageLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flagText: {
    fontSize: 20,
    lineHeight: 24,
  },
  languageCopy: {
    flex: 1,
    gap: 2,
  },
  languageCardTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  languageCardSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  checkWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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