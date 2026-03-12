import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { ThemeProvider, useThemeMode } from "@/src/providers/ThemeProvider";
import { ToastProvider } from "@/src/providers/ToastProvider";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isDark } = useThemeMode();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter-Bold.ttf"),
    SoraRegular: require("../assets/fonts/Sora-Regular.ttf"),
    SoraSemiBold: require("../assets/fonts/Sora-SemiBold.ttf"),
    SoraBold: require("../assets/fonts/Sora-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: "#050816" }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}