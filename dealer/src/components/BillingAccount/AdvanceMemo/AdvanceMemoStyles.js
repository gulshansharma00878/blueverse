import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    value1: {
      fontSize: theme?.typography?.h7?.fontSize,
      fontWeight: theme?.typography?.p2?.fontWeight
    },
    innerBox: {
      padding: "1rem",
      borderRadius: "0.8rem 0.8rem 0rem 0rem"
    },
    innerBox_container: {
      boxShadow:
        "0rem 0rem 0.2rem rgba(58, 58, 68, 0.12), 0rem 0.2rem 0.4rem rgba(90, 91, 106, 0.12)",
      padding: "2rem",
      borderRadius: "0.8rem",
      width: "100%",
      marginBottom: "20rem"
    },
    textDeco: {
      overflow: "hidden",
      textAlign: "center",
      position: "relative",
      "&::before, &::after": {
        backgroundColor: theme?.palette?.background?.blue8,
        content: '""',
        display: "inline-block",
        height: "0.1rem",
        position: "relative",
        verticalAlign: "middle",
        width: "50%"
      },
      "&::before": {
        right: "0.5rem",
        marginLeft: "-50%"
      },
      "&::after": {
        left: "0.5rem",
        marginRight: "-50%"
      }
    },
    billingAddress: {
      fontSize: theme?.typography?.h7?.fontSize,
      fontWeight: theme?.typography?.p2?.fontWeight,
      color: theme.palette.primary.main
    },

    detailBox: {
      padding: "2rem",
      backgroundColor: "#F3F8FE",
      display: "flex",
      justifyContent: "space-between",
      rowGap: "1.6rem"
    },
    washSection_box: {
      borderTop: `0.1rem solid ${theme?.palette?.background?.blue1}`,
      borderBottom: `0.1rem solid ${theme?.palette?.background?.blue1}`,
      marginTop: "3.4rem",
      padding: "2.4rem 0px 2.4rem 0px",
      display: "flex",
      flexDirection: "column",
      gap: "1.6rem"
    },
    washSection: {
      display: "flex",
      justifyContent: "space-between"
    },
    machineInfo: {
      margin: "3.6rem 0px 3.6rem 0px",
      width: "100%"
    },
    amountText: {
      fontSize: theme.typography.s1.fontSize,
      fontWeight: theme.typography.s1.fontWeight
    },
    amount: {
      fontSize: theme.typography.s1.fontSize,
      fontWeight: theme.typography.h1.fontWeight
    },
    blueverseText: {
      fontSize: theme.typography.s1.fontSize,
      fontWeight: theme.typography.p4.fontWeight,
      paddingTop: "1.6rem",
      borderTop: `1px solid ${theme.palette.background.blue1} `
    },
    signature: {
      fontSize: theme.typography.s1.fontSize,
      fontWeight: theme.typography.h1.fontWeight
    },
    invoiceSection: {
      marginBottom: "3.2rem",
      fontSize: theme.typography.s1.fontSize,
      fontWeight: theme.typography.s1.fontWeight
    },
    memoFooter: {
      position: "fixed",
      padding: "2rem",
      bottom: 0,
      width: "100%",
      boxShadow: "0px -1px 16px 0px rgba(86, 74, 169, 0.24)",
      display: "flex",
      rowGap: "1rem",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.palette.background.default,
      zIndex: 3, // should be higher than of memo-table

      "& #amount-section": {
        display: "flex",
        alignItems: "center"
      },

      "& #button-section": {
        display: "flex",
        gap: 1
      },

      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",

        "& #amount-section": {
          width: "100%",
          justifyContent: "flex-start"
        },
        "& #button-section": {
          width: "100%",
          "& button": {
            width: "50%"
          }
        }
      }
    },
    // Payment-Success Screen Styling
    outerContainer: {
      backgroundColor: theme.palette.background.pink3,
      justifyContent: "space-between",
      padding: "1rem",
      gap: "2rem",
      width: "100%",
      display: "flex",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column-reverse"
      }
    },
    innerContainer: {
      padding: "1rem",
      backgroundColor: "#fff",
      borderRadius: "0.8rem",
      marginBottom: "2rem",
      width: "50%",
      [theme.breakpoints.down("sm")]: {
        width: "100%"
      }
    }
  }
}
