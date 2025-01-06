import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    outerBox: {
      margin: "20px 10px",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      padding: "20px"
    },
    status: {
      fontSize: theme.typography?.p1?.fontSize,
      fontWeight: theme.typography?.h1?.fontWeight,
      color: theme.palette.text?.gray
    },
    activeText: {
      fontSize: theme.typography?.s1?.fontSize,
      fontWeight: theme.typography?.h1?.fontWeight
    },
    roleBox: {
      marginTop: "20px",
      borderTop: `1px solid ${theme.palette.background.blue1}`,
      borderBottom: `1px solid ${theme.palette.background.blue1}`,
      padding: "20px 0px"
    }
  }
}
