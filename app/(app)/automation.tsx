import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BrandSwitch from "@/src/components/ui/BrandSwitch";
import { useToast } from "@/src/providers/ToastProvider";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Rule = {
  id: string;
  title: string;
  description: string;
  frequency: string;
  insight: string;
  footer: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  active: boolean;
};

export default function AutomationScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [rules, setRules] = useState<Rule[]>([
    {
      id: "emergency-fund",
      title: "Emergency Fund Auto-Save",
      description: "Automatically save ₦10,000 weekly to Emergency Fund",
      frequency: "Weekly",
      insight: "Saves 10% of income",
      footer: "10% auto-saved",
      icon: "wallet-outline",
      iconBg: "#57F2C8",
      active: true,
    },
    {
      id: "round-up",
      title: "Round-Up Savings",
      description: "Round up every transaction to the nearest ₦100 and save the difference",
      frequency: "Per transaction",
      insight: "Average ₦650 saved monthly",
      footer: "₦4,350 → ₦5,000",
      icon: "sync-outline",
      iconBg: "#8B5CF6",
      active: true,
    },
    {
      id: "dstv",
      title: "DStv Auto-Renewal",
      description: "Automatically pay DStv subscription 3 days before due date",
      frequency: "Monthly",
      insight: "3 subscriptions managed",
      footer: "Auto-renews before due date",
      icon: "flash-outline",
      iconBg: "#F59E0B",
      active: true,
    },
    {
      id: "bill-reminder",
      title: "Bill Payment Reminder",
      description: "Schedule all bill payments 2 days before due date",
      frequency: "Monthly",
      insight: "Next payment: Dec 28th",
      footer: "Upcoming reminder active",
      icon: "calendar-outline",
      iconBg: "#3B82F6",
      active: true,
    },
  ]);

  const activeCount = useMemo(
    () => rules.filter((rule) => rule.active).length,
    [rules]
  );

  const potentialSavings = "₦45,000";

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== id) return rule;

        const nextActive = !rule.active;

        showToast({
          type: "success",
          title: nextActive ? "Automation enabled" : "Automation paused",
          message: `${rule.title} ${nextActive ? "is now active" : "has been turned off"}.`,
        });

        return {
          ...rule,
          active: nextActive,
        };
      })
    );
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:10,
            paddingBottom: Math.max(insets.bottom + 28, 34),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>

          <View style={styles.headerText}>
            <AppText variant="title" weight="bold" style={styles.title}>
              Automation Center
            </AppText>
            <AppText
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.subtitle}
            >
              Set up smart money rules
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.summaryBlock}>
            <AppText variant="body" style={{fontSize:12}} color={theme.colors.textSecondary}>
              Active Automations
            </AppText>
            <AppText variant="title" weight="bold" color={theme.colors.tint}>
              {String(activeCount)}
            </AppText>
          </View>

          <View style={styles.summaryBlockRight}>
            <AppText
              variant="body"
              color={theme.colors.textSecondary}
              style={styles.summaryRightLabel}
            >
              Potential Monthly Savings
            </AppText>
            <AppText
              variant="title"
              weight="bold"
              color={theme.colors.tint}
              style={styles.savingsText}
            >
              {potentialSavings}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.disclaimerCard,
            {
              backgroundColor: theme.isDark
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(245, 158, 11, 0.12)",
              borderColor: "rgba(245, 158, 11, 0.28)",
            },
          ]}
        >
          <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
          <AppText
            variant="body"
            color="#F59E0B"
            style={styles.disclaimerText}
          >
            AI suggestions are for informational purposes only and do not
            constitute financial advice. Always consult a qualified financial
            advisor.
          </AppText>
        </View>

        <AppText variant="title" weight="bold" style={styles.sectionTitle}>
          Your Rules
        </AppText>

        <View style={styles.rulesWrap}>
          {rules.map((rule) => (
            <View
              key={rule.id}
              style={[
                styles.ruleCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <View style={styles.ruleTop}>
                <View
                  style={[
                    styles.ruleIconWrap,
                    {
                      backgroundColor: rule.iconBg,
                    },
                  ]}
                >
                  <Ionicons name={rule.icon} size={24} color="#06110D" />
                </View>

                <View style={styles.ruleMain}>
                  <View style={styles.ruleTitleRow}>
                    <AppText
                      variant="title"
                      weight="bold"
                      numberOfLines={1}
                      style={styles.ruleTitle}
                    >
                      {rule.title}
                    </AppText>

                    <View
                      style={[
                        styles.activePill,
                        {
                          backgroundColor: rule.active
                            ? theme.isDark
                              ? "rgba(87,242,200,0.16)"
                              : "rgba(49,230,183,0.14)"
                            : theme.colors.surfaceElevated,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        weight="semibold"
                        color={rule.active ? theme.colors.tint : theme.colors.textMuted}
                      >
                        {rule.active ? "Active" : "Paused"}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.ruleDescription}
                  >
                    {rule.description}
                  </AppText>

                  <AppText
                    variant="caption"
                    weight="semibold"
                    color={theme.colors.tint}
                    style={styles.ruleInsight}
                  >
                    {rule.insight}
                  </AppText>

                  <AppText variant="caption" color={theme.colors.textSecondary}>
                    {rule.frequency}
                  </AppText>
                </View>

                <BrandSwitch value={rule.active} onChange={() => toggleRule(rule.id)} />
              </View>

              <View
                style={[
                  styles.ruleDivider,
                  {
                    backgroundColor: theme.colors.borderSoft,
                  },
                ]}
              />

              <View style={styles.ruleFooter}>
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color={theme.colors.textMuted}
                />
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  {rule.footer}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={[
            styles.createRuleButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderSoft,
            },
          ]}
          onPress={() =>
            showToast({
              type: "success",
              title: "Custom rules coming next",
              message: "The custom automation builder will be the next deep flow.",
            })
          }
        >
          <Ionicons name="add" size={18} color={theme.colors.text} />
          <AppText variant="label" weight="semibold">
            Create Custom Rule
          </AppText>
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryBlock: {
    flex: 1,
    gap: 6,
  },
  summaryBlockRight: {
    flex: 1.25,
    alignItems: "flex-end",
    gap: 6,
  },
  summaryRightLabel: {
    textAlign: "right",
    fontSize:12
  },
  savingsText: {
    fontSize: 24,
    lineHeight: 30,
    textAlign: "right",
  },
  disclaimerCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  rulesWrap: {
    gap: 14,
  },
  ruleCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  ruleTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  ruleIconWrap: {
    width: 49,
    height: 49,
    borderRadius:18,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleMain: {
    flex: 1,
    gap: 4,
  },
  ruleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  ruleTitle: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  activePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  ruleDescription: {
    fontSize: 13,
    lineHeight: 21,
  },
  ruleInsight: {
    fontSize: 12,
    lineHeight: 18,
  },
  ruleDivider: {
    height: 1,
    width: "100%",
  },
  ruleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createRuleButton: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
});