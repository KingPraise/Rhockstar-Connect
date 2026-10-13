importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBSZEyhIBmnHzc775nR9-YEDcaZH9rZxKE",
  authDomain: "rhockstar-connect-v2.firebaseapp.com",
  projectId: "rhockstar-connect-v2",
  storageBucket: "rhockstar-connect-v2.firebasestorage.app",
  messagingSenderId: "17083340747",
  appId: "1:17083340747:web:69544071173f8324c4484e"
});

const messaging = firebase.messaging();

// Badge count tracker (synced from main thread, incremented on background push)
let badgeCount = 0;

// Handle background push notifications (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Rhockstar Connect';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: { url: payload.fcmOptions?.link || payload.data?.link || '/' },
    tag: payload.data?.tag || 'rhockstar-' + Date.now(),
    renotify: true,
    vibrate: [200, 100, 200]
  };

  // Increment app icon badge count
  badgeCount++;
  if (self.navigator?.setAppBadge) {
    self.navigator.setAppBadge(badgeCount).catch(() => {});
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — focus existing window or open new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Decrease badge count
  badgeCount = Math.max(0, badgeCount - 1);
  if (badgeCount === 0 && self.navigator?.clearAppBadge) {
    self.navigator.clearAppBadge().catch(() => {});
  } else if (self.navigator?.setAppBadge) {
    self.navigator.setAppBadge(badgeCount).catch(() => {});
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Try to focus an existing app window and navigate to the target URL
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // No existing window — open a new one
      return clients.openWindow(targetUrl);
    })
  );
});

// Receive messages from the main thread (badge sync)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_BADGE') {
    badgeCount = event.data.count || 0;
    if (badgeCount > 0 && self.navigator?.setAppBadge) {
      self.navigator.setAppBadge(badgeCount).catch(() => {});
    } else if (self.navigator?.clearAppBadge) {
      self.navigator.clearAppBadge().catch(() => {});
    }
  }

  if (event.data?.type === 'CLEAR_BADGE') {
    badgeCount = 0;
    if (self.navigator?.clearAppBadge) {
      self.navigator.clearAppBadge().catch(() => {});
    }
  }
});
