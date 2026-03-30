import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppText from "@/src/components/ui/AppText";
import type { InvestPlatform } from "@/src/features/invest/types";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type Step = "select" | "connect";

type Props = {
  visible: boolean;
  onClose: () => void;
  platforms: InvestPlatform[];
  onConnect: (platformKey: InvestPlatform["key"], credential: string) => void;
};

export default function LinkInvestmentPlatformSheet({
  visible,
  onClose,
  platforms,
  onConnect,
}: Props) {
  const theme = useAppTheme();
  const [step, setStep] = useState<Step>("select");
  const [selectedPlatform, setSelectedPlatform] = useState<InvestPlatform | null>(
    null
  );
  const [credential, setCredential] = useState("");

  useEffect(() => {
    if (!visible) {
      setStep("select");
      setSelectedPlatform(null);
      setCredential("");
    }
  }, [visible]);

  const handleChoosePlatform = (platform: InvestPlatform) => {
    setSelectedPlatform(platform);
    setCredential("");
    setStep("connect");
  };

  const handleConnect = () => {
    if (!selectedPlatform || !credential.trim()) return;
    onConnect(selectedPlatform.key, credential.trim());
    onClose();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {step === "connect" ? (
        <Pressable onPress={() => setStep("select")} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}

      <AppText variant="title" weight="bold" style={styles.headerTitle}>
        {step === "select"
          ? "Link Investment Platform"
          : `Connect ${selectedPlatform?.name ?? ""}`}
      </AppText>

      <Pressable onPress={onClose} hitSlop={10}>
        <Ionicons name="close" size={24} color={theme.colors.text} />
      </Pressable>
    </View>
  );

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="92%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderHeader()}

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        {step === "select" ? (
          <>
            <AppText
              variant="title"
              color={theme.colors.textSecondary}
              style={styles.intro}
            >
              Select a platform to link your investment portfolio
            </AppText>

            <View style={styles.grid}>
              {platforms.map((platform) => (
                <Pressable
                  key={platform.key}
                  onPress={() => handleChoosePlatform(platform)}
                  style={[
                    styles.platformCard,
                    {
                      borderColor: theme.colors.borderSoft,
                      backgroundColor: theme.colors.inputBackground,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.platformGradient,
                      {
                        backgroundColor: platform.gradientFrom,
                      },
                    ]}
                  />

                  <AppText style={styles.platformEmoji}>
                    {platform.emoji}
                  </AppText>

                  <AppText variant="title" weight="bold" style={styles.platformName}>
                    {platform.name}
                  </AppText>

                  <AppText
                    variant="body"
                    color={theme.colors.textSecondary}
                    style={styles.platformSubtitle}
                  >
                    {platform.subtitle}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </>
        ) : selectedPlatform ? (
          <>
            <View
              style={[
                styles.platformHero,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText style={styles.platformHeroEmoji}>
                {selectedPlatform.emoji}
              </AppText>

              <View style={styles.platformHeroCopy}>
                <AppText variant="title" weight="bold" style={styles.platformHeroTitle}>
                  {selectedPlatform.name}
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {selectedPlatform.subtitle}
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.instructionsCard,
                {
                  backgroundColor: "rgba(87,242,200,0.10)",
                  borderColor: "rgba(87,242,200,0.32)",
                },
              ]}
            >
              <AppText variant="title" weight="bold" style={styles.instructionsTitle}>
                How to connect:
              </AppText>

              {selectedPlatform.instructions.map((instruction, index) => (
                <AppText
                  key={`${selectedPlatform.key}-${index}`}
                  variant="title"
                  color={theme.colors.textSecondary}
                  style={styles.instructionText}
                >
                  {index + 1}. {instruction}
                </AppText>
              ))}
            </View>

            <View style={styles.fieldSection}>
              <AppText variant="body" weight="bold" color={theme.colors.textSecondary}>
                {selectedPlatform.apiLabel}
              </AppText>

              <BottomSheetTextInput
                value={credential}
                onChangeText={setCredential}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderSoft,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bodyMedium,
                  },
                ]}
                selectionColor={theme.colors.tint}
                placeholder={`Paste your ${selectedPlatform.apiLabel.toLowerCase()} here`}
                placeholderTextColor={theme.colors.placeholder}
              />

              <AppText variant="body" color={theme.colors.textSecondary}>
                We only request read-only access to view your portfolio
              </AppText>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <Pressable
              onPress={handleConnect}
              disabled={!credential.trim()}
              style={[
                styles.connectButton,
                {
                  backgroundColor: theme.colors.tint,
                  opacity: credential.trim() ? 1 : 0.45,
                },
              ]}
            >
              <Ionicons
                name="link-outline"
                size={20}
                color={theme.colors.primaryText}
              />
              <AppText
                variant="body"
                weight="bold"
                color={theme.colors.primaryText}
              >
                Connect Platform
              </AppText>
            </Pressable>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
  },
  header: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    width: "100%",
    height: 1,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  platformCard: {
    width: "48%",
    minHeight: 148,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    justifyContent: "flex-end",
    overflow: "hidden",
    gap: 4,
  },
  platformGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  platformEmoji: {
    fontSize: 25,
    lineHeight: 34,
    marginBottom: 8,
  },
  platformName: {
    fontSize: 16,
    lineHeight: 22,
  },
  platformSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  platformHero: {
    minHeight: 94,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  platformHeroEmoji: {
    fontSize: 20,
    lineHeight: 34,
  },
  platformHeroCopy: {
    flex: 1,
    gap: 2,
  },
  platformHeroTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  instructionsCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  fieldSection: {
    gap: 10,
  },
  textInput: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 22,
  },
  connectButton: {
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
});