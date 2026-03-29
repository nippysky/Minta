import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import BrandCard from "@/src/components/ui/BrandCard";
import TourTarget from "@/src/components/ui/TourTarget";
import { formatNaira, formatUsd } from "@/src/features/home/lib/currency";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  balanceNgn: number;
  balanceUsd: number;
  isBalanceVisible: boolean;
  onToggleBalanceVisibility: () => void;
  currency: "NGN" | "USD";
  onChangeCurrency: (currency: "NGN" | "USD") => void;
};

export default function BalanceCard({
  balanceNgn,
  balanceUsd,
  currency,
  isBalanceVisible,
  onChangeCurrency,
  onToggleBalanceVisibility,
}: Props) {
  const theme = useAppTheme();

  const amount =
    currency === "NGN" ? formatNaira(balanceNgn) : formatUsd(balanceUsd);

  return (
    <TourTarget id="balance-card">
      <BrandCard style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.amountWrap}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              MiNTA Balance
            </AppText>

            <AppText
              variant="hero"
              weight="bold"
              style={styles.amount}
              numberOfLines={2}
            >
              {isBalanceVisible ? amount : "******"}
            </AppText>
          </View>

          <View
            style={[
              styles.currencySwitch,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            {(["NGN", "USD"] as const).map((item) => {
              const active = currency === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => onChangeCurrency(item)}
                  style={[
                    styles.currencyPill,
                    active
                      ? {
                          backgroundColor: "rgba(77, 230, 190, 0.16)",
                        }
                      : null,
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={active ? "bold" : "semibold"}
                    color={active ? theme.colors.tint : theme.colors.textSecondary}
                  >
                    {item}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.middleRow}>
          <View style={styles.growthRow}>
            <View
              style={[
                styles.growthIcon,
                {
                  backgroundColor: "rgba(77, 230, 190, 0.14)",
                },
              ]}
            >
              <Ionicons
                name="trending-up-outline"
                size={15}
                color={theme.colors.tint}
              />
            </View>

            <AppText variant="body">
              <AppText variant="body" weight="bold" color={theme.colors.tint}>
                +12.5%
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {" "}
                this month
              </AppText>
            </AppText>
          </View>

          <Pressable
            onPress={onToggleBalanceVisibility}
            style={[
              styles.eyeButton,
              {
                borderColor: theme.colors.borderSoft,
                backgroundColor: theme.colors.surfaceElevated,
              },
            ]}
          >
            <Ionicons
              name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
              size={17}
              color={theme.colors.text}
            />
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.statementButton,
            {
              borderColor: theme.colors.tint,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <AppText variant="label" weight="bold" color={theme.colors.tint}>
            View Statements
          </AppText>
        </Pressable>
      </BrandCard>
    </TourTarget>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  amountWrap: {
    flex: 1,
    paddingRight: 8,
  },
  currencySwitch: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    marginTop: 2,
  },
  currencyPill: {
    minWidth: 48,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  amount: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.8,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  growthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  growthIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statementButton: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
});