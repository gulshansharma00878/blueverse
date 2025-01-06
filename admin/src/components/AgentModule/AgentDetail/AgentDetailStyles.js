import { useTheme } from "@mui/system"

export const useStyles = () => {
  const theme = useTheme()
  return {
    detailBox: {
      boxShadow: "0px 2px 4px 0px rgba(90, 91, 106, 0.12), 0px 0px 2px 0px rgba(58, 58, 68, 0.12)"
    },
    inputBox: {
      padding: "10px 14px 20px 10px",
      borderRadius: "8px 8px 0px 0px",
      height: "calc(100vh - 164px)"
    },
    editButtonBox: {
      borderRadius: "0rem 0rem 0.8rem 0.8rem",
      padding: "2.4rem 0rem 2.4rem 0rem",
      display: "flex",
      justifyContent: "center",
      bottom: 0,
      left: 0,
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        borderTop: `0.1rem solid ${theme?.palette?.background?.blue1}`
      }
    },
    formikBox: {
      padding: "10px 20px 20px 20px"
    }
  }
}
