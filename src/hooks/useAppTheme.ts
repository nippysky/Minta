import { useThemeMode } from "@/src/providers/ThemeProvider";

export function useAppTheme() {
  const { theme } = useThemeMode();
  return theme;
}