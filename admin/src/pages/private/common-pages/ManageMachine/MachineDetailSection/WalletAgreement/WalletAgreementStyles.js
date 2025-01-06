import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    transactionOuterBox: {
      padding: "2.3rem 1.2rem 2.3rem 1.2rem",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)"
    },
    transactionOuterBox1: {
      padding: "3rem 2rem 2.3rem 2rem",
      boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
      borderTop: `0.1rem solid ${theme?.palette?.background?.blue1}`
    },
    dueDate: {
      fontSize: theme?.typography?.p3?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight,
      marginLeft: "0.4rem"
    },
    totalBox: {
      borderTop: `0.1rem solid ${theme?.palette?.background?.blue1}`,
      borderBottom: `0.1rem solid ${theme?.palette?.background?.blue1}`,
      padding: "2.2rem 0rem",
      marginTop: "2rem"
    },
    minimalFontSize: {
      fontSize: theme?.typography?.p3?.fontSize, // 12 fontsize
      fontWeight: theme?.typography?.h4?.fontWeight // 700 fontWeight,
    },
    centerMinimalFontSize: {
      fontSize: theme?.typography?.p5?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight
    },
    rechargeDate: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center"
    },
    rechargeBox: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      flexDirection: "column",
      "@media (max-width: 960px)": {
        alignItems: "flex-start",
        margin: "2rem 0rem"
      }
    },
    guranteeBox: {
      display: "flex",
      justifyContent: "flex-end",
      flexDirection: "row",
      "@media (max-width: 960px)": {
        justifyContent: "space-between",
        marginTop: "1.6rem"
      }
    },
    taxAmount: {
      display: "flex"
    },
    taxAmountBox: {
      display: "flex",
      flexDirection: "column",
      "@media (max-width: 960px)": {
        justifyContent: "center",
        alignItems: "flex-end"
      }
    },
    amountBox: {
      display: "flex",
      "@media (max-width: 960px)": {
        marginTop: "0.1rem"
      }
    },
    dividerBox: {
      height: "6rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "2rem"
    }
  }
}
