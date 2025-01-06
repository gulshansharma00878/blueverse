import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    wash_count_box: {
      borderRadius: "0.8rem",
      boShadow: "0rem 0.1rem 0.4rem 0rem rgba(0, 0, 0, 0.2)",
      width: "100%",
      padding: "1.2rem 0rem 1.2rem 1.6rem"
    },
    machineName: {
      borderBottom: `1px solid ${theme?.palette?.text?.main}`,
      paddingBottom: "0.2rem"
    },
    feedback_box: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1.6rem",
      backgroundColor: theme.palette.background.blue6,
      mb: "2rem",
      borderRadius: "1.2rem"
    },
    icon_box: {
      borderRadius: "0.8rem",
      backgroundColor: theme.palette.background.blue2,
      height: "4rem",
      width: "4rem"
    },
    arrow_icon: {
      color: theme.palette.background.default
    }
  }
}
