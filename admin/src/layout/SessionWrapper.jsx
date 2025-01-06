import { useEffect } from "react"

const events = ["load", "mousemove", "mousedown", "click", "scroll", "keypress"]

const SessionWrapper = ({ children, handleLogout }) => {
  let timer
  useEffect(() => {
    events.forEach((item) => {
      window.addEventListener(item, () => {
        resetTimer()
        handleTimer()
      })
    })
  }, [])
  const resetTimer = () => {
    if (timer) clearTimeout(timer)
  }

  const handleTimer = () => {
    timer = setTimeout(() => {
      resetTimer()
      events.forEach((item) => {
        window.removeEventListener(item, resetTimer)
      })
      handleLogout()
    }, 14400000)
  }

  return children
}

export default SessionWrapper
