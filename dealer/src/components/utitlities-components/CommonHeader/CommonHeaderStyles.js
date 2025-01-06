import { useMediaQuery, useTheme } from "@mui/material"
export const useStyles = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  return {
    boxHeightBack: {
      padding: "1.2rem 1.2rem 1.2rem 1rem",
      borderRadius: "0.8rem 0.8rem 0rem 0rem"
    },
    boxHeightNormal: {
      backgroundColor: theme.palette.secondary.main,
      padding: "1.2rem",
      borderRadius: "0.8rem 0.8rem 0rem 0rem"
    },
    dropDownBox: {
      justifyContent: "space-between",
      gap: 1,
      width: isMobile ? "100%" : "auto",
      marginTop: isMobile ? "1.2rem !important" : "0rem",
      alignItems: "center"
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
      paddingRight: "2.4rem"
    },
    buttonBox: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    },
    display: {
      display: "flex"
    },
    iconBox: {
      backgroundColor: theme.palette.background.default,
      borderRadius: "0.8rem",
      height: "4.4rem",
      width: "4.4rem",
      marginLeft: "2rem"
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
    time: {
      marginTop: "0.5rem",
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.p2.fontWeight
    },
    badge: {
      backgroundColor: theme.palette.primary.main,
      borderRadius: "0.8rem",
      color: theme?.palette?.text?.white,
      paddingX: "1rem",
      paddingY: "0.6rem",
      marginLeft: "1.5rem"
    },
    dateSelect: {
      width: "100%"
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
