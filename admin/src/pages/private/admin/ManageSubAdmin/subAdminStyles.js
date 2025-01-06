import { useTheme } from "@mui/system"
export const useStyles = () => {
  const theme = useTheme()
  return {
    marginBottom: {
      marginBottom: "1.6rem"
    },
    tableContainer: {
      boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
      padding: "0.5rem"
    },
    count: {
      color: theme?.palette?.text?.gray,
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight
    },
    marginLeft: {
      marginLeft: "1.5rem"
    },
    IconButton: {
      width: "1.5rem",
      height: "1.5rem"
    },
    topMargin: {
      marginTop: "1.6rem"
    },
    status: {
      fontSize: theme.typography.p3.fontSize,
      fontWeight: theme.typography.p3.fontWeight,
      cursor: "pointer"
    },
    activeStatus: {
      color: theme.palette.text.green
    },
    inActiveStatus: {
      color: theme.palette.text.red1
    },
    statusText: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      color: theme.palette.text.gray
    },
    detailsButton: {
      height: "3rem",
      width: "8rem",
      marginRight: "1rem"
    },
    detailsHeadingText: {
      fontSize: theme.typography.p3.fontSize,
      fontWeight: theme.typography.p3.fontWeight,
      color: theme.palette.text.gray
    },
    detailsInfoText: {
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.p3.fontWeight,
      color: theme.palette.text.main
    },
    marginRight: {
      marginRight: "1rem"
    },
    formContainer: {
      boxShadow: "0px 2px 4px 0px rgba(90, 91, 106, 0.12), 0px 0px 2px 0px rgba(58, 58, 68, 0.12)",
      padding: "2rem 1.6rem",
      marginBottom: "20rem"
    },
    formField: {
      width: "40.1rem",
      marginTop: 0,
      marginBottom: 0,
      [theme.breakpoints.down("sm")]: {
        width: "100% !important"
      }
    },
    formFieldGroup: {
      display: "flex",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      gap: "2rem"
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-start",
      width: "100%",
      marginTop: "2rem",
      gap: "2rem",
      "& button": {
        width: "28.2rem"
      },
      [theme.breakpoints.down("sm")]: {
        marginTop: 0,
        justifyContent: "center",
        "& button": {
          width: "100%"
        }
      }
    }
  }
}
