import { useTheme } from "@mui/material"

const useStyles = () => {
  const theme = useTheme()

  const drawerWidth = "37.7rem"

  return {
    drawer: {
      zIndex: "2200 !important",
      width: drawerWidth,
      position: "relative",
      [theme.breakpoints.down("sm")]: {
        width: "100vw"
      }
    },
    filterHeader: {
      // border: "1px solid red",
      paddingX: "2rem",
      width: drawerWidth,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "7.6rem",
      borderBottom: `1px solid ${theme.palette.background.gray4}`,
      position: "fixed",
      top: "0",
      zIndex: "2210",
      backgroundColor: "inherit",
      [theme.breakpoints.down("sm")]: {
        width: "100vw"
      }
    },
    filterWrapper: {
      width: drawerWidth,
      paddingTop: "7.6rem", // 7.6rem to match filterheader height
      paddingX: "0.8rem", // 0.8rem as accordionsummary and accordiondetials have native paddingX of 1.6rem. and for figma we need total 2.4rem
      marginBottom: "10rem", // This is to prevent dropdowns to go behind the footer buttons when there is scroll in filter
      // border: "1px solid green",
      // flexDirection: "column",
      [theme.breakpoints.down("sm")]: {
        width: "100vw"
      }
    },

    closeIcon: {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "0.8rem"
    },
    dateSelect: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1
    },
    accordianDiv: {
      maxHeight: "25rem",
      overflowY: "auto",
      overflowX: "hidden"
    },

    filterFooter: {
      display: "flex",
      justifyContent: "center",
      zIndex: "2210",
      alignItems: "center",
      gap: "1rem",
      position: "fixed",
      bottom: "0",
      borderTop: `1px solid ${theme.palette.background.blue1}`,
      paddingX: "2rem",
      paddingTop: "3.2rem",
      paddingBottom: "1.6rem",
      width: drawerWidth,
      backgroundColor: "inherit",
      [theme.breakpoints.down("sm")]: {
        width: "100vw"
      }
    },
    filterDrawerButton: {
      width: "50%",
      "& button": {
        width: "100% !important",
        height: "6.4rem !important",
        borderRadius: "0.8rem !important"
      }
    }
  }
}

export default useStyles
