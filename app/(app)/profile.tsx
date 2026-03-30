
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppBackButton from "@/src/components/ui/AppBackButton";
import AppScreen from "@/src/components/ui/AppScreen";
import AppText from "@/src/components/ui/AppText";
import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import { mockHomeData } from "@/src/features/home/data/mockHome";
import { useAppTheme } from "@/src/hooks/useAppTheme";

type ProfileTab = "overview" | "badges" | "challenges";
type ShareTab = "card" | "qr";

type EditableProfile = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  avatarUri: string | null;
};

type BadgeItem = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  earned: boolean;
};

type ChallengeItem = {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  reward: string;
  eta: string;
};

const BADGES: BadgeItem[] = [
  {
    id: "first-transfer",
    icon: "🚀",
    title: "First Transfer",
    subtitle: "Made your first transfer",
    earned: true,
  },
  {
    id: "savings-starter",
    icon: "🎯",
    title: "Savings Starter",
    subtitle: "Made 3 savings contributions",
    earned: true,
  },
  {
    id: "budget-master",
    icon: "🔒",
    title: "Budget Master",
    subtitle: "Stayed within 3 budgets this month",
    earned: false,
  },
  {
    id: "bill-slayer",
    icon: "🔒",
    title: "Bill Slayer",
    subtitle: "Paid 10 bills on time",
    earned: false,
  },
  {
    id: "investor",
    icon: "📈",
    title: "Investor",
    subtitle: "Made your first investment",
    earned: true,
  },
  {
    id: "streak-lord",
    icon: "🔒",
    title: "Streak Lord",
    subtitle: "Maintain a 30-day login streak",
    earned: false,
  },
  {
    id: "goal-crusher",
    icon: "🔒",
    title: "Goal Crusher",
    subtitle: "Complete 5 savings goals",
    earned: false,
  },
  {
    id: "social-butterfly",
    icon: "🔒",
    title: "Social Butterfly",
    subtitle: "Share your account details 10 times",
    earned: false,
  },
  {
    id: "transfer-pro",
    icon: "🔒",
    title: "Transfer Pro",
    subtitle: "Complete 50 transfers",
    earned: false,
  },
  {
    id: "centurion",
    icon: "🔒",
    title: "Centurion",
    subtitle: "Earn 5,000 MiNTA Points",
    earned: false,
  },
];

const CHALLENGES: ChallengeItem[] = [
  {
    id: "weekly-saver",
    title: "Weekly Saver",
    subtitle: "Save ₦10,000 this week",
    progress: 1,
    reward: "+50 pts",
    eta: "3 days left",
  },
  {
    id: "budget-keeper",
    title: "Budget Keeper",
    subtitle: "Stay within 3 budgets this month",
    progress: 0.67,
    reward: "+100 pts",
    eta: "12 days left",
  },
  {
    id: "transfer-streak",
    title: "Transfer Streak",
    subtitle: "Make 5 transfers this week",
    progress: 0.6,
    reward: "+30 pts",
    eta: "4 days left",
  },
];

function gradientAvatarLetter(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "M";
}

