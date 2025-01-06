import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    documentText: {
      whiteSpace: "nowrap",
      cursor: "pointer",
      color: theme.palette.background.blue2,
      textDecoration: "underline"
    },
    paper: {
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)"
    },
    docContainer: {
      display: "flex",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center"
    },
    docNameContainer: {
      whiteSpace: "nowrap",
      minWidth: "200px",
      overflow: "hidden",
      padding: "8px",
      textOverflow: "ellipsis",
      display: "flex",
      alignItems: "center"
    },

    docName: {
      color: theme.palette.background.blue2,
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight,
      letterSpacing: 0,
      marginRight: "5px"
    }
  }
}
