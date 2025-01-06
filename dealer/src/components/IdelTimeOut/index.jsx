import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useCookies } from "react-cookie"
import { CookieKeys, CookieOptions } from "constants/cookieKeys"
import { coreAppActions } from "redux/store"
import { AuthService } from "network/authService"
import { useNavigate } from "react-router-dom"
import Toast from "components/utitlities-components/Toast/Toast"

const IdleTimeout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies([CookieKeys.Auth])

  let idleTimer = null

  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer)
    }

    idleTimer = setTimeout(() => {
      // Automatically logout after 24 hour of inactivity
      handleLogout()
    }, 60 * 60 * 24000) // 24 hour in milliseconds
  }

  const handleLogout = async () => {
    await AuthService.logoutOnClick({}, cookies?.authToken)
    const cookieNames = Object.keys(cookies)
    cookieNames.forEach((cookie) => {
      removeCookie(cookie, CookieOptions)
    })
    dispatch(coreAppActions.logout())
    Toast.showInfoToast(`Your session has expired`)
    dispatch(coreAppActions.updatePopupModal(false))
  }

  useEffect(() => {
    // Set up event listeners for user activity
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart"]
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer)
    })

    // Set up the initial idle timer
    resetIdleTimer()

    // Clear event listeners and idle timer on component unmount
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer)
      })

      if (idleTimer) {
        clearTimeout(idleTimer)
      }
    }
  }, [navigate, idleTimer])

  return <></>
}

export default IdleTimeout
