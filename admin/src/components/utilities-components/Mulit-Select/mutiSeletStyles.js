import { useTheme } from "@mui/material"
export const useStyles = () => {
  const theme = useTheme()
  return {
    helperText: {
      fontSize: theme?.typography?.p3?.fontSize,
      marginLeft: "0.15rem",
      fontWeight: 400,
      color: theme?.palette?.error?.main
    },
    menuContainer: {
      boxShadow: "0px 4px 12px 0px rgba(31, 61, 226, 0.12)",
      maxHeight: "38.4rem"
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      fontSize: `${theme.typography.p1.fontSize} !important`,
      fontWeight: `${theme.typography.p1.fontWeight} !important`,
      lineHeight: `${theme.typography.p1.lineHeight} !important`,
      [theme.breakpoints.down("sm")]: {
        fontSize: "2rem !important"
      }
    },
    checkboxContainer: {
      backgroundColor: theme?.palette?.secondary?.main,
      borderRadius: "1rem",
      width: "4.4rem",
      height: "4.4rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      // padding: "0.5rem",
      marginRight: "1rem",
      marginLeft: "0.6rem"
    }
  }
}
export default useStyles
