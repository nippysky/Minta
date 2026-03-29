import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS } from "@/src/constants/storage";

export type TourRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type HomeTourContextValue = {
  activeStep: number;
  isVisible: boolean;
  hasLoaded: boolean;
  targets: Record<string, TourRect>;
  scrollRevision: number;
  setTarget: (id: string, rect: TourRect) => void;
  notifyScroll: () => void;
  next: () => Promise<void>;
  prev: () => void;
  close: () => Promise<void>;
  open: () => void;
};

const DEV_FORCE_SHOW_HOME_TOUR = true;

const HomeTourContext = createContext<HomeTourContextValue | null>(null);

export function HomeTourProvider({ children }: { children: React.ReactNode }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [targets, setTargets] = useState<Record<string, TourRect>>({});
  const [scrollRevision, setScrollRevision] = useState(0);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const seen = await AsyncStorage.getItem(STORAGE_KEYS.hasSeenHomeTour);

        if (!mounted) return;

        if (__DEV__ && DEV_FORCE_SHOW_HOME_TOUR) {
          setIsVisible(true);
          setActiveStep(0);
        } else {
          setIsVisible(seen !== "true");
        }
      } finally {
        if (mounted) {
          setHasLoaded(true);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const setTarget = useCallback((id: string, rect: TourRect) => {
    setTargets((prev) => {
      const current = prev[id];

      if (
        current &&
        Math.abs(current.x - rect.x) < 1 &&
        Math.abs(current.y - rect.y) < 1 &&
        Math.abs(current.width - rect.width) < 1 &&
        Math.abs(current.height - rect.height) < 1
      ) {
        return prev;
      }

      return {
        ...prev,
        [id]: rect,
      };
    });
  }, []);

  const notifyScroll = useCallback(() => {
    setScrollRevision((prev) => prev + 1);
  }, []);

  const close = useCallback(async () => {
    setIsVisible(false);
    await AsyncStorage.setItem(STORAGE_KEYS.hasSeenHomeTour, "true");
  }, []);

  const next = useCallback(async () => {
    setActiveStep((prev) => Math.min(prev + 1, 8));
  }, []);

  const prev = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const open = useCallback(() => {
    setIsVisible(true);
    setActiveStep(0);
  }, []);

  const value = useMemo<HomeTourContextValue>(
    () => ({
      activeStep,
      isVisible,
      hasLoaded,
      targets,
      scrollRevision,
      setTarget,
      notifyScroll,
      next,
      prev,
      close,
      open,
    }),
    [
      activeStep,
      close,
      hasLoaded,
      isVisible,
      next,
      notifyScroll,
      open,
      prev,
      scrollRevision,
      setTarget,
      targets,
    ]
  );

  return (
    <HomeTourContext.Provider value={value}>
      {children}
    </HomeTourContext.Provider>
  );
}

export function useHomeTour() {
  const context = useContext(HomeTourContext);

  if (!context) {
    throw new Error("useHomeTour must be used within HomeTourProvider");
  }

  return context;
}