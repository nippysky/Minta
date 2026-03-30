import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type ToastType = "success" | "error";

type ToastPayload = {
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  showToast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toast, setToast] = useState<ToastPayload | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (payload: ToastPayload) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      setToast(payload);

      requestAnimationFrame(() => {
        translateY.setValue(-140);
        opacity.setValue(0);

        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });

      hideTimer.current = setTimeout(() => {
        hideToast();
      }, 2600);
    },
    [hideToast, opacity, translateY]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const backgroundColor =
    toast?.type === "error" ? "#EF4444" : theme.colors.tint;

  const textColor =
    toast?.type === "error" ? "#FFFFFF" : theme.colors.primaryText;

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastWrap,
            {
              top: Math.max(insets.top + 10, 20),
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <AppText variant="label" weight="bold" color={textColor}>
              {toast.title}
            </AppText>

            {toast.message ? (
              <AppText
                variant="caption"
                weight="medium"
                color={textColor}
                style={styles.toastMessage}
              >
                {toast.message}
              </AppText>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  toastWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 6,
  },
  toastMessage: {
    marginTop: 4,
  },
});