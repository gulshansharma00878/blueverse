import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    activeTab: {
      backgroundColor: theme.palette.secondary.main,
      color: "white"
    },
    inactiveTab: {
      color: "black"
    },
    tabContainer: {
      backgroundColor: theme.palette.background.pink3
    }
  }
}
