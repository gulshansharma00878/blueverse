import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    creditBox: {
      paddingLeft: "1rem",
      [theme.breakpoints.down("md")]: {
        paddingLeft: "0px",
        marginTop: "1.2rem"
      }
    },
    walletBox: {
      paddingRight: "1rem",
      [theme.breakpoints.down("md")]: {
        paddingRight: "0px"
      }
    },
    tableBox: {
      marginTop: "2.4rem",
      borderTop: `1px solid ${theme.palette.background.blue1}`,
      paddingTop: "2.4rem",
      [theme.breakpoints.down("md")]: {
        marginTop: "1.2rem",
        paddingTop: "1.2rem"
      }
    },
    marginLeft: {
      marginLeft: "2rem",
      [theme.breakpoints.down("md")]: {
        marginLeft: "1rem"
      }
    },
    borderLeft: {
      borderLeft: "1px solid",
      borderColor: theme.palette.background.blue1
    },
    iconBox: {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "0.8rem",
      height: "4.4rem",
      width: "4.4rem"
    },
    icon: {
      width: "2.4rem",
      height: "2.4rem"
    },
    searchBox: {
      marginBottom: "2.4rem",
      [theme.breakpoints.down("md")]: {
        marginBottom: "1.2rem"
      }
    },
    rowField: {
      fontSize: theme?.typography?.p3?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight
    }
  }
}
