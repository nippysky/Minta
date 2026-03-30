import { Platform } from "react-native";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "fade" : "none",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          animation: "none",
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          animation: "ios_from_left",
        }}
      />
      <Stack.Screen
        name="security-center"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="change-pin"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="cards"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="automation"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="budgets"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="bills"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
      <Stack.Screen
        name="fee-transparency"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />

      <Stack.Screen
        name="accounts/[accountId]/index"
        options={{
          animation: Platform.OS === "ios" ? "fade" : "none",
        }}
      />
   <Stack.Screen
  name="accounts/[accountId]/transactions/index"
  options={{
    animation: Platform.OS === "ios" ? "fade" : "none",
  }}
/>

<Stack.Screen
  name="accounts/[accountId]/transactions/[transactionId]"
  options={{
    animation: Platform.OS === "ios" ? "fade" : "none",
  }}
/>
    </Stack>
  );
}