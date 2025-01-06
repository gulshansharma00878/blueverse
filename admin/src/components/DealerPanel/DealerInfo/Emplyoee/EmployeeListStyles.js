import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    employeeBox: {
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
    },
    tableHeader: {
      display: "flex",
      alignItems: "center"
    }
  }
}
