// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getMessaging } from "firebase/messaging"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_FIREBASE_KEY}`,
  authDomain: "blueverse-notification.firebaseapp.com",
  projectId: "blueverse-notification",
  storageBucket: "blueverse-notification.appspot.com",
  messagingSenderId: "788928727607",
  appId: "1:788928727607:web:df52eb5f1f1758119d4db2",
  measurementId: "G-Z6D9W2P71T"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const messaging = navigator?.serviceWorker && getMessaging(app)
