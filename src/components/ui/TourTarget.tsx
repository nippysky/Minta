import { useCallback, useEffect, useRef } from "react";
import { View, type ViewProps } from "react-native";

import { useHomeTour } from "@/src/providers/HomeTourProvider";

type Props = ViewProps & {
  id: string;
};

export default function TourTarget({
  id,
  children,
  onLayout,
  ...props
}: Props) {
  const viewRef = useRef<View>(null);
  const { isVisible, scrollRevision, setTarget } = useHomeTour();

  const measure = useCallback(() => {
    requestAnimationFrame(() => {
      viewRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setTarget(id, { x, y, width, height });
        }
      });
    });
  }, [id, setTarget]);

  useEffect(() => {
    if (!isVisible) return;
    measure();
  }, [isVisible, measure, scrollRevision]);

  return (
    <View
      ref={viewRef}
      onLayout={(event) => {
        onLayout?.(event);
        measure();
      }}
      {...props}
    >
      {children}
    </View>
  );
}