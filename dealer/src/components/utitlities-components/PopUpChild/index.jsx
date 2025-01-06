import { Typography, CardMedia, Box } from "@mui/material"
import React from "react"
// import PrimaryButton from "../Button/CommonButton"
// import SecondaryButton from "../SecondaryButton/SecondaryButton"
import { useStyles } from "./popUpChildStyle"
import SecondaryButton from "../SecondaryButton/SecondaryButton"
import PrimaryButton from "../Button/CommonButton"

function PopUpChild({ src, handleClose, heading, subHeading, handleClick }) {
  const styles = useStyles()

  return (
    <Box sx={styles.popUpOuter} container>
      {" "}
      <CardMedia
        component="img"
        image={src}
        name="file"
        sx={{ height: "35rem", marginTop: "1rem" }}
      />
      <Typography variant="s1" color="text.main" component="p" marginTop="1.6rem">
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
    </Box>
  )
}

export default PopUpChild
