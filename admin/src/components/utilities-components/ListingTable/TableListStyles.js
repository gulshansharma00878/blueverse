// Info :  This style component is not used directly in this table list component instead being used with dependent components like DealerList and Agent List etc.

import { useTheme } from "@mui/system"

export const useStyles = () => {
  const theme = useTheme()
  return {
    outerBox: {
      height: "192px",
      width: "162px",
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      boxShadow: "0px 4px 12px rgba(31, 61, 226, 0.12)"
    },
    topMargin: {
      marginTop: "16px"
    },
    popBox: {
      display: "flex",
      alignItems: "center",
      height: "48px",
      cursor: "pointer"
    },
    textBox: {
      marginLeft: "14px"
    },
    searchBox: {
      marginTop: "16px",
      marginBottom: "16px",
      height: "24px"
    },
    records: {
      color: theme.palette?.text?.gray
    },
    active: {
      color: theme.palette.text.green,
      fontSize: "inherit",
      fontWeight: "inherit"
    },
    inactive: {
      color: theme.palette.text.red1,
      fontSize: "inherit",
      fontWeight: "inherit"
    },
    icon: {
      marginLeft: "4rem",
      cursor: "pointer",
      height: "4.2rem",
      width: "4.2rem",
      padding: "1rem",
      borderRadius: "0.8rem",
      backgroundColor: theme?.palette?.secondary?.main
    }
  }
}
