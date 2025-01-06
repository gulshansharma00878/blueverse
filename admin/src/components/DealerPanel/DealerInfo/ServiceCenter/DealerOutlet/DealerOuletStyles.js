import { useMediaQuery, useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery("(max-width:650px)")
  return {
    mappingAccordionContainer: {
      borderRadius: "8px",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      marginBottom: "36px"
    },
    expandMoreIconStyle: {
      borderColor: "none",
      width: "45px",
      height: "45px",
      backgroundColor: theme.palette.background.default,
      borderRadius: "8px",
      color: theme.palette.primary.main,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    mappingAccordionSummary: {
      borderColor: "none",
      backgroundColor: theme.palette.primary.main,
      borderRadius: "8px",
      color: theme.palette.background.default,
      padding: "13px 20px"
    },
    machineBox: {
      paddingTop: "20px"
    },
    mainOutletBox: {
      marginTop: "20px",
      padding: "20px",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)"
    },
    machineLabelContainer: {
      display: "flex",
      flexDirection: "row",
      overflowX: "auto",
      gap: "2rem"
    },
    machineLabel: {
      backgroundColor: theme.palette.background.blue3,
      borderRadius: "4px",
      paddingLeft: "8px",
      paddingRight: "8px",
      width: "10rem",
      height: "48px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    },
    machineAgreement: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    },
    amountBox: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: isMobile ? "flexStart" : "center",
      gap: "1.5rem",
      marginLeft: isMobile ? "0px" : "2.5rem"
    }
  }
}
