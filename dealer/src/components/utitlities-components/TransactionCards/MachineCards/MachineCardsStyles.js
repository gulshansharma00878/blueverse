import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    history: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      cursor: "pointer"
    },
    handleText: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h2.fontWeight,
      color: theme.palette.primary.main,
      [theme.breakpoints.down("md")]: {
        fontSize: theme.typography.body1.fontSize
      }
    },
    infoBox: {
      marginLeft: "0.5rem",
      cursor: "pointer"
    },
    cardBox: {
      backgroundColor: "#F3F8FE", // TODO: Change this to reference code
      borderRadius: "1rem",
      [theme.breakpoints.down("md")]: {
        padding: "0.8rem"
      },
      padding: "1rem"
    },
    leftBox: {
      marginLeft: "1.6rem"
    }
  }
}
