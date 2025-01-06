// This component is used to display amount with custom image

import { Grid, Typography } from "@mui/material"
import React from "react"
import { useStyles } from "./MachineCardsStyles"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import InfoIcon from "@mui/icons-material/Info"
import LightTooltip from "../../LightTooltip"

function MachineCards({
  boxHeading = "Wallet Machine",
  handleText = "",
  amount = 12903,
  currency = "",
  img = "",
  toolTipData = "",
  subHeading = "",
  handleToggle = () => {},
  customStyles = {}
}) {
  const styles = useStyles()
  return (
    <Grid container justifyContent="space-between" sx={styles.cardBox} style={customStyles}>
      <Grid item xs={handleText ? 9 : 12} container alignItems="center" flexWrap="nowrap">
        <img src={img} height={48} width={48} alt="logo" style={styles.marginRight} />
        <Grid item sx={styles.leftBox}>
          <Grid item container alignItems="center" flexWrap="nowrap">
            <Typography variant="p2">{boxHeading} </Typography>
            <Typography color="text.gray" variant="p2">
              {subHeading}
            </Typography>
            {toolTipData && (
              <LightTooltip
                title={
                  <Typography variant="p1" color="text.main">
                    {toolTipData}
                  </Typography>
                }>
                <InfoIcon color="primary" sx={styles.infoBox} fontSize="large" />
              </LightTooltip>
            )}
          </Grid>
          <Typography variant="h7">{formatCurrency(amount, currency)}</Typography>
        </Grid>
      </Grid>
      {handleText ? (
        <Grid item xs={3} onClick={handleToggle} textAlign="end" sx={styles.history}>
          <Typography variant="p1" color={"primary"}>
            {handleText}
          </Typography>
          <KeyboardArrowRightIcon color="primary" />
        </Grid>
      ) : null}
    </Grid>
  )
}

export default MachineCards
