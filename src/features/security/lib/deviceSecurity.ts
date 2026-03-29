import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";

export async function ensurePushNotificationsPermission() {
  const existing = await Notifications.getPermissionsAsync();

  if (
    existing.granted ||
    existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return {
      granted: true,
      message: "Push notifications enabled.",
    };
  }

  const requested = await Notifications.requestPermissionsAsync();

  if (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return {
      granted: true,
      message: "Push notifications enabled.",
    };
  }

  return {
    granted: false,
    message: "Push notification permission was not granted.",
  };
}

export async function enableBiometricAuthentication() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();

  if (!hasHardware) {
    return {
      success: false,
      message: "Biometric authentication is not available on this device.",
    };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!isEnrolled) {
    return {
      success: false,
      message: "Set up Face ID, Touch ID, or fingerprint in your device settings first.",
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Enable Biometric Login",
    promptSubtitle: "Secure your MiNTA account",
    promptDescription:
      "Authenticate to enable biometric login for faster, safer access.",
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
    requireConfirmation: false,
  });

  if (result.success) {
    return {
      success: true,
      message: "Biometric login enabled.",
    };
  }

  const errorMap: Record<string, string> = {
    user_cancel: "Biometric setup was cancelled.",
    app_cancel: "Biometric setup was cancelled.",
    not_enrolled: "No biometric profile is enrolled on this device.",
    not_available: "Biometric authentication is not available right now.",
    passcode_not_set: "Set a device passcode before enabling biometrics.",
    lockout: "Biometrics are temporarily locked. Try again later.",
    authentication_failed: "Biometric authentication failed. Please try again.",
  };

  return {
    success: false,
    message:
      errorMap[result.error ?? "unknown"] ??
      "Unable to enable biometric login.",
  };
}