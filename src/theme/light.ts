
import { AppTheme } from "../types/theme";
import { brand, semantic } from "./tokens";

export const lightTheme: AppTheme = {
  mode: "light",
  isDark: false,
  colors: {
    background: "#F6F7F9",
    backgroundSecondary: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceElevated: "#FCFCFD",
    text: "#0A0D14",
    textSecondary: "#525866",
    textMuted: "#868C98",
    border: "#DFE3E8",
    borderSoft: "#EBEEF2",
    borderFocus: brand.mint,
    primary: "#22D3A6",
    primaryText: "#07120F",
    tint: brand.mint,
    tintAlt: brand.blue,
    inputBackground: "#F3F4F6",
    placeholder: "#98A2B3",
    icon: "#6B7280",
    iconFocused: brand.mintDeep,
    grid: "rgba(17,24,39,0.05)",
    glow: "rgba(49,230,183,0.14)",
    success: semantic.success,
    shadow: "rgba(16,24,40,0.08)"
  }
};