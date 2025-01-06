import { useTheme } from "@mui/system"
import useMediaQuery from "@mui/material/useMediaQuery"

export const useStyles = () => {
  const theme = useTheme()
  // const isLargeDevice = useMediaQuery(theme.breakpoints.between("sm", "lg"))
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")) //TODO: Will change this to 425 when rem conversion is complete here
  return {
    container: {
      paddingLeft: "2.7rem",
      paddingRight: "2.7rem",
      paddingTop: isMobile ? "2rem" : "4rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box"
    },
    display: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    },
    headerContainer: {
      position: "relative"
    },
    backIcon: {
      position: "absolute",
      left: "-23%",
      top: "23%",
      color: `rgba(0, 0, 0, 0.54)`,
      backgroundColor: `rgba(0, 0, 0, 0.14)`
    },
    form: {
      border: "0.1rem solid",
      borderColor: theme.palette.background.gray1,
      borderRadius: "0.8rem",
      paddingLeft: "2.3rem",
      paddingRight: "2.3rem",
      paddingTop: "5rem",
      paddingBottom: "5.2rem",
      height: "fit-content",
      width: "100%",
      boxSizing: "border-box",
      [theme.breakpoints.up("md")]: {
        maxWidth: "47.8rem"
      }
    },
    formField: {
      width: "100%"
    },
    topLabel: {
      color: theme.palette.text.main,
      marginBottom: "2.3rem",
      marginTop: "2rem",
      fontWeight: theme.typography.h6.fontWeight,
      fontSize: theme.typography.h6.fontSize,
      width: "100%"
    },
    label: {
      marginTop: "2vh",
      color: "#444444",
      fontSize: "1.6rem",
      fontStyle: "normal",
      fontWeight: " 600",
      lineHeight: " 2.4rem",
      letterSpacing: "0.5px",
      textAlign: "left"
    },
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "2.6vh"
    },
    submitBtn: {
      padding: "1.6rem 5rem",
      width: "100%",
      height: "6.4rem"
    },
    textReset: {
      fontWeight: theme.typography.h6.fontWeight,
      fontSize: theme.typography.h6.fontSize,
      color: theme.palette.text.main,
      marginTop: "6rem",
      marginBottom: "4rem"
    },
    gridResetPasswordContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "1rem"
    },
    checkCircleIcon: {
      marginTop: "6rem",
      color: theme.palette.primary.main,
      width: "6rem",
      height: "6rem"
    },
    button: {
      fontWeight: 700,
      color: theme.palette.text.white,
      background: theme.palette.primary.main,
      height: "5.2rem",
      width: "15.7rem",
      marginTop: "3rem"
    },
    forgotPassword: {
      cursor: "pointer",
      marginTop: "2.4rem"
    },
    linkContainer: {
      margin: "0.8rem 0"
    },
    tryOtherEmailText: {
      cursor: "pointer",
      marginTop: "3.2rem"
    },
    loader: {
      padding: "0px 1.5rem 0.1rem 1.6rem",
      color: theme.palette.text.white
    },
    logoContainer: {
      marginBottom: "0rem"
    },
    logo: {
      height: "11.8rem",
      width: "16.9rem",
      marginBottom: "2.4rem"
    },
    subTitle: {
      color: theme.palette.text.gray,
      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight,
      margin: "1.6rem 0"
    },
    bannerContainer: {
      display: "flex",
      // justifyContent: "space-between",
      alignItems: "center",
      justifyContent: "center"
    },
    bannerText: {
      fontSize: "1.4rem",
      fontWeight: "500",
      color: "#8692A4",
      marginLeft: "1.8rem"
    },
    otpmailText: {
      color: theme.palette.text.main,
      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight
    },
    otpmailText1: {
      color: theme.palette.text.gray,

      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight
    },
    disabled: {
      pointerEvents: "none",
      color: theme.palette.text.gray
    },
    visibilityIcon: {
      backgroundColor: theme.palette.secondary.main,
      width: "4.8rem",
      height: "4.8rem",
      borderRadius: "1rem"
    }
  }
}
