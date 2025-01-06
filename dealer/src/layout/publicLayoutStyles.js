import { useTheme } from "@mui/system"
import Banner from "assets/images/placeholders/BlueverseBanner.webp"
export const useStyles = () => {
  const theme = useTheme()

  return {
    imageContainer: {
      backgroundImage: `url(${Banner})`,
      backgroundRepeat: "no-repeat",
      overflowX: "hidden",
      backgroundSize: "cover",
      display: "flex",
      justifyContent: "center",
      position: "relative",
      boxSizing: "border-box"
    },
    largeContainer: {
      flexDirection: "row"
    },
    smallContainer: {
      flexDirection: "column"
    },
    textContainer: {
      width: "40rem"
    },
    bannerBlue: {
      height: 200,
      width: "100%"
    },
    tabletText: {
      width: "80%",
      marginTop: "1rem",
      padding: "5.2rem"
    },
    laptopText: {
      width: "50%",
      marginTop: "-4rem",
      padding: "5.2rem",
      display: "flex",
      justifyContent: "center"
    },
    title: {
      color: theme?.palette?.text?.white,
      display: "flex",
      justifyContent: "flex-start",
      paddingTop: "5rem",
      cursor: "pointer",
      paddingLeft: "2rem",
      paddingRight: "2rem"
    },
    subtitle: {
      color: theme?.palette?.text?.white,
      textAlign: "left",
      display: "flex",
      justifyContent: "flex-start",
      paddingTop: "10rem",
      paddingLeft: "2rem",
      paddingRight: "2rem"
    },
    tagline: {
      color: theme?.palette?.text?.white,
      textAlign: "left",
      display: "flex",
      justifyContent: "center",
      paddingTop: "3rem",
      paddingLeft: "1.3rem",
      paddingRight: "1.3rem"
    },
    logo: {
      height: "11.8rem",
      width: "16.9rem"
    },
    largeScreenText: {
      width: "50%",
      marginTop: "-10rem",
      display: "flex"
    },
    smallScreenText: {
      marginTop: "28rem",
      padding: "1.6rem",
      marginLeft: "2rem",
      maxWidth: "38rem"
    },
    tabScreenText: {
      width: "45.4rem",
      marginTop: "-18rem"
    },
    smallTablet: {
      width: "38rem",
      marginTop: "-18rem"
    },

    alignedText: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column"
    },
    infoTitle: {
      color: theme?.palette?.text?.main,
      fontWeight: theme?.typography?.h5?.fontWeight,
      fontSize: theme?.typography?.h5?.fontSize
    },
    subTitle: {
      color: theme?.palette?.text?.main,
      fontWeight: theme?.typography?.s1?.fontWeight,
      fontSize: theme?.typography?.s1?.fontSize,
      lineHeight: "2.4rem"
    },
    formSection: {
      marginLeft: 0,
      [theme.breakpoints.up("lg")]: {
        width: "55.3rem !important"
      }
    }
  }
}
