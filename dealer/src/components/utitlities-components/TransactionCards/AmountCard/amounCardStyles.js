import { useTheme } from "@emotion/react"

export const useStyles = () => {
  const theme = useTheme()
  return {
    walletBalanceContainer: {
      width: "100%",
      padding: "0.4rem 2rem",
      display: "flex",
      alignItems: "center",
      borderRadius: "8px",
      height: "6rem"
    },
    icon: {
      width: "4rem",
      height: "4rem",
      marginRight: "1.2rem"
    },
    walletBalanceColor: {
      backgroundColor: theme.palette.background.green3
    },
    walletCreditColor: {
      backgroundColor: theme.palette.background.green4
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
      color: theme.palette.text.main,
      marginLeft: "0.5rem"
    },
    errorWalletBalanceColor: {
      border: `1px solid ${theme?.palette?.text?.red4}`
    }
  }
}
