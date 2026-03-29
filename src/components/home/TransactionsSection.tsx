import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import BrandCard from "@/src/components/ui/BrandCard";
import TourTarget from "@/src/components/ui/TourTarget";
import { formatCompactAmount } from "@/src/features/home/lib/currency";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  transactions: Transaction[];
};

export default function TransactionsSection({ transactions }: Props) {
  const theme = useAppTheme();

  return (
    <TourTarget id="transactions">
      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <AppText variant="title" weight="bold" style={styles.heading}>
            Recent Transactions
          </AppText>

          <Pressable style={styles.seeAllRow}>
            <AppText variant="label" weight="bold" color={theme.colors.tint}>
              See All
            </AppText>
          </Pressable>
        </View>

        <BrandCard style={styles.listCard}>
          <View style={styles.list}>
            {transactions.map((item, index) => {
              const isDebit = item.amount < 0;
              const isLast = index === transactions.length - 1;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.row,
                    {
                      borderBottomColor: theme.colors.borderSoft,
                      borderBottomWidth: isLast ? 0 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: isDebit
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(77, 230, 190, 0.12)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={isDebit ? theme.colors.textSecondary : theme.colors.tint}
                    />
                  </View>

                  <View style={styles.textWrap}>
                    <AppText variant="label" weight="semibold">
                      {item.title}
                    </AppText>
                    <AppText variant="body" color={theme.colors.textSecondary}>
                      {item.subtitle}
                    </AppText>
                  </View>

                  <AppText
                    variant="label"
                    weight="bold"
                    color={isDebit ? theme.colors.text : theme.colors.tint}
                  >
                    {formatCompactAmount(item.amount)}
                  </AppText>
                </View>
              );
            })}
          </View>
        </BrandCard>
      </View>
    </TourTarget>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    fontSize: 16,
    lineHeight: 26,
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listCard: {
    padding: 10,
  },
  list: {
    gap: 0,
  },
  row: {
    minHeight: 72,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});