import { useMediaQuery, useTheme } from "@mui/material"
export const useStyles = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  return {
    boxHeightBack: {
      padding: "1.2rem 1.2rem 1.2rem 1rem",
      borderRadius: "0.8rem 0.8rem 0rem 0rem"
    },
    headerImg: {
      height: "4.4rem",
      width: "4.4rem"
    },
    buttonImg: {
      height: "2.4rem",
      width: "2.4rem"
    },
    boxHeightNormal: {
      backgroundColor: theme.palette.secondary.main,
      padding: "1.2rem",
      borderRadius: "0.8rem 0.8rem 0rem 0rem"
    },
    innerHeading: {
      display: "flex",
      alignItems: "center"
    },
    innerHeadingText: {
      fontSize: "2rem"
    },
    amountCardBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px"
    },
    buttonBox: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    },
    imgTag: {
      paddingRight: "1.3rem",
      display: "flex",
      alignItems: "center"
    },
    display: {
      display: "flex"
    },
    justifyCenter: {
      justifyContent: "center"
    },
    alignCenter: {
      alignItems: "center"
    },
    badge: {
      backgroundColor: theme?.palette?.primary?.main,
      width: "fit-content",
      padding: "1rem",
      height: "3.2rem",
      borderRadius: "0.8rem",
      color: theme?.palette?.text?.white
    },
    smallMarginLeft: {
      marginLeft: "0.4rem"
    },
    marginLeft: {
      marginLeft: "2rem"
    },
    iconBox: {
      backgroundColor: isMobile ? theme.palette.secondary?.main : theme.palette.background.default,
      borderRadius: "0.8rem",
      height: "4.4rem",
      width: "4.4rem"
    },
    borderLeft: {
      borderLeft: "0.1rem solid",
      borderColor: theme.palette.background.blue1
    },
    deleteButton: {
      width: "14rem",
      height: "6.5rem"
    },
    editButton: {
      width: "14rem",
      height: "6.5rem",
      marginRight: "1.9rem"
    },
    icon: {
      width: "2.4rem",
      height: "2.4rem"
    },
    dateBox: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    },
    allIconBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "1.9rem"
    },
    marginZero: {
      marginLeft: "0rem"
    }
  }
}
