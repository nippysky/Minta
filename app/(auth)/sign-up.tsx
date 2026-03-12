import { router } from "expo-router";
import { Controller } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";

import AppBackButton from "@/src/components/ui/AppBackButton";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BrandButton from "@/src/components/ui/BrandButton";
import BrandCard from "@/src/components/ui/BrandCard";
import BrandTextInput from "@/src/components/ui/BrandTextInput";
import GridBackground from "@/src/components/ui/GridBackground";
import { PATHS } from "@/src/constants/paths";
import { useSignUpForm } from "@/src/features/auth/hooks/useSignUpForm";
import type { SignUpFormValues } from "@/src/features/auth/schemas/authSchemas";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";

export default function SignUpScreen() {
  const theme = useAppTheme();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useSignUpForm();

  const onSubmit = handleSubmit(async (values: SignUpFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 900));

    showToast({
      type: "success",
      title: "Account created",
      message: "We sent a verification code to your email address.",
    });

    router.push({
      pathname: PATHS.verifyEmail as any,
      params: {
        email: values.email,
      },
    });
  });

  return (
    <AppScreen>
      <GridBackground />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <AppBackButton />
        </View>

        <View style={styles.hero}>
          <AppText variant="title" weight="bold" style={styles.title}>
            Create your account
          </AppText>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            Start building your financial universe with Minta
          </AppText>
        </View>

        <BrandCard style={styles.card}>
          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <BrandTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  label="Full name"
                  icon="person-outline"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  error={errors.fullName?.message}
                />
              )}
            />

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
              name="phoneNumber"
              render={({ field }) => (
                <BrandTextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  label="Phone number"
                  icon="call-outline"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  error={errors.phoneNumber?.message}
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
                  autoComplete="password-new"
                  textContentType="newPassword"
                  error={errors.password?.message}
                />
              )}
            />

            <BrandButton
              title="Create Account"
              onPress={onSubmit}
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
            />
          </View>
        </BrandCard>

        <View style={styles.footer}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Already have an account?{" "}
          </AppText>

          <Pressable onPress={() => router.replace(PATHS.signIn as any)}>
            <AppText variant="body" color={theme.colors.tint} weight="semibold">
              Sign In
            </AppText>
          </Pressable>
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
    gap: 18,
  },
  footer: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
});