import API from './api';

const PUBLIC_VAPID_KEY = 'BDsBOSFgsviN1UPrNUJqmQE2_K3a6tp84pDhvcHOLWsuhwpGln1cN2kaY6anjENtc8DGMuzrQ7DDo0LhwobpsY0';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPush = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.error('Service worker not supported');
      return false;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Explicitly request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission not granted for notifications');
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });
    }

    await API.post('/notifications/subscribe', subscription);
    return true;
  } catch (error) {
    console.error('Push subscription error:', error);
    return false;
  }
};

export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await API.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
    }
    return true;
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return false;
  }
};

export const checkPushSubscription = async () => {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
};
