import { initFirebase, requestNotificationPermission } from "@/lib/firebase";

declare global {
  interface Window {
    ferixcomerzNativeFcmToken?: string;
    ferixcomerzNativeFcmPlatform?: string;
  }
}

export function getNativeFcmToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = window.ferixcomerzNativeFcmToken?.trim();
  return token || null;
}

export async function getGuestFcmToken(): Promise<string | null> {
  const nativeToken = getNativeFcmToken();
  if (nativeToken) return nativeToken;

  try {
    const { messaging } = await initFirebase();
    return await requestNotificationPermission(messaging);
  } catch {
    return null;
  }
}
