import React from "react"
import { Typography } from "@mui/material"
import { useStyles } from "../walletComponentStyles"
import { Box } from "@mui/system"
const WalletHistoryCard = (props) => {
  const { monthlyAgreement } = props
  const styles = useStyles()

  return (
    <Box sx={[styles?.displayFlex, styles?.fullWidth, styles?.justifyEnd]}>
      <Box>
        <Typography sx={[styles?.monthlyTitle]}>Monthly Agreement</Typography>
        <Typography sx={[styles?.monthlyCost]}>{monthlyAgreement} (Incl. GST)</Typography>
      </Box>
    </Box>
  )
}

export default WalletHistoryCard
