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

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/icon.png',
    data: payload.data?.link || '/'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
