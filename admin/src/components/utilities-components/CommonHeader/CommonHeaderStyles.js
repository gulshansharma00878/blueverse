import { useMediaQuery, useTheme } from "@mui/material"
export const useStyles = () => {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  return {
    boxHeightBack: {
      // height: "64px",
      padding: "1.2rem 1.2rem 1.2rem 1rem",
      borderRadius: "0.8rem 0.8rem 0rem 0rem"
    },
    headerImg: {
      height: "4.4rem !important",
      width: "4.4rem",
      cursor: "pointer"
    },
    buttonImg: {
      height: "2.4rem",
      width: "2.4rem"
    },
    boxHeightNormal: {
      // height: "64px",
      backgroundColor: theme.palette.secondary.main,
      padding: "1.2rem",
      borderRadius: "0.8rem 0.8rem 0rem 0rem"
    },
    innerHeading: {
      display: "flex",
      alignItems: "center"
      // width: "100%"
    },
    innerHeadingText: {
      fontSize: "2rem"
    },
    backBtn: {
      paddingRight: "2.4rem",
      display: "flex",
      alignItems: "center"
    },
    imgTag: {
      // paddingRight: "1.3rem",
      display: "flex",
      alignItems: "center",
      gap: 1
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
      backgroundColor: theme.palette.primary.main,
      borderRadius: "0.8rem",
      color: theme?.palette?.text?.white,
      paddingX: "1rem",
      paddingY: "0.6rem",
      marginLeft: "1.5rem"
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
    icon: {
      width: "2.4rem",
      height: "2.4rem"
    },
    borderLeft: {
      borderLeft: "1px solid",
      borderColor: theme.palette.background.blue1,
      marginLeft: "2rem"
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
    dualButtons: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      [theme.breakpoints.down("sm")]: {
        justifyContent: "flex-end",
        width: "100%",
        "& button": {
          width: "50% !important"
        }
      }
    },
    dropDownBox: {
      justifyContent: "space-between",
      gap: 1,
      width: isTablet ? "100%" : "auto",
      marginTop: isTablet ? "2rem !important" : "0rem",
      alignItems: "center"
    },
    buttonBox: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    },
    dateSelect: {
      width: "100%",
      backgroundColor: "#FFF"
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
    }
  }
}
