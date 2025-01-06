import { Typography, CardMedia, Box } from "@mui/material"
import React from "react"
import PrimaryButton from "../Button/CommonButton"
import SecondaryButton from "../SecondaryButton/SecondaryButton"
import { useStyles } from "./popUpChildStyle"

function PopUpChild({ src, handleClose, heading, subHeading, handleClick, showBtn = true }) {
  const styles = useStyles()

  return (
    <Box sx={styles.popUpOuter} container>
      <CardMedia component="img" image={src} name="file" />
      <Typography
        sx={{ textAlign: "center" }}
        variant="s1"
        color="text.main"
        component="p"
        marginTop="1.6rem">
        {heading}
      </Typography>
      <Typography
        variant="p4"
        color="text.main"
        component="p"
        marginTop="1.6rem"
        marginBottom="3.2rem">
        {subHeading}
      </Typography>
      {showBtn ? (
        <Box sx={styles.buttonsContainer}>
          <SecondaryButton
            style={{ marginRight: "1.6rem" }}
            onClick={() => {
              handleClose()
            }}
            type="cancel"
            variant="contained">
            No
          </SecondaryButton>
          <PrimaryButton
            style={{ marginLeft: "1.6rem" }}
            onClick={() => {
              handleClick()
            }}
            type="submit"
            variant="contained">
            Yes
          </PrimaryButton>
        </Box>
      ) : null}
    </Box>
  )
}

export default PopUpChild
