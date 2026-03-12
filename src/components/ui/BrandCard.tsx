import { useAppTheme } from "@/src/hooks/useAppTheme";
import { StyleSheet, View, ViewProps } from "react-native";

export default function BrandCard({ style, children, ...props }: ViewProps) {
  const theme = useAppTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
          shadowColor: theme.colors.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 22,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
});