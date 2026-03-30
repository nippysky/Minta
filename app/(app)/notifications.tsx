import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import { mockHomeData } from "@/src/features/home/data/mockHome";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import AppBackButton from "@/src/components/ui/AppBackButton";


export default function NotificationsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState(mockHomeData.notifications);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const toneColor = (tone: (typeof notifications)[number]["tone"]) => {
    switch (tone) {
      case "warning":
        return { iconBg: "rgba(255,184,0,0.18)", icon: "#FFBF1A" };
      case "success":
        return { iconBg: "rgba(77,230,190,0.18)", icon: theme.colors.tint };
      case "info":
        return { iconBg: "rgba(77,230,190,0.18)", icon: theme.colors.tint };
      case "danger":
        return { iconBg: "rgba(239,68,68,0.18)", icon: "#FF5A5A" };
    }
  };

  return (
    <AppScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: 10,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <AppBackButton />

            <View style={styles.titleRow}>
              <View style={styles.headerIconWrap}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={theme.colors.text}
                />
                {unreadCount > 0 ? (
                  <View style={styles.countBadge}>
                    <AppText variant="caption" weight="bold" color="#FFFFFF">
                      {Math.min(unreadCount, 9)}
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText variant="title" weight="bold" style={styles.headerTitle}>
                Notifications
              </AppText>
            </View>
          </View>

          <Pressable
            onPress={() =>
              setNotifications((prev) =>
                prev.map((item) => ({
                  ...item,
                  unread: false,
                }))
              )
            }
            style={styles.markReadButton}
          >
            <Ionicons name="checkmark" size={18} color={theme.colors.text} />
            <AppText variant="label" weight="semibold">
              Mark all read
            </AppText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: insets.bottom + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((item) => {
            const tone = toneColor(item.tone);

            return (
              <View
                key={item.id}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                {item.unread ? (
                  <View
                    style={[
                      styles.unreadRail,
                      {
                        backgroundColor: theme.colors.tint,
                      },
                    ]}
                  />
                ) : null}

                <View
                  style={[
                    styles.notificationIcon,
                    {
                      backgroundColor: tone.iconBg,
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={tone.icon} />
                </View>

                <View style={styles.notificationText}>
                  <AppText variant="label" weight="bold" numberOfLines={1}>
                    {item.title}
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.notificationBody}
                  >
                    {item.body}
                  </AppText>

                  <AppText variant="body" color={theme.colors.textMuted}>
                    {item.time}
                  </AppText>
                </View>

                {item.unread ? (
                  <View
                    style={[
                      styles.unreadDot,
                      {
                        backgroundColor: theme.colors.tint,
                      },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: 82,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconWrap: {
    position: "relative",
  },
  countBadge: {
    position: "absolute",
    top: -8,
    right: -10,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF5A5A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  markReadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  notificationCard: {
    minHeight: 122,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    overflow: "hidden",
  },
  unreadRail: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 5,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  notificationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    flex: 1,
    gap: 8,
    paddingRight: 12,
  },
  notificationBody: {
    lineHeight: 21,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
});