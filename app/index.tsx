import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { PATHS } from "@/src/constants/paths";
import { STORAGE_KEYS } from "@/src/constants/storage";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useAuth } from "@/src/providers/AuthProvider";

const FORCE_SHOW_ONBOARDING_IN_DEV = false;

export default function Index() {
  const theme = useAppTheme();
  const { isAuthenticated, isHydrated } = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const seen = await AsyncStorage.getItem(STORAGE_KEYS.hasSeenOnboarding);

        if (mounted) {
          setHasSeenOnboarding(seen === "true");
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isHydrated || !isReady || hasSeenOnboarding === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  if (__DEV__ && FORCE_SHOW_ONBOARDING_IN_DEV) {
    return <Redirect href={PATHS.onboarding} />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href={PATHS.onboarding} />;
  }

  return <Redirect href={isAuthenticated ? PATHS.home : PATHS.signIn} />;
}