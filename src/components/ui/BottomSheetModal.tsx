import { ReactNode, useEffect, useMemo, useRef } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal as GorhomBottomSheetModal,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/src/hooks/useAppTheme";

type BottomSheetMaxHeight = number | "auto" | `${number}%`;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: BottomSheetMaxHeight;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function BottomSheetModal({
  visible,
  onClose,
  children,
  maxHeight = "86%",
}: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const modalRef = useRef<GorhomBottomSheetModal>(null);
  const controlledDismissRef = useRef(false);

  const snapPoints = useMemo<(string | number)[]>(() => {
    if (maxHeight === "auto") return ["CONTENT_HEIGHT"];
    return [maxHeight];
  }, [maxHeight]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (visible) {
      controlledDismissRef.current = false;
      modal.present();
      return;
    }

    controlledDismissRef.current = true;
    modal.dismiss();
  }, [visible]);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.72}
    />
  );

  const handleDismiss = () => {
    if (controlledDismissRef.current) {
      controlledDismissRef.current = false;
      return;
    }

    onClose();
  };

  return (
    <GorhomBottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      detached={false}
      stackBehavior="replace"
      keyboardBehavior="extend"
      android_keyboardInputMode="adjustResize"
      topInset={0}
      bottomInset={insets.bottom}
      maxDynamicContentSize={SCREEN_HEIGHT * 0.86}
      handleIndicatorStyle={[
        styles.handle,
        { backgroundColor: theme.colors.border },
      ]}
      backgroundStyle={[
        styles.background,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSoft,
        },
      ]}
    >
      {children}
    </GorhomBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    borderTopWidth: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
  },
});