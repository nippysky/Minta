import { Tabs } from "expo-router";

import AppTabBar from "@/src/components/navigation/AppTabBar";
import { HomeTourProvider } from "@/src/providers/HomeTourProvider";
import { TabBarVisualProvider } from "@/src/providers/TabBarVisualProvider";

export default function TabsLayout() {
  return (
    <HomeTourProvider>
      <TabBarVisualProvider>
        <Tabs
          tabBar={(props) => <AppTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="accounts" />
          <Tabs.Screen name="goals" />
          <Tabs.Screen name="invest" />
          <Tabs.Screen name="minta-ai" />
        </Tabs>
      </TabBarVisualProvider>
    </HomeTourProvider>
  );
}