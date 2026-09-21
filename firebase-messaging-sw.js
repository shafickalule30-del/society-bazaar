// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjCwfUlDa4aXBFUpjL17fXHHfVain615k",
  authDomain: "societybazaar-e31df.firebaseapp.com",
  projectId: "societybazaar-e31df",
  storageBucket: "societybazaar-e31df.firebasestorage.app",
  messagingSenderId: "311712324164",
  appId: "1:311712324164:web:204b8b6105642f15c5fa11",
  measurementId: "G-33TPC5EP18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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