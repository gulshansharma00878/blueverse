/* eslint-disable no-console */

import React, { useEffect, useRef, useState } from "react"
import { styled, useTheme } from "@mui/material/styles"
import {
  Box,
  List,
  Typography,
  ListItemIcon,
  Divider,
  ListItemText,
  ListItemButton,
  Toolbar,
  Popover
} from "@mui/material"
import MuiDrawer from "@mui/material/Drawer"
import CssBaseline from "@mui/material/CssBaseline"
import { DashboardMenus } from "router/routes/dashboardRoutes"
import { useNavigate } from "react-router-dom"
import { useStyles } from "./privateLayoutStyles"
import { useCookies } from "react-cookie"
import { CookieKeys, CookieOptions } from "constants/cookieKeys"
import { userDetail } from "hooks/state"
import MuiAppBar from "@mui/material/AppBar"
import { useDispatch } from "react-redux"
import { AuthService } from "network/authService"
import { coreAppActions, billingActions, machineAction } from "redux/store"
import Toast from "components/utitlities-components/Toast/Toast"
import CloseIcon from "@mui/icons-material/Close"
import { getPermissionJson, validateUserLogin } from "helpers/Functions/roleFunction"
import BlueverseMobileLogo from "assets/images/Logo/BV_MobileLogo.svg"
import BlueverseDesktopLogo from "assets/images/Logo/BV_DesktopLogo.svg"
import MenuIcon from "assets/images/icons/menuIcon.svg"
import useMediaQuery from "@mui/material/useMediaQuery"
import SecondaryButton from "components/utitlities-components/SecondaryButton/SecondaryButton"
import UserAvatar from "./UserAvatar"
import Badge from "@mui/material/Badge"
import NotificationIcon from "../assets/images/icons/notificationIcon.svg"
import NotificationListing from "components/NotificationListing"
import { getNotifications, readAllNotifications } from "helpers/Functions/getNotificationListing"
import { NotificationService } from "network/notificationService"
import { getToken, onMessage } from "firebase/messaging"
import { messaging } from "../firebase"
import { useSelector } from "react-redux"
import AppLoader from "components/Loader/AppLoader"
import { permissionMapNotification } from "helpers/Functions/notificationImageMap"
const drawerWidth = 270

const openedMixin = (theme) => ({
  width: drawerWidth,
  height: "100vh",
  [theme.breakpoints.down("sm")]: {
    width: "100vw"
  },
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: "hidden"
})

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: "hidden",
  overflowY: "hidden",
  width: `calc(${theme.spacing(7)} + 0.1rem)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 0.1rem)`
  },
  [theme.breakpoints.down("sm")]: {
    width: 0,
    display: "none"
  }
})

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    [theme.breakpoints.down("sm")]: {
      width: 0
    },
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme)
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme)
    })
  })
)

const NotificationBell = styled(Badge)(() => {
  return {
    "& .MuiBadge-badge": {
      fontSize: "1.2rem",
      fontWeight: "bold",
      height: "fit-content",
      padding: "0.6rem 0.8rem",
      minWidth: "0rem"
    }
  }
})

