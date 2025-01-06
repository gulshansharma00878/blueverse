import { useTheme } from "@mui/material"
const useStyles = () => {
  const theme = useTheme()
  return {
    dropDown: {
      backgroundColor: "#fff",
      padding: 0,
      minWidth: "12rem"
    },

    dropDownIconBox: {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "0.8rem",
      height: "4.4rem",
      width: "4.4rem",
      top: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginRight: "0.6rem"
    },
    dropDownIcon: {
      height: "2.4rem",
      width: "2.4rem"
    },
    typography: {
      fontWeight: theme?.typography?.p1?.fontWeight,
      fontSize: theme?.typography?.p1?.fontSize,
      color: theme?.palette?.text?.main,
      marginBottom: "-0.5rem"
    },
    helperText: {
      fontSize: theme?.typography?.p3?.fontSize,
      marginLeft: "0.15rem",
      fontWeight: 400,
      color: theme?.palette?.error?.main
    },
    select: {
      paddingTop: "1rem !important",
      borderRadius: "0.8rem !important",
      height: "7.2rem",
      backgroundColor: "#fff"
    },
    label: {
      paddingTop: "0.5rem !important",
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.p2.fontWeight,
      lineHeight: theme.typography.p2.lineHeight,
      color: theme.palette.text.gray,
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.8rem !important",
        marginTop: "-0.8rem"
      }
    }
  }
}
export default useStyles
