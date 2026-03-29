import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { STORAGE_KEYS } from "@/src/constants/storage";
import { translations, type SupportedLanguage } from "@/src/i18n/translations";

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "en";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (value: SupportedLanguage) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getDeviceLanguage(): SupportedLanguage {
  const locale = getLocales()[0]?.languageCode?.toLowerCase();

  if (locale === "fr") return "fr";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.languagePreference);

      if (!active) return;

      if (saved === "en" || saved === "pidgin" || saved === "fr") {
        i18n.locale = saved;
        setLanguageState(saved);
        return;
      }

      const deviceLanguage = getDeviceLanguage();
      i18n.locale = deviceLanguage;
      setLanguageState(deviceLanguage);
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = async (value: SupportedLanguage) => {
    i18n.locale = value;
    setLanguageState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.languagePreference, value);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string) => i18n.t(key),
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}