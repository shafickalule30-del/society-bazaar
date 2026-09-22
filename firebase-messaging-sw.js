// firebase-messaging-sw.js — runs in the background
// NOTE: Service workers MUST use importScripts(), not ES module imports.

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDjCwfUlDa4aXBFUpjL17fXHHfVain615k",
  authDomain: "societybazaar-e31df.firebaseapp.com",
  projectId: "societybazaar-e31df",
  storageBucket: "societybazaar-e31df.firebasestorage.app",
  messagingSenderId: "311712324164",
  appId: "1:311712324164:web:204b8b6105642f15c5fa11"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const postId = payload.data?.post_id;

  self.registration.showNotification(title || "Society Bazaar", {
    body: body || "New product posted",
    icon: icon || "https://via.placeholder.com/192x192/075E54/ffffff?text=SB",
    data: { post_id: postId }
  });
});

// Handle notification click → open post
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const postId = event.notification.data?.post_id;
  const url = postId ? `/post.html?id=${postId}` : "/index.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
