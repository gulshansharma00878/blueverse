import { useTheme } from "@mui/material"
const useStyles = () => {
  const theme = useTheme()
  return {
    dropDown: {
      backgroundColor: theme?.palette?.secondary?.main,
      padding: 0,
      marginTop: "-1.4rem",
      height: "4.4rem",
      width: "4.4rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "0.8rem"
    }
  }
}
export default useStyles
