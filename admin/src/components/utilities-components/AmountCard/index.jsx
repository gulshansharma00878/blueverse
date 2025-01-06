import React from "react"
import { Typography, Box } from "@mui/material"
import { useStyles } from "./amounCardStyles"
const AmountCard = (props) => {
  const { title, imgSrc, amount, type, errorText = false, handleRoutes = false } = props
  const styles = useStyles()
  const getStyles = () => {
    switch (type) {
      case "cash":
        return [
          styles?.walletBalanceContainer,
          errorText ? styles?.errorWalletBalanceColor : styles?.walletBalanceColor
        ]
      case "credit":
        return [styles?.walletBalanceContainer, styles?.walletCreditColor]

      case "pending":
        return [styles?.walletBalanceContainer, styles?.walletPendingColor]
    }
  }
  return (
    <Box
      onClick={handleRoutes}
      style={handleRoutes ? { cursor: "pointer" } : null}
      sx={getStyles()}>
      <Box>
        <img src={imgSrc} alt="" width="40px" height="40px" />
      </Box>
      <Box>
        <Typography sx={[styles?.walletText]}>{title}</Typography>
        <Typography color={errorText ? "text.red1" : "text.main"} sx={[styles?.walletAmount]}>
          {amount}
        </Typography>{" "}
      </Box>
    </Box>
  )
}

export default AmountCard
