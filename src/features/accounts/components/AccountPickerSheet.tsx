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
import type { LinkedAccount } from "@/src/features/accounts/types";
import { formatCurrency } from "@/src/features/accounts/utils";

type Mode = "transfer" | "fund-general" | "fund-account";

type TransferStep =
  | "source"
  | "destination"
  | "amount"
  | "category"
  | "confirm";

type DestinationType = "own" | "other-bank";

type TransferPayload = {
  source: LinkedAccount;
  destinationType: DestinationType;
  destinationAccount?: LinkedAccount | null;
  destinationBankName?: string;
  destinationAccountNumber?: string;
  destinationAccountName?: string;
  amount: number;
  fee: number;
  category: string;
};

type FundMethod = "bank-transfer" | "debit-card" | "ussd";
type FundStep = "target" | "method" | "amount" | "success";

export type FundPayload = {
  target: LinkedAccount;
  amount: number;
  method: FundMethod;
  reference: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  mode: Mode;
  accounts: LinkedAccount[];
  targetAccount?: LinkedAccount | null;
  sourceAccount?: LinkedAccount | null;
  onSelectAccount: (account: LinkedAccount) => void;
  onTransferComplete?: (payload: TransferPayload) => void;
  onFundComplete?: (payload: FundPayload) => void;
};

const CATEGORY_OPTIONS = [
  { label: "Miscellaneous", icon: "attach-outline" },
  { label: "Transport", icon: "car-outline" },
  { label: "Entertainment", icon: "film-outline" },
  { label: "Food & Dining", icon: "restaurant-outline" },
  { label: "Groceries", icon: "cart-outline" },
  { label: "Health", icon: "heart" },
  { label: "Housing", icon: "home-outline" },
  { label: "Personal Care", icon: "person-outline" },
  { label: "Phone & Internet", icon: "phone-portrait-outline" },
  { label: "Utilities", icon: "flash-outline" },
  { label: "Savings", icon: "cash-outline" },
  { label: "Donations", icon: "hand-left-outline" },
  { label: "Shopping", icon: "bag-handle-outline" },
  { label: "Travel", icon: "airplane-outline" },
] as const;

const EXTERNAL_BANKS = [
  { name: "GTBank", color: "#F59E0B" },
  { name: "UBA", color: "#EF4444" },
  { name: "Access Bank", color: "#22C55E" },
  { name: "Zenith Bank", color: "#DC2626" },
  { name: "First Bank", color: "#F59E0B" },
  { name: "Kuda", color: "#A855F7" },
  { name: "OPay", color: "#22C55E" },
  { name: "MoniePoint", color: "#2563EB" },
] as const;

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000] as const;
const TRANSFER_FEE = 25;
const FUND_MINIMUM = 100;

function formatAccountNumberInput(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 10);
}

function formatAmountInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

function amountNumber(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function iconForAccount(account: LinkedAccount) {
  return account.icon as keyof typeof Ionicons.glyphMap;
}

function recipientNameFor(bankName: string, accountNumber: string) {
  if (accountNumber.length !== 10) return "";
  if (bankName === "GTBank") return "Oluwaseun Adeyemi";
  if (bankName === "UBA") return "Sarah Okafor";
  if (bankName === "Access Bank") return "David Eze";
  if (bankName === "Zenith Bank") return "Mariam Bello";
  if (bankName === "First Bank") return "Tolu Adepoju";
  return "Verified Recipient";
}

function generateReference() {
  const tail = Math.random().toString(36).toUpperCase().slice(2, 10);
  return `TXN${Date.now()}${tail}`;
}

function fundingMethodLabel(method: FundMethod | null) {
  if (method === "bank-transfer") return "Bank Transfer";
  if (method === "debit-card") return "Debit Card";
  if (method === "ussd") return "USSD";
  return "";
}

function fundingSuccessTargetName(account: LinkedAccount | null) {
  if (!account) return "account";
  return account.kind === "wallet" ? "MiNTA account" : `${account.bankName} account`;
}

function PinInput({
  pin,
  onChange,
}: {
  pin: string;
  onChange: (next: string) => void;
}) {
  const theme = useAppTheme();
  const refs = useRef<any[]>([]);

  return (
    <View style={styles.pinRow}>
      {[0, 1, 2, 3].map((index) => (
        <BottomSheetTextInput
          key={index}
          ref={(ref) => {
            refs.current[index] = ref;
          }}
          value={pin[index] ?? ""}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => {
            const digit = text.replace(/[^\d]/g, "");
            const arr = pin.split("");
            arr[index] = digit;
            const next = arr.join("").slice(0, 4);
            onChange(next);

            if (digit && index < 3) refs.current[index + 1]?.focus();
          }}
          style={[
            styles.pinInput,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.borderSoft,
              color: theme.colors.text,
              fontFamily: theme.fonts.bodySemiBold,
            },
          ]}
          textAlign="center"
          selectionColor={theme.colors.tint}
        />
      ))}
    </View>
  );
}

