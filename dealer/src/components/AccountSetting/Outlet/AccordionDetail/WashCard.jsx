import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { useStyles } from "./AccordionDetailStyles"
import { formatCurrency } from "helpers/Functions/formatCurrency"
function WashCard({ item }) {
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const cardColor = (washType) => {
    switch (washType) {
      case "GOLD":
        return styles?.gold
      case "SILVER":
        return styles?.silver
      case "PLATINUM":
        return styles?.platinum
    }
  }
  const getWashType = (washType) => {
    if (washType === "SILVER") {
      return `${washType} (Default)`
    } else {
      return washType
    }
  }
  return (
    <Grid
      container
      style={
        isMobile
          ? { ...styles?.mobileWidth, ...styles?.card }
          : { ...styles?.card, ...styles?.notMobileWidth }
      }
      sx={cardColor(item?.type)}>
      <Grid item xs={12} display={"flex"} justifyContent={"center"} alignItems={"center"}>
        <Typography variant={"p1"}>{getWashType(item?.type)}</Typography>
      </Grid>
      <Grid item xs={12} display={"flex"} justifyContent={"space-around"}>
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}>
          {" "}
          <Typography variant={"p1"}>{formatCurrency(item.dealerPerWashPrice)}</Typography>
          <Typography variant="c1">Per Wash Price</Typography>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}>
          <Typography variant={"p1"}>{formatCurrency(item.manpowerPricePerWash)}</Typography>
          <Typography variant="c1">Manpower Price</Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

export default WashCard
