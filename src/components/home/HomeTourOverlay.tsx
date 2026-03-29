import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/src/components/ui/AppText";
import { HOME_TOUR_STEPS } from "@/src/features/home/constants/homeTourSteps";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useHomeTour } from "@/src/providers/HomeTourProvider";

export default function HomeTourOverlay() {
  const theme = useAppTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { activeStep, close, hasLoaded, isVisible, next, prev, targets } =
    useHomeTour();

  const step = HOME_TOUR_STEPS[activeStep];
  const target = step ? targets[step.targetId] : undefined;

  const progress = activeStep + 1;
  const isLast = activeStep === HOME_TOUR_STEPS.length - 1;

  const cardWidth = Math.min(width - 28, 350);
  const cardHeight = 214;

  const cardPosition = useMemo(() => {
    const safeTop = insets.top + 18;
    const safeBottom = height - insets.bottom - 18;
    const minTop = safeTop;
    const maxTop = safeBottom - cardHeight;

    if (!target) {
      return {
        left: Math.max(14, (width - cardWidth) / 2),
        top: Math.max(minTop, Math.min((height - cardHeight) / 2, maxTop)),
      };
    }

    const centerX = target.x + target.width / 2;
    let left = centerX - cardWidth / 2;
    left = Math.max(14, Math.min(left, width - cardWidth - 14));

    const spaceBelow = safeBottom - (target.y + target.height);
    const spaceAbove = target.y - safeTop;

    let top = minTop;

    if (spaceBelow >= cardHeight + 14) {
      top = target.y + target.height + 14;
    } else if (spaceAbove >= cardHeight + 14) {
      top = target.y - cardHeight - 14;
    } else {
      top = Math.max(minTop, Math.min((height - cardHeight) / 2, maxTop));
    }

    top = Math.max(minTop, Math.min(top, maxTop));

    return { left, top };
  }, [cardHeight, cardWidth, height, insets.bottom, insets.top, target, width]);

  const highlightStyle = useMemo(() => {
    if (!target) return null;

    return {
      left: Math.max(target.x - 6, 8),
      top: Math.max(target.y - 6, insets.top + 4),
      width: target.width + 12,
      height: target.height + 12,
    };
  }, [insets.top, target]);

  if (!hasLoaded || !isVisible || !step) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={styles.backdrop} />

      {highlightStyle ? (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            highlightStyle,
            {
              borderColor: theme.colors.tint,
              shadowColor: theme.colors.tint,
            },
          ]}
        />
      ) : null}

      <View
        style={[
          styles.card,
          {
            left: cardPosition.left,
            top: cardPosition.top,
            width: cardWidth,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSoft,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.stepRow}>
            <View
              style={[
                styles.sparkleBadge,
                {
                  backgroundColor: "rgba(77, 230, 190, 0.14)",
                },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={15}
                color={theme.colors.tint}
              />
            </View>

            <AppText
              variant="body"
              color={theme.colors.textSecondary}
              weight="medium"
            >
              {progress} of {HOME_TOUR_STEPS.length}
            </AppText>
          </View>

          <Pressable onPress={close} hitSlop={8}>
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <AppText variant="title" weight="bold" style={styles.title}>
          {step.title}
        </AppText>

        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.description}
        >
          {step.description}
        </AppText>

        <View style={styles.progressRow}>
          {HOME_TOUR_STEPS.map((item, index) => {
            const filled = index <= activeStep;
            return (
              <View
                key={item.id}
                style={[
                  styles.progressDot,
                  {
                    width: index === activeStep ? 30 : 10,
                    backgroundColor: filled
                      ? theme.colors.tint
                      : theme.colors.border,
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={prev}
            disabled={activeStep === 0}
            style={({ pressed }) => [
              styles.backButton,
              {
                opacity: activeStep === 0 ? 0.35 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
            <AppText variant="label" weight="semibold">
              Back
            </AppText>
          </Pressable>

          <Pressable
            onPress={async () => {
              if (isLast) {
                await close();
                return;
              }
              await next();
            }}
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.colors.tint,
              },
            ]}
          >
            <AppText variant="label" weight="bold" color={theme.colors.primaryText}>
              {isLast ? "Start Exploring ✨" : "Next"}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.74)",
  },
  highlight: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
  },
  card: {
    position: "absolute",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sparkleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 14,
    fontSize: 22,
    lineHeight: 28,
  },
  description: {
    marginTop: 10,
    lineHeight: 22,
  },
  progressRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressDot: {
    height: 7,
    borderRadius: 999,
  },
  actionRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  nextButton: {
    minWidth: 116,
    minHeight: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
});