export default function AccountPickerSheet({
  visible,
  onClose,
  mode,
  accounts,
  targetAccount,
  sourceAccount,
  onSelectAccount,
  onTransferComplete,
  onFundComplete,
}: Props) {
  const theme = useAppTheme();

  const [step, setStep] = useState<TransferStep>("source");
  const [selectedSource, setSelectedSource] = useState<LinkedAccount | null>(
    null
  );
  const [destinationType, setDestinationType] =
    useState<DestinationType>("own");
  const [selectedDestination, setSelectedDestination] =
    useState<LinkedAccount | null>(null);
  const [otherBankName, setOtherBankName] = useState("");
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [otherAccountNumber, setOtherAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pin, setPin] = useState("");

  const [fundStep, setFundStep] = useState<FundStep>("target");
  const [fundTarget, setFundTarget] = useState<LinkedAccount | null>(null);
  const [fundMethod, setFundMethod] = useState<FundMethod | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundReference, setFundReference] = useState("");

  useEffect(() => {
    if (!visible) return;

    setSelectedSource(sourceAccount ?? null);
    setDestinationType("own");
    setSelectedDestination(null);
    setOtherBankName("");
    setBankPickerOpen(false);
    setOtherAccountNumber("");
    setAmount("");
    setSelectedCategory("");
    setPin("");

    setFundMethod(null);
    setFundAmount("");
    setFundReference("");

    if (mode === "transfer") {
      setStep(sourceAccount ? "destination" : "source");
      setFundTarget(null);
      setFundStep("target");
      return;
    }

    if (mode === "fund-account" && targetAccount) {
      setFundTarget(targetAccount);
      setFundStep("method");
      return;
    }

    setFundTarget(null);
    setFundStep("target");
  }, [visible, mode, sourceAccount, targetAccount]);

  const sourceCandidates = useMemo(() => {
    if (mode !== "transfer") return accounts;
    return accounts.filter((item) => item.balance >= 0);
  }, [accounts, mode]);

  const ownDestinationAccounts = useMemo(() => {
    if (!selectedSource) return accounts;
    return accounts.filter((item) => item.id !== selectedSource.id);
  }, [accounts, selectedSource]);

  const externalRecipientName = useMemo(
    () => recipientNameFor(otherBankName, otherAccountNumber),
    [otherAccountNumber, otherBankName]
  );

  const numericAmount = amountNumber(amount);
  const fee = destinationType === "other-bank" ? TRANSFER_FEE : 0;
  const totalCharge = numericAmount + fee;

  const canContinueFromAmount =
    !!selectedSource &&
    numericAmount > 0 &&
    totalCharge <= selectedSource.balance &&
    ((destinationType === "own" && !!selectedDestination) ||
      (destinationType === "other-bank" &&
        !!otherBankName &&
        otherAccountNumber.length === 10 &&
        !!externalRecipientName));

  const currentDestinationLabel =
    destinationType === "own"
      ? selectedDestination?.bankName ?? ""
      : otherBankName;

  const fundNumericAmount = amountNumber(fundAmount);
  const canContinueFundAmount = !!fundTarget && fundNumericAmount >= FUND_MINIMUM;

  const handleBack = () => {
    if (mode === "transfer") {
      if (step === "source") {
        onClose();
        return;
      }

      if (step === "destination") {
        if (sourceAccount) {
          onClose();
        } else {
          setStep("source");
        }
        return;
      }

      if (step === "amount") {
        setStep("destination");
        return;
      }

      if (step === "category") {
        setStep("amount");
        return;
      }

      setStep("category");
      return;
    }

    if (fundStep === "target") {
      onClose();
      return;
    }

    if (fundStep === "method") {
      if (mode === "fund-account") {
        onClose();
      } else {
        setFundStep("target");
      }
      return;
    }

    if (fundStep === "amount") {
      setFundStep("method");
      return;
    }

    if (fundStep === "success") {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSourceSelect = (account: LinkedAccount) => {
    if (mode !== "transfer") {
      onSelectAccount(account);
      return;
    }

    setSelectedSource(account);
    setStep("destination");
  };

  const handleOwnDestinationSelect = (account: LinkedAccount) => {
    setSelectedDestination(account);
    setStep("amount");
  };

  const handleContinueOtherBank = () => {
    if (!otherBankName || otherAccountNumber.length !== 10 || !externalRecipientName) {
      return;
    }
    setStep("amount");
  };

  const handleContinueAmount = () => {
    if (!canContinueFromAmount) return;
    setStep("category");
  };

  const handleContinueCategory = () => {
    if (!selectedCategory) return;
    setStep("confirm");
  };

  const handleConfirmTransfer = () => {
    if (!selectedSource || pin.length !== 4 || !onTransferComplete) return;

    onTransferComplete({
      source: selectedSource,
      destinationType,
      destinationAccount: destinationType === "own" ? selectedDestination : null,
      destinationBankName:
        destinationType === "other-bank" ? otherBankName : undefined,
      destinationAccountNumber:
        destinationType === "other-bank" ? otherAccountNumber : undefined,
      destinationAccountName:
        destinationType === "other-bank" ? externalRecipientName : undefined,
      amount: numericAmount,
      fee,
      category: selectedCategory,
    });

    onClose();
  };

  const handleFundTargetSelect = (account: LinkedAccount) => {
    setFundTarget(account);
    setFundStep("method");
  };

  const handleFundMethodSelect = (method: FundMethod) => {
    setFundMethod(method);
    setFundAmount("");
    setFundStep("amount");
  };

  const handleFundSubmit = () => {
    if (!fundTarget || !fundMethod || !canContinueFundAmount) return;

    const reference = generateReference();
    setFundReference(reference);

    onFundComplete?.({
      target: fundTarget,
      amount: fundNumericAmount,
      method: fundMethod,
      reference,
    });

    setFundStep("success");
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

  const renderTransferSourceStep = () => (
    <>
      {renderHeader("Select Source Account", false)}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <View style={styles.list}>
        {sourceCandidates.map((account) => (
          <Pressable
            key={account.id}
            onPress={() => handleSourceSelect(account)}
            style={[
              styles.row,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={styles.logoWrap}>
                <Ionicons
                  name={iconForAccount(account)}
                  size={22}
                  color={account.logoColor}
                />
              </View>

              <View style={styles.rowCopy}>
                <AppText variant="body" weight="bold">
                  {account.bankName}
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {account.accountNumber}
                </AppText>
              </View>
            </View>

            <AppText variant="body" weight="bold">
              {formatCurrency(account.balance)}
            </AppText>
          </Pressable>
        ))}
      </View>
    </>
  );

  const renderTransferDestinationStep = () => {
    if (!selectedSource) return null;

    return (
      <>
        {renderHeader("Select Destination", true)}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View
          style={[
            styles.sourceHeroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(87,242,200,0.22)",
            },
          ]}
        >
          <View
            style={[
              styles.sourceHeroGlow,
              { backgroundColor: selectedSource.accent },
            ]}
          />
          <View style={styles.rowLeft}>
            <View style={styles.logoWrapLarge}>
              <Ionicons
                name={iconForAccount(selectedSource)}
                size={24}
                color={selectedSource.logoColor}
              />
            </View>

            <View style={styles.rowCopy}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                From
              </AppText>
              <AppText variant="title" weight="semibold" style={styles.heroName}>
                {selectedSource.bankName === "MiNTA Wallet"
                  ? "MiNTA"
                  : selectedSource.bankName}
              </AppText>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.segmentWrap,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          {(["own", "other-bank"] as const).map((item) => {
            const active = destinationType === item;
            return (
              <Pressable
                key={item}
                onPress={() => setDestinationType(item)}
                style={[
                  styles.segmentButton,
                  active && { backgroundColor: theme.colors.tint },
                ]}
              >
                <AppText
                  variant="label"
                  weight="semibold"
                  color={active ? theme.colors.primaryText : theme.colors.text}
                >
                  {item === "own" ? "Own Accounts" : "Other Banks"}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {destinationType === "own" ? (
          <>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Transfer to:
            </AppText>

            <View style={styles.list}>
              {ownDestinationAccounts.map((account) => (
                <Pressable
                  key={account.id}
                  onPress={() => handleOwnDestinationSelect(account)}
                  style={[
                    styles.row,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.logoWrap}>
                      <Ionicons
                        name={iconForAccount(account)}
                        size={22}
                        color={account.logoColor}
                      />
                    </View>

                    <View style={styles.rowCopy}>
                      <AppText variant="body" weight="bold">
                        {account.bankName}
                      </AppText>
                      <AppText variant="body" color={theme.colors.textSecondary}>
                        {account.accountNumber}
                      </AppText>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.fieldBlock}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Select Bank
              </AppText>

              <Pressable
                onPress={() => setBankPickerOpen((prev) => !prev)}
                style={[
                  styles.selectField,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.borderSoft,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  {otherBankName ? (
                    <View
                      style={[
                        styles.bankColorDot,
                        {
                          backgroundColor:
                            EXTERNAL_BANKS.find((item) => item.name === otherBankName)
                              ?.color ?? theme.colors.tint,
                        },
                      ]}
                    />
                  ) : null}

                  <AppText
                    variant="body"
                    color={
                      otherBankName
                        ? theme.colors.text
                        : theme.colors.placeholder
                    }
                  >
                    {otherBankName || "Choose a bank"}
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-down"
                  size={22}
                  color={theme.colors.text}
                />
              </Pressable>

              {bankPickerOpen ? (
                <View
                  style={[
                    styles.dropdownList,
                    {
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.borderSoft,
                    },
                  ]}
                >
                  {EXTERNAL_BANKS.map((bank) => (
                    <Pressable
                      key={bank.name}
                      onPress={() => {
                        setOtherBankName(bank.name);
                        setBankPickerOpen(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <View
                        style={[
                          styles.bankColorDot,
                          { backgroundColor: bank.color },
                        ]}
                      />
                      <AppText variant="body">{bank.name}</AppText>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Account Number
              </AppText>

              <BottomSheetTextInput
                value={otherAccountNumber}
                onChangeText={(text) =>
                  setOtherAccountNumber(formatAccountNumberInput(text))
                }
                keyboardType="number-pad"
                maxLength={10}
                style={[
                  styles.sheetTextInput,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor:
                      otherAccountNumber.length === 10
                        ? theme.colors.borderFocus
                        : theme.colors.borderSoft,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bodyMedium,
                    shadowColor:
                      otherAccountNumber.length === 10
                        ? theme.colors.glow
                        : "transparent",
                  },
                ]}
                selectionColor={theme.colors.tint}
                placeholder="0123456789"
                placeholderTextColor={theme.colors.placeholder}
              />

              <AppText variant="caption" color={theme.colors.textSecondary}>
                {otherAccountNumber.length}/10 digits
              </AppText>
            </View>

            {externalRecipientName ? (
              <View
                style={[
                  styles.resolvedAccountCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: "rgba(87,242,200,0.22)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.sourceHeroGlow,
                    { backgroundColor: "rgba(87,242,200,0.12)" },
                  ]}
                />
                <View style={styles.rowLeft}>
                  <View
                    style={[
                      styles.verifiedBadge,
                      { backgroundColor: theme.colors.tintSoft },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.tint}
                    />
                  </View>

                  <View style={styles.rowCopy}>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                      Account Name
                    </AppText>
                    <AppText variant="body" weight="bold">
                      {externalRecipientName}
                    </AppText>
                  </View>
                </View>
              </View>
            ) : null}

            <View
              style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
            />

            <Pressable
              onPress={handleContinueOtherBank}
              disabled={
                !otherBankName ||
                otherAccountNumber.length !== 10 ||
                !externalRecipientName
              }
              style={[
                styles.primaryFooterButton,
                {
                  backgroundColor: theme.colors.tint,
                  opacity:
                    !otherBankName ||
                    otherAccountNumber.length !== 10 ||
                    !externalRecipientName
                      ? 0.55
                      : 1,
                },
              ]}
            >
              <AppText
                variant="title"
                weight="bold"
                color={theme.colors.primaryText}
                style={styles.primaryFooterText}
              >
                Continue
              </AppText>
            </Pressable>
          </>
        )}
      </>
    );
  };

  const renderAmountStep = () => {
    if (!selectedSource) return null;

    return (
      <>
        {renderHeader("Enter Amount", true)}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View
          style={[
            styles.transferRouteCard,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.routeEdge}>
            <View style={styles.routeIdentity}>
              <Ionicons
                name={iconForAccount(selectedSource)}
                size={22}
                color={selectedSource.logoColor}
              />
              <View style={styles.routeCopy}>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  From
                </AppText>
                <AppText variant="body" weight="bold">
                  {selectedSource.bankName === "MiNTA Wallet"
                    ? "MiNTA"
                    : selectedSource.bankName}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.routeCenter}>
            <Ionicons
              name="swap-horizontal"
              size={24}
              color={theme.colors.textMuted}
            />
          </View>

          <View style={styles.routeEdgeRight}>
            <View style={styles.routeCopyRight}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                To
              </AppText>
              <AppText variant="body" weight="bold">
                {currentDestinationLabel}
              </AppText>
            </View>

            {destinationType === "own" && selectedDestination ? (
              <Ionicons
                name={iconForAccount(selectedDestination)}
                size={22}
                color={selectedDestination.logoColor}
              />
            ) : destinationType === "other-bank" && otherBankName ? (
              <View
                style={[
                  styles.bankColorDotLarge,
                  {
                    backgroundColor:
                      EXTERNAL_BANKS.find((item) => item.name === otherBankName)
                        ?.color ?? theme.colors.tint,
                  },
                ]}
              />
            ) : null}
          </View>
        </View>

        {destinationType === "other-bank" && externalRecipientName ? (
          <View
            style={[
              styles.recipientCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: "rgba(87,242,200,0.22)",
              },
            ]}
          >
            <View
              style={[
                styles.sourceHeroGlow,
                { backgroundColor: "rgba(87,242,200,0.12)" },
              ]}
            />
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Sending to
            </AppText>
            <AppText variant="title" weight="bold" style={styles.recipientName}>
              {externalRecipientName}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {otherAccountNumber}
            </AppText>
          </View>
        ) : null}

        <View style={styles.amountMetaBlock}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Available Balance
          </AppText>
          <AppText
            variant="hero"
            weight="bold"
            color={theme.colors.tint}
            style={styles.balanceText}
          >
            {formatCurrency(selectedSource.balance)}
          </AppText>
        </View>

        <View style={styles.fieldBlock}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Amount to Transfer
          </AppText>

          <View
            style={[
              styles.amountInputWrap,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <AppText variant="hero" weight="bold">
              ₦
            </AppText>
            <BottomSheetTextInput
              value={amount}
              onChangeText={(text) => setAmount(formatAmountInput(text))}
              keyboardType="number-pad"
              style={[
                styles.amountInput,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.headingBold,
                },
              ]}
              selectionColor={theme.colors.tint}
              placeholder="0"
              placeholderTextColor={theme.colors.placeholder}
              textAlign="center"
            />
          </View>

          {fee > 0 ? (
            <AppText variant="body" color={theme.colors.textSecondary}>
              Transfer fee: {formatCurrency(fee)}
            </AppText>
          ) : null}
        </View>

        <View style={styles.quickAmountRow}>
          {QUICK_AMOUNTS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setAmount(item.toLocaleString("en-NG"))}
              style={[
                styles.quickAmountChip,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText variant="body" weight="semibold">
                ₦{item >= 1000 ? `${item / 1000}k` : item}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <Pressable
          onPress={handleContinueAmount}
          disabled={!canContinueFromAmount}
          style={[
            styles.primaryFooterButton,
            {
              backgroundColor: theme.colors.tint,
              opacity: canContinueFromAmount ? 1 : 0.55,
            },
          ]}
        >
          <AppText
            variant="title"
            weight="bold"
            color={theme.colors.primaryText}
            style={styles.primaryFooterText}
          >
            Continue
          </AppText>
        </Pressable>
      </>
    );
  };

  const renderCategoryStep = () => (
    <>
      {renderHeader("Choose Category", true)}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <View style={styles.centerBlock}>
        <AppText variant="title" weight="bold" style={styles.centerTitle}>
          Choose Category
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          Tag this transaction for better tracking
        </AppText>
      </View>

      <View style={styles.categoryGrid}>
        {CATEGORY_OPTIONS.map((item) => {
          const active = selectedCategory === item.label;
          return (
            <Pressable
              key={item.label}
              onPress={() => setSelectedCategory(item.label)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active
                    ? theme.colors.tint
                    : theme.colors.inputBackground,
                  borderColor: active
                    ? theme.colors.tint
                    : theme.colors.borderSoft,
                },
              ]}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={active ? theme.colors.primaryText : theme.colors.text}
              />
              <AppText
                variant="body"
                weight="semibold"
                color={active ? theme.colors.primaryText : theme.colors.text}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <Pressable
        onPress={handleContinueCategory}
        disabled={!selectedCategory}
        style={[
          styles.primaryFooterButton,
          {
            backgroundColor: theme.colors.tint,
            opacity: selectedCategory ? 1 : 0.55,
          },
        ]}
      >
        <AppText
          variant="title"
          weight="bold"
          color={theme.colors.primaryText}
          style={styles.primaryFooterText}
        >
          Continue
        </AppText>
      </Pressable>
    </>
  );

  const renderConfirmStep = () => {
    if (!selectedSource) return null;

    const destinationLine =
      destinationType === "own"
        ? selectedDestination?.bankName ?? ""
        : `${externalRecipientName} (${otherBankName})`;

    return (
      <>
        {renderHeader("Confirm Transfer", true)}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View style={styles.confirmWrap}>
          <View
            style={[
              styles.confirmIcon,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <Ionicons
              name="swap-horizontal"
              size={34}
              color={theme.colors.primaryText}
            />
          </View>

          <AppText variant="title" weight="bold" style={styles.confirmTitle}>
            Confirm Transfer
          </AppText>

          <AppText variant="body" color={theme.colors.textSecondary}>
            You&apos;re about to transfer
          </AppText>

          <AppText
            variant="hero"
            weight="bold"
            color={theme.colors.tint}
            style={styles.confirmAmount}
          >
            {formatCurrency(numericAmount)}
          </AppText>

          {fee > 0 ? (
            <AppText variant="body" color={theme.colors.textSecondary}>
              + {formatCurrency(fee)} fee = {formatCurrency(totalCharge)} total
            </AppText>
          ) : null}

          <View style={styles.confirmMeta}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              From:{" "}
              {selectedSource.bankName === "MiNTA Wallet"
                ? "MiNTA"
                : selectedSource.bankName}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              To: {destinationLine}
            </AppText>
          </View>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.pinPrompt}
          >
            Enter your 4-digit PIN
          </AppText>

          <PinInput pin={pin} onChange={setPin} />
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <Pressable
          onPress={handleConfirmTransfer}
          disabled={pin.length !== 4}
          style={[
            styles.primaryFooterButton,
            {
              backgroundColor: theme.colors.tint,
              opacity: pin.length === 4 ? 1 : 0.55,
            },
          ]}
        >
          <AppText
            variant="title"
            weight="bold"
            color={theme.colors.primaryText}
            style={styles.primaryFooterText}
          >
            Confirm Transfer
          </AppText>
        </Pressable>
      </>
    );
  };

  const renderFundTargetStep = () => (
    <>
      {renderHeader("Select Account to Fund", false)}
      <View
        style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
      />

      <View style={styles.list}>
        {accounts.map((account) => (
          <Pressable
            key={account.id}
            onPress={() => handleFundTargetSelect(account)}
            style={[
              styles.row,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor:
                  fundTarget?.id === account.id
                    ? theme.colors.borderFocus
                    : theme.colors.borderSoft,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={styles.logoWrap}>
                <Ionicons
                  name={iconForAccount(account)}
                  size={22}
                  color={account.logoColor}
                />
              </View>

              <View style={styles.rowCopy}>
                <AppText variant="body" weight="bold">
                  {account.bankName === "MiNTA Wallet" ? "MiNTA" : account.bankName}
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {account.accountNumber}
                </AppText>
              </View>
            </View>

            <AppText variant="body" weight="bold">
              {formatCurrency(account.balance)}
            </AppText>
          </Pressable>
        ))}
      </View>
    </>
  );

  const renderFundMethodStep = () => {
    if (!fundTarget) return null;

    const targetName =
      fundTarget.kind === "wallet"
        ? "MiNTA"
        : fundTarget.bankName === "MiNTA Wallet"
          ? "MiNTA"
          : fundTarget.bankName;

    const methodCards: {
      key: FundMethod;
      title: string;
      subtitle: string;
      icon: keyof typeof Ionicons.glyphMap;
    }[] = [
      {
        key: "bank-transfer",
        title: "Bank Transfer",
        subtitle: "Transfer from another bank",
        icon: "business-outline",
      },
      {
        key: "debit-card",
        title: "Debit Card",
        subtitle: "Fund with your card",
        icon: "card-outline",
      },
      {
        key: "ussd",
        title: "USSD",
        subtitle: "Use USSD code",
        icon: "wallet-outline",
      },
    ];

    return (
      <>
        {renderHeader("Choose Funding Source", true)}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View
          style={[
            styles.sourceHeroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: "rgba(87,242,200,0.22)",
            },
          ]}
        >
          <View
            style={[
              styles.sourceHeroGlow,
              { backgroundColor: fundTarget.accent },
            ]}
          />
          <View style={styles.rowLeft}>
            <View style={styles.logoWrapLarge}>
              <Ionicons
                name={iconForAccount(fundTarget)}
                size={24}
                color={fundTarget.logoColor}
              />
            </View>

            <View style={styles.rowCopy}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                Funding
              </AppText>
              <AppText variant="title" weight="semibold" style={styles.heroName}>
                {targetName}
              </AppText>
            </View>
          </View>
        </View>

        <AppText variant="body" color={theme.colors.textSecondary}>
          Choose how to fund:
        </AppText>

        <View style={styles.methodList}>
          {methodCards.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handleFundMethodSelect(item.key)}
              style={[
                styles.methodCard,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <View
                style={[
                  styles.methodIconWrap,
                  { backgroundColor: theme.colors.tintSoft },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={theme.colors.tint}
                />
              </View>

              <View style={styles.methodCopy}>
                <AppText variant="title" weight="semibold" style={styles.methodTitle}>
                  {item.title}
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {item.subtitle}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      </>
    );
  };

  const renderFundAmountStep = () => {
    if (!fundTarget || !fundMethod) return null;

    const targetName =
      fundTarget.kind === "wallet"
        ? "MiNTA"
        : fundTarget.bankName === "MiNTA Wallet"
          ? "MiNTA"
          : fundTarget.bankName;

    return (
      <>
        {renderHeader("Enter Amount", true)}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View
          style={[
            styles.fundHeroCard,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.rowLeft}>
            <View style={styles.logoWrap}>
              <Ionicons
                name={iconForAccount(fundTarget)}
                size={22}
                color={fundTarget.logoColor}
              />
            </View>

            <View style={styles.rowCopy}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Funding via {fundingMethodLabel(fundMethod)}
              </AppText>
              <AppText variant="title" weight="semibold" style={styles.heroName}>
                {targetName}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Amount to Add
          </AppText>

          <View
            style={[
              styles.amountInputWrap,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <AppText variant="hero" weight="bold">
              ₦
            </AppText>
            <BottomSheetTextInput
              value={fundAmount}
              onChangeText={(text) => setFundAmount(formatAmountInput(text))}
              keyboardType="number-pad"
              style={[
                styles.amountInput,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.headingBold,
                },
              ]}
              selectionColor={theme.colors.tint}
              placeholder="0"
              placeholderTextColor={theme.colors.placeholder}
              textAlign="center"
            />
          </View>

          <AppText variant="body" color={theme.colors.textSecondary}>
            Minimum amount: {formatCurrency(FUND_MINIMUM)}
          </AppText>
        </View>

        <View style={styles.quickAmountRow}>
          {QUICK_AMOUNTS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFundAmount(item.toLocaleString("en-NG"))}
              style={[
                styles.quickAmountChip,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.borderSoft,
                },
              ]}
            >
              <AppText variant="body" weight="semibold">
                ₦{item >= 1000 ? `${item / 1000}k` : item}
              </AppText>
            </Pressable>
          ))}
        </View>

        {fundMethod === "bank-transfer" ? (
          <View
            style={[
              styles.bankTransferDetailsCard,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <AppText variant="title" weight="semibold" style={styles.bankTransferTitle}>
              Bank Transfer Details
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Account Name: MiNTA/MiNTA Wallet
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Account Number: 9012345678
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Bank: Providus Bank
            </AppText>
          </View>
        ) : null}

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <Pressable
          onPress={handleFundSubmit}
          disabled={!canContinueFundAmount}
          style={[
            styles.primaryFooterButton,
            {
              backgroundColor: theme.colors.tint,
              opacity: canContinueFundAmount ? 1 : 0.55,
            },
          ]}
        >
          <AppText
            variant="title"
            weight="bold"
            color={theme.colors.primaryText}
            style={styles.primaryFooterText}
          >
            Fund {formatCurrency(fundNumericAmount)}
          </AppText>
        </Pressable>
      </>
    );
  };

  const renderFundSuccessStep = () => {
    if (!fundTarget || !fundMethod) return null;

    return (
      <>
        {renderHeader("Funding Successful", false)}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <View style={styles.confirmWrap}>
          <View style={styles.successIconWrap}>
            <View style={styles.successGlow} />
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={36} color="#07110E" />
            </View>
          </View>

          <AppText variant="hero" weight="bold" style={styles.successTitle}>
            Funding Successful!
          </AppText>

          <AppText
            variant="body"
            color={theme.colors.textSecondary}
            style={styles.successMessage}
          >
            {formatCurrency(fundNumericAmount)} has been added to your{" "}
            {fundingSuccessTargetName(fundTarget)}
          </AppText>

          <View
            style={[
              styles.referenceCard,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <AppText variant="body" color={theme.colors.textSecondary}>
              Reference
            </AppText>
            <AppText variant="body" weight="medium" style={styles.referenceText}>
              {fundReference}
            </AppText>
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.borderSoft }]}
        />

        <Pressable
          onPress={onClose}
          style={[
            styles.primaryFooterButton,
            { backgroundColor: theme.colors.tint },
          ]}
        >
          <AppText
            variant="title"
            weight="bold"
            color={theme.colors.primaryText}
            style={styles.primaryFooterText}
          >
            Done
          </AppText>
        </Pressable>
      </>
    );
  };

  const renderCurrentFundFlow = () => {
    if (fundStep === "target") return renderFundTargetStep();
    if (fundStep === "method") return renderFundMethodStep();
    if (fundStep === "amount") return renderFundAmountStep();
    return renderFundSuccessStep();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="90%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {mode === "transfer" ? (
          <>
            {step === "source" ? renderTransferSourceStep() : null}
            {step === "destination" ? renderTransferDestinationStep() : null}
            {step === "amount" ? renderAmountStep() : null}
            {step === "category" ? renderCategoryStep() : null}
            {step === "confirm" ? renderConfirmStep() : null}
          </>
        ) : (
          renderCurrentFundFlow()
        )}
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

  list: {
    gap: 10,
  },
  row: {
    minHeight: 84,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },

  sourceHeroCard: {
    minHeight: 98,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: "hidden",
    justifyContent: "center",
  },
  sourceHeroGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
  },
  logoWrapLarge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  heroName: {
    fontSize: 16,
    lineHeight: 24,
  },

  segmentWrap: {
    minHeight: 60,
    borderRadius: 22,
    borderWidth: 1,
    padding: 4,
    flexDirection: "row",
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 12,
  },

  fieldBlock: {
    gap: 10,
  },
  selectField: {
    minHeight: 64,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 12,
  },
  bankColorDot: {
    width: 22,
    height: 22,
    borderRadius: 7,
  },
  bankColorDotLarge: {
    width: 22,
    height: 22,
    borderRadius: 7,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  dropdownItem: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  sheetTextInput: {
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

  resolvedAccountCard: {
    minHeight: 90,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: "hidden",
    justifyContent: "center",
  },
  verifiedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  transferRouteCard: {
    minHeight: 90,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeEdge: {
    flex: 1,
  },
  routeEdgeRight: {
    flex: 1,
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  routeCenter: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  routeIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeCopy: {
    gap: 2,
  },
  routeCopyRight: {
    alignItems: "flex-end",
    gap: 2,
  },

  recipientCard: {
    minHeight: 104,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 4,
  },
  recipientName: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
  },

  amountMetaBlock: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  balanceText: {
    fontSize: 16,
    lineHeight: 32,
  },
  amountInputWrap: {
    minHeight: 92,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  amountInput: {
    flex: 1,
    minHeight: 92,
    fontSize: 20,
    lineHeight: 38,
  },
  quickAmountRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickAmountChip: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  centerBlock: {
    alignItems: "center",
    gap: 6,
    paddingTop: 6,
    paddingBottom: 6,
  },
  centerTitle: {
    fontSize: 16,
    lineHeight: 25,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  categoryChip: {
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  confirmWrap: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  confirmIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
  confirmAmount: {
    fontSize: 16,
    lineHeight: 36,
  },
  confirmMeta: {
    alignItems: "center",
    gap: 2,
    marginTop: 6,
  },
  pinPrompt: {
    marginTop: 16,
  },
  pinRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },
  pinInput: {
    width: 72,
    height: 88,
    borderRadius: 24,
    borderWidth: 1.5,
    fontSize: 16,
    lineHeight: 36,
  },

  methodList: {
    gap: 12,
  },
  methodCard: {
    minHeight: 104,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  methodIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  methodCopy: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    fontSize: 16,
    lineHeight: 23,
  },

  fundHeroCard: {
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  bankTransferDetailsCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  bankTransferTitle: {
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 2,
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
    backgroundColor: "rgba(87,242,200,0.14)",
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
  referenceCard: {
    minHeight: 92,
    minWidth: 250,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    gap: 6,
    marginTop: 10,
  },
  referenceText: {
    textAlign: "center",
  },

  primaryFooterButton: {
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryFooterText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "600",
    textAlign: "center",
  },

  secondaryFooter: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryFooterText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  sectionSpacing: {
    marginTop: 20,
  },

  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyStateText: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
  },

  emptyStateSubText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },

  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  shadowSoft: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});