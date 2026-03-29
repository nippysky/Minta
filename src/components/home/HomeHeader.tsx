import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Props = {
  initials: string;
  fullName: string;
  unreadCount?: number;
  onPressAvatar: () => void;
  onPressSettings: () => void;
  onPressNotifications: () => void;
};

export default function HomeHeader({
  initials,
  fullName,
  unreadCount = 0,
  onPressAvatar,
  onPressSettings,
  onPressNotifications,
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <Pressable onPress={onPressAvatar} style={styles.left}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: "rgba(77, 230, 190, 0.92)",
            },
          ]}
        >
          <AppText variant="label" weight="bold" color="#06110D">
            {initials}
          </AppText>
        </View>

        <View style={styles.textWrap}>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Good morning,
          </AppText>
          <AppText variant="title" weight="bold" style={styles.name}>
            {fullName}
          </AppText>
        </View>
      </Pressable>

      <View style={styles.right}>
        <Pressable
          onPress={onPressSettings}
          style={[
            styles.iconButton,
            {
              borderColor: theme.colors.borderSoft,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Ionicons name="settings-outline" size={18} color={theme.colors.text} />
        </Pressable>

        <Pressable
          onPress={onPressNotifications}
          style={[
            styles.iconButton,
            {
              borderColor: theme.colors.borderSoft,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={theme.colors.text}
          />
          {unreadCount > 0 ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.colors.tint,
                },
              ]}
            />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
});