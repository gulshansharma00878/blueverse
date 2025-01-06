import { Grid, Typography } from "@mui/material"
import React from "react"

import { formatCurrency } from "helpers/Functions/formatCurrency"
import { useStyles } from "./washCardStyles"

function WashCard({ item }) {
  const styles = useStyles()
  const cardColor = () => {
    switch (item.type) {
      case "GOLD":
        return styles?.gold
      case "SILVER":
        return styles?.silver
      case "PLATINUM":
        return styles?.platinum
    }
  }
  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      item
      md={3.7}
      xs={12}
      style={styles?.card}
      sx={cardColor()}>
      <Grid item xs={12} container justifyContent="center" alignItems="center">
        <Typography variant="s1" sx={{ textAlign: "center" }}>
          {item?.type}
        </Typography>
      </Grid>
      <Grid container style={{ marginTop: "12px" }} item>
        <Grid item container direction="column" alignItems="center" xs={6}>
          <Typography variant="p1">{formatCurrency(item?.dealerPerWashPrice)}</Typography>
          <Typography variant="p3">Per Wash Price</Typography>
        </Grid>
        <Grid item direction="column" alignItems="center" container xs={6}>
          <Typography variant="p1">{formatCurrency(item?.manpowerPricePerWash)}</Typography>
          <Typography variant="p3">Manpower Price</Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default WashCard
