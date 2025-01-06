import React from "react"
import { Box, Typography } from "@mui/material"
import styles from "./singleAmountcard.module.scss"
const SingleAmountCard = () => {
  return (
    <Box className={styles.wrapper}>
      <Box className={styles.machineBlock}>
        <Box className={styles.machineNameBox}>M1</Box>
        <Box className={styles.paddingTextBox}>
          <Typography className={styles.balanceText}>
            Balance <span className={styles.greyText}>(incl. GST)</span> INR 94,000.00
          </Typography>
          <Typography className={styles.greenText}>
            Blueverse Credits:<span className={styles.balanceText}>10000</span>
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography className={styles.balanceText}>
          <span className={styles.greyText}>Monthly Agreement:</span>INR 94,000.00 (incl. GST)
        </Typography>
      </Box>
    </Box>
  )
}

export default SingleAmountCard
