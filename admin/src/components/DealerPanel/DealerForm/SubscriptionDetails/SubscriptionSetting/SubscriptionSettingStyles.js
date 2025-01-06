import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    outerBox: {
      padding: "2rem 2.4rem",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)"
    },
    planCardBox_outerStyle: {
      marginRight: 4,
      [theme.breakpoints.down("sm")]: {
        marginRight: "0rem"
      }
    },

    planCardBox: {
      minWidth: "28.8rem",
      width: "1/3",
      padding: "0rem 0rem 3.2rem 0rem",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      borderRadius: "0.8rem",
      margin: "0rem 4rem 2rem 0rem",
      [theme.breakpoints.down("sm")]: {
        width: "100%"
      }
    },
    topName: {
      backgroundColor: theme.palette.background.green,
      height: "5.2rem",
      color: theme.palette.background.default,
      borderTopLeftRadius: "0.8rem",
      borderTopRightRadius: "0.8rem"
    },
    innerPlanBox: {
      padding: "0rem 1.2rem 0rem 1.2rem"
    },
    cardBox: {
      padding: "0rem 0rem 3.2rem 0rem",
      border: `0.1rem solid ${theme.palette.background.blue4}`,
      borderRadius: "0.8rem"
    },
    outerCardBox: {
      minWidth: "28.8rem",
      margin: "3.6rem 4rem 2rem 0rem"
    },
    planBox: {
      display: "flex",
      overflowX: "scroll",
      width: "inherit",
      paddingLeft: "0.1rem",

      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        paddingLeft: "0rem",
        width: "100%"
      }
    },
    primaryCard: {
      padding: "0rem 1.2rem 0rem 1.2rem"
    },
    primary: {
      display: "flex",
      flexDirection: "column",
      marginTop: "2rem"
    },
    innerBox: {
      backgroundColor: "#94DD60",
      height: "5.2rem"
    },
    inputBox: {
      padding: "0rem 1.2rem 0rem 1.2rem"
    },
    goldWash: {
      backgroundColor: theme.palette.background.gold
    },
    silverWash: {
      backgroundColor: theme.palette.background.silver
    },
    platinumWash: {
      backgroundColor: theme.palette.background.platinum
    },
    disabled: {
      backgroundColor: theme.palette.background.gray1
    },
    dateInputField: {
      width: "100%",
      height: "7.2rem"
    }
  }
}
