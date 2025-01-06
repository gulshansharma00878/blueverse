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
        width: drawerWidth - 16,
        boxSizing: "border-box",
        height: "9.8rem"
      }
    },
    drawerHeader: {
      color: theme.palette.text.main
    },
    divider: {
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      marginBottom: "2.1rem"
    },
    activeListItem: {
      color: theme.palette.text.white,
      backgroundColor: theme.palette.secondary.main,
      borderLeft: "5px solid " + theme.palette.primary.main,
      width: "90%",
      margin: "auto",
      borderRadius: "0.5rem",
      padding: "1.6rem",
      "&:hover": {
        backgroundColor: theme.palette.secondary.main
      }
    },
    listItem: {
      color: theme.palette.text.main,
      borderLeft: "5px solid transparent",
      width: "90%",
      margin: "auto",
      borderRadius: "0.5rem",
      padding: "1.6rem"
    },
    icon: {
      color: theme.palette.text.main
    },
    iconActive: {
      filter:
        "invert(28%) sepia(98%) saturate(728%) hue-rotate(195deg) brightness(91%) contrast(88%)"
    },
    header_box: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    appbar: {
      background: theme.palette.background.default,
      color: theme.palette.primary.main,
      boxShadow: "0px -1px 16px 0px #564AA93D"
    },
    avatarContainer: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      cursor: "pointer"
    },
    avatar: {
      backgroundColor: "background.gray2",
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
