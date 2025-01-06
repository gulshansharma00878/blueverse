import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    displayFlex: {
      display: "flex"
    },
    alignCenter: {
      alignItems: "center"
    },
    justifyCenter: {
      justifyContent: "center"
    },
    justifyEnd: {
      justifyContent: "flex-end"
    },
    tableWidth: {
      // maxWidth: "94vw",
      marginBottom: "1rem"
    },
    paper: {
      boxShadow: "0px 2px 4px 0px rgba(90, 91, 106, 0.12), 0px 0px 2px 0px rgba(58, 58, 68, 0.12)",
      padding: "2rem",
      borderRadius: "8px",
      marginTop: "2rem"
    },
    padding: {
      padding: "1rem 0.4rem"
    },
    fontSize: {
      fontSize: theme?.typography?.p3?.fontSize
    },
    stateText: {
      fontSize: theme?.typography?.s1?.fontSize,
      fontWeight: theme?.typography?.p5?.fontWeight
    },
    dateColumn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }
}
