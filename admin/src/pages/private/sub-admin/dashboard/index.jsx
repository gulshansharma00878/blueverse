import React, { useEffect, useState } from "react"
import { Divider, Box } from "@mui/material"
import { userDetail } from "hooks/state"
import { getPermissionJson, screenPermission, getMenuRoute } from "helpers/Functions/roleFunction"
import { useNavigate } from "react-router-dom"
function SubAdminDashboard() {
  const user = userDetail()
  const navigate = useNavigate()
  // eslint-disable-next-line no-unused-vars
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "dashboard")
        if (permissionJson && permissionJson.viewPermission) {
          setSubadminPermission(permissionJson)
        } else {
          let screen_permission = screenPermission(user?.permissions?.permission)
          if (screen_permission) {
            let menu_route = getMenuRoute(screen_permission)
            if (menu_route.route) {
              navigate(`/${user.role}` + menu_route?.route)
            } else {
              navigate("/subadmin/no-permission")
            }
          } else {
            navigate("/subadmin/no-permission")
          }
        }
      }
    }
  }

  return (
    <Box>
      <h2>SubAdmin Dashboard</h2>
      <Divider />
    </Box>
  )
}

export default SubAdminDashboard
