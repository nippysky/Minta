/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Controller } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BrandButton from "@/src/components/ui/BrandButton";
import BrandCard from "@/src/components/ui/BrandCard";
import BrandSwitch from "@/src/components/ui/BrandSwitch";
import BrandTextInput from "@/src/components/ui/BrandTextInput";
import GridBackground from "@/src/components/ui/GridBackground";
import { PATHS } from "@/src/constants/paths";
import { useSignInForm } from "@/src/features/auth/hooks/useSignInForm";
import type { SignInFormValues } from "@/src/features/auth/schemas/authSchemas";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useAuth } from "@/src/providers/AuthProvider";
import { useToast } from "@/src/providers/ToastProvider";

export default function SignInScreen() {
  const theme = useAppTheme();
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useSignInForm();

  const onSubmit = handleSubmit(async (values: SignInFormValues) => {
    console.log("Sign in payload:", values);

    await new Promise((resolve) => setTimeout(resolve, 900));

    await signIn("mock-auth-token");

    showToast({
      type: "success",
      title: "Welcome back",
      message: "You have signed in successfully.",
    });

    router.replace(PATHS.home as any);
  });

  return (
    <AppScreen>
      <GridBackground />

      <View style={styles.container}>
        <View style={styles.hero}>
          <View
            style={[
              styles.heroMarkWrap,
              {
                backgroundColor: theme.colors.glow,
              },
            ]}
          >
            <AppText
              variant="hero"
              weight="bold"
              style={[
                styles.heroMark,
                {
                  color: theme.colors.tint,
                },
              ]}
            >
              M
            </AppText>
          </View>

          <View style={styles.heroTextWrap}>
            <View style={styles.heroTitleRow}>
              <AppText variant="hero" weight="bold" style={styles.heroTitle}>
                Welcome
              </AppText>

              <AppText
                variant="hero"
                weight="bold"
                style={[styles.heroTitle, { color: theme.colors.tint }]}
              >
                back
              </AppText>
            </View>

            <AppText
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.heroSubtitle}
            >
              Sign in to continue to your account
            </AppText>
          </View>
        </View>

        <BrandCard style={styles.card}>
          <View style={styles.form}>
            <Controller
              control={control}
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
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <BrandTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  label="Password"
                  icon="lock-closed-outline"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  error={errors.password?.message}
                />
              )}
            />

            <View style={styles.rowBetween}>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <BrandSwitch
                    label="Remember me"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Pressable onPress={() => router.push(PATHS.forgotPassword as any)}>
                <AppText variant="label" color={theme.colors.tint} weight="medium">
                  Forgot password?
                </AppText>
              </Pressable>
            </View>

            <View style={styles.primaryButtonWrap}>
              <BrandButton
                title="Sign In"
                onPress={onSubmit}
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              />
            </View>
          </View>
        </BrandCard>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={theme.colors.tint}
            />
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Bank-grade encryption
            </AppText>
          </View>

          <View style={styles.signupRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Don't have an account?{" "}
            </AppText>

            <Pressable onPress={() => router.push(PATHS.signUp as any)}>
              <AppText variant="body" color={theme.colors.tint} weight="semibold">
                Create Account
              </AppText>
            </Pressable>
          </View>
        </View>
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
  hero: {
    alignItems: "center",
    marginBottom: 44,
  },
  heroMarkWrap: {
    width: 156,
    height: 156,
    borderRadius: 78,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  heroMark: {
    fontSize: 72,
    lineHeight: 76,
  },
  heroTextWrap: {
    alignItems: "center",
    gap: 8,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: 10,
  },
  heroTitle: {
    textAlign: "center",
    fontSize: 42,
    lineHeight: 48,
    includeFontPadding: false,
  },
  heroSubtitle: {
    textAlign: "center",
    marginTop: 2,
    paddingHorizontal: 8,
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  form: {
    gap: 20,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  primaryButtonWrap: {
    marginTop: 6,
  },
  footer: {
    marginTop: 34,
    alignItems: "center",
    gap: 20,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
});