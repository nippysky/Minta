import { StyleSheet, View } from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

export default function HomeScreen() {
  const theme = useAppTheme();

  return (
    <AppScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <AppText variant="title" weight="bold">
          Welcome to Minta
        </AppText>

        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          Your financial universe is taking shape.
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
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
  },
});