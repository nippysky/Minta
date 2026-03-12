import { AppTheme } from "../types/theme";
import { semantic } from "./tokens";

export const darkTheme: AppTheme = {
  mode: "dark",
  isDark: true,
  colors: {
    background: "#060708",
    backgroundSecondary: "#0B0C0E",
    surface: "#101114",
    surfaceElevated: "#15171B",
    text: "#F5F7FA",
    textSecondary: "#A3A9B5",
    textMuted: "#7C8491",
    border: "rgba(255,255,255,0.08)",
    borderSoft: "rgba(255,255,255,0.045)",
    borderFocus: "#57F2C8",
    primary: "#34E7B8",
    primaryText: "#06110D",
    tint: "#57F2C8",
    glow: "rgba(87,242,200,0.16)",
    inputBackground: "#16181D",
    placeholder: "#707887",
    icon: "#8D95A3",
    iconFocused: "#57F2C8",
    grid: "rgba(255,255,255,0.022)",
    success: semantic.success,
    shadow: "rgba(0,0,0,0.38)",
  },
  fonts: {
    headingRegular: "SoraRegular",
    headingSemiBold: "SoraSemiBold",
    headingBold: "SoraBold",
    bodyRegular: "InterRegular",
    bodyMedium: "InterMedium",
    bodySemiBold: "InterSemiBold",
    bodyBold: "InterBold",
  },
};