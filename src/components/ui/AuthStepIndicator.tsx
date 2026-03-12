import { StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  totalSteps: number;
  currentStep: number;
};

export default function AuthStepIndicator({
  totalSteps,
  currentStep,
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const active = step === currentStep;
        const completed = step < currentStep;

        return (
          <View key={step} style={styles.stepWrap}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor:
                    active || completed
                      ? theme.colors.tint
                      : theme.colors.surfaceElevated,
                  borderColor:
                    active || completed
                      ? theme.colors.tint
                      : theme.colors.borderSoft,
                },
              ]}
            >
              <AppText
                variant="caption"
                weight="bold"
                color={
                  active || completed
                    ? theme.colors.primaryText
                    : theme.colors.textSecondary
                }
              >
                {step}
              </AppText>
            </View>

            {step !== totalSteps ? (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor:
                      step < currentStep
                        ? theme.colors.tint
                        : theme.colors.borderSoft,
                  },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  line: {
    width: 36,
    height: 2,
    marginHorizontal: 8,
    borderRadius: 999,
  },
});