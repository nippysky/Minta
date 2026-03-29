import { StyleSheet, View } from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

export default function InvestScreen() {
  const theme = useAppTheme();

  return (
    <AppScreen>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppText variant="title" weight="bold">
          Invest
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          Investments and portfolio tracking will live here.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
});