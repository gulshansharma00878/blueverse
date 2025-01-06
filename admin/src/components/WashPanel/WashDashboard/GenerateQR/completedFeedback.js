import { useTheme } from "@mui/system"

export const useStyles = () => {
  const theme = useTheme()
  return {
    fc_generated_text: {
      fontSize: theme?.typography?.p3?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.gray,
      margin: 0
    },
    fc_date_text: {
      fontSize: theme?.typography?.p3?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight,
      color: theme.palette.text.main,
      margin: 0
    },
    sku_heading: {
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight,
      color: theme.palette.text.gray,
      marginRight: "1rem"
    },
    generated_text: {
      fontSize: theme?.typography?.p3?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.gray,
      padding: "0.6rem, 1.2rem, 0.6rem, 1.2rem"
    },
    textStyle: {
      fontSize: theme?.typography?.s1?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.main,
      marginBottom: "0.8rem"
    },
    washTime: {
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.gray,
      marginBottom: "1.2rem"
    },
    hrsp_text: {
      fontSize: theme?.typography?.s1?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight,
      padding: "0.3rem 1.8rem"
    },
    customer_name: {
      fontSize: theme?.typography?.p1?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.main,
      padding: "0.3rem 1.8rem"
    },
    vechile_name: {
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.gray,
      padding: "0.3rem 1.8rem"
    },
    vechileNumber_text: {
      fontSize: theme?.typography?.s1?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      padding: "0.2rem 1.8rem",
      margin: 0
    },
    fc_customer_name: {
      fontSize: theme?.typography?.p1?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.gray,
      padding: "0.1rem 1.8rem",
      margin: 0
    },
    fc_wash_time: {
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme.palette.text.gray,
      padding: "0.1rem 1.8rem"
    },
    fc_date: {
      color: theme.palette.text.main
    }
  }
}
