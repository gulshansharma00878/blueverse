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
        case "admin":
          return <Navigate to="/admin/dashboard" />
        case "subadmin":
          return <Navigate to="/subadmin/dashboard" />
        case "agent":
          return <Navigate to="/agent/washes" />
        case "areaManager":
          return <Navigate to="/areaManager/dashboard" />
        case "oemManager":
          return <Navigate to="/oemManager/dashboard" />
        default:
          return <Navigate to="/admin/dashboard" />
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
