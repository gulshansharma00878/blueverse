import React, { useEffect, useRef, useState } from "react"
import { styled, useTheme } from "@mui/material/styles"
import { AuthService } from "network/authService"
import Toast from "components/utilities-components/Toast/Toast"
import { Box, Divider, Popover, Toolbar, Typography, useMediaQuery } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useStyles } from "./privateLayoutStyles"
import { useCookies } from "react-cookie"
import { CookieKeys, CookieOptions } from "constants/cookieKeys"
import { userDetail } from "hooks/state"
import MuiAppBar from "@mui/material/AppBar"
import MuiDrawer from "@mui/material/Drawer"
import CloseIcon from "@mui/icons-material/Close"
import CssBaseline from "@mui/material/CssBaseline"
import { useDispatch, useSelector } from "react-redux"
import { coreAppActions } from "redux/store"
import SideBar from "./SideBar"
import SessionWrapper from "./SessionWrapper"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useIsLoggedIn } from "hooks/state"
import BlueverseMobileLogo from "assets/images/Logo/BV_MobileLogo.svg"
import BlueverseDesktopLogo from "assets/images/Logo/BV_DesktopLogo.svg"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import MenuIcon from "assets/images/icons/menuIcon.svg"
import UserAvatar from "./UserAvatar"
import Badge from "@mui/material/Badge"
import NotificationIcon from "../assets/images/icons/notificationIcon.svg"
import NotificationListing from "components/NotificationListing"
import { getFirebaseTokens } from "../firebase"
import { getMessaging, onMessage } from "firebase/messaging"
import { getNotifications, readAllNotifications } from "helpers/Functions/getNotificationListing"
import { NotificationService } from "network/services/notificationService"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { permissionMapNotification } from "helpers/Functions/notificationImageMap"

