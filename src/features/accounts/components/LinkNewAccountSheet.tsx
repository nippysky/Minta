import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import AppText from "@/src/components/ui/AppText";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type BankOption = {
  id: string;
  name: string;
  color: string;
  iconShape: "square" | "circle";
};

type LinkedAccountDraft = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete?: (payload: LinkedAccountDraft) => void;
};

type Step = "institution" | "details" | "verify" | "success";

const BANKS: BankOption[] = [
  { id: "gtbank", name: "GTBank", color: "#F59E0B", iconShape: "square" },
  { id: "uba", name: "UBA", color: "#EF4444", iconShape: "square" },
  {
    id: "access-bank",
    name: "Access Bank",
    color: "#22C55E",
    iconShape: "square",
  },
  {
    id: "zenith-bank",
    name: "Zenith Bank",
    color: "#DC2626",
    iconShape: "circle",
  },
  {
    id: "first-bank",
    name: "First Bank",
    color: "#F59E0B",
    iconShape: "circle",
  },
  { id: "opay", name: "OPay", color: "#16A34A", iconShape: "circle" },
  { id: "kuda", name: "Kuda", color: "#A855F7", iconShape: "circle" },
  {
    id: "moniepoint",
    name: "MoniePoint",
    color: "#2563EB",
    iconShape: "circle",
  },
  {
    id: "palmpay",
    name: "PalmPay",
    color: "#FACC15",
    iconShape: "circle",
  },
];

function sanitizeAccountNumber(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 10);
}

function resolveMockAccountName(bankName: string, accountNumber: string) {
  if (accountNumber.length !== 10) return "";

  const map: Record<string, string> = {
    MoniePoint: "Chuwkudubem O",
    GTBank: "Adebayo Samuel",
    UBA: "Chioma Okeke",
    "Access Bank": "David Eze",
    "Zenith Bank": "Mariam Bello",
    "First Bank": "Tolu Adepoju",
    OPay: "Moses Daniel",
    Kuda: "Esther Nwosu",
    PalmPay: "Ifeanyi Peter",
  };

  return map[bankName] ?? "Verified Account";
}

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const theme = useAppTheme();
  const refs = useRef<any[]>([]);

  return (
    <View style={styles.otpRow}>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <BottomSheetTextInput
          key={index}
          ref={(ref) => {
            refs.current[index] = ref;
          }}
          value={value[index] ?? ""}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => {
            const digit = text.replace(/[^\d]/g, "");
            const arr = value.split("");
            arr[index] = digit;
            const next = arr.join("").slice(0, 6);
            onChange(next);

            if (digit && index < 5) refs.current[index + 1]?.focus();
            if (!digit && index > 0) refs.current[index - 1]?.focus();
          }}
          style={[
            styles.otpInput,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor:
                value[index] && value[index].length > 0
                  ? theme.colors.borderFocus
                  : theme.colors.borderSoft,
              color: theme.colors.text,
              fontFamily: theme.fonts.bodySemiBold,
              shadowColor:
                value[index] && value[index].length > 0
                  ? theme.colors.glow
                  : "transparent",
            },
          ]}
          textAlign="center"
          selectionColor={theme.colors.tint}
        />
      ))}
    </View>
  );
}

