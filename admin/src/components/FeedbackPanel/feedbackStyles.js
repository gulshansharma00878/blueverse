import { useTheme } from "@mui/system"
export const useStyles = () => {
  const theme = useTheme()
  return {
    textColor: {
      color: theme?.palette?.text?.main
    },
    filterText: {
      fontWeight: theme?.typography?.s1?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      lineHeight: theme?.typography?.s1?.lineHeight
    },
    filterType: {
      fontWeight: theme?.typography?.p1?.fontWeight,
      fontSize: theme?.typography?.p1?.fontSize,
      lineHeight: theme?.typography?.p1?.lineHeight
    },
    display: {
      display: "flex"
    },
    align: {
      alignItems: "center"
    },
    alignEnd: {
      alignItems: "flex-end"
    },
    justify: {
      justifyContent: "center"
    },
    justifyAround: {
      justifyContent: "space-around"
    },
    justifyEnd: {
      justifyContent: "flex-end"
    },
    justifySpace: {
      justifyContent: "space-around"
    },
    column: {
      flexDirection: "column"
    },
    normalScreenFormTypeWidth: {
      height: "4.8rem",
      width: "50.4rem",
      display: "flex"
    },
    mobileScreenFormTypeWidth: {
      marginTop: "2rem",
      width: "100%"
    },
    formTypeContainer: {
      padding: "0.3rem",
      backgroundColor: theme?.palette?.primary?.main,
      borderRadius: "0.8rem",
      cursor: "pointer",
      justifyContent: "space-between",
      marginTop: "1rem"
    },

    formTypeSelect: {
      width: "16.6rem"
    },
    smallScreenSelect: {
      width: "98%",
      height: "4rem",
      margin: "0.2rem ",
      padding: "0 0 0 1rem"
    },
    typeSelect: {
      backgroundColor: theme?.palette?.background?.default,
      borderRadius: "0.8rem",
      margin: " 0.2rem ",
      display: "flex",
      alignItems: "center"
    },
    widthAdjust: {
      width: "10rem"
    },
    formTypeImage: { width: "2.4rem", height: "2.4rem", marginRight: "0.4rem" },
    formTypeText: {
      fontWeight: theme?.typography?.p1?.fontWeight,
      fontSize: theme?.typography?.p1?.fontSize,
      lineHeight: theme?.typography?.p1?.lineHeight,
      color: theme?.palette?.primary?.main
    },
    mcqWrapper: { padding: "0.8rem 0" },
    mcqDel: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      paddingLeft: "1.6rem"
    },
    marginRight8: {
      marginRight: "0.8rem"
    },
    marginLeft16: {
      marginLeft: "1.6rem"
    },
    button: {
      height: "4.4rem",
      width: "4.4rem"
    },
    commentInput: {
      padding: "1.6rem 0",
      width: "10rem",
      marginLeft: 10
    },
    maxChar: {
      fontWeight: theme?.typography?.p1?.fontWeight,
      fontSize: theme?.typography?.p2?.fontSize,
      lineHeight: theme?.typography?.p1?.lineHeight
    },
    tableInformationText: {
      fontWeight: theme?.typography?.c2?.fontWeight,
      fontSize: theme?.typography?.c2?.fontSize,
      color: theme?.palette?.text?.main
    },
    IconButton: {
      width: "2.4rem",
      height: "2.4rem"
    },
    marginLeft: {
      marginLeft: "2.4rem"
    },
    smallMarginLeft: {
      marginLeft: "0.4rem"
    },
    container: {
      width: "65rem",
      maxHeight: "80vh",
      padding: "1rem"
    },
    popUpTitle: {
      fontWeight: theme?.typography?.h6?.fontWeight,
      fontSize: theme?.typography?.h6?.fontSize,
      color: theme?.palette?.text?.main
    },
    popUpSubTitle: {
      fontWeight: theme?.typography?.c1?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      color: theme?.palette?.text?.main,
      marginTop: "1rem"
    },
    detailContainer: {
      padding: "0.8rem"
    },
    outletContainer: {
      backgroundColor: theme.palette.secondary.main,
      marginTop: "2rem",
      padding: "0.5rem",
      marginBottom: "3.5rem"
    },
    outletName: {
      fontWeight: theme?.typography?.h6?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      color: theme?.palette?.text?.main
    },
    outletAddress: {
      fontWeight: theme?.typography?.p2?.fontWeight,
      fontSize: theme?.typography?.p2?.fontSize,
      color: theme?.palette?.text?.main
    },
    outletSubTitle: {
      fontWeight: theme?.typography?.p2?.fontWeight,
      fontSize: theme?.typography?.p2?.fontSize,
      color: theme?.palette?.text?.gray
    },
    machineBox: {
      height: "5rem",
      maxWidth: "fit-content",
      backgroundColor: theme.palette.background.blue3,
      borderRadius: "0.5rem",
      marginLeft: "0.5rem",
      padding: "1rem",
      fontSize: theme?.typography?.p1?.fontSize
    },
    subTitle: { color: theme?.palette?.text?.gray },
    popupButton: {
      height: "6.5rem",
      width: "23rem"
    },
    previewContainer: {
      maxHeight: "98vh",
      width: "92vw",
      height: "85vh"
    },
    marginBottom: {
      marginBottom: "1rem"
    },
    mobile: {
      height: "58rem",
      border: "0.8rem solid black",
      maxWidth: "32.5rem",
      borderRadius: "2.4rem",
      position: "relative",
      overflow: "hidden",
      whiteSpace: "wrap"
    },
    machineBoxContaiiner: {
      maxWidth: "20rem",
      overflow: "auto"
    },
    moblileBanner: {
      width: "32.5rem",
      borderRadius: "1.6rem 1.6rem 0 0 "
    },
    titleContainer: { textAlign: "left", marginLeft: "1rem" },
    noMargin: { margin: 0 },
    questionContainer: {
      fontSize: theme?.typography?.s1?.fontSize,
      fontWeight: theme?.typography?.p1?.fontWeight,
      color: theme?.palette?.text?.main,
      lineBreak: "anywhere"
    },
    overFlow: {
      overflowX: "auto",
      maxHeight: "18rem"
    },
    mobileButton: {
      height: "5.2rem",
      width: "14rem"
    },
    fullWidth: {
      width: "100%"
    },
    mobileInput: {
      height: "17rem"
    },
    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: "1.6rem 0"
    },
    accordianDiv: {
      maxHeight: "25rem",
      overflowY: "auto",
      overflowX: "hidden"
    },
    buttonContainer: {
      paddingBottom: "1rem"
    },
    mt: {
      marginTop: "2.5rem"
    }
  }
}
