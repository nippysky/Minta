import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="security-center" />
      <Stack.Screen name="change-pin" />
      <Stack.Screen name="cards" />
      <Stack.Screen name="automation" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="bills" />
    </Stack>
  );
}