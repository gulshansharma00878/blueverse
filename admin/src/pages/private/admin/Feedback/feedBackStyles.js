import { useTheme } from "@emotion/react"
export const useStyles = () => {
  const theme = useTheme()
  return {
    container: {
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      padding: "4rem 0"
    },
    title: {
      fontWeight: theme?.typography?.h5?.fontWeight,
      fontSize: theme?.typography?.h6?.fontSize,
      color: theme?.palette?.text?.main,
      padding: "1.6rem 0"
    },
    subTitle: {
      fontWeight: theme?.typography?.s1?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      color: theme?.palette?.text?.main,
      padding: "0.8rem 0"
    },
    btn: { height: "6.4rem", width: "21.5rem" },
    createBtn: { height: "6.4rem", minWidth: "fit-content" },
    badge: {
      backgroundColor: theme?.palette?.primary?.main,
      width: "3.5rem",
      height: "3.2rem",
      borderRadius: "0.8rem",
      color: theme?.palette?.text?.white
    },
    tableInformationText: {
      fontWeight: theme?.typography?.c2?.fontWeight,
      fontSize: theme?.typography?.c2?.fontSize,
      color: theme?.palette?.text?.main
    },
    pageTitle: {
      fontWeight: theme?.typography?.h7?.fontWeight,
      fontSize: theme?.typography?.h7?.fontSize,
      color: theme?.palette?.text?.main,
      marginLeft: "1rem"
    },
    tableText: {
      fontWeight: theme?.typography?.c2?.fontWeight,
      fontSize: theme?.typography?.c2?.fontSize
    },
    countText: {
      fontSize: theme?.typography?.p3?.fontSize,
      fontWeight: theme?.typography?.p3?.fontWeight,
      color: theme?.palette?.text?.gray
    },
    fullWidth: {
      width: "100%"
    },
    generaalPadding: {
      padding: "1.6rem 0"
    },
    generalMargin: {
      margin: "1.6rem"
    },
    iconButton: {
      margin: "0 0.6rem",
      width: "4.4rem",
      height: "4.4rem"
    },
    smallPadding: {
      padding: "0.8rem",
      margin: "1.6rem 0"
    },
    marginRight: {
      marginRight: "0.4rem"
    },
    dropdownStyle: {
      marginTop: "1.6rem",
      width: "10rem"
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
    column: {
      flexDirection: "column"
    },
    marTop: {
      marginTop: "1rem"
    },
    machineBox: {
      maxWidth: "20rem",
      overflow: "auto",
      height: "7rem"
    },
    justifySpace: {
      justifyContent: "space-between"
    },
    justifyStart: {
      justifyContent: "flex-start"
    },
    justifyEnd: {
      justifyContent: "flex-end"
    },
    marginBottom: {
      marginBottom: "0.8rem"
    },
    commonMarginBottom: {
      marginBottom: "1.6rem"
    },
    backgroundColor: {
      backgroundColor: theme?.palette?.background?.default
    },
    button: {
      height: "5.2rem"
    },
    dropDownWidth: {
      minWidth: "42rem"
    },
    multiSelectWidth: {
      minWidth: "41rem"
    },
    cellWidth: {
      maxWidth: "10rem",
      cursor: "pointer"
    },
    accordion: {
      border: `0.1rem solid ${theme?.palette?.background?.blue1}`,
      borderRadius: "0.8rem !important",
      marginTop: "1.6rem",
      marginBottom: "1.6rem"
    },
    summary: {
      backgroundColor: theme?.palette?.background?.blue2,
      color: theme?.palette?.background?.default,
      borderRadius: "0.8rem !important"
    },
    expandDiv: {
      height: "4.4rem",
      width: "4.4rem",
      backgroundColor: theme?.palette?.background?.default,

      borderRadius: "0.8rem"
    },
    machines: {
      backgroundColor: theme?.palette?.background?.blue3,
      marginRight: "0.8rem",
      borderRadius: "0.8rem"
    },
    square: {
      height: "4.4rem",
      width: "fit-content",
      padding: "0 0.5rem"
    },
    rect: {
      height: "4.8rem",
      width: "max-content",
      padding: "0 0.5rem"
    },
    marLef: {
      marginLeft: "1.6rem"
    },
    marginL: {
      marginLeft: "2rem"
    },
    detailsWrapper: {
      border: `0.1rem   solid ${theme?.palette?.primary?.main}`,
      borderRadius: "0.8rem",
      minHeight: "11.2rem",
      maxHeight: "16rem",
      padding: "1.5rem 1rem",
      justifyContent: "space-between",
      overflowX: "hidden",
      overflowY: "auto",
      marginBottom: "1.5rem"
    },
    oemDet: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    agentWrapper: {
      // maxWidth: "35rem",
      flexWrap: "wrap",
      maxHeight: "4rem",
      marginTop: "1.2rem",
      gap: "4"
    },
    agentDiv: {
      width: "fit-content",
      height: "3.2rem",
      backgroundColor: theme?.palette?.background?.gray1,
      margin: "0.8rem",
      borderRadius: "0.8rem",
      padding: "0.5rem"
    },
    justifyAround: {
      justifyContent: "space-around"
    },

    redText: {
      color: theme?.palette?.text?.red1
    },
    greenText: {
      color: theme.palette?.text?.green
    },
    normalText: {
      color: theme?.palette?.text?.main
    },
    clearAll: {
      color: theme?.palette?.background?.blue2
    },
    pointer: {
      cursor: "pointer"
    },
    commonText: {
      fontWeight: theme?.typography?.h5?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      padding: "1.6rem 0"
    },
    whiteText: {
      fontWeight: theme?.typography?.h5?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      padding: "0.5rem 0"
    },
    smallWhiteText: {
      fontWeight: theme?.typography?.p2?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      padding: "0.5rem 0"
    },
    textAlign: {
      textAlign: "right"
    },
    marginLeft: {
      marginLeft: "2.4rem"
    },
    smallMarginLeft: {
      marginLeft: "1rem"
    },
    IconButton: {
      width: "2.4rem",
      height: "2.4rem"
    },
    smallMarginTop: {
      marginTop: "0.8rem"
    },

    papperWrapper: {
      padding: "1.6rem auto",
      maxWidth: "94vw",
      maxHeight: "10vh",
      marginTop: "1.6rem"
    },
    whitebackGround: {
      backgroundColor: theme?.palette?.background?.default
    },
    saveBtn: {
      height: "6.4rem",
      width: "23rem"
    },
    smallWrapper: {
      // backgroundColor: theme?.palette?.background?.main,
      padding: "1.2rem",
      marginTop: "0.4rem",
      marginBottom: "0.8rem"
    },
    dropDownGrid: {
      maxHeight: "fit-content",
      backgroundColor: theme?.palette?.background?.default,
      borderRadius: "0.4rem",
      overflowX: "hidden",
      overflowY: "auto",
      paddingBottom: "1.6rem"
    },
    accordionGrid: {
      backgroundColor: theme?.palette?.background?.default,
      borderRadius: "0.4rem",
      padding: "0.4rem 0.4rem 0.4rem 0",
      marginBottom: "1.2rem",
      overflowX: "hidden",
      overflowY: "auto"
    },
    parameter: {
      backgroundColor: theme?.palette?.secondary?.main,
      height: "3.4rem",
      borderRadius: "0.8rem",
      cursor: "pointer"
    },

    parameterText: {
      color: theme?.palette?.primary?.main,
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.p2?.fontWeight,
      textDecoration: "underline",
      cursor: "pointer"
    },
    count: {
      marginTop: "1rem",
      color: theme?.palette?.text?.gray,
      fontSize: theme?.typography?.p2?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight
    },
    tableContainer: {
      boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.2)",
      maxHeight: "fit-content",
      overflowX: "hidden",
      overflowY: "auto",
      marginTop: "2rem"
    },
    mobileContainer: {
      boxShadow: "0px 0.3rem 0.5rem rgba(0, 0, 0, 0.2)",
      maxHeight: "fit-content",
      overflowX: "hidden",
      overflowY: "auto"
    },
    textCenter: {
      textAlign: "center"
    },
    commonCellWidth: {
      width: "10%"
    },
    fomNameCell: {
      width: "40%"
    },
    previewText: {
      fontSize: theme?.typography?.h7?.fontSize,
      fontWeight: theme?.typography?.p1?.fontWeight,
      color: theme?.palette?.background?.blue2
    },
    searchContainer: {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "0.8rem 0.8rem 0 0"
    },
    whatsAppButton: {
      height: "4.4rem",
      width: "24.8rem"
    },
    mobilewhatsAppButton: {
      height: "6rem",
      width: "100%"
    }
  }
}
