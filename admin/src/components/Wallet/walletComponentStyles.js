import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    displayFlex: {
      display: " flex"
    },
    alignCenter: {
      alignItems: "center"
    },
    fullWidth: { width: "100%" },
    justifyCenter: {
      justifyContent: "center"
    },
    justifyEnd: {
      justifyContent: "flex-end"
    },
    walletHistoryButton: {
      width: "17.125rem",
      height: "3rem",
      marginLeft: "1.5rem"
    },
    monthlyCost: {
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.text.main
    },
    monthlyTitle: {
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.text.gray
    },
    // Wallet Header Card Styles :

    headerContainer: {
      width: "100%",
      backgroundColor: theme.palette.secondary.main,
      marginBottom: "2.4rem",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0px 2px 4px 0px rgba(90, 91, 106, 0.12), 0px 0px 2px 0px rgba(58, 58, 68, 0.12)",
      justifyContent: "space-between",
      alignItems: "center",
      rowGap: "1.6rem !important"
    },
    walletHeading: {
      fontSize: theme.typography.h6.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.text.main,
      marginLeft: "0.5rem",
      width: "20rem"
    },
    viewTransactions: {
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.primary.main,
      marginLeft: "0.5rem",
      cursor: "pointer"
    },
    walletIcon: {
      width: "8.4rem",
      height: "7.8rem"
    }
  }
}
