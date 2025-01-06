import React from "react"
import Grid from "@mui/material/Grid"
import CloseIcon from "@mui/icons-material/Close"
import Earth from "assets/images/Logo/corneredEarth.svg"
import QuarterEarth from "assets/images/Logo/quarterCorneredEarth.svg"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import { IconButton } from "@mui/material"
import styles from "./ModalHeader.module.scss"

const ModalHeader = ({ title, handleClose, waterSaved = null }) => {
  const isMobile = useMediaQuery("(max-width:600px)")
  const subTitle = (
    <span>
      Your Wash has been completed!
      <br />
      {waterSaved}
    </span>
  )

  const CloseButton = () => {
    return (
      <IconButton className={styles.closeButton} onClick={handleClose}>
        <CloseIcon fontSize="large" />
      </IconButton>
    )
  }

  const TitleBox = () => {
    return (
      <Grid
        item
        xs={12}
        container
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        gap={1}
        sx={{ height: "100%" }}>
        <Typography variant="h7" color="text.main">
          {title}
        </Typography>
        {waterSaved ? (
          <Typography variant="p1" color="text.main">
            {subTitle}
          </Typography>
        ) : null}
      </Grid>
    )
  }

  const WaterSavedForMobile = () => {
    return (
      <Grid container className={styles.container_waterSaved}>
        <Grid item xs={6}>
          <img src={QuarterEarth} alt="quarter-cornered earth" />
        </Grid>
        <Grid item xs={6} container justifyContent="flex-end">
          <CloseButton />
        </Grid>
        <Grid item xs={12}>
          <TitleBox />
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      {isMobile && waterSaved ? (
        <WaterSavedForMobile />
      ) : (
        <Grid container className={styles.container}>
          {!isMobile ? (
            <Grid item xs={2}>
              {/* 14.6rem  = 234-88. Check figma for details */}
              <img src={Earth} style={{ width: "14.6rem" }} alt="EarthLogo" />
            </Grid>
          ) : null}
          <Grid item sm={10} xs={12} container>
            <Grid item xs={10}>
              <TitleBox />
            </Grid>
            <Grid item xs={2} container justifyContent="flex-end">
              <CloseButton />
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  )
}

export default ModalHeader
