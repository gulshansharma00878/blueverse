import React, { useState, useEffect } from "react"
import { Box, Grid, Typography } from "@mui/material"
import styles from "./singleAmountcard.module.scss"
import { useSelector } from "react-redux"
import { SettingService } from "network/settingsService"
import { getMachineAgreement } from "pages/private/dealer/Wallet/walletutilities"
import AppLoader from "components/Loader/AppLoader"
const SingleAmountCard = ({ creditBalance, machines }) => {
  const [monthlyAgreement, setMonthlyAgreement] = useState("")
  const [loading, setLoading] = useState(false)

  const userID = useSelector((state) => state?.app?.user?.userId)

  useEffect(() => {
    getMonthlyAgreement()
  }, [])
  const getMonthlyAgreement = async () => {
    setLoading(true)
    const response = await SettingService.getSubscriptions(userID)
    if (response?.success && response?.code === 200) {
      const machineAgreement = getMachineAgreement(response?.data, machines[0]?.value)
      const machineObj = machineAgreement.get(machines[0]?.value)
      setMonthlyAgreement(machineObj?.machineSubscriptionSetting?.total)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }
  return (
    <Box className={styles.wrapper}>
      {loading && <AppLoader />}
      <Grid container gap="0.4rem" mb="0.4rem">
        <Box className={styles.machineNameBox}>
          <Typography variant="s1" color="text.white">
            {machines[0]?.label}
          </Typography>
        </Box>
        <Box>
          <Box>
            <Typography variant="p2" color="text.main">
              Balance &nbsp;
            </Typography>
            <Typography variant="p3" color="text.gray">
              (incl. GST) &nbsp;
            </Typography>
            <Typography variant="s1" color="text.main">
              INR {creditBalance?.walletBalance}
            </Typography>
          </Box>
          <Box>
            <Typography variant="p3" color="text.green">
              Blueverse Credits:&nbsp;
            </Typography>
            <Typography variant="s1" color="text.main">
              {creditBalance?.creditBalance}
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid container flexWrap="nowrap" gap="0.4rem">
        <Typography variant="p3" color="text.gray">
          Monthly Agreement:
        </Typography>
        <Typography variant="p3" color="text.main">
          INR {monthlyAgreement ? monthlyAgreement : "--"} (Incl. GST)
        </Typography>
      </Grid>
    </Box>
  )
}

export default SingleAmountCard
