import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import TourTarget from "@/src/components/ui/TourTarget";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Action = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  actions: Action[];
};

export default function QuickActionsRow({ actions }: Props) {
  const theme = useAppTheme();

  return (
    <TourTarget id="quick-actions">
      <View style={styles.row}>
        {actions.map((action) => (
          <Pressable key={action.id} style={styles.item}>
            <LinearGradient
              colors={["#61F2CF", "#35DBA9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name={action.icon} size={20} color="#08100D" />
            </LinearGradient>

            <AppText variant="body" color={theme.colors.textSecondary}>
              {action.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </TourTarget>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});