import { useTheme } from "@mui/material"
export const useStyles = () => {
  const theme = useTheme()

  return {
    span: {
      fontSize: theme?.typography?.p1?.fontSize,
      fontWeight: theme?.typography?.p1?.fontWeight,
      color: theme?.palette?.text?.main
    },
    btns: {
      width: "100%",
      height: "6.4rem",
      marginTop: "2rem",
      fontSize: theme?.typography?.button?.fontSize,
      fontWeight: theme?.typography?.button?.fontWeight,
      lineHeight: theme?.typography?.button?.lineHeight,
      letterSpacing: theme?.typography?.button?.letterSpacing,
      textTransform: theme?.typography?.button?.textTransform
    },
    image: {
      marginLeft: "1.2rem"
    },
    formDisplay: {
      width: "70%",
      marginLeft: "auto",
      marginRight: "auto"
    },
    bikeBox: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "flex-start"
      }
    },
    formInputBox: {
      width: "43%",
      [theme.breakpoints.down("sm")]: {
        width: "100%"
      }
    }
  }
}
