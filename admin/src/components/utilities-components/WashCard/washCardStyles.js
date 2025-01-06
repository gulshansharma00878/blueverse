import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    card: {
      borderRadius: "0.8rem",
      height: "11.8rem",
      padding: "2rem"
    },
    gold: {
      backgroundColor: theme.palette.background.pink3
    },
    silver: {
      backgroundColor: theme.palette.background.gray2
    },
    platinum: {
      backgroundColor: theme.palette.background.gray3
    }
  }
}
