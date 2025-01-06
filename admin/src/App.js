import React from "react"
import { Provider } from "react-redux"
import AppRouter from "./router"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { defaultTheme } from "./themes/defaultTheme"
import { persistor, store } from "redux/store"
import { CookiesProvider } from "react-cookie"
import "./styles/global.scss"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { PersistGate } from "redux-persist/integration/react"
// import { getFirebaseTokens, onMessageListener } from "./firebase"
import "./firebase"
/**
 * @description Check if browser is Safar
 * @description It'll be usefull for web notifications
 */

if (window.safari) {
  // eslint-disable-next-line no-console
  console.log("safari browser detected")
} else {
  // initializeFirebase();
}

function App() {
  // const [show, setShow] = useState(false)
  // const [notification, setNotification] = useState({ title: "", body: "" })
  const currentTheme = createTheme(defaultTheme)
  // const [isTokenFound, setTokenFound] = useState(false)
  // const [deviceToken, setDeviceToken] = useState(false)
  // getFirebaseTokens(setTokenFound, setDeviceToken)
  // // inside the jsx being returned:
  // if (isTokenFound) {
  //   console.log("HHEHEHE", deviceToken)
  //   //  Notification permission enabled 👍🏻

  // } else if (!isTokenFound) {
  //   //  Need notification permission ❗️
  // }
  // onMessageListener()
  //   .then((payload) => {
  //     setShow(true)
  //     setNotification({ title: payload.notification.title, body: payload.notification.body })
  //     console.log(payload)
  //   })
  //   .catch((err) => console.log("failed: ", err))
  // console.log(notification, show, 49)
  return (
    <CookiesProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={currentTheme}>
            <AppRouter />
            <ToastContainer autoClose={3000} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </CookiesProvider>
  )
}

export default App
