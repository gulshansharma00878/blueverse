import React from "react"
import PublicLayout from "../layout/publicLayout"
import { useIsLoggedIn, userDetail } from "hooks/state"
import { Navigate } from "react-router-dom"
const PublicWrapper = ({ component: Component }) => {
  const isLoggedIn = useIsLoggedIn()
  const user = userDetail()

  const Wrapper = (props) => {
    if (isLoggedIn) {
      switch (user.role) {
        case "dealer":
          return <Navigate to="/dealer/dashboard" />
        case "agent":
          return <Navigate to="/agent/washes" />
        case "employee":
          return <Navigate to="/employee/dashboard" />
        default:
          return <Navigate to="/dealer/dashboard" />
      }
    }

    return (
      <>
        <PublicLayout {...props}>
          <Component {...props} />
        </PublicLayout>
      </>
    )
  }

  return <Wrapper />
}

export default PublicWrapper