export default function PrivateLayout({ children }) {
  const navigateTo = useNavigate()
  const styles = useStyles()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const currentRoute = window.location.pathname
  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies([CookieKeys.Auth])
  const [open, setOpen] = React.useState(false)
  const user = userDetail()
  const [anchorEl, setAnchorEl] = useState(null)
  const opens = Boolean(anchorEl)
  const appRef = useRef()
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null)
  const [notifications, setnotifications] = useState([])
  // const [notificationsCount, setnotificationsCount] = useState("")
  const isNotificationPermissionGranted = useSelector((state) => state?.app?.deviceToken)
  const isTokenPresent = useSelector((state) => state?.app?.firebaseToken)
  const isTokenStored = useSelector((state) => state?.app?.tokenStored)
  const [loading, setLoading] = React.useState(false)
  const [refetch, setRefetch] = useState(false)
  const notificationsCount = useSelector((state) => state?.app?.refetch)
  const [employeePermission, setEmployeePermission] = useState({
    advance: {},
    topup: {},
    taxInvoice: {},
    blueverseCredit: {},
    wallet: {},
    machine: {},
    employe: {}
  })

  useEffect(() => {
    getUnreadcount()
  }, [notificationsCount, employeePermission])

  useEffect(() => {
    getAllpermission()
  }, [])

  useEffect(() => {
    getNotifications(
      user,
      setHeaderNotifications,
      setHeaderNotificationsCount,
      setLoading,
      pagination,
      1,
      7,
      employeePermission
    )
  }, [refetch, notificationsCount, employeePermission])

  useEffect(() => {
    isNotificationPermissionGranted && getFireBaseToken()
  }, [isNotificationPermissionGranted])

  useEffect(() => {
    isTokenPresent !== "" && !isTokenStored && addTokenToBackEnd()
  }, [isTokenStored, isTokenPresent])

  const getFireBaseToken = async () => {
    const token = await getToken(messaging, {
      vapidKey:
        "BKIN9NTui9O99oTtKy7-xsCyl9ozra4SGA0NcKBaPi-CLOEU4o4oNo9F6Qn0_-HwTolmoyoaBKFBqrITDIyx8ks"
    })
    dispatch(coreAppActions.setFirebaseToken(token))
  }

  async function getAllpermission() {
    if (user.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "Billing & Accounting Advance Memo")
        let topupPermissionJson = getPermissionJson(user, "Billing & Accounting Top Up Memo")
        let taxInvoicePermissionJson = getPermissionJson(user, "Billing & Accounting Tax Invoice")
        let creditPermissionJson = getPermissionJson(user, "Billing & Accounting Blueverse credits")
        let walletPermissionJson = getPermissionJson(user, "wallet")
        let machinePermissionJson = getPermissionJson(user, "machine details")
        let employeePermissionJson = getPermissionJson(user, "manage employees")

        setEmployeePermission({
          ...employeePermission,
          advance: permissionJson?.permissionObj,
          topup: topupPermissionJson?.permissionObj,
          taxInvoice: taxInvoicePermissionJson?.permissionObj,
          blueverseCredit: creditPermissionJson?.permissionObj,
          wallet: walletPermissionJson?.permissionObj,
          machine: machinePermissionJson?.permissionObj,
          employee: employeePermissionJson?.permissionObj
        })
      }
    }
  }

  const setHeaderNotifications = (notifications) => {
    notifications?.length > 0 && setnotifications(notifications)
  }

  const pagination = () => {}

  const setHeaderNotificationsCount = (count) => {
    console.log("setHeaderNotification", count)
  }

  const handleNotificationClick = (event) => {
    getNotifications(
      user,
      setHeaderNotifications,
      setHeaderNotificationsCount,
      setLoading,
      pagination,
      1,
      7,
      employeePermission
    )
    setPopoverAnchorEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setPopoverAnchorEl(null)
  }
  const popoverOpen = Boolean(popoverAnchorEl)

  const getUnreadcount = async () => {
    setLoading(true)

    let perArr = []

    if (user?.role == "employee") {
      Object?.keys(employeePermission)?.map((item) => {
        let newPermission = permissionMapNotification(employeePermission, item)
        if (newPermission == undefined || perArr?.includes(newPermission)) {
          return
        } else {
          return perArr.push(permissionMapNotification(employeePermission, item))
        }
      })
    }

    const params = {}
    if (user?.role === "employee") {
      params.restrictTypes = perArr.length > 0 ? perArr?.join(",") : "NO_DATA"
    }
    const response = await NotificationService.getUnreadcount(params)
    if (response?.success && response?.code === 200) {
      dispatch(coreAppActions.setRefetch(response?.data?.records))
      setLoading(false)
    } else {
      setLoading(false)
    }
  }
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // eslint-disable-next-line no-unused-vars
  const handleLogout = async () => {
    const payLoad = {}
    try {
      // setLoading(true)
      const response = await AuthService.logoutOnClick(payLoad, cookies?.authToken)
      if (response.success) {
        const cookieNames = Object.keys(cookies)
        cookieNames.forEach((cookie) => {
          removeCookie(cookie, CookieOptions)
        })
        dispatch(coreAppActions.logout())

        Toast.showInfoToast(`${response.message}`)
      } else {
        if (response?.code === 400) {
          const text = response?.message

          if (text.includes("deactivated")) {
            const cookieNames = Object.keys(cookies)
            cookieNames.forEach((cookie) => {
              removeCookie(cookie, CookieOptions)
            })
            dispatch(coreAppActions.logout())
            Toast.showInfoToast(`You have been logged out`)
          } else {
            Toast.showErrorToast(`${response.message}`)
          }
        } else {
          Toast.showErrorToast(`${response.message}`)
        }
      }
    } catch (e) {
      // console.log(e)
    } finally {
      // setLoading(false)
    }
  }
  const addTokenToBackEnd = async () => {
    const response = await NotificationService.storeDeviceToken(isTokenPresent)
    if (response?.success) {
      dispatch(coreAppActions.setTokenStored(true))
    } else {
      dispatch(coreAppActions.setTokenStored(false))
    }
  }
  const navigate = (route) => {
    navigateTo(route)
  }
  const activeMenu = (item) => currentRoute.includes(item.route)

  const handleClick = () => {
    setAnchorEl(appRef.current)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const navigateToHome = () => {
    navigate("/")
  }

  const handleNavigate = (e, item) => {
    dispatch(billingActions.setBillingTabActive(0))
    dispatch(machineAction.setActiveTab(0))
    navigate(`/${user.role}` + item.route)
  }
  const removeStoredDeviceToken = async () => {
    const response = await NotificationService.deleteDeviceToken(isTokenPresent)
    if (response?.success && response?.code === 200) {
      dispatch(coreAppActions.setToken(false))
      dispatch(coreAppActions.setFirebaseToken(""))
      dispatch(coreAppActions.setTokenStored(false))
      handleLogout()
    }
  }
  const logout = () => {
    if (isNotificationPermissionGranted) {
      removeStoredDeviceToken()
    } else {
      handleLogout()
    }
  }
  if ("serviceWorker" in navigator) {
    onMessage(messaging, () => {
      getUnreadcount()
    })
  }
  const readAll = () => {
    handleNotificationClose()
    readAllNotifications(setLoading, setRefetch)
    // getUnreadcount()
    dispatch(coreAppActions.setRefetch(0))
  }
  return (
    <Box
      sx={{
        display: "flex"
      }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={styles.appbar} ref={appRef}>
        <Toolbar>
          <SecondaryButton
            onClick={handleDrawerOpen}
            sx={{
              marginRight: "2.5rem",
              minWidth: 0,
              width: "4.4rem",
              height: "4.4rem",
              padding: "2rem",
              borderColor: "transparent",
              backgroundColor: theme.palette.secondary.main
            }}>
            <img src={MenuIcon} style={{ width: "2.4rem", height: "2.4rem" }} />
          </SecondaryButton>
          <Box sx={styles.logoContainer}>
            {isMobile ? (
              <img src={BlueverseMobileLogo} onClick={navigateToHome} style={styles.mobileLogo} />
            ) : (
              <img src={BlueverseDesktopLogo} onClick={navigateToHome} style={styles.desktopLogo} />
            )}
          </Box>
          <Box sx={styles.userActionsContainer}>
            <Box sx={styles.notificationBell}>
              <NotificationBell
                badgeContent={notificationsCount}
                color="error"
                onClick={handleNotificationClick}>
                <img src={NotificationIcon} style={styles.notificationIcon} />
              </NotificationBell>
              <Popover
                id={"notification-popover"}
                open={popoverOpen}
                anchorEl={popoverAnchorEl}
                onClose={handleNotificationClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center"
                }}
                PaperProps={{
                  style: {
                    backgroundColor: "#fff",
                    boxShadow: "0px -0.1rem 1.6rem 0px #564aa93d ",
                    borderRadius: "0.5rem"
                  }
                }}
                sx={{ top: "0.5rem" }}>
                <Box
                  sx={{
                    width: "60rem",
                    borderRadius: "0.5rem"
                  }}
                  className="filter_container">
                  <Box>
                    <Box
                      display={"flex"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      padding="1.3rem">
                      <Typography variant="p2">Your Notifications</Typography>
                      <Typography
                        variant="p2"
                        color="background.blue2"
                        sx={{ cursor: "pointer" }}
                        onClick={readAll}>
                        Mark All As Read
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        minWidth: "60rem"
                      }}>
                      {loading ? (
                        <AppLoader />
                      ) : (
                        <NotificationListing
                          isPopUp
                          notifications={notifications}
                          handleNotificationClose={handleNotificationClose}
                        />
                      )}{" "}
                    </Box>
                    <Box
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      padding="1.3rem"
                      onClick={() => navigate(`/${user.role}/notifications`)}>
                      <Typography
                        variant="p2"
                        color={"background.blue7"}
                        sx={{ cursor: "pointer" }}>
                        View All Notifications
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Popover>
            </Box>
            <UserAvatar
              username={user?.name}
              handleClick={handleClick}
              handleClose={handleClose}
              handleLogout={logout}
              open={opens}
              anchor={anchorEl}
              profileImage={user?.profileImage}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        onMouseEnter={handleDrawerOpen}
        onMouseLeave={handleDrawerClose}>
        <DrawerHeader>
          {isMobile ? (
            <SecondaryButton
              onClick={handleDrawerClose}
              sx={{
                minWidth: "0",
                width: "4.4rem",
                height: "4.4rem",
                [theme.breakpoints.up("sm")]: { borderColor: "transparent" }
              }}>
              <CloseIcon fontSize="large" />
            </SecondaryButton>
          ) : null}
        </DrawerHeader>
        <Divider />
        <List>
          <Divider sx={styles.divider} />
          {DashboardMenus.map((item) => {
            const permissionObj = validateUserLogin(user, item)
            if (item.role.indexOf(user.role) !== -1) {
              return (
                <>
                  {permissionObj?.viewPermission ? (
                    <ListItemButton
                      sx={activeMenu(item) ? styles.activeListItem : styles.listItem}
                      key={item.alias}
                      onClick={(e) => handleNavigate(e, item)}>
                      <ListItemIcon sx={activeMenu(item) ? styles.iconActive : styles.icon}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText>
                        <Typography
                          color={activeMenu(item) ? "primary.main" : "text.main"}
                          variant="p1">
                          {item.title}
                        </Typography>
                      </ListItemText>
                    </ListItemButton>
                  ) : null}
                </>
              )
            }
          })}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: "2rem",
          width: `calc(100% - (${theme.spacing(8)} + 0.1rem))`, // Using this width to match with closedMixin Width of SideBar
          [theme.breakpoints.down("sm")]: {
            width: "100%"
          }
        }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  )
}
