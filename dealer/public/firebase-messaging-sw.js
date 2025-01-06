/* global firebase */
/*eslint-disable no-undef */

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js")
// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const fireBaseConfig = {
  apiKey: "AIzaSyAiuRnG8gRGDGkekmLvbSFfmRUKVrTRum8",
  authDomain: "blueverse-notification.firebaseapp.com",
  projectId: "blueverse-notification",
  storageBucket: "blueverse-notification.appspot.com",
  messagingSenderId: "788928727607",
  appId: "1:788928727607:web:df52eb5f1f1758119d4db2",
  measurementId: "G-Z6D9W2P71T"
}
firebase.initializeApp(fireBaseConfig)
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()
messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    data: { url: payload.data.openURL }
  }
  self.registration.showNotification(notificationTitle, notificationOptions)
})
self.addEventListener("notificationclick", function (event) {
  if (event.action === "close") {
    event.notification.close()
  } else if (event.notification.data.url && "" !== event.notification.data.url.trim()) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})
