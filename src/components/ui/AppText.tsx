import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Text, TextProps } from "react-native";

type Variant = "body" | "caption" | "label" | "title" | "hero";

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  weight?: "400" | "500" | "600" | "700";
};

export default function AppText({
  variant = "body",
  color,
  weight,
  style,
  ...props
}: Props) {
  const theme = useAppTheme();

  const variantStyles = {
    body: { fontSize: 16, lineHeight: 24, fontWeight: weight ?? "400" },
    caption: { fontSize: 14, lineHeight: 20, fontWeight: weight ?? "400" },
    label: { fontSize: 16, lineHeight: 22, fontWeight: weight ?? "500" },
    title: { fontSize: 32, lineHeight: 38, fontWeight: weight ?? "700" },
    hero: { fontSize: 42, lineHeight: 48, fontWeight: weight ?? "700" }
  };

  return (
    <Text
      {...props}
      style={[
        {
          color: color ?? theme.colors.text
        },
        variantStyles[variant],
        style
      ]}
    />
  );
}