import { useMediaQuery, useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  return {
    active: {
      borderBottom: "none",
      color: theme.palette?.text?.green
    },
    inactive: {
      borderBottom: "none",
      color: theme.palette?.error?.main
    },
    dealerOuter: {
      padding: isMobile ? "20px 0px 0px 0px" : "20px 20px 0px 20px",
      borderTop: `1px solid ${theme.palette.background.blue1}`
    },
    outerCards: {
      marginBottom: isMobile ? "2rem" : "2.5rem"
    },
    topBoxHeading: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.p4.fontWeight,
      marginBottom: "1.6rem"
    },
    dealerInfoBox: {
      padding: "20px"
    },
    dealerOutletInfoBox: {
      padding: "20px",
      boxShadow: "0px 2px 4px 0px #5A5B6A1F, 0px 0px 2px 0px #3A3A441F"
    },
    outletInnerBox: {
      padding: "20px",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      marginBottom: "20px"
    },
    accordionOuterCard: {
      display: "flex",
      justifyContent: "space-between"
    },
    accordionHeadingText: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.p4.fontWeight,
      marginTop: "20px"
    },
    activeTab: {
      backgroundColor: "#F3F8FE",
      borderBottom: `4px solid ${theme?.palette?.primary?.main}`
    },
    accordionHeadingText1: {
      fontSize: theme.typography.s1.fontSize,
      marginTop: "20px",
      fontWeight: theme.typography.s1.fontWeight
    },
    amountData: {
      marginTop: "20px"
    }
  }
}
