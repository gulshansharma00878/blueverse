import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    oemBox: {
      height: "12rem",
      border: "1px solid red"
    },
    subTitle: {
      width: "100%",
      marginBottom: "2.4rem"
    },
    inputBox: {
      marginTop: "2.4rem"
    },
    documentBox: {
      marginTop: "2.4rem"
    },
    formBox: {
      width: "100%"
    },
    imgIcon: {
      height: 24,
      width: 24,
      marginRight: 13
    },
    iconButton: {
      backgroundColor: theme.palette.secondary.main,
      height: "auto",
      display: "flex",
      alignItem: "center",
      padding: "0.6rem",
      borderRadius: "0.6rem"
    },
    loader: {
      padding: "0.6rem 1.2rem",
      zIndex: 100,
      backgroundColor: theme.palette.background.default
    },
    loadingBox: {
      position: "absolute",
      zIndex: 999,
      width: "100%",
      top: "calc(100% + 0.8rem)",
      left: 0
    },
    suggestionsBox: {
      boxShadow: "0px -1px 16px 0px #564aa93d",
      marginTop: "0.2rem !important",
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.p1.fontWeight,
      [theme.breakpoints.down("sm")]: {
        fontSize: "2rem !important"
      },
      color: theme.palette.text.main
    },
    suggestionItem: {
      padding: "0.6rem 1.6rem",
      cursor: "pointer"
    },
    suggestionItemHover: {
      backgroundColor: theme?.palette?.secondary?.main,
      padding: "0.6rem 1.6rem",
      cursor: "pointer"
    },
    documentIcon: {
      height: "2.4rem",
      width: "2.4rem",
      marginRight: "1.3rem",
      color: theme?.palette?.primary?.main
    }
  }
}
