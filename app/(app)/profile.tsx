import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import { mockHomeData } from "@/src/features/home/data/mockHome";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import PageBackButton from "@/src/components/ui/PageBackButton";

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const user = mockHomeData.user;

  return (
    <AppScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: insets.bottom + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <PageBackButton />

          <View style={styles.header}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarInner}>
                <AppText variant="hero" weight="bold" color="#06110D">
                  {user.initials.slice(0, 1)}
                </AppText>
              </View>
            </View>

            <AppText variant="hero" weight="bold" style={styles.title}>
              {user.fullName}
            </AppText>

            <AppText variant="body" color={theme.colors.textSecondary}>
              {user.email}
            </AppText>
          </View>

          <View
            style={[
              styles.placeholderCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <AppText variant="title" weight="bold">
              Profile screen
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              We’ll build the full profile details next.
            </AppText>
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
  header: {
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
  },
  avatarInner: {
    flex: 1,
    backgroundColor: "#61F2CF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: "center",
  },
  placeholderCard: {
    minHeight: 130,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
});