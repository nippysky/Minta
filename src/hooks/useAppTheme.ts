import { useThemeMode } from "../providers/ThemeProvider";

export function useAppTheme() {
  return useThemeMode().theme;
}