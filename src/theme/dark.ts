
import { AppTheme } from "../types/theme";
import { brand, semantic } from "./tokens";

export const darkTheme: AppTheme = {
  mode: "dark",
  isDark: true,
  colors: {
    background: "#04070D",
    backgroundSecondary: "#090D14",
    surface: "#0B1018",
    surfaceElevated: "#101622",
    text: "#F3F7FA",
    textSecondary: "#A1A9B7",
    textMuted: "#7E8797",
    border: "rgba(255,255,255,0.08)",
    borderSoft: "rgba(255,255,255,0.05)",
    borderFocus: brand.mintBright,
    primary: "#34E7B8",
    primaryText: "#04110B",
    tint: brand.mintBright,
    tintAlt: "#2F87FF",
    inputBackground: "#121722",
    placeholder: "#6F7785",
    icon: "#8D95A3",
    iconFocused: brand.mintBright,
    grid: "rgba(255,255,255,0.04)",
    glow: "rgba(87,242,200,0.18)",
    success: semantic.success,
    shadow: "rgba(0,0,0,0.35)"
  }
};