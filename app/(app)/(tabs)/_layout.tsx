import { Tabs } from "expo-router";

import HomeTourOverlay from "@/src/components/home/HomeTourOverlay";
import AppTabBar from "@/src/components/navigation/AppTabBar";
import { HomeTourProvider } from "@/src/providers/HomeTourProvider";
import { TabBarVisualProvider } from "@/src/providers/TabBarVisualProvider";

export default function TabsLayout() {
  return (
    <TabBarVisualProvider>
      <HomeTourProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
          tabBar={(props) => <AppTabBar {...props} />}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="accounts" />
          <Tabs.Screen name="goals" />
          <Tabs.Screen name="invest" />
          <Tabs.Screen name="minta-ai" />
        </Tabs>

        <HomeTourOverlay />
      </HomeTourProvider>
    </TabBarVisualProvider>
  );
}