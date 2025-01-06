import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    display: {
      display: "flex"
    },
    justifyCenter: {
      justifyContent: "center"
    },
    alignCenter: {
      alignItems: "center"
    },
    fullWidth: {
      width: "100%"
    },
    textAlignCenter: {
      textAlign: "center"
    },
    commonMarginTop: {
      marginTop: "1rem"
    },
    container: {
      padding: "1rem",
      maxWidth: "40rem"
    },
    tryAnotherText: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.p1.fontWeight,
      color: theme.palette.primary.main,
      cursor: "pointer"
    },
    grayText: {
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.p1.fontWeight,
      color: theme.palette.text.gray
    }
  }
}
