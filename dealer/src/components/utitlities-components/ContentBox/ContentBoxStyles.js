import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    imgContainer: {
      marginRight: "2.4rem",
      alignItems: "center",
      display: "flex"
    },
    contentBox: {
      display: "flex"
    },
    valueBox: {
      display: "flex",
      alignItems: "flex-start"
    },
    value: {
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.p2?.fontWeight
    },
    item: {
      fontSize: theme?.typography?.button?.fontSize,
      fontWeight: theme?.typography?.button?.fontWeight
    }
  }
}
