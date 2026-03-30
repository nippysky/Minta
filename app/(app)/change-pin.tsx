import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useToast } from "@/src/providers/ToastProvider";
import AppBackButton from "@/src/components/ui/AppBackButton";

function sanitizePin(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

export default function ChangePinScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const errors = useMemo(() => {
    const result = {
      current: "",
      next: "",
      confirm: "",
    };

    if (currentPin.length > 0 && currentPin.length < 4) {
      result.current = "Current PIN must be 4 digits.";
    }

    if (newPin.length > 0 && newPin.length < 4) {
      result.next = "New PIN must be 4 digits.";
    }

    if (newPin.length === 4 && newPin === currentPin) {
      result.next = "New PIN must be different from current PIN.";
    }

    if (confirmPin.length > 0 && confirmPin !== newPin) {
      result.confirm = "PIN confirmation does not match.";
    }

    return result;
  }, [confirmPin, currentPin, newPin]);

  const canSubmit =
    currentPin.length === 4 &&
    newPin.length === 4 &&
    confirmPin.length === 4 &&
    !errors.current &&
    !errors.next &&
    !errors.confirm;

  const handleSubmit = () => {
    if (!canSubmit) return;

    showToast({
      type: "success",
      title: "PIN updated",
      message: "Your transaction PIN has been changed successfully.",
    });

    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <AppScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: 10,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: insets.bottom + 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppBackButton />

            <View style={styles.headerText}>
              <AppText variant="hero" weight="bold" style={styles.headerTitle}>
                Change PIN
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Update your transaction PIN securely
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.fieldGroup}>
              <AppText variant="label" weight="semibold" style={styles.fieldLabel}>
                Current PIN
              </AppText>

              <TextInput
                value={currentPin}
                onChangeText={(text) => setCurrentPin(sanitizePin(text))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                placeholder="••••"
                placeholderTextColor={theme.colors.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: errors.current
                      ? "#EF4444"
                      : theme.colors.borderSoft,
                    color: theme.colors.text,
                  },
                ]}
              />

              {errors.current ? (
                <AppText variant="caption" color="#EF4444">
                  {errors.current}
                </AppText>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <AppText variant="label" weight="semibold" style={styles.fieldLabel}>
                New PIN
              </AppText>

              <TextInput
                value={newPin}
                onChangeText={(text) => setNewPin(sanitizePin(text))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                placeholder="••••"
                placeholderTextColor={theme.colors.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: errors.next ? "#EF4444" : theme.colors.borderSoft,
                    color: theme.colors.text,
                  },
                ]}
              />

              {errors.next ? (
                <AppText variant="caption" color="#EF4444">
                  {errors.next}
                </AppText>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <AppText variant="label" weight="semibold" style={styles.fieldLabel}>
                Confirm New PIN
              </AppText>

              <TextInput
                value={confirmPin}
                onChangeText={(text) => setConfirmPin(sanitizePin(text))}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                placeholder="••••"
                placeholderTextColor={theme.colors.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: errors.confirm
                      ? "#EF4444"
                      : theme.colors.borderSoft,
                    color: theme.colors.text,
                  },
                ]}
              />

              {errors.confirm ? (
                <AppText variant="caption" color="#EF4444">
                  {errors.confirm}
                </AppText>
              ) : null}
            </View>

            <Pressable
              onPress={() =>
                showToast({
                  type: "success",
                  title: "PIN recovery next",
                  message: "Forgot PIN recovery flow will be built next.",
                })
              }
              style={styles.helpRow}
            >
              <AppText variant="body" weight="medium" color={theme.colors.tint}>
                Forgot current PIN?
              </AppText>
            </Pressable>
          </View>

          <View
            style={[
              styles.tipCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <AppText variant="label" weight="semibold" style={styles.tipTitle}>
              Security tips
            </AppText>

            <View style={styles.tipList}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Use a PIN you can remember but others cannot guess.
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Avoid repeated digits like 1111 or 1234.
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Never share your transaction PIN with anyone.
              </AppText>
            </View>
          </View>

          <Pressable
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={[
              styles.buttonWrap,
              {
                opacity: canSubmit ? 1 : 0.5,
              },
            ]}
          >
            <LinearGradient
              colors={["#57F2C8", "#31E6B7"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.button}
            >
              <AppText variant="body" weight="bold" color="#06110D">
                Save New PIN
              </AppText>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    gap: 16,
  },
  header: {
    gap: 10,
  },
  headerText: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 6,
  },
  helpRow: {
    marginTop: 2,
    alignSelf: "flex-start",
  },
  tipCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  tipTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  tipList: {
    gap: 8,
  },
  buttonWrap: {
    marginTop: 20,
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});