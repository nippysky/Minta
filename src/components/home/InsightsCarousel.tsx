import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";

import AppText from "@/src/components/ui/AppText";
import TourTarget from "@/src/components/ui/TourTarget";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Insight = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

type Props = {
  insights: Insight[];
};

export default function InsightsCarousel({ insights }: Props) {
  const theme = useAppTheme();

  return (
    <TourTarget id="insights">
      <View style={styles.wrap}>
        <AppText variant="title" weight="bold" style={styles.heading}>
          Insights
        </AppText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {insights.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <LinearGradient
                colors={["#61F2CF", "#35DBA9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconWrap}
              >
                <Ionicons name={item.icon} size={16} color="#08100D" />
              </LinearGradient>

              <AppText variant="body" weight="medium" style={styles.cardText}>
                {item.text}
              </AppText>
            </View>
          ))}
        </ScrollView>
      </View>
    </TourTarget>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  heading: {
    fontSize: 16,
    lineHeight: 20,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 8,
  },
  card: {
    width: 240,
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
  },
});