import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import GridBackground from "@/src/components/ui/GridBackground";
import OnboardingOrb from "@/src/components/ui/OnboardingOrb";
import OnboardingPagination from "@/src/components/ui/OnboardingPagination";
import { EXTERNAL_LINKS } from "@/src/constants/links";
import { PATHS } from "@/src/constants/paths";
import { STORAGE_KEYS } from "@/src/constants/storage";
import {
  ONBOARDING_SLIDES,
  type OnboardingSlide,
} from "@/src/features/auth/constants/onboardingSlides";
import { useAppTheme } from "@/src/hooks/useAppTheme";

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const { width, height } = useWindowDimensions();

  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = useMemo(
    () => ONBOARDING_SLIDES[activeIndex],
    [activeIndex]
  );

  const isCompactWidth = width < 380;
  const isShortHeight = height < 780;

  const heroFontSize = isCompactWidth ? 38 : 44;
  const heroLineHeight = heroFontSize + 6;
  const descriptionFontSize = isCompactWidth ? 16 : 17;
  const descriptionLineHeight = isCompactWidth ? 26 : 28;
  const orbScale = isShortHeight ? 0.9 : 1;

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setActiveIndex(index);
  };

  const handleContinue = async () => {
    const isLast = activeIndex === ONBOARDING_SLIDES.length - 1;

    if (!isLast) {
      goToSlide(activeIndex + 1);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.hasSeenOnboarding, "true");
    router.replace(PATHS.signUp as any);
  };

  const handleSignIn = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.hasSeenOnboarding, "true");
    router.replace(PATHS.signIn as any);
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  const openExternal = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // no-op for now
    }
  };

  const renderItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.heroBlock}>
          <View style={{ transform: [{ scale: orbScale }] }}>
            <OnboardingOrb
              icon={item.icon}
              gradient={item.gradient}
              dotColor={item.dotColor}
            />
          </View>

          <AppText
            variant="hero"
            weight="bold"
            style={[
              styles.title,
              {
                fontSize: heroFontSize,
                lineHeight: heroLineHeight,
              },
            ]}
          >
            {item.title}
          </AppText>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={[
              styles.description,
              {
                fontSize: descriptionFontSize,
                lineHeight: descriptionLineHeight,
              },
            ]}
          >
            {item.description}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <AppScreen>
      <GridBackground />

      <View style={styles.container}>
        <View style={styles.carouselWrap}>
          <FlatList
            ref={flatListRef}
            data={ONBOARDING_SLIDES}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
          />
        </View>

        <View
          style={[
            styles.bottomArea,
            {
              paddingBottom: isShortHeight ? 24 : 34,
            },
          ]}
        >
          <OnboardingPagination
            count={ONBOARDING_SLIDES.length}
            activeIndex={activeIndex}
            accentColor={activeSlide.dotColor}
            onPressDot={goToSlide}
          />

          <Pressable onPress={handleContinue} style={styles.ctaWrap}>
            <LinearGradient
              colors={[activeSlide.gradient[0], activeSlide.gradient[1]]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[
                styles.cta,
                {
                  minHeight: isCompactWidth ? 70 : 76,
                },
              ]}
            >
              <AppText
                variant="label"
                weight="bold"
                color="#09110E"
                style={styles.ctaText}
              >
                {activeSlide.ctaLabel}
              </AppText>
            </LinearGradient>
          </Pressable>

          <View style={styles.signInRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Already have an account?{" "}
            </AppText>

            <Pressable onPress={handleSignIn}>
              <AppText variant="body" weight="semibold" color={theme.colors.tint}>
                Sign in
              </AppText>
            </Pressable>
          </View>

          <View style={styles.legalRow}>
            <Pressable onPress={() => openExternal(EXTERNAL_LINKS.terms)}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Terms
              </AppText>
            </Pressable>

            <AppText variant="caption" color={theme.colors.textMuted}>
              {" · "}
            </AppText>

            <Pressable onPress={() => openExternal(EXTERNAL_LINKS.privacy)}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Privacy
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselWrap: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 34,
  },
  heroBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 34,
  },
  title: {
    textAlign: "center",
    letterSpacing: -0.8,
    maxWidth: 340,
  },
  description: {
    textAlign: "center",
    maxWidth: 560,
  },
  bottomArea: {
    paddingHorizontal: 34,
    gap: 28,
  },
  ctaWrap: {
    width: "100%",
  },
  cta: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 18,
    lineHeight: 22,
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});