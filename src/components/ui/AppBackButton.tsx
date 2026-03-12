import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  style?: ViewStyle;
};

export default function AppBackButton({ style }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={() => router.back()}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
        style,
      ]}
      hitSlop={10}
    >
      <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});