import * as React from "react"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { Typography, useMediaQuery } from "@mui/material"
import { useStyles } from "./publicLayoutStyles"
import Earth from "assets/images/placeholders/Earth.svg"
import EarthBanner from "assets/images/placeholders/EarthBanner.webp"

export default function PublicLayout({ children }) {
  const styles = useStyles()
  const tablet = useMediaQuery("(max-width:1400px)")
  const smallTablet = useMediaQuery("(max-width:943px)")
  const mobile = useMediaQuery("(max-width:600px)")
  const getImageStyle = () => {
    return smallTablet
      ? styles.smallTablet
      : !tablet
      ? styles?.largeScreenText
      : styles?.tabScreenText
  }
  const getTextStyle = () => {
    return tablet ? styles.tabletText : { ...styles.laptopText, ...styles?.smallContainer }
  }
  const getContainerStyle = () => {
    return tablet
      ? { ...styles?.imageContainer, ...styles?.smallContainer }
      : { ...styles?.imageContainer, ...styles?.largeContainer }
  }

  return (
    <Box>
      {window.location.pathname !== "/terms" && window.location.pathname !== "/privacy-policy" ? (
        <Grid
          container
          sx={{ height: { sx: "auto", sm: "100vh" }, overflowY: { sx: "auto", sm: "scroll" } }}>
          {mobile ? (
            <img src={EarthBanner} style={{ width: "100%" }} />
          ) : (
            <Grid item xs={12} sm={6} lg={7.5} sx={getContainerStyle()}>
              <div style={getImageStyle()}>
                <img src={Earth} alt="" style={{ width: "100%" }} />
              </div>
              <div style={getTextStyle()}>
                <Typography sx={styles?.infoTitle}>Think Blue, Go Green</Typography>
                <span style={styles?.subTitle}>
                  BlueVerse aims to revolutionize the Indian Vehicle Wash industry by providing
                  eco-friendly, efficient, and high-quality washing services that recycle millions
                  of liters of water daily.{" "}
                </span>
              </div>

              <br />
            </Grid>
          )}
          <Grid item xs={12} sm={6} lg={4.5} sx={styles.formSection}>
            {children}
          </Grid>
        </Grid>
      ) : (
        <Grid container>
          <Grid item xs={12} sx={{ marginLeft: 0 }}>
            {children}
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
