import { useTheme } from "@emotion/react"

export const useStyles = () => {
  const theme = useTheme()
  return {
    walletBalanceContainer: {
      width: "100%",
      padding: "1rem",
      display: "flex",
      alignItems: "center",
      borderRadius: "10px", // Dont convert px to REM
      gap: "1rem",
      height: "100%"
    },
    walletBalanceColor: {
      backgroundColor: theme.palette.background.green3
    },
    walletCreditColor: {
      backgroundColor: theme.palette.background.green4
    },
    walletPendingColor: {
      backgroundColor: theme.palette.background.green2
    },
    walletText: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.text.main,
      marginLeft: "0.5rem"
    },
    walletAmount: {
      fontSize: theme.typography.s1.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      marginLeft: "0.5rem",
      wordBreak: "break-all"
    },
    errorWalletBalanceColor: {
      border: `1px solid ${theme?.palette?.text?.red4}`
    }
  }
}