const drawerWidth = 285

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
  const isLoggedIn = useIsLoggedIn()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const styles = useStyles()
  const user = userDetail()
  const navigateTo = useNavigate()
  const dispatch = useDispatch()
  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies([CookieKeys.Auth])
  const [open, setOpen] = React.useState(false)
  const appRef = useRef()
  const [loading, setLoading] = React.useState(false)
  // const [accordianOpen, setAccordianOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null)
  const [isTokenFound, setTokenFound] = useState(false)
  const [deviceToken, setDeviceToken] = useState("")
  const [subAdminPermission, setSubAdminPermission] = useState({
    advance: {},
    topup: {},
    taxInvoice: {},
    blueverseCredit: {},
    machine: {},
    dealer: {},
    service: {}
  })

  const permissionGranted = useSelector((state) => state?.app?.deviceToken)
  const notificationsCount = useSelector((state) => state?.app?.refetch)
  const isTokenPresent = useSelector((state) => state?.app?.tokenStored)
  useEffect(() => {
    getToken()
  }, [permissionGranted])
  useEffect(() => {
    tokenEnables()
  }, [isTokenFound])
  useEffect(() => {
    !isTokenPresent && deviceToken && sendDeviceToken()
  }, [deviceToken])
  const [notifications, setnotifications] = useState([])
  const [refetch, setRefetch] = useState(false)
  useEffect(() => {
    getNotifications(
      user,
      setHeaderNotifications,
      setHeaderNotificationsCount,
      handleLoading,
      pagination,
      1,
      7,
      subAdminPermission
    )
  }, [refetch, notificationsCount, subAdminPermission])
  const setHeaderNotifications = (notifications) => {
    notifications?.length > 0 && setnotifications(notifications)
  }
  const pagination = () => {}
  const handleLoading = () => {}
  const setHeaderNotificationsCount = () => {
    /* eslint-disable no-console*/
  }
  const getToken = () => {
    getFirebaseTokens(setTokenFound, setDeviceToken)
  }
  const tokenEnables = () => {
    if (isTokenFound) {
      dispatch(coreAppActions.setFirebaseToken(deviceToken))
      // sendDeviceToken(isTokenStored)
      //  Notification permission enabled 👍🏻
    } else if (!isTokenFound) {
      //  Need notification permission ❗️
    }
  }
  const sendDeviceToken = async () => {
    const response = await NotificationService.storeDeviceToken(deviceToken)
    if (response?.success && response?.code === 200) {
      dispatch(coreAppActions.setTokenStored(true))
    }
  }
  const handleNotificationClick = (event) => {
    setPopoverAnchorEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setPopoverAnchorEl(null)
  }
  useEffect(() => {
    getAllpermission()
    initializeAutocomplete()
  }, [])
  useEffect(() => {
    getUnreadcount()
  }, [notificationsCount])
  const messaging = navigator?.serviceWorker && getMessaging()
  if ("serviceWorker" in navigator) {
    onMessage(messaging, () => {
      getUnreadcount()
      getNotifications(
        user,
        setHeaderNotifications,
        setHeaderNotificationsCount,
        handleLoading,
        pagination,
        1,
        7,
        subAdminPermission
      )
    })
  } else {
    console.log("No ServiceWorker")
  }

  async function getAllpermission() {
    if (user.role == "subadmin") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "Billing & Accounting Advance Memo")
        let topupPermissionJson = getPermissionJson(user, "Billing & Accounting Top Up Memo")
        let taxInvoicePermissionJson = getPermissionJson(user, "Billing & Accounting Tax Invoice")
        let creditPermissionJson = getPermissionJson(user, "Billing & Accounting Blueverse credits")
        let machinePermissionJson = getPermissionJson(user, "machine details")
        let dealerPermissionJson = getPermissionJson(user, "dealer")
        let servicePermissionJson = getPermissionJson(user, "service request")
        setSubAdminPermission({
          ...subAdminPermission,
          advance: permissionJson?.permissionObj,
          topup: topupPermissionJson?.permissionObj,
          taxInvoice: taxInvoicePermissionJson?.permissionObj,
          blueverseCredit: creditPermissionJson?.permissionObj,
          machine: machinePermissionJson?.permissionObj,
          dealer: dealerPermissionJson?.permissionObj,
          service: servicePermissionJson?.permissionObj
        })
      }
    }
  }
  const opens = Boolean(anchorEl)

  const navigate = (route) => {
    navigateTo(route)
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }
  const getUnreadcount = async () => {
    let perArr = []

    if (user?.role === "subadmin") {
      Object?.keys(subAdminPermission)?.forEach((item) => {
        let newPermission = permissionMapNotification(subAdminPermission, item)

        if (newPermission === undefined || perArr?.includes(newPermission)) {
          return
        } else {
          return perArr.push(newPermission)
        }
      })
    }

    const params = {}
    if (user?.role === "subadmin") {
      params.restrictTypes = perArr.length > 0 ? perArr?.join(",") : "NO_DATA"
    }
    const response = await NotificationService.getUnreadcount(params)
    if (response?.success && response?.code === 200) {
      // setnotificationsCount(response?.data?.records)
      dispatch(coreAppActions.setRefetch(response?.data?.records))
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }

  // eslint-disable-next-line no-unused-vars
  const handleLogout = async () => {
    const payLoad = {}
    try {
      setLoading(true)
      const response = await AuthService.logoutOnClick(payLoad, cookies?.authToken)
      if (response.success) {
        const cookieNames = Object.keys(cookies)
        cookieNames.forEach((cookie) => {
          removeCookie(cookie, CookieOptions)
        })
        dispatch(coreAppActions.logout())
        Toast.showInfoToast(`${response.message}`)
      } else {
        if (user?.role !== "admin" && response.code === 400) {
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
      setLoading(false)
    }
    navigate("/auth/login")
  }

  const handleClick = () => {
    setAnchorEl(appRef.current)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const navigateToHome = () => {
    navigate("/")
  }

  const initializeAutocomplete = async () => {
    if (!window.google) {
      const url = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`
      const script = document.createElement("script")
      script.src = url
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }
  const deleteNotificationToken = async () => {
    const response = await NotificationService.deleteDeviceToken(deviceToken)
    if (response?.success && response?.code === 200) {
      dispatch(coreAppActions.setToken(false))
      dispatch(coreAppActions.setFirebaseToken(""))
      dispatch(coreAppActions.setTokenStored(false))
      handleLogout()
    }
  }
  const logout = () => {
    if (permissionGranted) {
      deleteNotificationToken()
    } else {
      handleLogout()
    }
  }
  const readAll = () => {
    handleNotificationClose()
    readAllNotifications(setLoading, setRefetch)
    getUnreadcount()
    dispatch(coreAppActions.setRefetch(0))
  }

  const popoverOpen = Boolean(popoverAnchorEl)
  return (
    <SessionWrapper handleLogout={handleLogout}>
      {loading && <AppLoader />}
      <Box sx={{ display: "flex" }}>
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
                <img src={BlueverseMobileLogo} style={styles.mobileLogo} onClick={navigateToHome} />
              ) : (
                <img
                  src={BlueverseDesktopLogo}
                  style={styles.desktopLogo}
                  onClick={navigateToHome}
                />
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
                        )}
                      </Box>
                      <Box
                        display={"flex"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        padding="1.3rem"
                        onClick={() => navigate(`/${user.role}/notifications`)}>
                        <Typography
                          variant="p2"
                          color={"background.blue2"}
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
                profileImage={user?.profileImg}
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
          <SideBar />
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
          {isLoggedIn && children}
        </Box>
      </Box>
    </SessionWrapper>
  )
}
