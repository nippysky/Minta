import { Animated, Pressable, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  count: number;
  activeIndex: number;
  accentColor: string;
  onPressDot: (index: number) => void;
};

export default function OnboardingPagination({
  count,
  activeIndex,
  accentColor,
  onPressDot,
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <Pressable
            key={index}
            onPress={() => onPressDot(index)}
            hitSlop={10}
            style={styles.dotPressable}
          >
            <Animated.View
              style={[
                styles.dot,
                {
                  width: isActive ? 52 : 14,
                  backgroundColor: isActive ? accentColor : theme.colors.border,
                  opacity: isActive ? 1 : 0.85,
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  dotPressable: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    height: 14,
    borderRadius: 999,
  },
});