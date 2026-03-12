import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  leftSlot?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

export default function BrandButton({
  title,
  onPress,
  variant = "primary",
  leftSlot,
  disabled = false,
  loading = false,
}: Props) {
  const theme = useAppTheme();
  const isPrimary = variant === "primary";
  const isInactive = disabled || loading;

  const textColor = isPrimary ? theme.colors.primaryText : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.primary : "transparent",
          borderColor: isPrimary ? theme.colors.primary : theme.colors.tint,
          opacity: isInactive ? 0.45 : pressed ? 0.95 : 1,
          shadowColor: isPrimary ? theme.colors.glow : "transparent",
        },
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {leftSlot}
            <AppText variant="label" weight="bold" color={textColor}>
              {title}
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 60,
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 5,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});