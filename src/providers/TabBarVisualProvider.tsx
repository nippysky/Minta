import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TabBarVisualContextValue = {
  scrollY: number;
  setScrollY: (value: number) => void;
};

const TabBarVisualContext = createContext<TabBarVisualContextValue | null>(null);

export function TabBarVisualProvider({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0);

  const value = useMemo(
    () => ({
      scrollY,
      setScrollY,
    }),
    [scrollY]
  );

  return (
    <TabBarVisualContext.Provider value={value}>
      {children}
    </TabBarVisualContext.Provider>
  );
}

export function useTabBarVisual() {
  const context = useContext(TabBarVisualContext);

  if (!context) {
    throw new Error("useTabBarVisual must be used within TabBarVisualProvider");
  }

  return context;
}