import { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/src/hooks/useAppTheme";

type BottomSheetMaxHeight = number | "auto" | `${number}%`;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: BottomSheetMaxHeight;
};

export default function BottomSheetModal({
  visible,
  onClose,
  children,
  maxHeight = "86%",
}: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const backdrop = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(560)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    backdrop.setValue(0);
    translateY.setValue(560);
  }, [backdrop, translateY, visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 560,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "rgba(0,0,0,0.76)",
              opacity: backdrop,
            },
          ]}
        />

        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.borderSoft,
              paddingBottom: Math.max(insets.bottom, 18),
              maxHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              {
                backgroundColor: theme.colors.border,
              },
            ]}
          />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
});