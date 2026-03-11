import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BrandButton from "@/src/components/ui/BrandButton";
import BrandCard from "@/src/components/ui/BrandCard";
import BrandTextInput from "@/src/components/ui/BrandTextInput";
import GridBackground from "@/src/components/ui/GridBackground";
import MintaLogo from "@/src/components/ui/MintaLogo";
import RememberMeSwitch from "@/src/components/ui/RememberMeSwitch";
import { useAppTheme } from "@/src/hooks/useAppTheme";

export default function SignInScreen() {
  const theme = useAppTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <AppScreen>
      <GridBackground />

      <View style={styles.container}>
        <View style={styles.hero}>
          <MintaLogo size={82} />

          <View style={styles.heroTextWrap}>
            <AppText variant="hero" style={styles.heroTitle}>
              Welcome{" "}
              <AppText
                variant="hero"
                style={{ color: theme.colors.tintAlt, fontWeight: "700" }}
              >
                back
              </AppText>
            </AppText>

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
            <BrandTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              icon="mail-outline"
              keyboardType="email-address"
            />

            <BrandTextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              icon="lock-closed-outline"
              secureTextEntry
            />

            <View style={styles.rowBetween}>
              <RememberMeSwitch value={rememberMe} onChange={setRememberMe} />

              <Pressable>
                <AppText variant="label" color={theme.colors.tint}>
                  Forgot password?
                </AppText>
              </Pressable>
            </View>

            <BrandButton title="Sign In" onPress={() => {}} />

            <View style={styles.dividerWrap}>
              <View
                style={[styles.dividerLine, { backgroundColor: theme.colors.borderSoft }]}
              />
              <AppText variant="caption" color={theme.colors.textMuted}>
                OR
              </AppText>
              <View
                style={[styles.dividerLine, { backgroundColor: theme.colors.borderSoft }]}
              />
            </View>

            <BrandButton
              title="Try Demo"
              variant="secondary"
              onPress={() => {}}
              leftSlot={<Ionicons name="sparkles" size={18} color="#F7C948" />}
            />
          </View>
        </BrandCard>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.tint} />
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Bank-grade encryption
            </AppText>
          </View>

          <View style={styles.signupRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Don&apos;t have an account?{" "}
            </AppText>
            <Pressable>
              <AppText variant="body" color={theme.colors.tint} weight="600">
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
    paddingHorizontal: 20,
    justifyContent: "center"
  },
  hero: {
    alignItems: "center",
    marginBottom: 30
  },
  heroTextWrap: {
    alignItems: "center",
    marginTop: 22
  },
  heroTitle: {
    textAlign: "center"
  },
  heroSubtitle: {
    textAlign: "center",
    marginTop: 10
  },
  card: {
    padding: 20
  },
  form: {
    gap: 16
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  footer: {
    marginTop: 26,
    alignItems: "center",
    gap: 18
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap"
  }
});