function MiniQrCode({ value }: { value: string }) {
  const cells = 21;
  const size = 220;
  const cell = Math.floor(size / cells);

  const bits = Array.from({ length: cells * cells }, (_, index) => {
    const charCode = value.charCodeAt(index % value.length) || 77;
    const mix = (charCode * (index + 11) + index * 17) % 7;
    return mix % 2 === 0;
  });

  const isFinder = (row: number, col: number) => {
    const blocks = [
      { r: 0, c: 0 },
      { r: 0, c: cells - 7 },
      { r: cells - 7, c: 0 },
    ];

    return blocks.some(({ r, c }) => row >= r && row < r + 7 && col >= c && col < c + 7);
  };

  const finderFill = (row: number, col: number) => {
    const localRow = row % (cells - 7);
    const localCol = col % (cells - 7);

    const isOuter =
      row % (cells - 7) < 7 &&
      col % (cells - 7) < 7 &&
      (localRow === 0 ||
        localRow === 6 ||
        localCol === 0 ||
        localCol === 6);

    const isInner =
      localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;

    return isOuter || isInner;
  };

  return (
    <View style={styles.qrWrap}>
      {Array.from({ length: cells }).map((_, row) => (
        <View key={row} style={styles.qrRow}>
          {Array.from({ length: cells }).map((__, col) => {
            const index = row * cells + col;
            const active = isFinder(row, col) ? finderFill(row, col) : bits[index];

            return (
              <View
                key={`${row}-${col}`}
                style={[
                  styles.qrCell,
                  {
                    width: cell,
                    height: cell,
                    backgroundColor: active ? "#050607" : "#FFFFFF",
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      <Ionicons name={icon} size={26} color={theme.colors.tint} />
      <AppText variant="body" weight="bold" style={styles.statValue}>
        {value}
      </AppText>
      <AppText variant="body" color={theme.colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

function BadgeCard({ item }: { item: BadgeItem }) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.badgeCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      <View
        style={[
          styles.badgeIconWrap,
          {
            backgroundColor: item.earned
              ? "rgba(87,242,200,0.12)"
              : theme.colors.inputBackground,
          },
        ]}
      >
        <AppText style={styles.badgeEmoji}>{item.icon}</AppText>
      </View>

      <AppText variant="body" weight="bold" style={styles.badgeTitle}>
        {item.title}
      </AppText>

      <AppText
        variant="body"
        color={theme.colors.textSecondary}
        style={styles.badgeSubtitle}
      >
        {item.subtitle}
      </AppText>

      {item.earned ? (
        <AppText variant="body" weight="medium" color={theme.colors.tint}>
          ✓ Earned
        </AppText>
      ) : null}
    </View>
  );
}

function ChallengeCard({ item }: { item: ChallengeItem }) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.challengeCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      <View style={styles.challengeTop}>
        <View style={styles.challengeCopy}>
          <AppText variant="body" weight="bold">
            {item.title}
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            {item.subtitle}
          </AppText>
        </View>

        <View
          style={[
            styles.rewardPill,
            { backgroundColor: "rgba(87,242,200,0.12)" },
          ]}
        >
          <Ionicons name="gift-outline" size={16} color={theme.colors.tint} />
          <AppText variant="body" weight="bold" color={theme.colors.tint}>
            {item.reward}
          </AppText>
        </View>
      </View>

      <View style={styles.challengeProgressRow}>
        <View
          style={[
            styles.challengeTrack,
            { backgroundColor: theme.colors.inputBackground },
          ]}
        >
          <View
            style={[
              styles.challengeProgress,
              {
                width: `${Math.max(0, Math.min(100, item.progress * 100))}%`,
                backgroundColor: theme.colors.tint,
              },
            ]}
          />
        </View>

        <AppText variant="body" color={theme.colors.textSecondary}>
          {Math.round(item.progress * 100)}%
        </AppText>
      </View>

      <AppText variant="body" color={theme.colors.textSecondary}>
        ↗ {item.eta}
      </AppText>
    </View>
  );
}

function ShareAccountSheet({
  visible,
  onClose,
  accountName,
  accountNumber,
  bankName,
}: {
  visible: boolean;
  onClose: () => void;
  accountName: string;
  accountNumber: string;
  bankName: string;
}) {
  const theme = useAppTheme();
  const [tab, setTab] = useState<ShareTab>("card");

  const shareText = `MiNTA Smart Account\nAccount Number: ${accountNumber}\nAccount Name: ${accountName}\nBank: ${bankName}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareText);
    Alert.alert("Copied", "Account details copied successfully.");
  };

  const handleShare = async () => {
    await Share.share({
      message: shareText,
      title: "Share Account",
    });
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="86%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sheetContent}
      >
        <View style={styles.sheetHeader}>
          <AppText variant="body" weight="bold" style={styles.sheetTitle}>
            Share Account
          </AppText>

          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.segmentedWrap}>
          {(["card", "qr"] as const).map((item) => {
            const active = tab === item;

            return (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[
                  styles.segmentedItem,
                  active && styles.segmentedItemActive,
                ]}
              >
                <Ionicons
                  name={item === "card" ? "wallet-outline" : "qr-code-outline"}
                  size={15}
                  color={active ? theme.colors.text : theme.colors.textMuted}
                />
                <AppText
                  variant="body"
                  weight="medium"
                  color={active ? theme.colors.text : theme.colors.textMuted}
                >
                  {item === "card" ? "Card" : "QR Code"}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {tab === "card" ? (
          <View style={styles.sharePreviewCard}>
            <View style={styles.sharePreviewTop}>
              <View style={styles.mintaMark}>
                <AppText variant="body" weight="bold" color={theme.colors.tint}>
                  M
                </AppText>
              </View>

              <View>
                <AppText variant="body" weight="bold">
                  MiNTA
                </AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  SMART ACCOUNT
                </AppText>
              </View>
            </View>

            <View style={styles.sharePreviewBlock}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Account Number
              </AppText>
              <AppText
                variant="hero"
                weight="bold"
                color={theme.colors.tint}
                style={styles.accountNumberDisplay}
              >
                {accountNumber}
              </AppText>
            </View>

            <View style={styles.sharePreviewBottom}>
              <View>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  Account Name
                </AppText>
                <AppText variant="body" weight="bold">
                  {accountName}
                </AppText>
              </View>

              <View>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  Bank
                </AppText>
                <AppText variant="body" weight="bold">
                  {bankName}
                </AppText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.qrCard}>
            <View style={styles.qrHeaderBrand}>
              <View style={styles.mintaMark}>
                <AppText variant="body" weight="bold" color={theme.colors.tint}>
                  M
                </AppText>
              </View>

              <AppText variant="body" weight="bold">
                MiNTA
              </AppText>
            </View>

            <MiniQrCode value={shareText} />

            <AppText
              variant="body"
              weight="bold"
              color={theme.colors.tint}
              style={styles.qrNumber}
            >
              {accountNumber}
            </AppText>
            <AppText variant="body">{accountName}</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {bankName}
            </AppText>
          </View>
        )}

        <View style={styles.sheetActions}>
          <Pressable
            onPress={handleCopy}
            style={[
              styles.secondarySheetButton,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.borderSoft,
              },
            ]}
          >
            <Ionicons
              name="copy-outline"
              size={20}
              color={theme.colors.text}
            />
            <AppText variant="body" weight="bold">
              Copy
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={[
              styles.primarySheetButton,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={theme.colors.primaryText}
            />
            <AppText
              variant="body"
              weight="bold"
              color={theme.colors.primaryText}
            >
              Share
            </AppText>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function EditProfileSheet({
  visible,
  onClose,
  profile,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  profile: EditableProfile;
  onSave: (payload: EditableProfile) => void;
}) {
  const theme = useAppTheme();

  const [draft, setDraft] = useState<EditableProfile>(profile);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="92%">
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sheetContent}
      >
        <View style={styles.sheetHeader}>
          <AppText variant="body" weight="bold" style={styles.sheetTitle}>
            Edit Profile
          </AppText>

          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.formGroup}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Full Name
          </AppText>
          <BottomSheetTextInput
            value={draft.fullName}
            onChangeText={(text) => setDraft((prev) => ({ ...prev, fullName: text }))}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
                color: theme.colors.text,
                fontFamily: theme.fonts.bodyMedium,
              },
            ]}
            placeholder="Full name"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>

        <View style={styles.formGroup}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Email Address
          </AppText>
          <BottomSheetTextInput
            value={draft.email}
            onChangeText={(text) => setDraft((prev) => ({ ...prev, email: text }))}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
                color: theme.colors.text,
                fontFamily: theme.fonts.bodyMedium,
              },
            ]}
            placeholder="Email address"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Phone Number
          </AppText>
          <BottomSheetTextInput
            value={draft.phoneNumber}
            onChangeText={(text) =>
              setDraft((prev) => ({ ...prev, phoneNumber: text }))
            }
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
                color: theme.colors.text,
                fontFamily: theme.fonts.bodyMedium,
              },
            ]}
            placeholder="Phone number"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Address
          </AppText>
          <BottomSheetTextInput
            value={draft.address}
            onChangeText={(text) => setDraft((prev) => ({ ...prev, address: text }))}
            style={[
              styles.input,
              styles.multilineInput,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
                color: theme.colors.text,
                fontFamily: theme.fonts.bodyMedium,
              },
            ]}
            placeholder="Address"
            placeholderTextColor={theme.colors.placeholder}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Date of Birth
          </AppText>
          <BottomSheetTextInput
            value={draft.dateOfBirth}
            onChangeText={(text) =>
              setDraft((prev) => ({ ...prev, dateOfBirth: text }))
            }
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderSoft,
                color: theme.colors.text,
                fontFamily: theme.fonts.bodyMedium,
              },
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>

        <Pressable
          onPress={handleSave}
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.tint },
          ]}
        >
          <Ionicons name="checkmark-outline" size={20} color={theme.colors.primaryText} />
          <AppText
            variant="body"
            weight="bold"
            color={theme.colors.primaryText}
          >
            Save Changes
          </AppText>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const user = mockHomeData.user;

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [shareVisible, setShareVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [profile, setProfile] = useState<EditableProfile>({
    fullName: user.fullName,
    email: user.email,
    phoneNumber: "+234 803 456 7890",
    address: "12 Victoria Island, Lagos, Nigeria",
    dateOfBirth: "1995-06-15",
    avatarUri: null,
  });

  const earnedBadges = useMemo(() => BADGES.filter((item) => item.earned), []);
  const initials = gradientAvatarLetter(profile.fullName);

  const accountNumber = "801 234 5678";
  const bankName = "Sterling Bank";
  const smartAccountName = profile.fullName;
  const points = 1948;
  const nextTierGap = 1552;

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to update your profile photo."
      );
      return;
    }

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.9,
});
    if (result.canceled || !result.assets?.[0]?.uri) return;

    setProfile((prev) => ({
      ...prev,
      avatarUri: result.assets[0].uri,
    }));
  };

  const handleCopyAccount = async () => {
    await Clipboard.setStringAsync(accountNumber.replace(/\s/g, ""));
    Alert.alert("Copied", "Account number copied successfully.");
  };

  const renderTopHeader = () => (
    <View style={styles.topHeader}>
      <AppBackButton />

      <View style={styles.topHeaderCopy}>
        <AppText variant="body" weight="bold" style={styles.pageTitle}>
          Profile
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          Manage your personal info
        </AppText>
      </View>

      <Pressable
        onPress={() => setEditVisible(true)}
        style={[
          styles.editTopButton,
          { backgroundColor: theme.colors.inputBackground },
        ]}
      >
        <Ionicons name="create-outline" size={22} color={theme.colors.text} />
      </Pressable>
    </View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHero}>
      <View style={styles.avatarWrap}>
        {profile.avatarUri ? (
          <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarInner}>
            <AppText variant="hero" weight="bold" color="#06110D">
              {initials}
            </AppText>
          </View>
        )}

        <Pressable
          onPress={handlePickImage}
          style={[
            styles.avatarCameraButton,
            { backgroundColor: theme.colors.inputBackground },
          ]}
        >
          <Ionicons
            name="camera-outline"
            size={22}
            color={theme.colors.textMuted}
          />
        </Pressable>
      </View>

      <AppText variant="hero" weight="bold" style={styles.profileName}>
        {profile.fullName}
      </AppText>

      <AppText variant="body" color={theme.colors.textSecondary}>
        {profile.email}
      </AppText>
    </View>
  );

  const renderSmartAccountCard = () => (
    <>
      <AppText variant="body" weight="bold" color={theme.colors.textSecondary}>
        MiNTA Smart Account
      </AppText>

      <View style={styles.smartAccountCard}>
        <View style={styles.smartCardGlow} />

        <View style={styles.smartCardTop}>
          <View style={styles.smartCardIdentity}>
            <View
              style={[
                styles.smartCardIcon,
                { backgroundColor: "rgba(87,242,200,0.12)" },
              ]}
            >
              <Ionicons name="wallet-outline" size={26} color={theme.colors.tint} />
            </View>

            <View>
              <AppText variant="body" weight="bold">
                MiNTA Smart Account
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Sterling Bank • Savings
              </AppText>
            </View>
          </View>
        </View>

        <AppText variant="body" color={theme.colors.textSecondary}>
          Account Number
        </AppText>

        <View style={styles.smartCardMid}>
          <AppText
            variant="body"
            weight="bold"
            color={theme.colors.tint}
            style={styles.smartAccountNumber}
          >
            {accountNumber}
          </AppText>

          <View style={styles.smartCardActions}>
            <Pressable
              onPress={handleCopyAccount}
              style={[
                styles.smallActionButton,
                {
                  backgroundColor: "rgba(87,242,200,0.08)",
                  borderColor: "rgba(87,242,200,0.20)",
                },
              ]}
            >
              <Ionicons name="copy-outline" size={15} color={theme.colors.tint} />
              <AppText variant="body" style={{fontSize:13}} weight="medium" color={theme.colors.tint}>
                Copy
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setShareVisible(true)}
              style={[
                styles.smallActionButton,
                {
                  backgroundColor: "rgba(87,242,200,0.08)",
                  borderColor: "rgba(87,242,200,0.20)",
                },
              ]}
            >
              <Ionicons
                name="share-social-outline"
                size={15}
                color={theme.colors.tint}
              />
              <AppText variant="body" style={{fontSize:13}} weight="medium" color={theme.colors.tint}>
                Share
              </AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.smartCardBottom}>
          <View>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Account Name
            </AppText>
            <AppText variant="body" weight="bold">
              {smartAccountName}
            </AppText>
          </View>

          <View>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Bank
            </AppText>
            <AppText variant="body" weight="bold">
              {bankName}
            </AppText>
          </View>
        </View>
      </View>
    </>
  );

  const renderRewardsCard = () => (
    <>
      <AppText variant="body" weight="bold" color={theme.colors.textSecondary}>
        Rewards & Achievements
      </AppText>

      <View style={styles.rewardsCard}>
        <View style={styles.smartCardGlow} />

        <View style={styles.rewardsTop}>
          <View style={styles.rewardIdentity}>
            <View style={styles.goldIconWrap}>
              <Ionicons name="trophy-outline" size={30} color="#F5D900" />
            </View>

            <View>
              <AppText variant="body" weight="bold">
                Gold
              </AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Level 3
              </AppText>
            </View>
          </View>

          <View style={styles.pointsWrap}>
            <AppText variant="title" weight="bold" color={theme.colors.tint}>
              {points.toLocaleString("en-NG")}
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              MiNTA Points
            </AppText>
          </View>
        </View>

        <View style={styles.tierMetaRow}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Gold
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Platinum
          </AppText>
        </View>

        <View
          style={[
            styles.tierTrack,
            { backgroundColor: theme.colors.inputBackground },
          ]}
        >
          <View
            style={[
              styles.tierProgress,
              { width: "22%", backgroundColor: theme.colors.tint },
            ]}
          />
        </View>

        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.centerMuted}
        >
          {nextTierGap} pts to Platinum
        </AppText>

        <View
          style={[
            styles.streakPill,
            {
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: theme.colors.borderSoft,
            },
          ]}
        >
          <View style={styles.streakLeft}>
            <Ionicons name="flame-outline" size={20} color="#FF7A3D" />
            <AppText variant="body" weight="bold">
              9-day streak
            </AppText>
          </View>

          <AppText variant="body" color={theme.colors.textSecondary}>
            Keep it going! 🔥
          </AppText>
        </View>
      </View>
    </>
  );

  const renderTabs = () => (
    <View
      style={[
        styles.segmentedTabs,
        {
          backgroundColor: theme.colors.inputBackground,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      {(["overview", "badges", "challenges"] as const).map((item) => {
        const active = activeTab === item;

        return (
          <Pressable
            key={item}
            onPress={() => setActiveTab(item)}
            style={[
              styles.segmentedTabItem,
              active && styles.segmentedTabItemActive,
            ]}
          >
            <AppText
              variant="body"
              weight={active ? "bold" : "medium"}
              color={active ? theme.colors.text : theme.colors.textMuted}
            >
              {item === "overview"
                ? "Overview"
                : item === "badges"
                  ? "Badges"
                  : "Challenges"}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  const renderVerifiedBanner = () => (
    <View style={styles.verifiedCard}>
      <View style={styles.verifiedGlow} />

      <View style={styles.verifiedIconWrap}>
        <Ionicons name="checkmark-circle-outline" size={34} color={theme.colors.tint} />
      </View>

      <View style={styles.verifiedCopy}>
        <View style={styles.verifiedTitleRow}>
          <AppText variant="body" weight="bold" color={theme.colors.tint}>
            Verified
          </AppText>

          <View
            style={[
              styles.levelPill,
              { backgroundColor: "rgba(255,255,255,0.06)" },
            ]}
          >
            <AppText variant="body" color={theme.colors.textSecondary}>
              Level 3
            </AppText>
          </View>
        </View>

        <AppText variant="body" color={theme.colors.textSecondary}>
          Your identity has been verified
        </AppText>
      </View>
    </View>
  );

  const renderPersonalInfo = () => (
    <>
      <AppText variant="body" weight="bold" color={theme.colors.textSecondary}>
        Personal Information
      </AppText>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSoft,
          },
        ]}
      >
        {[
          {
            icon: "person-outline",
            label: "Full Name",
            value: profile.fullName,
          },
          {
            icon: "mail-outline",
            label: "Email Address",
            value: profile.email,
          },
          {
            icon: "call-outline",
            label: "Phone Number",
            value: profile.phoneNumber,
          },
          {
            icon: "location-outline",
            label: "Address",
            value: profile.address,
          },
          {
            icon: "calendar-outline",
            label: "Date of Birth",
            value: profile.dateOfBirth,
          },
        ].map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <View
              style={[
                styles.infoIconWrap,
                { backgroundColor: theme.colors.inputBackground },
              ]}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={theme.colors.textMuted}
              />
            </View>

            <View style={styles.infoCopy}>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {item.label}
              </AppText>
              <AppText variant="body" weight="bold" style={styles.infoValue}>
                {item.value}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const renderIdentityDocs = () => (
    <>
      <AppText variant="body" weight="bold" color={theme.colors.textSecondary}>
        Identity Documents
      </AppText>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSoft,
          },
        ]}
      >
        {[
          { label: "BVN", value: "22•••••••90" },
          { label: "NIN", value: "70•••••••45" },
        ].map((item) => (
          <View key={item.label} style={styles.docRow}>
            <View style={styles.docLeft}>
              <View
                style={[
                  styles.docIconWrap,
                  { backgroundColor: "rgba(87,242,200,0.12)" },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color={theme.colors.tint}
                />
              </View>

              <View>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {item.label}
                </AppText>
                <AppText variant="body" weight="bold">
                  {item.value}
                </AppText>
              </View>
            </View>

            <Ionicons
              name="checkmark-circle-outline"
              size={28}
              color={theme.colors.tint}
            />
          </View>
        ))}
      </View>
    </>
  );

  const renderOverviewContent = () => (
    <>
      <View style={styles.statsRow}>
        <StatCard icon="star-outline" value="3" label="Badges" />
        <StatCard icon="flame-outline" value="9" label="Day Streak" />
        <StatCard icon="radio-button-on-outline" value="3" label="Challenges" />
      </View>

      <View
        style={[
          styles.panelCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSoft,
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <AppText variant="body" weight="bold">
            Recent Badges
          </AppText>

          <Pressable onPress={() => setActiveTab("badges")}>
            <AppText variant="body" weight="medium" color={theme.colors.tint}>
              View all ›
            </AppText>
          </Pressable>
        </View>

        <View style={styles.recentBadgesRow}>
          {earnedBadges.slice(0, 3).map((badge) => (
            <View key={badge.id} style={styles.recentBadgeItem}>
              <View
                style={[
                  styles.recentBadgeIcon,
                  { backgroundColor: "rgba(87,242,200,0.10)" },
                ]}
              >
                <AppText style={styles.badgeEmoji}>{badge.icon}</AppText>
              </View>
              <AppText
                variant="body"
                color={theme.colors.textSecondary}
                style={styles.centerMuted}
              >
                {badge.title}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.panelCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSoft,
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <AppText variant="body" weight="bold">
            Active Challenge
          </AppText>

          <Pressable onPress={() => setActiveTab("challenges")}>
            <AppText variant="body" weight="medium" color={theme.colors.tint}>
              View all ›
            </AppText>
          </Pressable>
        </View>

        <View style={styles.activeChallengeRow}>
          <View
            style={[
              styles.challengeBadgeIcon,
              { backgroundColor: "rgba(87,242,200,0.12)" },
            ]}
          >
            <Ionicons
              name="flash-outline"
              size={28}
              color={theme.colors.tint}
            />
          </View>

          <View style={styles.activeChallengeCopy}>
            <AppText variant="body" weight="bold">
              Weekly Saver
            </AppText>

            <View style={styles.activeProgressRow}>
              <View
                style={[
                  styles.challengeTrack,
                  { backgroundColor: theme.colors.inputBackground },
                ]}
              >
                <View
                  style={[
                    styles.challengeProgress,
                    { width: "100%", backgroundColor: theme.colors.tint },
                  ]}
                />
              </View>

              <AppText variant="body" color={theme.colors.textSecondary}>
                10000/10000
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.rewardPill,
              { backgroundColor: "rgba(87,242,200,0.12)" },
            ]}
          >
            <Ionicons name="gift-outline" size={16} color={theme.colors.tint} />
            <AppText variant="body" weight="bold" color={theme.colors.tint}>
              +50
            </AppText>
          </View>
        </View>
      </View>

      {renderVerifiedBanner()}
      {renderPersonalInfo()}
      {renderIdentityDocs()}
    </>
  );

  const renderBadgesContent = () => (
    <>
      <View style={styles.badgesGrid}>
        {BADGES.map((badge) => (
          <BadgeCard key={badge.id} item={badge} />
        ))}
      </View>

      {renderVerifiedBanner()}
      {renderPersonalInfo()}
    </>
  );

  const renderChallengesContent = () => (
    <>
      <View style={styles.challengeList}>
        {CHALLENGES.map((challenge) => (
          <ChallengeCard key={challenge.id} item={challenge} />
        ))}
      </View>

      {renderVerifiedBanner()}
      {renderPersonalInfo()}
    </>
  );

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
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: insets.bottom + 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {renderTopHeader()}
          {renderProfileHeader()}
          {renderSmartAccountCard()}
          {renderRewardsCard()}
          {renderTabs()}

          {activeTab === "overview"
            ? renderOverviewContent()
            : activeTab === "badges"
              ? renderBadgesContent()
              : renderChallengesContent()}
        </ScrollView>
      </View>

      <ShareAccountSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        accountName={smartAccountName}
        accountNumber={accountNumber}
        bankName={bankName}
      />

      <EditProfileSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        profile={profile}
        onSave={(payload) => {
          setProfile(payload);
          Alert.alert("Saved", "Your profile details have been updated.");
        }}
      />
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

  topHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  topHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 20,
    lineHeight: 30,
  },
  editTopButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  profileHero: {
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  avatarWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    position: "relative",
  },
  avatarInner: {
    flex: 1,
    borderRadius: 66,
    backgroundColor: "#61F2CF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#61F2CF",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 66,
  },
  avatarCameraButton: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#050607",
  },
  profileName: {
    fontSize: 16,
    lineHeight: 32,
    textAlign: "center",
    marginTop: 8,
  },

  smartAccountCard: {
    minHeight: 210,
    borderRadius: 30,
    overflow: "hidden",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(87,242,200,0.18)",
    backgroundColor: "#09100E",
  },
  smartCardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(87,242,200,0.06)",
  },
  smartCardTop: {
    marginBottom: 18,
  },
  smartCardIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  smartCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  smartCardMid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 10,
    marginBottom: 18,
  },
  smartAccountNumber: {
    fontSize: 20,
    lineHeight: 34,
    letterSpacing: 3.6,
  },
  smartCardActions: {
    flexDirection: "row",
    gap: 10,
  },
  smallActionButton: {
    minHeight: 40,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smartCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
    marginTop: 2,
  },

  rewardsCard: {
    minHeight: 250,
    borderRadius: 30,
    overflow: "hidden",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(87,242,200,0.18)",
    backgroundColor: "#09100E",
  },
  rewardsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16,
  },
  rewardIdentity: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  goldIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,217,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,217,0,0.22)",
  },
  pointsWrap: {
    alignItems: "flex-end",
  },
  tierMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tierTrack: {
    height: 14,
    borderRadius: 999,
    overflow: "hidden",
  },
  tierProgress: {
    height: "100%",
    borderRadius: 999,
  },
  streakPill: {
    minHeight: 50,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  segmentedTabs: {
    minHeight: 56,
    borderRadius: 28,
    borderWidth: 1,
    padding: 6,
    flexDirection: "row",
    gap: 6,
  },
  segmentedTabItem: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedTabItemActive: {
    backgroundColor: "rgba(0,0,0,0.32)",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 34,
  },

  panelCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentBadgesRow: {
    flexDirection: "row",
    gap: 22,
  },
  recentBadgeItem: {
    alignItems: "center",
    gap: 8,
    width: 82,
  },
  recentBadgeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  activeChallengeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  challengeBadgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  activeChallengeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  activeProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  verifiedCard: {
    minHeight: 112,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#61F2CF",
    backgroundColor: "#0B1D18",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  verifiedGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(87,242,200,0.06)",
  },
  verifiedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(87,242,200,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedCopy: {
    flex: 1,
    gap: 4,
  },
  verifiedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  levelPill: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  infoCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    gap: 14,
  },
  infoIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCopy: {
    flex: 1,
    gap: 4,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 24,
  },

  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  docLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  docIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  badgeCard: {
    width: "48%",
    minHeight: 208,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  badgeIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: {
    fontSize: 20,
    lineHeight: 36,
  },
  badgeTitle: {
    textAlign: "center",
  },
  badgeSubtitle: {
    textAlign: "center",
  },

  challengeList: {
    gap: 14,
  },
  challengeCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  challengeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  challengeCopy: {
    flex: 1,
    gap: 2,
  },
  rewardPill: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  challengeProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  challengeTrack: {
    flex: 1,
    height: 14,
    borderRadius: 999,
    overflow: "hidden",
  },
  challengeProgress: {
    height: "100%",
    borderRadius: 999,
  },

  centerMuted: {
    textAlign: "center",
  },

  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  sheetHeader: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: 16,
    lineHeight: 30,
  },

  segmentedWrap: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 6,
    flexDirection: "row",
    gap: 6,
  },
  segmentedItem: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  segmentedItemActive: {
    backgroundColor: "rgba(0,0,0,0.32)",
  },

  sharePreviewCard: {
    minHeight: 294,
    borderRadius: 30,
    backgroundColor: "#0B1D18",
    overflow: "hidden",
    padding: 18,
    gap: 22,
  },
  sharePreviewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mintaMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(87,242,200,0.10)",
    borderWidth: 1,
    borderColor: "rgba(87,242,200,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  sharePreviewBlock: {
    gap: 8,
  },
  accountNumberDisplay: {
    fontSize: 20,
    lineHeight: 36,
    letterSpacing: 3.2,
  },
  sharePreviewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  qrCard: {
    minHeight: 520,
    borderRadius: 30,
    backgroundColor: "#0B1D18",
    overflow: "hidden",
    padding: 18,
    alignItems: "center",
    gap: 14,
  },
  qrHeaderBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
  },
  qrWrap: {
    width: 220,
    height: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 10,
    overflow: "hidden",
    marginTop: 6,
  },
  qrRow: {
    flexDirection: "row",
  },
  qrCell: {},
  qrNumber: {
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 2.4,
    textAlign: "center",
  },

  sheetActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondarySheetButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primarySheetButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  formGroup: {
    gap: 8,
  },
  input: {
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  saveButton: {
    minHeight: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
});