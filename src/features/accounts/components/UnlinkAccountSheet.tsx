import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, View } from "react-native";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { LinkedAccount } from "@/src/features/accounts/types";
import { formatCurrency } from "@/src/features/accounts/utils";

type Props = {
  visible: boolean;
  onClose: () => void;
  account: LinkedAccount | null;
  pin: string;
  onChangePin: (value: string) => void;
  onConfirm: () => void;
};

export default function UnlinkAccountSheet({
  visible,
  onClose,
  account,
  pin,
  onChangePin,
  onConfirm,
}: Props) {
  const theme = useAppTheme();

  if (!account) return null;

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="84%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <AppText variant="title" weight="bold" style={styles.title}>
            Unlink Account
          </AppText>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View
          style={[
            styles.warningCard,
            {
              backgroundColor: "rgba(239,68,68,0.14)",
              borderColor: "rgba(239,68,68,0.34)",
            },
          ]}
        >
          <Ionicons name="warning-outline" size={24} color="#EF4444" />
          <View style={styles.warningCopy}>
            <AppText variant="body" weight="bold" color="#EF4444">
              Are you sure?
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              This will remove your {account.bankName} account from MiNTA. You
              can re-link it later.
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.accountCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(87,242,200,0.22)",
            },
          ]}
        >
          <View
            style={[styles.accountGlow, { backgroundColor: account.accent }]}
          />
          <Ionicons
            name={account.icon as keyof typeof Ionicons.glyphMap}
            size={26}
            color={account.logoColor}
          />
          <View style={styles.accountCopy}>
            <AppText variant="body" weight="bold">
              {account.bankName}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {account.accountNumber}
            </AppText>
          </View>
          <AppText variant="body" weight="bold">
            {formatCurrency(account.balance)}
          </AppText>
        </View>

        <View style={styles.bullets}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            What happens when you unlink:
          </AppText>

          {[
            "Your transaction history will be preserved",
            "The account balance will no longer be synced",
            "You can re-link this account anytime",
          ].map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Ionicons name="checkmark" size={18} color={theme.colors.tint} />
              <AppText variant="body" color={theme.colors.textSecondary}>
                {item}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.pinWrap}>
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.pinLabel}>
            Enter your 4-digit PIN to confirm
          </AppText>

          <View style={styles.pinRow}>
            {[0, 1, 2, 3].map((index) => (
              <BottomSheetTextInput
                key={index}
                value={pin[index] ?? ""}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(text) => {
                  const clean = text.replace(/[^\d]/g, "").slice(0, 1);
                  const chars = pin.split("");
                  chars[index] = clean;
                  onChangePin(chars.join("").slice(0, 4));
                }}
                textAlign="center"
                selectionColor={theme.colors.tint}
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderSoft,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bodySemiBold,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <AppText variant="body" weight="bold">
              Cancel
            </AppText>
          </Pressable>

          <Pressable
            onPress={onConfirm}
            style={[
              styles.dangerButton,
              {
                backgroundColor:
                  pin.length === 4 ? "rgba(170,55,49,0.92)" : "rgba(170,55,49,0.54)",
              },
            ]}
          >
            <AppText variant="body" weight="bold" color={theme.colors.text}>
              Unlink Account
            </AppText>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 14,
  },
  header: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  warningCopy: {
    flex: 1,
    gap: 4,
  },
  accountCard: {
    minHeight: 84,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  accountGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  accountCopy: {
    flex: 1,
    gap: 2,
  },
  bullets: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pinWrap: {
    gap: 12,
  },
  pinLabel: {
    textAlign: "center",
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  pinInput: {
    width: 54,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});