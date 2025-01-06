import React from "react"
import { Typography, Box } from "@mui/material"
import { useStyles } from "./amounCardStyles"
const AmountCard = (props) => {
  const {
    title,
    imgSrc,
    amount,
    type,
    errorText = false,
    handleRoutes = false,
    customStyles = {}
  } = props
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
    }
  }
  return (
    <Box
      sx={getStyles()}
      onClick={handleRoutes}
      style={(handleRoutes ? { cursor: "pointer" } : null, customStyles)}>
      <img src={imgSrc} alt="" style={styles.icon} />
      <Box>
        <Typography sx={[styles?.walletText]}>{title}</Typography>{" "}
        <Typography sx={[styles?.walletAmount]}>{amount}</Typography>{" "}
      </Box>
    </Box>
  )
}

export default AmountCard
