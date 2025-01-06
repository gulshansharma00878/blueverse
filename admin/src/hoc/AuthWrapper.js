import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useIsLoggedIn } from "hooks/state"
import PrivateLayout from "../layout/privateLayout"
import { PrivateRoutes } from "router/routes"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import NoPermission from "pages/private/sub-admin/no-permission"
const AuthWrapper = ({ component: Component, userDetail, ...rest }) => {
  const authorizedRoutes = PrivateRoutes[userDetail?.role]
  const isAuthorized = authorizedRoutes && authorizedRoutes.some(({ path }) => path === rest.path)
  const isLoggedIn = useIsLoggedIn()

  const [viewPermission, setViewPermission] = useState(false)
  useEffect(() => {
    getAllpermission()
  }, [rest?.module])

  async function getAllpermission() {
    // get subadmin route permission
    if (userDetail?.role === "subadmin" && isLoggedIn && isAuthorized) {
      if (userDetail?.permissions?.permission.length > 0) {
        if (
          rest?.module === "cms" ||
          rest?.module === "billingAccounting" ||
          rest?.module === "dashboard"
        ) {
          setViewPermission(true)
        } else {
          let permissionJson = getPermissionJson(userDetail, rest?.module)
          setViewPermission(permissionJson?.permissionObj[rest?.permissionType])
        }
      }
    }
  }
  const Wrapper = (props) => {
    if (rest.path === "/" && !isLoggedIn) {
      return <Navigate to="/auth/login" />
    }

    if (isLoggedIn && isAuthorized) {
      // restrict route for subadmin based on permission
      if (userDetail?.role === "subadmin") {
        return (
          <PrivateLayout {...props}>
            {viewPermission ? <Component {...props} /> : <NoPermission />}
          </PrivateLayout>
        )
      } else {
        return (
          <PrivateLayout {...props}>
            <Component {...props} />
          </PrivateLayout>
        )
      }
    } else {
      return <Navigate to={{ pathname: "/auth/login" }} />
    }
  }

  return <Wrapper />
}

export default AuthWrapper
