import { Grid, Typography } from "@mui/material"
import React from "react"
import { useStyles } from "./AccordionDetailStyles"

function MinimumBox({ heading, subHeading, variant = "p1", direction, flexEnd }) {
  const styles = useStyles()
  return (
    <Grid
      xs
      item
      direction={direction}
      container
      justifyContent={flexEnd ? "flex-end" : "flex-start"}>
      <Typography sx={flexEnd ? styles?.darkDetails : styles.detailName}>{heading}</Typography>
      <Typography variant={variant} sx={{ marginLeft: direction === "row" ? "1rem" : 0 }}>
        {subHeading}
      </Typography>
    </Grid>
  )
}

export default MinimumBox
