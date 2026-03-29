import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { STORAGE_KEYS } from "@/src/constants/storage";

export type FraudAlertItem = {
  id: string;
  tone: "danger" | "warning";
  title: string;
  description: string;
  time: string;
};

export type LoginHistoryItem = {
  id: string;
  deviceName: string;
  deviceIcon: "phone-portrait-outline" | "laptop-outline" | "logo-chrome";
  location: string;
  timeLabel: string;
  isCurrent?: boolean;
};

type SecurityPreferencesState = {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  transactionAlertsEnabled: boolean;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
};

type SecurityPreferencesContextValue = SecurityPreferencesState & {
  setPushNotificationsEnabled: (value: boolean) => void;
  setEmailNotificationsEnabled: (value: boolean) => void;
  setSmsNotificationsEnabled: (value: boolean) => void;
  setTransactionAlertsEnabled: (value: boolean) => void;
  setTwoFactorEnabled: (value: boolean) => void;
  setBiometricEnabled: (value: boolean) => void;
  securityScore: number;
  fraudAlerts: FraudAlertItem[];
  loginHistory: LoginHistoryItem[];
};

const DEFAULT_STATE: SecurityPreferencesState = {
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: true,
  transactionAlertsEnabled: true,
  twoFactorEnabled: true,
  biometricEnabled: false,
};

const FRAUD_ALERTS: FraudAlertItem[] = [
  {
    id: "1",
    tone: "danger",
    title: "Multiple login attempts",
    description: "3 failed login attempts from Lagos, Nigeria",
    time: "2 hours ago",
  },
  {
    id: "2",
    tone: "warning",
    title: "New device detected",
    description: "iPhone 15 Pro was used to access your account",
    time: "Yesterday",
  },
];

const LOGIN_HISTORY: LoginHistoryItem[] = [
  {
    id: "1",
    deviceName: "iPhone 14 Pro",
    deviceIcon: "phone-portrait-outline",
    location: "Lagos, Nigeria",
    timeLabel: "Today, 10:30 AM",
    isCurrent: true,
  },
  {
    id: "2",
    deviceName: "MacBook Pro",
    deviceIcon: "laptop-outline",
    location: "Lagos, Nigeria",
    timeLabel: "Yesterday, 3:15 PM",
  },
  {
    id: "3",
    deviceName: "Chrome on Windows",
    deviceIcon: "logo-chrome",
    location: "Abuja, Nigeria",
    timeLabel: "Dec 5, 2024",
  },
];

const SecurityPreferencesContext =
  createContext<SecurityPreferencesContextValue | null>(null);

export function SecurityPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<SecurityPreferencesState>(DEFAULT_STATE);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.securityPreferences);

        if (!active || !raw) return;

        const parsed = JSON.parse(raw) as Partial<SecurityPreferencesState>;

        setState((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (error) {
        console.warn("[SecurityPreferencesProvider] Failed to hydrate", error);
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.securityPreferences, JSON.stringify(state)).catch(
      (error) => {
        console.warn("[SecurityPreferencesProvider] Failed to persist", error);
      }
    );
  }, [state]);

  const setPushNotificationsEnabled = (value: boolean) =>
    setState((prev) => ({ ...prev, pushNotificationsEnabled: value }));

  const setEmailNotificationsEnabled = (value: boolean) =>
    setState((prev) => ({ ...prev, emailNotificationsEnabled: value }));

  const setSmsNotificationsEnabled = (value: boolean) =>
    setState((prev) => ({ ...prev, smsNotificationsEnabled: value }));

  const setTransactionAlertsEnabled = (value: boolean) =>
    setState((prev) => ({ ...prev, transactionAlertsEnabled: value }));

  const setTwoFactorEnabled = (value: boolean) =>
    setState((prev) => ({ ...prev, twoFactorEnabled: value }));

  const setBiometricEnabled = (value: boolean) =>
    setState((prev) => ({ ...prev, biometricEnabled: value }));

  const securityScore =
    70 + (state.twoFactorEnabled ? 10 : 0) + (state.biometricEnabled ? 10 : 0);

  const value = useMemo<SecurityPreferencesContextValue>(
    () => ({
      ...state,
      setPushNotificationsEnabled,
      setEmailNotificationsEnabled,
      setSmsNotificationsEnabled,
      setTransactionAlertsEnabled,
      setTwoFactorEnabled,
      setBiometricEnabled,
      securityScore,
      fraudAlerts: FRAUD_ALERTS,
      loginHistory: LOGIN_HISTORY,
    }),
    [securityScore, state]
  );

  return (
    <SecurityPreferencesContext.Provider value={value}>
      {children}
    </SecurityPreferencesContext.Provider>
  );
}

export function useSecurityPreferences() {
  const context = useContext(SecurityPreferencesContext);

  if (!context) {
    throw new Error(
      "useSecurityPreferences must be used within SecurityPreferencesProvider"
    );
  }

  return context;
}