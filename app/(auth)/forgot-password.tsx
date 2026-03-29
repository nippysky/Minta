/* eslint-disable react/no-unescaped-entities */
import { router } from "expo-router";
import { Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppBackButton from "@/src/components/ui/AppBackButton";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import AuthStepIndicator from "@/src/components/ui/AuthStepIndicator";
import BrandButton from "@/src/components/ui/BrandButton";
import BrandCard from "@/src/components/ui/BrandCard";
import BrandTextInput from "@/src/components/ui/BrandTextInput";
import GridBackground from "@/src/components/ui/GridBackground";
import OtpCodeInput from "@/src/components/ui/OtpCodeInput";
import { PATHS } from "@/src/constants/paths";
import { useForgotPasswordEmailForm } from "@/src/features/auth/hooks/useForgotPasswordEmailForm";
import { useResetPasswordForm } from "@/src/features/auth/hooks/useResetPasswordForm";
import type {
  ForgotPasswordEmailFormValues,
  ResetPasswordFormValues,
} from "@/src/features/auth/schemas/authSchemas";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";

const RESEND_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [emailForReset, setEmailForReset] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const emailForm = useForgotPasswordEmailForm();
  const resetForm = useResetPasswordForm();

  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, timeLeft]);

  const handleEmailSubmit = emailForm.handleSubmit(
    async (values: ForgotPasswordEmailFormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setEmailForReset(values.email);
      setStep(2);
      setTimeLeft(RESEND_SECONDS);

      showToast({
        type: "success",
        title: "Reset code sent",
        message: "Check your email for the 6-digit reset code.",
      });
    }
  );

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setCodeError("Enter the 6-digit code");
      return;
    }

    setVerifyingCode(true);
    setCodeError("");

    await new Promise((resolve) => setTimeout(resolve, 800));

    setVerifyingCode(false);
    setStep(3);

    showToast({
      type: "success",
      title: "Code confirmed",
      message: "You can now create a new password.",
    });
  };

  const handleResend = () => {
    if (timeLeft > 0) return;

    setTimeLeft(RESEND_SECONDS);

    showToast({
      type: "success",
      title: "Code resent",
      message: "A new reset code has been sent to your email.",
    });
  };

  const handleResetPassword = resetForm.handleSubmit(
    async (_values: ResetPasswordFormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 900));

      showToast({
        type: "success",
        title: "Password updated",
        message: "Your password has been reset successfully. Please sign in.",
      });

      router.replace(PATHS.signIn as any);
    }
  );

  return (
    <AppScreen>
      <GridBackground />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <AppBackButton />
        </View>

        <View style={styles.hero}>
          <AuthStepIndicator totalSteps={3} currentStep={step} />

          <AppText variant="title" weight="bold" style={styles.title}>
            Forgot password
          </AppText>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            {step === 1
              ? "Enter your email address to receive a reset code"
              : step === 2
              ? `Enter the 6-digit code sent to ${emailForReset}`
              : "Create a new password for your account"}
          </AppText>
        </View>

        <BrandCard style={styles.card}>
          {step === 1 ? (
            <View style={styles.form}>
              <Controller
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <BrandTextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    label="Email address"
                    icon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    error={emailForm.formState.errors.email?.message}
                  />
                )}
              />

              <BrandButton
                title="Send Code"
                onPress={handleEmailSubmit}
                disabled={!emailForm.formState.isValid || emailForm.formState.isSubmitting}
                loading={emailForm.formState.isSubmitting}
              />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.form}>
              <OtpCodeInput
                value={code}
                onChangeValue={(next) => {
                  setCode(next);
                  if (codeError) setCodeError("");
                }}
                error={codeError}
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
                title="Verify Code"
                onPress={handleVerifyCode}
                disabled={code.length !== 6 || verifyingCode}
                loading={verifyingCode}
              />
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.form}>
              <Controller
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <BrandTextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    label="New password"
                    icon="lock-closed-outline"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                    textContentType="newPassword"
                    error={resetForm.formState.errors.password?.message}
                  />
                )}
              />

              <Controller
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <BrandTextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    label="Confirm new password"
                    icon="shield-checkmark-outline"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                    textContentType="newPassword"
                    error={resetForm.formState.errors.confirmPassword?.message}
                  />
                )}
              />

              <BrandButton
                title="Update Password"
                onPress={handleResetPassword}
                disabled={!resetForm.formState.isValid || resetForm.formState.isSubmitting}
                loading={resetForm.formState.isSubmitting}
              />
            </View>
          ) : null}
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
    gap: 14,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 320,
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  form: {
    gap: 20,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
});