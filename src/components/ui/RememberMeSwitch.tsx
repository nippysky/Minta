import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function RememberMeSwitch({ value, onChange }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable style={styles.row} onPress={() => onChange(!value)}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? theme.colors.tint : theme.colors.border
          }
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: value ? "#0A1210" : "#FFFFFF",
              transform: [{ translateX: value ? 22 : 0 }]
            }
          ]}
        />
      </View>

      <AppText variant="label" color={theme.colors.textSecondary}>
        Remember me
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  track: {
    width: 50,
    height: 30,
    borderRadius: 999,
    padding: 3,
    justifyContent: "center"
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12
  }
});