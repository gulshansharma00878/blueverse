/* eslint-disable no-unused-vars*/
/* eslint-disable no-console*/

// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
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
export const firebaseApp = initializeApp(firebaseConfig)

export const messaging = navigator?.serviceWorker && getMessaging(firebaseApp)

export const getFirebaseTokens = async (setTokenFound, setDeviceToken) => {
  return await getToken(messaging, {
    vapidKey:
      "BKIN9NTui9O99oTtKy7-xsCyl9ozra4SGA0NcKBaPi-CLOEU4o4oNo9F6Qn0_-HwTolmoyoaBKFBqrITDIyx8ks"
  })
    .then((currentToken) => {
      if (currentToken) {
        setTokenFound(true)
        setDeviceToken(currentToken)
        // Track the token -> client mapping, by sending to backend server
        // show on the UI that permission is secured
      } else {
        setTokenFound(false)
        // shows on the UI that permission is required
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err)
      // catch error while creating client token
    })
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
