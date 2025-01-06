import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    alarmList: {
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      padding: "2rem",
      marginTop: "2rem"
    },
    alertBox: {
      marginBottom: "2px",
      padding: "12px 16px",
      borderRadius: "12px",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)"
    },
    boxIndex: {
      color: theme?.palette?.text?.gray,
      fontWeight: theme?.typography?.h4?.fontWeight,
      fontSize: theme?.typography?.h6?.fontSize,
      borderRight: `1px solid ${theme?.palette?.background?.blue1}`
    },
    errorText: {
      color: theme?.palette?.text?.red3,
      fontWeight: theme?.typography?.h4?.fontWeight,
      fontSize: theme?.typography?.h6?.fontSize,
      borderRight: `1px solid ${theme?.palette?.text?.red2}`
    },

    errorBox: {
      marginBottom: "2px",
      padding: "12px 16px",
      borderRadius: "12px",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      backgroundColor: theme?.palette?.background?.pink2
    },
    allCheckTrue: {
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      padding: "1.5rem",
      borderRadius: "12px"
    },
    allCheckFalse: {
      border: `1px solid ${theme?.palette?.text?.red4}`,
      padding: "1.5rem",
      borderRadius: "12px"
    },
    alarmStatus: {
      fontWeight: theme?.typography?.h4?.fontWeight,
      fontSize: theme?.typography?.h6?.fontSize
    },
    progressBar: {
      height: "20px",
      width: "70%"
    },
    machineError: {
      color: theme?.palette?.background?.yellow
    },
    successColor: {
      color: theme?.palette?.text?.green
    },
    systemCheck: {
      borderRight: `1px solid ${theme?.palette?.background?.blue1}`,
      paddingRight: "3rem",

      // Responsive media query
      "@media (max-width: 960px)": {
        borderRight: `1px solid ${theme?.palette?.background?.blue1}`,
        display: "flex",
        justifyContent: "flex-start"
      }
    },
    numberError: {
      borderRight: `1px solid ${theme?.palette?.background?.blue1}`,
      // Responsive media query
      "@media (max-width: 960px)": {
        borderRight: "none"
      }
    },
    numberError1: {
      borderRight: `1px solid ${theme?.palette?.background?.blue1}`,
      // Responsive media query
      "@media (max-width: 960px)": {
        borderBottom: `1px solid ${theme?.palette?.background?.blue1}`,
        borderRight: "none",
        padding: "1.2rem 0rem",
        display: "flex",
        justifyContent: "flex-start"
      }
    },
    systemBox: {
      "@media (max-width: 960px)": {
        paddingBottom: "1.4rem",
        borderBottom: `1px solid ${theme?.palette?.background?.blue1}`
      }
    },
    alarmWorking: {
      "@media (max-width: 960px)": {
        borderRight: "none",
        padding: "1.2rem 0rem",
        borderBottom: `1px solid ${theme?.palette?.background?.blue1}`,
        display: "flex",
        justifyContent: "flex-start"
      }
    }
  }
}
