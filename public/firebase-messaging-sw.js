importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAP83m-z728_wIWlFt_t89GRtISB97ww84",
  authDomain: "medmate-7d098.firebaseapp.com",
  projectId: "medmate-7d098",
  storageBucket: "medmate-7d098.firebasestorage.app",
  messagingSenderId: "705400480666",
  appId: "1:705400480666:web:16956b2ca5517fb21f9023"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
