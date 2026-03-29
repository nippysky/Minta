import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { STORAGE_KEYS } from "@/src/constants/storage";

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (user?: Partial<AuthUser>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getSafeStorageKeys(keys: (string | null | undefined)[]) {
  return keys.filter(
    (key): key is string => typeof key === "string" && key.trim().length > 0
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.authUser);

        if (!active) return;

        if (rawUser) {
          setUser(JSON.parse(rawUser) as AuthUser);
        }
      } catch (error) {
        console.warn("[AuthProvider] Failed to hydrate auth state", error);
      } finally {
        if (active) {
          setIsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (partialUser?: Partial<AuthUser>) => {
    const nextUser: AuthUser = {
      id: partialUser?.id ?? "demo-user-1",
      fullName: partialUser?.fullName ?? "Samuel Nwamaife",
      email: partialUser?.email ?? "samuel@demo.minta.ng",
    };

    setUser(nextUser);

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.authSession, "authenticated"],
      [STORAGE_KEYS.authUser, JSON.stringify(nextUser)],
    ]);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);

    const keysToRemove = getSafeStorageKeys([
      STORAGE_KEYS.authSession,
      STORAGE_KEYS.authUser,
    ]);

    if (keysToRemove.length === 0) return;

    await AsyncStorage.multiRemove(keysToRemove);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrated,
      signIn,
      signOut,
    }),
    [isHydrated, signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}