import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import BalanceCard from "@/src/components/home/BalanceCard";
import BudgetBillsSection from "@/src/components/home/BudgetBillsSection";
import HomeHeader from "@/src/components/home/HomeHeader";
import InsightsCarousel from "@/src/components/home/InsightsCarousel";
import QuickActionsRow from "@/src/components/home/QuickActionsRow";
import TransactionsSection from "@/src/components/home/TransactionsSection";
import AppScreen from "@/src/components/ui/AppScreen";
import { STORAGE_KEYS } from "@/src/constants/storage";
import { HOME_TOUR_STEPS } from "@/src/features/home/constants/homeTourSteps";
import { mockHomeData } from "@/src/features/home/data/mockHome";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useHomeTour } from "@/src/providers/HomeTourProvider";
import { useTabBarVisual } from "@/src/providers/TabBarVisualProvider";

type SectionOffsets = Partial<Record<string, number>>;

export default function HomeScreen() {
  const theme = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const tabBarHeight = useBottomTabBarHeight();

  const { activeStep, isVisible, notifyScroll, open } = useHomeTour();
  const { setScrollY } = useTabBarVisual();

  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [budgetBillsTab, setBudgetBillsTab] = useState<"budgets" | "bills">(
    "bills"
  );
  const [sectionOffsets, setSectionOffsets] = useState<SectionOffsets>({});

  const data = useMemo(() => mockHomeData, []);

  const unreadCount = useMemo(
    () => data.notifications.filter((item) => item.unread).length,
    [data.notifications]
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const checkRestartTour = async () => {
        const restart = await AsyncStorage.getItem(STORAGE_KEYS.restartHomeTour);

        if (!active || restart !== "true") return;

        await AsyncStorage.removeItem(STORAGE_KEYS.restartHomeTour);

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false,
        });

        requestAnimationFrame(() => {
          open();
        });
      };

      checkRestartTour();

      return () => {
        active = false;
      };
    }, [open])
  );

  const setSectionOffset =
    (id: string) =>
    (event: LayoutChangeEvent): void => {
      const { y } = event.nativeEvent.layout;

      setSectionOffsets((prev) => ({
        ...prev,
        [id]: y,
      }));
    };

  useEffect(() => {
    if (!isVisible) return;

    const targetId = HOME_TOUR_STEPS[activeStep]?.targetId;
    if (!targetId) return;

    const y = sectionOffsets[targetId];
    if (typeof y !== "number") return;

    scrollRef.current?.scrollTo({
      y: Math.max(0, y - 110),
      animated: true,
    });
  }, [activeStep, isVisible, sectionOffsets]);

  return (
    <AppScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 12,
              paddingBottom: tabBarHeight + 18,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            setScrollY(offsetY);
            notifyScroll();
          }}
        >
          <HomeHeader
            initials={data.user.initials}
            fullName={data.user.fullName}
            unreadCount={unreadCount}
            onPressAvatar={() => router.push("/(app)/profile")}
            onPressSettings={() => router.push("/(app)/settings")}
            onPressNotifications={() => router.push("/(app)/notifications")}
          />

          <View onLayout={setSectionOffset("balance-card")}>
            <BalanceCard
              balanceNgn={data.balance.ngn}
              balanceUsd={data.balance.usdEquivalent}
              currency={currency}
              onChangeCurrency={setCurrency}
              isBalanceVisible={isBalanceVisible}
              onToggleBalanceVisibility={() =>
                setIsBalanceVisible((prev) => !prev)
              }
            />
          </View>

          <View onLayout={setSectionOffset("quick-actions")}>
            <QuickActionsRow actions={data.quickActions} />
          </View>

          <View onLayout={setSectionOffset("insights")}>
            <InsightsCarousel insights={data.insights} />
          </View>

          <View onLayout={setSectionOffset("budget-bills")}>
            <BudgetBillsSection
              activeTab={budgetBillsTab}
              onChangeTab={setBudgetBillsTab}
              budgets={data.budgets}
              bills={data.bills}
            />
          </View>

          <View onLayout={setSectionOffset("transactions")}>
            <TransactionsSection transactions={data.transactions} />
          </View>
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
    gap: 18,
  },
});