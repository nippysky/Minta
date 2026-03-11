import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  leftSlot?: React.ReactNode;
};

export default function BrandButton({
  title,
  onPress,
  variant = "primary",
  leftSlot
}: Props) {
  const theme = useAppTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.primary : "transparent",
          borderColor: isPrimary ? theme.colors.primary : theme.colors.tint,
          opacity: pressed ? 0.94 : 1,
          shadowColor: isPrimary ? theme.colors.glow : "transparent"
        }
      ]}
    >
      <View style={styles.inner}>
        {leftSlot}
        <AppText
          variant="label"
          weight="700"
          color={isPrimary ? theme.colors.primaryText : theme.colors.text}
        >
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 5
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  }
});