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

type SectionCardProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  bullets?: string[];
};

function SectionCard({ icon, title, body, bullets }: SectionCardProps) {
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
        {icon ? (
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
        ) : null}

        <AppText variant="title" weight="bold" style={styles.cardTitle}>
          {title}
        </AppText>
      </View>

      {body ? (
        <AppText variant="body" color={theme.colors.textSecondary} style={styles.bodyText}>
          {body}
        </AppText>
      ) : null}

      {bullets ? (
        <View style={styles.bulletList}>
          {bullets.map((item) => (
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
      ) : null}
    </View>
  );
}

export default function TermsOfServiceScreen() {
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
   <AppBackButton/>

            <View style={styles.headerCopy}>
              <AppText variant="hero" weight="bold" style={styles.headerTitle}>
                Terms of Service
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Effective: December 2024
              </AppText>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={70}>
          <View
            style={[
              styles.noticeCard,
              {
                borderColor: "rgba(245,158,11,0.24)",
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.noticeStripe,
                { backgroundColor: "#F59E0B" },
              ]}
            />

            <View style={styles.noticeContent}>
              <View style={styles.noticeHeader}>
                <Ionicons name="warning-outline" size={22} color="#F59E0B" />
                <AppText variant="body" weight="bold" color="#F59E0B">
                  Important Notice
                </AppText>
              </View>

              <AppText variant="body" color={theme.colors.textSecondary} style={styles.bodyText}>
                MiNTA is a financial aggregator platform, NOT a bank. We do not
                hold deposits, issue loans, or provide investment advice. AI
                suggestions are informational only and do not constitute
                financial advice.
              </AppText>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={120}>
          <SectionCard
            title="Acceptance of Terms"
            body="By creating an account or using MiNTA, you agree to these Terms of Service. If you do not agree, please do not use our services. We may update these terms periodically, and continued use constitutes acceptance of changes."
          />
        </FadeInUp>

        <FadeInUp delay={170}>
          <SectionCard
            icon="document-text-outline"
            title="Service Description"
            body="MiNTA is a financial aggregation and management platform. We are NOT a bank, deposit-taking institution, or investment advisor. We connect to your existing financial accounts to provide a unified view and insights."
          />
        </FadeInUp>

        <FadeInUp delay={220}>
          <SectionCard
            icon="people-outline"
            title="User Responsibilities"
            bullets={[
              "Provide accurate and up-to-date information",
              "Maintain the confidentiality of your login credentials",
              "Use the platform only for lawful purposes",
              "Report any unauthorized access immediately",
              "Keep your linked account information current",
            ]}
          />
        </FadeInUp>

        <FadeInUp delay={270}>
          <SectionCard
            icon="shield-outline"
            title="Account Security"
            bullets={[
              "Create a strong, unique password",
              "Enable two-factor authentication",
              "Never share your PIN with anyone",
              "Log out from shared devices",
              "Review your transactions regularly",
            ]}
          />
        </FadeInUp>

        <FadeInUp delay={320}>
          <SectionCard
            icon="warning-outline"
            title="Limitations of Liability"
            body="MiNTA is not responsible for: decisions made based on AI suggestions, third-party service disruptions, losses from unauthorized access due to user negligence, or accuracy of data from linked institutions."
          />
        </FadeInUp>

        <FadeInUp delay={370}>
          <SectionCard
            icon="scale-outline"
            title="Dispute Resolution"
            body="Any disputes arising from these terms shall be resolved through arbitration in Lagos, Nigeria, in accordance with Nigerian law. Users agree to attempt informal resolution before pursuing formal proceedings."
          />
        </FadeInUp>

        <FadeInUp delay={420}>
          <SectionCard
            icon="hammer-outline"
            title="Governing Law"
            body="These terms are governed by the laws of the Federal Republic of Nigeria. All legal proceedings shall be conducted in courts located in Lagos State."
          />
        </FadeInUp>

        <FadeInUp delay={470}>
          <SectionCard
            title="Termination"
            body="You may close your account at any time through the app settings. We reserve the right to suspend or terminate access in cases of fraud, abuse, or violations of these terms."
          />
        </FadeInUp>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10
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

  noticeCard: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
    flexDirection: "row",
  },
  noticeStripe: {
    width: 6,
  },
  noticeContent: {
    flex: 1,
    padding: 18,
    gap: 12,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  bodyText: {
    lineHeight: 20,
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
});