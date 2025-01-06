import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    active: {
      borderBottom: "none",
      fontSize: "12px",
      fontWeight: 700,
      color: theme.palette?.text?.green
    },
    inactive: {
      borderBottom: "none",
      fontSize: "12px",
      fontWeight: 700,
      color: theme.palette?.error?.main
    },
    roleBox: {
      marginTop: "20px"
    },
    tableBox: {
      marginTop: "24px"
    },
    topMargin: {
      marginTop: "16px"
    },
    records: {
      color: theme.palette?.text?.gray
    },
    searchBox: {
      marginTop: "16px",
      marginBottom: "16px",
      height: "24px",
      padding: "0px 10px 0px 10px"
    }
  }
}
