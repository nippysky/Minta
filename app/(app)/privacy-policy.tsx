import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import AppBackButton from "@/src/components/ui/AppBackButton";

type FadeInUpProps = {
  delay?: number;
  children: React.ReactNode;
};

function FadeInUp({ delay = 0, children }: FadeInUpProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 460,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

type PolicyCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
};

function PolicyCard({ icon, title, children }: PolicyCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: theme.colors.surfaceElevated,
            },
          ]}
        >
          <Ionicons name={icon} size={21} color={theme.colors.textMuted} />
        </View>

        <AppText variant="title" weight="bold" style={styles.cardTitle}>
          {title}
        </AppText>
      </View>

      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  const theme = useAppTheme();

  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View
            style={[
              styles.bulletDot,
              { backgroundColor: theme.colors.tint },
            ]}
          />
          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.bulletText}
          >
            {item}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const theme = useAppTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInUp delay={20}>
          <View style={styles.header}>
            <AppBackButton />

            <View style={styles.headerCopy}>
              <AppText variant="hero" weight="bold" style={styles.headerTitle}>
                Privacy Policy
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Last updated: December 2024
              </AppText>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={70}>
          <View
            style={[
              styles.heroCard,
              {
                borderColor: theme.colors.borderSoft,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.heroGlow,
                { backgroundColor: theme.colors.tintSoft },
              ]}
            />

            <View
              style={[
                styles.heroIcon,
                { backgroundColor: theme.colors.tintSoft },
              ]}
            >
              <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.tint} />
            </View>

            <View style={styles.heroCopy}>
              <AppText variant="title" weight="bold" style={styles.heroTitle}>
                Our Commitment to Privacy
              </AppText>
              <AppText
                variant="body"
                color={theme.colors.textSecondary}
                style={styles.heroText}
              >
                At MiNTA, your privacy is our priority. We are committed to
                protecting your personal and financial information with the
                highest security standards. This policy explains how we collect,
                use, and safeguard your data.
              </AppText>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={120}>
          <View
            style={[
              styles.highlightCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View
              style={[
                styles.highlightStripe,
                { backgroundColor: theme.colors.tint },
              ]}
            />
            <View style={styles.highlightContent}>
              <View style={styles.highlightHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={theme.colors.tint}
                />
                <AppText variant="title" weight="bold" style={styles.highlightTitle}>
                  NDPR Compliance
                </AppText>
              </View>

              <AppText variant="body" color={theme.colors.textSecondary}>
                MiNTA fully complies with the Nigeria Data Protection Regulation
                (NDPR). We process your data lawfully, fairly, and
                transparently.
              </AppText>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={170}>
          <PolicyCard icon="server-outline" title="Data We Collect">
            <BulletList
              items={[
                "Account information (name, email, phone number)",
                "Financial data from linked bank accounts",
                "Transaction history and spending patterns",
                "Device information for security purposes",
                "Usage data to improve our services",
              ]}
            />
          </PolicyCard>
        </FadeInUp>

        <FadeInUp delay={220}>
          <PolicyCard icon="eye-outline" title="How We Use Your Data">
            <BulletList
              items={[
                "Provide personalized financial insights",
                "Process transactions and transfers",
                "Detect and prevent fraud",
                "Improve our AI recommendations",
                "Send important account notifications",
              ]}
            />
          </PolicyCard>
        </FadeInUp>

        <FadeInUp delay={270}>
          <PolicyCard icon="lock-closed-outline" title="Data Protection">
            <BulletList
              items={[
                "256-bit AES encryption for all data",
                "Secure data centers in Nigeria",
                "Regular security audits and penetration testing",
                "Two-factor authentication available",
                "Biometric login options",
              ]}
            />
          </PolicyCard>
        </FadeInUp>

        <FadeInUp delay={320}>
          <PolicyCard icon="person-outline" title="Your Rights">
            <BulletList
              items={[
                "Access your personal data anytime",
                "Request correction of inaccurate data",
                "Delete your account and data",
                "Export your data in standard formats",
                "Opt-out of marketing communications",
              ]}
            />
          </PolicyCard>
        </FadeInUp>

        <FadeInUp delay={370}>
          <View
            style={[
              styles.contactCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.contactHeader}>
              <Ionicons
                name="mail-outline"
                size={22}
                color={theme.colors.tint}
              />
              <AppText variant="title" weight="bold" style={styles.cardTitle}>
                Contact Us
              </AppText>
            </View>

            <AppText variant="body" color={theme.colors.textSecondary}>
              For privacy-related inquiries or to exercise your data rights:
            </AppText>

            <AppText variant="body" weight="bold" color={theme.colors.tint}>
              privacy@minta.ng
            </AppText>
          </View>
        </FadeInUp>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:10
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 36,
    gap: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 36,
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
    padding: 18,
    flexDirection: "row",
    gap: 16,
    position: "relative",
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroText: {
    lineHeight: 20,
  },

  highlightCard: {
    borderWidth: 1,
    borderRadius: 26,
    overflow: "hidden",
    flexDirection: "row",
  },
  highlightStripe: {
    width: 6,
  },
  highlightContent: {
    flex: 1,
    padding: 18,
    gap: 10,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  highlightTitle: {
    fontSize: 16,
    lineHeight: 22,
  },

  card: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  cardBody: {
    gap: 10,
  },

  bulletList: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },

  contactCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 12,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});