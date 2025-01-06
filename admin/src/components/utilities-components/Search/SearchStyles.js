import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    borderRadius: {
      borderRadius: "0.8rem",
      height: "4.4rem",
      width: "4.4rem"
    },
    whiteBg: {
      backgroundColor: theme?.palette?.background?.default
    },
    secondaryBg: {
      backgroundColor: theme?.palette?.secondary?.main
    },
    icon: {
      height: "2.4rem",
      width: "2.4rem"
    },
    searchBox: {
      height: "4.4rem",
      width: "20rem"
    }
  }
}
