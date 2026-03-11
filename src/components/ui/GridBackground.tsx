import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

type Props = {
  cellSize?: number;
};

export default function GridBackground({ cellSize = 54 }: Props) {
  const theme = useAppTheme();

  const verticalLines = useMemo(() => {
    const count = Math.ceil(width / cellSize);
    return Array.from({ length: count }, (_, i) => i * cellSize);
  }, [cellSize]);

  const horizontalLines = useMemo(() => {
    const count = Math.ceil(height / cellSize);
    return Array.from({ length: count }, (_, i) => i * cellSize);
  }, [cellSize]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {verticalLines.map((left) => (
        <View
          key={`v-${left}`}
          style={[
            styles.vLine,
            {
              left,
              backgroundColor: theme.colors.grid
            }
          ]}
        />
      ))}

      {horizontalLines.map((top) => (
        <View
          key={`h-${top}`}
          style={[
            styles.hLine,
            {
              top,
              backgroundColor: theme.colors.grid
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  vLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1
  },
  hLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1
  }
});