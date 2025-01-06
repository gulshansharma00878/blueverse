import { useTheme } from "@mui/material"
export const useStyles = () => {
  const theme = useTheme()
  return {
    appbar: {
      background: theme.palette.background.default,
      color: theme.palette.primary.main,
      boxShadow: "0px -1px 16px 0px #564AA93D"
    },
    marginRight: {
      marginRight: "1rem"
    }
  }
}
