import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import PageBackButton from "@/src/components/ui/PageBackButton";
import { enableBiometricAuthentication } from "@/src/features/security/lib/deviceSecurity";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useAuth } from "@/src/providers/AuthProvider";
import { useSecurityPreferences } from "@/src/providers/SecurityPreferencesProvider";
import { useToast } from "@/src/providers/ToastProvider";

const SIZE = 104;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SecurityCenterScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { signOut } = useAuth();

  const {
    twoFactorEnabled,
    biometricEnabled,
    setTwoFactorEnabled,
    setBiometricEnabled,
    securityScore,
    fraudAlerts,
    loginHistory,
  } = useSecurityPreferences();

  const progress = securityScore / 100;
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const handleToggleTwoFactor = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Enable Two-Factor Authentication",
        "For now this demo enables 2FA locally. Later this will connect to your production backend for OTP or authenticator setup.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: () => {
              setTwoFactorEnabled(true);
              showToast({
                type: "success",
                title: "2FA enabled",
                message: "Two-factor authentication is now active.",
              });
            },
          },
        ]
      );
      return;
    }

    setTwoFactorEnabled(false);
    showToast({
      type: "success",
      title: "2FA disabled",
      message: "Two-factor authentication has been turned off.",
    });
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await enableBiometricAuthentication();

      if (result.success) {
        setBiometricEnabled(true);
        showToast({
          type: "success",
          title: "Biometric enabled",
          message: "Face ID / fingerprint login is now active.",
        });
      } else {
        setBiometricEnabled(false);
        showToast({
          type: "error",
          title: "Biometric setup failed",
          message: result.message,
        });
      }

      return;
    }

    setBiometricEnabled(false);
    showToast({
      type: "success",
      title: "Biometric disabled",
      message: "Biometric login has been turned off.",
    });
  };

  const handleOpenAlert = (title: string) => {
    showToast({
      type: "success",
      title: title,
      message: "Detailed alert view will be connected next.",
    });
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      "Logout from all devices",
      "This will sign you out everywhere. In production, this should revoke all server sessions and device tokens.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout All",
          style: "destructive",
          onPress: async () => {
            await signOut();
            showToast({
              type: "success",
              title: "Logged out everywhere",
              message: "All active sessions have been cleared.",
            });
            router.replace("/sign-in");
          },
        },
      ]
    );
  };

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
                Security Center
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Protect your account and data
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.scoreCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.scoreRingWrap}>
              <Svg width={SIZE} height={SIZE}>
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={theme.colors.borderSoft}
                  strokeWidth={STROKE}
                  fill="none"
                />
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={theme.colors.tint}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
              </Svg>

              <View style={styles.scoreIconWrap}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={28}
                  color={theme.colors.tint}
                />
              </View>
            </View>

            <AppText
              variant="title"
              weight="bold"
              color={theme.colors.tint}
              style={styles.scoreValue}
            >
              {securityScore}% Secure
            </AppText>

            <AppText
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.scoreSubtitle}
            >
              Your account security is excellent
            </AppText>
          </View>

          <View style={styles.sectionHeader}>
            <AppText variant="title" weight="bold" style={styles.sectionTitle}>
              Fraud Alerts
            </AppText>

            <AppText variant="body" color={theme.colors.textSecondary}>
              {fraudAlerts.length} alerts
            </AppText>
          </View>

          <View style={styles.alertList}>
            {fraudAlerts.map((alert) => {
              const accentColor =
                alert.tone === "danger" ? "#FF5A5A" : "#F4C21D";
              const iconColor =
                alert.tone === "danger" ? "#FF5A5A" : "#F4C21D";
              const iconBackground =
                alert.tone === "danger"
                  ? "rgba(255, 90, 90, 0.10)"
                  : "rgba(244, 194, 29, 0.14)";

              return (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.alertAccent,
                      {
                        backgroundColor: accentColor,
                      },
                    ]}
                  />

                  <View
                    style={[
                      styles.alertIconWrap,
                      {
                        backgroundColor: iconBackground,
                      },
                    ]}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={20}
                      color={iconColor}
                    />
                  </View>

                  <View style={styles.alertTextWrap}>
                    <AppText
                      variant="label"
                      weight="bold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.alertTitle}
                    >
                      {alert.title}
                    </AppText>

                    <AppText
                      variant="body"
                      color={theme.colors.textSecondary}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={styles.alertDescription}
                    >
                      {alert.description}
                    </AppText>

                    <AppText variant="body" color={theme.colors.textMuted}>
                      {alert.time}
                    </AppText>
                  </View>

                  <Pressable
                    onPress={() => handleOpenAlert(alert.title)}
                    style={styles.alertAction}
                    hitSlop={10}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={20}
                      color={theme.colors.text}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>

          <AppText variant="title" weight="bold" style={styles.sectionTitle}>
            Security Settings
          </AppText>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View
              style={[
                styles.settingRow,
                {
                  borderBottomColor: theme.colors.borderSoft,
                },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconWrap,
                    {
                      backgroundColor: "rgba(77, 230, 190, 0.14)",
                    },
                  ]}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={22}
                    color={theme.colors.tint}
                  />
                </View>

                <View style={styles.settingTextWrap}>
                  <AppText
                    variant="label"
                    weight="semibold"
                    style={styles.settingTitle}
                  >
                    Two-Factor Authentication
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.settingSubtitle}
                  >
                    Add extra security to your account
                  </AppText>
                </View>
              </View>

              <Switch
                value={twoFactorEnabled}
                onValueChange={handleToggleTwoFactor}
                trackColor={{
                  false: theme.colors.border,
                  true: "rgba(77, 230, 190, 0.88)",
                }}
                thumbColor="#000000"
                ios_backgroundColor={theme.colors.border}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconWrap,
                    {
                      backgroundColor: "rgba(77, 230, 190, 0.14)",
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color={theme.colors.tint}
                  />
                </View>

                <View style={styles.settingTextWrap}>
                  <AppText
                    variant="label"
                    weight="semibold"
                    style={styles.settingTitle}
                  >
                    Biometric Login
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.settingSubtitle}
                  >
                    Use Face ID or fingerprint
                  </AppText>
                </View>
              </View>

              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{
                  false: theme.colors.border,
                  true: "rgba(77, 230, 190, 0.88)",
                }}
                thumbColor="#000000"
                ios_backgroundColor={theme.colors.border}
              />
            </View>
          </View>

          <AppText variant="title" weight="bold" style={styles.sectionTitle}>
            Login History
          </AppText>

          <View
            style={[
              styles.historyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            {loginHistory.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.historyRow,
                  index !== loginHistory.length - 1
                    ? {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.borderSoft,
                      }
                    : null,
                ]}
              >
                <View
                  style={[
                    styles.historyIconWrap,
                    {
                      backgroundColor: item.isCurrent
                        ? "rgba(77, 230, 190, 0.14)"
                        : theme.colors.surfaceElevated,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.deviceIcon}
                    size={22}
                    color={
                      item.isCurrent
                        ? theme.colors.tint
                        : theme.colors.textSecondary
                    }
                  />
                </View>

                <View style={styles.historyTextWrap}>
                  <View style={styles.historyTitleRow}>
                    <AppText
                      variant="label"
                      weight="semibold"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={styles.historyDeviceName}
                    >
                      {item.deviceName}
                    </AppText>

                    {item.isCurrent ? (
                      <View
                        style={[
                          styles.currentPill,
                          {
                            backgroundColor: "rgba(77, 230, 190, 0.16)",
                          },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          weight="semibold"
                          color={theme.colors.tint}
                        >
                          Current
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color={theme.colors.textMuted}
                      />
                      <AppText
                        variant="caption"
                        color={theme.colors.textSecondary}
                      >
                        {item.location}
                      </AppText>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color={theme.colors.textMuted}
                      />
                      <AppText
                        variant="caption"
                        color={theme.colors.textSecondary}
                      >
                        {item.timeLabel}
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Pressable onPress={handleLogoutAllDevices} style={styles.logoutAllRow}>
            <Ionicons name="log-out-outline" size={17} color="#FF5A5A" />
            <AppText variant="body" weight="semibold" color="#FF5A5A">
              Logout from All Devices
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
    gap: 16,
  },
  header: {
    gap: 10,
  },
  headerText: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  scoreCard: {
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 8,
  },
  scoreRingWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreIconWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 18,
    lineHeight: 24,
  },
  scoreSubtitle: {
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  alertList: {
    gap: 10,
  },
  alertCard: {
    minHeight: 96,
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: 0,
    paddingRight: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  alertAccent: {
    width: 5,
    alignSelf: "stretch",
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    marginRight: 12,
  },
  alertIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  alertTextWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  alertTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  alertDescription: {
    lineHeight: 20,
  },
  alertAction: {
    paddingLeft: 10,
    paddingVertical: 8,
  },
  settingsCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    minHeight: 88,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  settingIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTextWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  settingTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  settingSubtitle: {
    lineHeight: 20,
  },
  historyCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  historyRow: {
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  historyTextWrap: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  historyDeviceName: {
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
  },
  currentPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  logoutAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
    marginBottom: 8,
  },
});