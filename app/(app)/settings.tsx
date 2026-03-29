import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SettingsAccordionCard, {
  type SettingsAccordionItem,
} from "@/src/components/settings/SettingsAccordionCard";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import PageBackButton from "@/src/components/ui/PageBackButton";
import { STORAGE_KEYS } from "@/src/constants/storage";
import { mockHomeData } from "@/src/features/home/data/mockHome";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useAuth } from "@/src/providers/AuthProvider";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { type ThemePreference, useThemeMode } from "@/src/providers/ThemeProvider";

export default function SettingsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { themePreference, setThemePreference } = useThemeMode();
  const { language, setLanguage, t } = useLanguage();

  const user = mockHomeData.user;

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(true);

  const sections = useMemo<
    {
      id: string;
      title: string;
      subtitle: string;
      icon: keyof typeof Ionicons.glyphMap;
      items: SettingsAccordionItem[];
    }[]
  >(
    () => [
      {
        id: "appearance",
        title: t("settings.appearanceTitle"),
        subtitle: t("settings.appearanceSubtitle"),
        icon: "color-palette-outline",
        items: [
          {
            type: "theme-selector",
            value: themePreference,
            onChange: async (value: ThemePreference) => {
              await setThemePreference(value);
            },
          },
          {
            type: "language-selector",
            label: t("common.appLanguage"),
            value: language,
            onChange: (value: string) => {
              void setLanguage(value as "en" | "pidgin" | "fr");
            },
            options: [
              {
                key: "en",
                flag: "🇬🇧",
                label: t("common.english"),
                subtitle: "English",
              },
              {
                key: "pidgin",
                flag: "🇳🇬",
                label: t("common.pidgin"),
                subtitle: "Nigerian Pidgin",
              },
              {
                key: "fr",
                flag: "🇫🇷",
                label: t("common.french"),
                subtitle: "French",
              },
            ],
          },
        ],
      },
      {
        id: "notifications",
        title: t("settings.notificationsTitle"),
        subtitle: t("settings.notificationsSubtitle"),
        icon: "notifications-outline",
        items: [
          {
            type: "toggle",
            icon: "notifications-outline",
            label: t("settings.pushNotifications"),
            subtitle: t("settings.pushNotificationsSub"),
            value: pushNotifications,
            onToggle: setPushNotifications,
          },
          {
            type: "toggle",
            icon: "mail-outline",
            label: t("settings.emailNotifications"),
            subtitle: t("settings.emailNotificationsSub"),
            value: emailNotifications,
            onToggle: setEmailNotifications,
          },
          {
            type: "toggle",
            icon: "chatbox-outline",
            label: t("settings.smsNotifications"),
            subtitle: t("settings.smsNotificationsSub"),
            value: smsNotifications,
            onToggle: setSmsNotifications,
          },
          {
            type: "toggle",
            icon: "trending-up-outline",
            label: t("settings.transactionAlerts"),
            subtitle: t("settings.transactionAlertsSub"),
            value: transactionAlerts,
            onToggle: setTransactionAlerts,
          },
        ],
      },
      {
        id: "security",
        title: t("settings.securityTitle"),
        subtitle: t("settings.securitySubtitle"),
        icon: "shield-outline",
        items: [
          {
            type: "link",
            icon: "shield-outline",
            label: t("settings.securityCenter"),
            subtitle: t("settings.securityCenterSub"),
            onPress: () => {},
          },
          {
            type: "link",
            icon: "key-outline",
            label: t("settings.changePin"),
            subtitle: t("settings.changePinSub"),
            onPress: () => {},
          },
          {
            type: "toggle",
            icon: "finger-print-outline",
            label: t("settings.biometricLogin"),
            subtitle: t("settings.biometricLoginSub"),
            value: biometricLogin,
            onToggle: setBiometricLogin,
          },
        ],
      },
      {
        id: "banking",
        title: t("settings.bankingTitle"),
        subtitle: t("settings.bankingSubtitle"),
        icon: "wallet-outline",
        items: [
          {
            type: "link",
            icon: "card-outline",
            label: t("settings.cardManagement"),
            subtitle: t("settings.cardManagementSub"),
            onPress: () => {},
          },
          {
            type: "link",
            icon: "flash-outline",
            label: t("settings.automationRules"),
            subtitle: t("settings.automationRulesSub"),
            onPress: () => {},
          },
          {
            type: "link",
            icon: "wallet-outline",
            label: t("settings.budgetManagement"),
            subtitle: t("settings.budgetManagementSub"),
            onPress: () => {},
          },
          {
            type: "link",
            icon: "calendar-outline",
            label: t("settings.billsReminders"),
            subtitle: t("settings.billsRemindersSub"),
            onPress: () => {},
          },
        ],
      },
      {
        id: "legal",
        title: t("settings.legalTitle"),
        subtitle: t("settings.legalSubtitle"),
        icon: "document-text-outline",
        items: [
          {
            type: "link",
            icon: "shield-outline",
            label: t("settings.privacyPolicy"),
            subtitle: t("settings.privacyPolicySub"),
            onPress: () => {},
          },
          {
            type: "link",
            icon: "document-text-outline",
            label: t("settings.termsOfService"),
            subtitle: t("settings.termsOfServiceSub"),
            onPress: () => {},
          },
          {
            type: "link",
            icon: "cash-outline",
            label: t("settings.feesPricing"),
            subtitle: t("settings.feesPricingSub"),
            onPress: () => {},
          },
        ],
      },
      {
        id: "support",
        title: t("settings.supportTitle"),
        subtitle: t("settings.supportSubtitle"),
        icon: "help-circle-outline",
        items: [
          {
            type: "link",
            icon: "help-circle-outline",
            label: t("common.helpSupport"),
            subtitle: t("settings.helpSupportSub"),
            onPress: () => {},
          },
          {
            type: "action",
            icon: "play-outline",
            label: t("common.restartProductTour"),
            subtitle: t("common.walkThroughFeatures"),
            highlight: true,
            onPress: async () => {
              await AsyncStorage.setItem(STORAGE_KEYS.restartHomeTour, "true");
              router.replace("/(app)/(tabs)/home");
            },
          },
        ],
      },
    ],
    [
      biometricLogin,
      emailNotifications,
      language,
      pushNotifications,
      setLanguage,
      setThemePreference,
      smsNotifications,
      t,
      themePreference,
      transactionAlerts,
    ]
  );

  return (
    <AppScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: 10,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: insets.bottom + 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <PageBackButton />

            <View style={styles.headerText}>
              <AppText variant="hero" weight="bold" style={styles.headerTitle}>
                {t("common.settings")}
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {t("common.managePreferences")}
              </AppText>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/(app)/profile")}
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.profileLeft}>
              <View style={styles.profileAvatar}>
                <View style={styles.profileAvatarInner}>
                  <AppText variant="title" weight="bold" color="#06110D">
                    {user.initials.slice(0, 1)}
                  </AppText>
                </View>
              </View>

              <View style={styles.profileText}>
                <AppText variant="title" weight="bold" style={styles.profileName}>
                  {user.fullName}
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {user.email}
                </AppText>

                <View style={styles.profileMetaRow}>
                  {user.verified ? (
                    <AppText variant="body" weight="semibold" color={theme.colors.tint}>
                      {t("common.verified")}
                    </AppText>
                  ) : null}
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {user.verified ? " • " : ""}
                    {t("common.level3")}
                  </AppText>
                </View>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {sections.map((section) => (
            <SettingsAccordionCard
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              icon={section.icon}
              items={section.items}
            />
          ))}

          <Pressable
            onPress={async () => {
              await signOut();
            }}
            style={styles.logoutRow}
          >
            <Ionicons name="log-out-outline" size={18} color="#FF4D4F" />
            <AppText variant="body" weight="semibold" color="#FF4D4F">
              {t("common.logout")}
            </AppText>
          </Pressable>
        </ScrollView>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  header: {
    gap: 12,
  },
  headerText: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  profileCard: {
    minHeight: 112,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    paddingRight: 10,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
  },
  profileAvatarInner: {
    flex: 1,
    backgroundColor: "#61F2CF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    lineHeight: 22,
  },
  profileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 20,
  },
});