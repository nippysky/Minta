import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LayoutAnimation, useColorScheme } from "react-native";

import { STORAGE_KEYS } from "@/src/constants/storage";
import { darkTheme, lightTheme } from "../theme";


export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: typeof lightTheme;
  isDark: boolean;
  resolvedMode: "light" | "dark";
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.themePreference);

      if (!mounted) return;

      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemePreferenceState(saved);
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const resolvedMode: "light" | "dark" =
    themePreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  const theme = resolvedMode === "dark" ? darkTheme : lightTheme;

  const setThemePreference = useCallback(async (value: ThemePreference) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setThemePreferenceState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.themePreference, value);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: resolvedMode === "dark",
      resolvedMode,
      themePreference,
      setThemePreference,
    }),
    [resolvedMode, setThemePreference, theme, themePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }

  return context;
}