import React from "react"
import { Provider } from "react-redux"
import AppRouter from "./router"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { defaultTheme } from "./themes/defaultTheme"
import { store, persistor } from "redux/store"
import { CookiesProvider } from "react-cookie"
import "./styles/global.scss"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { PersistGate } from "redux-persist/integration/react"
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
  const currentTheme = createTheme(defaultTheme)

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
