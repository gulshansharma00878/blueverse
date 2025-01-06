// Info :  This style component is not used directly in this table list component instead being used with dependent components like DealerList and Agent List etc.

import { useTheme } from "@mui/system"

export const useStyles = () => {
  const theme = useTheme()
  return {
    outerBox: {
      height: "19.2rem",
      width: "16.2rem",
      padding: "1.2rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      boxShadow: "0px 4px 12px rgba(31, 61, 226, 0.12)"
    },
    topMargin: {
      marginTop: "1.6rem"
    },
    popBox: {
      display: "flex",
      alignItems: "center",
      height: "4.8rem",
      cursor: "pointer"
    },
    textBox: {
      marginLeft: "1.4rem"
    },
    searchBox: {
      marginTop: "1.6rem",
      marginBottom: "1.6rem",
      height: "2.4rem"
    },
    records: {
      color: theme.palette?.text?.gray
    },
    active: {
      borderBottom: "none",
      fontSize: "1.2rem",
      fontWeight: 700,
      color: theme.palette?.text?.green
    },
    inactive: {
      borderBottom: "none",
      fontSize: "1.2rem",
      fontWeight: 700,
      color: theme.palette?.error?.main
    }
  }
}
