export type ThemeMode = "light" | "dark" | "system";

export type AppTheme = {
  mode: "light" | "dark";
  isDark: boolean;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderSoft: string;
    borderFocus: string;
    primary: string;
    primaryText: string;
    tint: string;
    tintAlt: string;
    inputBackground: string;
    placeholder: string;
    icon: string;
    iconFocused: string;
    grid: string;
    glow: string;
    success: string;
    shadow: string;
  };
};