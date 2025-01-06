import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    kyc: {
      color: theme.palette.disable.main,
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.c1.fontWeight
    },
    profileBox: {
      backgroundColor: theme.palette.secondary.main,
      padding: "2rem",
      marginTop: "2.4rem",
      borderRadius: "1.6rem"
    },
    date: {
      color: theme.palette.disable.main
    },
    inputBox: {
      marginTop: "0",
      marginBottom: "0",
      fontSize: "8rem !important"
    },
    adornment: {
      display: "flex",
      alignItems: "center",
      height: "100%",
      marginTop: "0.9rem",
      marginRight: "0.5rem"
    },
    contactUs: {
      color: theme.palette.disable.main
    },
    forgetPassword: {
      marginTop: "2rem",
      marginLeft: "2rem"
    },
    infoTxt: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.p4.fontWeight,
      color: theme.palette.text.gray3
    },
    inputBoxContainer: {
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      borderRadius: "0.8rem",
      padding: "2rem"
    }
  }
}
