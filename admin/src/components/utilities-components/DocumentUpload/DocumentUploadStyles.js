import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    documentText: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "250px",
      color: theme.palette.background.blue2
    },
    documentBox: {
      overflowX: "scroll",
      flexWrap: "nowrap",
      width: "calc(100vw - 229px)",
      marginLeft: "20px"
    },
    innerBox: {
      display: "flex",
      flexShrink: 0,
      marginRight: "40px"
    }
  }
}
