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

function CheckRow({ label }: { label: string }) {
  const theme = useAppTheme();

  return (
    <View style={styles.checkRow}>
      <View
        style={[
          styles.checkWrap,
          { backgroundColor: theme.colors.tintSoft },
        ]}
      >
        <Ionicons name="checkmark" size={16} color={theme.colors.tint} />
      </View>

      <AppText variant="body" weight="bold" style={styles.checkText}>
        {label}
      </AppText>
    </View>
  );
}

export default function FeeTransparencyScreen() {
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
                Fee Transparency
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Clear pricing, no surprises
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
                No Hidden Fees Pledge
              </AppText>
              <AppText
                variant="body"
                color={theme.colors.textSecondary}
                style={styles.heroText}
              >
                We commit to complete transparency in all charges. You will
                always know exactly what you&apos;re paying and why. If a fee
                applies, we&lsquo;ll show it before you confirm any action.
              </AppText>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={120}>
          <View style={styles.sectionWrap}>
            <View style={styles.inlineTitle}>
              <Ionicons name="gift-outline" size={24} color={theme.colors.tint} />
              <AppText variant="hero" weight="bold" style={styles.sectionTitle}>
                Free Forever
              </AppText>
            </View>

            <View
              style={[
                styles.bigCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              {[
                "Account linking and aggregation",
                "Balance viewing across all banks",
                "Transaction history and search",
                "Budget creation and tracking",
                "Savings goals management",
                "Basic AI financial insights",
                "Bill reminders",
                "Push notifications",
              ].map((item) => (
                <CheckRow key={item} label={item} />
              ))}
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={170}>
          <View style={styles.sectionWrap}>
            <View style={styles.inlineTitle}>
              <Ionicons name="pricetag-outline" size={24} color={theme.colors.tint} />
              <AppText variant="hero" weight="bold" style={styles.sectionTitle}>
                Premium Features
              </AppText>
            </View>

            <View
              style={[
                styles.bigCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              {[
                ["Advanced AI recommendations", "Coming Soon"],
                ["Investment portfolio tracking", "Free Beta"],
                ["Detailed spending analytics", "Free Beta"],
                ["Automated savings rules", "Free Beta"],
                ["Priority customer support", "Coming Soon"],
              ].map(([label, badge]) => (
                <View key={label} style={styles.premiumRow}>
                  <AppText variant="body" weight="bold" style={styles.premiumLabel}>
                    {label}
                  </AppText>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: theme.colors.tintSoft },
                    ]}
                  >
                    <AppText
                      variant="body"
                      weight="medium"
                      color={theme.colors.tint}
                    >
                      {badge}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={220}>
          <View style={styles.sectionWrap}>
            <View style={styles.inlineTitle}>
              <Ionicons name="cash-outline" size={24} color={theme.colors.textMuted} />
              <AppText variant="hero" weight="bold" style={styles.sectionTitle}>
                Transaction Fees
              </AppText>
            </View>

            <View
              style={[
                styles.bigCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              {[
                ["Inter-bank transfers", "Charged by banks, not MiNTA", "₦10 - ₦50"],
                ["Same-bank transfers", "", "Free"],
                ["Bill payments", "No MiNTA markup", "Free"],
                ["Card transactions", "Standard card fees may apply", "Free"],
                ["Investment trades", "MiNTA adds no extra charge", "Platform fees only"],
              ].map(([title, subtitle, value], index, arr) => (
                <View
                  key={title}
                  style={[
                    styles.feeRow,
                    index !== arr.length - 1 && [
                      styles.feeRowBorder,
                      { borderBottomColor: theme.colors.borderSoft },
                    ],
                  ]}
                >
                  <View style={styles.feeLeft}>
                    <AppText variant="body" weight="bold" style={styles.feeTitle}>
                      {title}
                    </AppText>
                    {!!subtitle && (
                      <AppText variant="body" color={theme.colors.textSecondary}>
                        {subtitle}
                      </AppText>
                    )}
                  </View>

                  <AppText
                    variant="body"
                    weight="semibold"
                    color={value === "Free" ? theme.colors.tint : theme.colors.text}
                    style={styles.feeValue}
                  >
                    {value}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={270}>
          <View style={styles.sectionWrap}>
            <View style={styles.inlineTitle}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={theme.colors.textMuted}
              />
              <AppText variant="hero" weight="bold" style={styles.sectionTitle}>
                Common Questions
              </AppText>
            </View>

            <View style={styles.faqList}>
              {[
                [
                  "Does MiNTA charge hidden fees?",
                  "No. We believe in complete transparency. Any fees you see are from partner banks or platforms, not hidden charges from MiNTA.",
                ],
                [
                  "How does MiNTA make money?",
                  "We earn through partner commissions on products you choose to use, premium features (coming soon), and referral partnerships. We never sell your data.",
                ],
                [
                  "Will premium features lock free features?",
                  "No. Core features like account linking, budgeting, and basic insights will always be free. Premium is for power users who want advanced features.",
                ],
              ].map(([q, a]) => (
                <View
                  key={q}
                  style={[
                    styles.faqCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <AppText variant="title" weight="medium" style={styles.faqQuestion}>
                    {q}
                  </AppText>
                  <AppText variant="body" color={theme.colors.textSecondary} style={styles.heroText}>
                    {a}
                  </AppText>
                </View>
              ))}
            </View>
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

  sectionWrap: {
    gap: 12,
  },
  inlineTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 26,
  },

  bigCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 16,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  checkWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },

  premiumRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  premiumLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  badge: {
    minHeight: 35,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 4,
  },
  feeRowBorder: {
    borderBottomWidth: 1,
    paddingBottom: 14,
    marginBottom: 2,
  },
  feeLeft: {
    flex: 1,
    gap: 2,
  },
  feeTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  feeValue: {
    textAlign: "right",
    maxWidth: "42%",
  },

  faqList: {
    gap: 14,
  },
  faqCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 16,
    lineHeight: 22,
  },
});