export default function LinkNewAccountSheet({
  visible,
  onClose,
  onComplete,
}: Props) {
  const theme = useAppTheme();

  const [step, setStep] = useState<Step>("institution");
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!visible) return;

    setStep("institution");
    setSelectedBank(null);
    setAccountName("");
    setAccountNumber("");
    setOtp("");
  }, [visible]);

  const resolvedAccountName = useMemo(
    () =>
      selectedBank
        ? resolveMockAccountName(selectedBank.name, accountNumber)
        : "",
    [selectedBank, accountNumber]
  );

  useEffect(() => {
    if (!selectedBank) return;

    if (accountNumber.length === 10) {
      setAccountName(resolvedAccountName);
      return;
    }

    setAccountName("");
  }, [accountNumber, resolvedAccountName, selectedBank]);

  const canContinueDetails =
    !!selectedBank &&
    accountNumber.length === 10 &&
    accountName.trim().length > 0;

  const canVerify = otp.length === 6;

  const handleBack = () => {
    if (step === "institution") {
      onClose();
      return;
    }

    if (step === "details") {
      setStep("institution");
      return;
    }

    if (step === "verify") {
      setStep("details");
      return;
    }

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleContinueFromDetails = () => {
    if (!canContinueDetails) return;
    setStep("verify");
  };

  const handleVerify = () => {
    if (!selectedBank || !canVerify) return;

    onComplete?.({
      bankName: selectedBank.name,
      accountName,
      accountNumber,
    });

    setStep("success");
  };

  const renderHeader = (title: string, showBack = false) => (
    <View style={styles.header}>
      {showBack ? (
        <Pressable onPress={handleBack} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}

      <AppText variant="title" weight="bold" style={styles.title}>
        {title}
      </AppText>

      <Pressable onPress={handleClose} hitSlop={10}>
        <Ionicons name="close" size={24} color={theme.colors.text} />
      </Pressable>
    </View>
  );

  const renderInstitutionStep = () => (
    <>
      {renderHeader("Select Institution")}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <View style={styles.topCopyBlock}>
        <AppText variant="body" color={theme.colors.textSecondary}>
          Select your bank to link your account. Your NIN will be used to
          automatically fetch all your linked accounts.
        </AppText>
      </View>

      <View style={styles.bankGrid}>
        {BANKS.map((bank) => (
          <Pressable
            key={bank.id}
            onPress={() => {
              setSelectedBank(bank);
              setStep("details");
            }}
            style={[
              styles.bankCard,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View
              style={[
                bank.iconShape === "square"
                  ? styles.bankSquareMark
                  : styles.bankCircleMark,
                { backgroundColor: bank.color },
              ]}
            />
            <AppText
              variant="body"
              weight="semibold"
              style={styles.bankCardLabel}
            >
              {bank.name}
            </AppText>
          </Pressable>
        ))}
      </View>
    </>
  );

  const renderDetailsStep = () => (
    <>
      {renderHeader("Enter Details", true)}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      {selectedBank ? (
        <View
          style={[
            styles.selectedInstitutionCard,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View
            style={[
              selectedBank.iconShape === "square"
                ? styles.selectedSquareMark
                : styles.selectedCircleMark,
              { backgroundColor: selectedBank.color },
            ]}
          />
          <AppText variant="title" weight="semibold" style={styles.bankHeroName}>
            {selectedBank.name}
          </AppText>
        </View>
      ) : null}

      <View style={styles.fieldBlock}>
        <AppText variant="body" color={theme.colors.textSecondary}>
          Account Name
        </AppText>

        <BottomSheetTextInput
          value={accountName}
          onChangeText={setAccountName}
          editable={false}
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.borderSoft,
              color: accountName ? theme.colors.text : theme.colors.placeholder,
              fontFamily: theme.fonts.bodyMedium,
            },
          ]}
          selectionColor={theme.colors.tint}
          placeholder="Enter account holder name"
          placeholderTextColor={theme.colors.placeholder}
        />
      </View>

      <View style={styles.fieldBlock}>
        <AppText variant="body" color={theme.colors.textSecondary}>
          Account Number
        </AppText>

        <BottomSheetTextInput
          value={accountNumber}
          onChangeText={(text) => setAccountNumber(sanitizeAccountNumber(text))}
          keyboardType="number-pad"
          maxLength={10}
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor:
                accountNumber.length === 10
                  ? theme.colors.borderFocus
                  : theme.colors.borderSoft,
              color: theme.colors.text,
              fontFamily: theme.fonts.bodyMedium,
              shadowColor:
                accountNumber.length === 10
                  ? theme.colors.glow
                  : "transparent",
            },
          ]}
          selectionColor={theme.colors.tint}
          placeholder="0123456789"
          placeholderTextColor={theme.colors.placeholder}
        />

        <AppText variant="caption" color={theme.colors.textSecondary}>
          {accountNumber.length}/10 digits
        </AppText>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <Pressable
        onPress={handleContinueFromDetails}
        disabled={!canContinueDetails}
        style={[
          styles.primaryButton,
          {
            backgroundColor: theme.colors.tint,
            opacity: canContinueDetails ? 1 : 0.55,
          },
        ]}
      >
        <AppText
          variant="title"
          weight="bold"
          color={theme.colors.primaryText}
          style={styles.primaryButtonText}
        >
          Continue
        </AppText>
      </Pressable>
    </>
  );

  const renderVerifyStep = () => (
    <>
      {renderHeader("Verify Account", true)}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <View style={styles.verifyContent}>
        <View
          style={[
            styles.verifyIconOuter,
            { backgroundColor: theme.colors.tint },
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={34}
            color={theme.colors.primaryText}
          />
        </View>

        <AppText variant="hero" weight="bold" style={styles.verifyTitle}>
          Verify Ownership
        </AppText>

        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.verifySubtitle}
        >
          Enter the OTP sent to your registered phone number
        </AppText>

        <OtpInput value={otp} onChange={setOtp} />
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <Pressable
        onPress={handleVerify}
        disabled={!canVerify}
        style={[
          styles.primaryButton,
          {
            backgroundColor: theme.colors.tint,
            opacity: canVerify ? 1 : 0.55,
          },
        ]}
      >
        <AppText
          variant="title"
          weight="bold"
          color={theme.colors.primaryText}
          style={styles.primaryButtonText}
        >
          Verify
        </AppText>
      </Pressable>
    </>
  );

  const renderSuccessStep = () => (
    <>
      {renderHeader("Success!")}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <View style={styles.successContent}>
        <View style={styles.successIconWrap}>
          <View
            style={[
              styles.successGlow,
              { backgroundColor: "rgba(87,242,200,0.14)" },
            ]}
          />
          <View style={styles.successIconInner}>
            <Ionicons name="checkmark" size={36} color="#07110E" />
          </View>
        </View>

        <AppText variant="hero" weight="bold" style={styles.successTitle}>
          Account Synced!
        </AppText>

        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.successMessage}
        >
          Your {selectedBank?.name ?? "bank"} account has been successfully
          linked to MiNTA.
        </AppText>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <Pressable
        onPress={onClose}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.tint },
        ]}
      >
        <AppText
          variant="title"
          weight="bold"
          color={theme.colors.primaryText}
          style={styles.primaryButtonText}
        >
          Done
        </AppText>
      </Pressable>
    </>
  );

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="88%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {step === "institution" ? renderInstitutionStep() : null}
        {step === "details" ? renderDetailsStep() : null}
        {step === "verify" ? renderVerifyStep() : null}
        {step === "success" ? renderSuccessStep() : null}
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
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSpacer: {
    width: 24,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    width: "100%",
  },

  topCopyBlock: {
    paddingTop: 6,
    paddingBottom: 4,
  },

  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  bankCard: {
    width: "31.6%",
    minHeight: 122,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 14,
  },
  bankSquareMark: {
    width: 38,
    height: 38,
    borderRadius: 6,
  },
  bankCircleMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  bankCardLabel: {
    textAlign: "center",
    lineHeight: 24,
  },

  selectedInstitutionCard: {
    minHeight: 84,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  selectedSquareMark: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  selectedCircleMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  bankHeroName: {
    fontSize: 16,
    lineHeight: 24,
  },

  fieldBlock: {
    gap: 10,
  },
  textInput: {
    minHeight: 64,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    fontSize: 14,
    lineHeight: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 2,
  },

  verifyContent: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
  },
  verifyIconOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  verifyTitle: {
    fontSize: 16,
    lineHeight: 30,
    textAlign: "center",
  },
  verifySubtitle: {
    textAlign: "center",
    maxWidth: 320,
  },

  otpRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    justifyContent: "center",
    flexWrap: "nowrap",
  },
  otpInput: {
    width: 54,
    height: 76,
    borderRadius: 22,
    borderWidth: 1.5,
    fontSize: 16,
    lineHeight: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 2,
  },

  successContent: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 22,
  },
  successIconWrap: {
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  successIconInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FC3F7",
  },
  successTitle: {
    fontSize: 16,
    lineHeight: 32,
    textAlign: "center",
  },
  successMessage: {
    textAlign: "center",
    maxWidth: 320,
  },

  primaryButton: {
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
  },
});