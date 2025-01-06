import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    gridContainer: {
      backgroundColor: "#F3F8FE",
      marginTop: "3.6rem",
      padding: "2rem",
      borderRadius: "0.8rem",
      marginRight: "10rem"
    },
    machineName: {
      backgroundColor: theme.palette.background.blue3,
      width: "fit-content",
      padding: "2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "White",
      borderRadius: "0.4rem"
    },
    detailName: {
      color: theme.palette.disable.main,
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.c1.fontWeight
    },
    darkDetails: {
      color: theme.palette.text.main,
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.p1.fontWeight
    },
    detailBox: {
      backgroundColor: theme.palette.secondary.main,
      marginTop: "3.6rem",
      padding: "2rem",
      borderRadius: "0.8rem",
      marginRight: "10rem"
    },
    minBox: {
      padding: "2rem 0px",
      borderTop: `1px solid ${theme.palette.background.blue1}`,
      borderBottom: `1px solid ${theme.palette.background.blue1}`
    },
    cardBox: {
      padding: "2rem 0px"
    },
    card: {
      borderRadius: "0.8rem",
      color: "white",
      height: "11.4rem",
      padding: "1.2rem",
      marginRight: "1.6rem"
    },
    notMobileWidth: { width: "23.4rem" },
    mobileWidth: { width: "100%" },
    gold: {
      backgroundColor: theme.palette.background.gold
    },
    silver: {
      backgroundColor: theme.palette.background.silver
    },
    platinum: {
      backgroundColor: theme.palette.background.platinum
    }
  }
}
