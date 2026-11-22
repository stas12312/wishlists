import { deleteWebPushSubscription } from "./client-requests/notification";

export const browserPushWorker = "/web-push.js";

export function supportsBrowserPush() {
  return (
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function disconnectBrowserPush() {
  if (!supportsBrowserPush()) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (
    registration?.active?.scriptURL !==
    new URL(browserPushWorker, location.origin).href
  ) {
    return;
  }
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await deleteWebPushSubscription(subscription.endpoint);
  } finally {
    await subscription.unsubscribe();
  }
}
