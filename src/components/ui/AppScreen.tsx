import { useAppTheme } from "@/src/hooks/useAppTheme";
import { StyleSheet, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppScreen({ style, children, ...props }: ViewProps) {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View
        {...props}
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.background
          },
          style
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  content: {
    flex: 1
  }
});