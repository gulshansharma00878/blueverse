import React, { useState } from "react"
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from "@mui/material"
import Typography from "@mui/material/Typography"
import { DashboardMenus } from "router/routes/dashboardRoutes"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"
import { useStyles } from "./privateLayoutStyles"
import { cmsActions, billingActions, dealerActions, machineAction } from "redux/store"
import { useDispatch } from "react-redux"
import { getModulePermissions, addModules } from "helpers/Functions/roleFunction"

const grantedViewPermission = (item, user) => {
  if (user?.role === "subadmin") {
    let newPermission = addModules(user?.permissions?.permission)
    if (item?.module === "dashboard") {
      return true
    } else {
      let flag
      let modulePermission = getModulePermissions(newPermission, item.module)
      if (modulePermission && modulePermission.length > 0) {
        let getView = modulePermission.find((item) => {
          return item
        })
        if (getView?.permissionObj?.viewPermission) {
          flag = true
        } else {
          flag = false
        }
      }
      return flag
    }
  } else {
    return true
  }
}

const grantedParentPermission = (item, user) => {
  if (user?.role === "subadmin") {
    let flag
    for (let i = 0; i < item.alias?.length; i++) {
      let check = getModulePermissions(user?.permissions?.permission, item.alias[i]?.module)
      if (check && check.length > 0) {
        let getView = check.find((item) => {
          return item
        })
        if (getView?.permissionObj?.viewPermission) {
          flag = true
          break
        } else {
          flag = false
        }
      }
    }
    return flag
  } else {
    return true
  }
}
const SideBar = () => {
  const user = userDetail()
  return DashboardMenus.map((item, i) => {
    if (item.role.indexOf(user.role) != -1) {
      return <MenuItem key={i} item={item} />
    }
  })
}

export default SideBar
const hasChildren = (item) => {
  return !Array.isArray(item.alias) ? false : true
}

const MenuItem = ({ item, onClick }) => {
  const Component = hasChildren(item) ? MultiLevel : SingleLevel
  return <Component item={item} onClick={onClick} />
}

const SingleLevel = ({ item }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = userDetail()
  const currentRoute = window.location.pathname
  const styles = useStyles()
  const activeMenu = (item) => currentRoute.includes(item.route)

  const handlenavigate = (item) => {
    dispatch(cmsActions.setTabActive(0))
    dispatch(dealerActions.setDealerTabActive(0))
    dispatch(billingActions.setBillingTabActive(0))
    dispatch(machineAction.setActiveTab(0))
    navigate(`/${user.role}` + item.route)
  }
  return grantedViewPermission(item, user) ? (
    <>
      <ListItem
        sx={activeMenu(item) ? styles.activeListItem : styles.listItem}
        button
        onClick={() => handlenavigate(item)}>
        <ListItemIcon sx={activeMenu(item) ? styles.iconActive : styles.icon}>
          {item.icon}
        </ListItemIcon>
        <ListItemText>
          <Typography
            color={activeMenu(item) ? "primary.main" : "text.main"}
            variant="p1"
            paddingRight={"1rem"}>
            {item.title}
          </Typography>
        </ListItemText>
      </ListItem>
    </>
  ) : (
    ""
  )
}

const MultiLevel = ({ item }) => {
  const [open, setOpen] = useState(false)
  const user = userDetail()
  const currentRoute = window.location.pathname
  const styles = useStyles()
  const activeMenu = (item) => currentRoute.includes(item.route)

  const activeMenuParent = (item) => item.alias.some((child) => currentRoute.includes(child.route))

  const handleCollapseOpen = () => {
    setOpen(true)
  }

  const handleCollapseClose = () => {
    setOpen(false)
  }
  const navigate = useNavigate()

  return grantedParentPermission(item, user) ? (
    <>
      <List sx={{ paddingTop: "0", paddingBottom: "0" }}>
        <ListItem
          sx={activeMenuParent(item) ? styles.activeListItem : styles.listItem}
          button
          onMouseEnter={handleCollapseOpen}
          onMouseLeave={handleCollapseClose}>
          <ListItemIcon sx={activeMenuParent(item) ? styles.iconActive : styles.icon}>
            {item.icon}
          </ListItemIcon>
          <ListItemText>
            <Typography color={activeMenuParent(item) ? "primary.main" : "text.main"} variant="p1">
              {item.title}
            </Typography>
          </ListItemText>
        </ListItem>
        <Collapse
          in={open}
          timeout="auto"
          unmountOnExit
          onMouseEnter={handleCollapseOpen}
          onMouseLeave={handleCollapseClose}>
          <List component="div" sx={{ paddingLeft: "1.6rem" }}>
            {item.alias.map((child, i) =>
              grantedViewPermission(child, user) ? (
                <>
                  <ListItem
                    sx={activeMenu(child) ? styles.activeListItem : styles.listItem}
                    button
                    key={i}
                    onClick={() => navigate(`/${user.role}` + child.route)}>
                    <ListItemIcon sx={activeMenu(child) ? styles.iconActive : styles.icon}>
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText>
                      <Typography
                        color={activeMenu(child) ? "primary.main" : "text.main"}
                        variant="p2">
                        {child.title}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                </>
              ) : (
                ""
              )
            )}
          </List>
        </Collapse>
      </List>
    </>
  ) : null
}
