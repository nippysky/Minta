import { Text, TextProps } from "react-native";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Variant = "body" | "caption" | "label" | "title" | "hero";
type Weight = "regular" | "medium" | "semibold" | "bold";

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  weight?: Weight;
};

export default function AppText({
  variant = "body",
  color,
  weight = "regular",
  style,
  ...props
}: Props) {
  const theme = useAppTheme();

  const isHeading = variant === "title" || variant === "hero";

  const fontFamilyMap = {
    regular: isHeading ? theme.fonts.headingRegular : theme.fonts.bodyRegular,
    medium: isHeading ? theme.fonts.headingSemiBold : theme.fonts.bodyMedium,
    semibold: isHeading ? theme.fonts.headingSemiBold : theme.fonts.bodySemiBold,
    bold: isHeading ? theme.fonts.headingBold : theme.fonts.bodyBold,
  } as const;

  const variantStyles = {
    body: { fontSize: 14, lineHeight: 22 },
    caption: { fontSize: 12, lineHeight: 18 },
    label: { fontSize: 14, lineHeight: 22 },
    title: { fontSize: 28, lineHeight: 38 },
    hero: { fontSize: 40, lineHeight: 50 },
  };

  return (
    <Text
      {...props}
      style={[
        {
          color: color ?? theme.colors.text,
          fontFamily: fontFamilyMap[weight],
        },
        variantStyles[variant],
        style,
      ]}
    />
  );
}