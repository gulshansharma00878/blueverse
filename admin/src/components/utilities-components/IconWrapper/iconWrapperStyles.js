import { useTheme } from "@mui/system"

const useStyles = () => {
  const theme = useTheme()
  return {
    wrapper: {
      height: "4.4rem",
      width: "4.4rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "0.8rem"
    },
    icon: {
      width: "2.4rem",
      height: "2.4rem"
    },
    pointer: {
      cursor: "pointer"
    },
    disable: {
      "& img": {
        filter:
          "invert(51%) sepia(38%) saturate(328%) hue-rotate(204deg) brightness(136%) contrast(48%)"
      }
    }
  }
}

export default useStyles
