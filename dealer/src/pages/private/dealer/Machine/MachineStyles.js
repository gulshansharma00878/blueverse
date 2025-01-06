import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    activeTab: {
      backgroundColor: theme?.palette?.secondary?.main,
      color: theme?.palette?.background?.default
    },
    inactiveTab: {
      color: theme?.palette?.text?.main
    }
  }
}
