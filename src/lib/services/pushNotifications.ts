import { auth } from '@/lib/firebase';

type PushNotificationPayload = {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
};

export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.warn('Push notification skipped: no authenticated Firebase user.');
      return false;
    }

    const idToken = await currentUser.getIdToken();

    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`Push notification failed (${response.status}):`, result);
      return false;
    }

    if (result.failureCount > 0) {
      console.warn('Some push notifications could not be delivered:', result);
    }

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}
