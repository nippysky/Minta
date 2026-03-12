/* eslint-disable react/no-unescaped-entities */
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppBackButton from "@/src/components/ui/AppBackButton";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BrandButton from "@/src/components/ui/BrandButton";
import BrandCard from "@/src/components/ui/BrandCard";
import GridBackground from "@/src/components/ui/GridBackground";
import OtpCodeInput from "@/src/components/ui/OtpCodeInput";
import { PATHS } from "@/src/constants/paths";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";

const RESEND_SECONDS = 60;

export default function VerifyEmailScreen() {
  const theme = useAppTheme();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ email?: string }>();

  const email = useMemo(() => String(params.email ?? ""), [params.email]);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (timeLeft > 0) return;

    setTimeLeft(RESEND_SECONDS);
    showToast({
      type: "success",
      title: "Code resent",
      message: "A fresh verification code has been sent to your email.",
    });
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setSubmitting(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 900));

    setSubmitting(false);

    showToast({
      type: "success",
      title: "Email verified",
      message: "Your account is ready to go.",
    });

    router.replace(PATHS.home as any);
  };

  return (
    <AppScreen>
      <GridBackground />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <AppBackButton />
        </View>

        <View style={styles.hero}>
          <AppText variant="title" weight="bold" style={styles.title}>
            Verify your email
          </AppText>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            Enter the 6-digit code sent to {email || "your email address"}
          </AppText>
        </View>

        <BrandCard style={styles.card}>
          <View style={styles.form}>
            <OtpCodeInput
              value={code}
              onChangeValue={(next) => {
                setCode(next);
                if (error) setError("");
              }}
              error={error}
            />

            <View style={styles.resendRow}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Didn't get code?
              </AppText>

              <Pressable onPress={handleResend} disabled={timeLeft > 0}>
                <AppText
                  variant="body"
                  weight="semibold"
                  color={timeLeft > 0 ? theme.colors.textMuted : theme.colors.tint}
                >
                  Resend
                </AppText>
              </Pressable>

              <AppText variant="body" color={theme.colors.textMuted}>
                {timeLeft > 0 ? `00:${String(timeLeft).padStart(2, "0")}` : ""}
              </AppText>
            </View>

            <BrandButton
              title="Verify Email"
              onPress={handleVerify}
              disabled={code.length !== 6 || submitting}
              loading={submitting}
            />
          </View>
        </BrandCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 18,
    left: 24,
    zIndex: 10,
  },
  hero: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    maxWidth: 320,
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  form: {
    gap: 22,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
});