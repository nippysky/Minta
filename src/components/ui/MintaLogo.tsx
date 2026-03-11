import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { StyleSheet, View } from "react-native";

type Props = {
  size?: number;
};

export default function MintaLogo({ size = 92 }: Props) {
  const theme = useAppTheme();

  const circleSize = size;
  const glowSize = size * 1.9;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.glow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: theme.colors.glow
          }
        ]}
      />
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderColor: theme.colors.tint,
            backgroundColor: theme.isDark ? "#151B23" : "#2A2F36"
          }
        ]}
      >
        <AppText
          style={{
            fontSize: size * 0.42,
            lineHeight: size * 0.46,
            fontWeight: "700",
            color: theme.colors.tint
          }}
        >
          M
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: "center",
    alignItems: "center"
  },
  glow: {
    position: "absolute"
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2
  }
});