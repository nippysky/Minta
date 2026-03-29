import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  dotColor: string;
};

export default function OnboardingOrb({ icon, gradient, dotColor }: Props) {
  const theme = useAppTheme();

  const orbit = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.96,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [float, orbit, pulse]);

  const spin = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const reverseSpin = useMemo(
    () => ({
      transform: [
        {
          rotate: orbit.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "-360deg"],
          }),
        },
      ],
    }),
    [orbit]
  );

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          transform: [{ translateY: float }, { scale: pulse }],
        },
      ]}
    >
      <View
        style={[
          styles.outerGhost,
          {
            borderColor: theme.colors.borderSoft,
            backgroundColor: theme.isDark ? "rgba(255,255,255,0.01)" : "#FFFFFF",
          },
        ]}
      />

      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerTile}
      >
        <Ionicons name={icon} size={42} color="#0A0D14" />
      </LinearGradient>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.orbitLayer,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Animated.View style={reverseSpin}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 196,
    height: 196,
    alignItems: "center",
    justifyContent: "center",
  },
  outerGhost: {
    position: "absolute",
    width: 134,
    height: 134,
    borderRadius: 34,
    borderWidth: 1,
    transform: [{ rotate: "12deg" }],
  },
  innerTile: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 6,
  },
  orbitLayer: {
    position: "absolute",
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});