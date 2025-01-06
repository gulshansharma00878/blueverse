import { useTheme } from "@mui/system"

const drawerWidth = 270

export const useStyles = () => {
  const theme = useTheme()

  return {
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        margin: "0.8rem",
        marginBottom: "6.6rem",
        // background: theme.palette.background.secondary,
        borderRadius: "0.5rem",
        width: drawerWidth - 1.6,
        boxSizing: "border-box",
        height: "98vh"
      }
    },
    drawerHeader: {
      color: theme.palette.text.main
    },
    divider: {
      border: `0.1rem solid rgba(255, 255, 255, 0.1)`,
      marginBottom: "2.1rem"
    },
    activeListItem: {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.secondary.main,
      borderLeft: "5px solid " + theme.palette.primary.main,
      padding: "1.6rem",
      "&:hover": {
        backgroundColor: theme.palette.secondary.main
      }
    },
    listItem: {
      color: theme.palette.text.main,
      borderLeft: "5px solid transparent",
      borderRadius: "0.5rem",
      padding: "1.6rem"
    },
    listItemText: {
      fontFamily: theme.typography.fontFamily,
      fontSize: "1.4rem",
      fontWeight: "400",
      lineHeight: "1.6rem"
    },
    icon: {
      color: theme.palette.text.main
    },
    iconActive: {
      filter:
        "invert(28%) sepia(98%) saturate(728%) hue-rotate(195deg) brightness(91%) contrast(88%)"
    },
    logout: {
      position: "absolute",
      bottom: 0,
      color: theme.palette.secondary.main,
      fontSize: "1.4rem",
      fontWeight: "400",
      left: 0,
      right: 0
    },
    menu_style: {
      border: "0.1rem solid #F1F1F1 !important"
    },
    topbar_button: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "1rem !important",
      height: "5.2rem",
      background: "#FFFFFF",
      border: "0.1rem solid #F1F1F1",
      boxSizing: "border-box",
      borderRadius: "3.7rem !important"
    },
    header_box: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    appbar: {
      background: theme.palette.background.default,
      color: theme.palette.primary.main,
      boxShadow: "0rem -0.1rem 1.6rem 0rem #564AA93D"
    },
    avatarContainer: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      cursor: "pointer"
    },
    avatar: {
      backgroundColor: "background.gray4",
      fontSize: "1.6rem",
      cursor: "pointer",
      width: "4.4rem",
      height: "4.4rem"
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      width: "100%"
    },
    notificationBell: {
      backgroundColor: theme.palette.secondary.main,
      width: "4.4rem",
      height: "4.4rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "1rem",
      marginRight: "2.4rem"
    },
    notificationIcon: {
      width: "2.5rem",
      height: "2.5rem",
      cursor: "pointer"
    },
    userActionsContainer: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    },
    logoContainer: {
      width: "100%"
    },
    desktopLogo: {
      width: "12rem",
      height: "3.2rem",
      cursor: "pointer"
    },
    mobileLogo: {
      width: "5rem",
      height: "5rem",
      cursor: "pointer"
    }
  }
}
