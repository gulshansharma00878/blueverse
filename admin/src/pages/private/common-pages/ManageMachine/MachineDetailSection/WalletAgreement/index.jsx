import { Box, Divider, Grid, Stack, Typography } from "@mui/material"
import AmountCard from "components/utilities-components/AmountCard"
import React, { useEffect, useState } from "react"
import { useStyles } from "./WalletAgreementStyles"
import Coins from "assets/images/icons/coins.svg"
import Wallet from "assets/images/icons/Wallet.svg"
import WashCard from "components/utilities-components/WashCard"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import { ManageMachinesServices } from "network/manageMachinesServices"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import Toast from "components/utilities-components/Toast/Toast"
import { getNextMonthStartDate } from "helpers/app-dates/dates"
function WalletAgreement({ machineId, startDate = "", endDate = "" }) {
  const styles = useStyles()

  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMachineTransaction()
  }, [startDate, endDate])

  const getMachineTransaction = async () => {
    setLoading(true)

    let params = [`${machineId}?fromDate=${startDate}&toDate=${endDate}`]

    const response = await ManageMachinesServices.machineDetailsById(params)
    if (response.success && response.code === 200) {
      setData(response?.data)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoading(false)
  }

  return (
    <Grid style={{ marginTop: "2rem" }} container>
      <Grid sx={styles.transactionOuterBox} container justifyContent="space-between">
        <Grid item container gap={2} sm={8} xs={12}>
          <Grid sx={{ paddingBottom: "1.2rem" }} item sm={6} xs={12}>
            <AmountCard
              errorText={
                parseFloat(data?.walletBalance) + parseFloat(data?.topUpBalance) < 500
                  ? true
                  : false
              }
              title="Wallet Balance (incl.Gst)"
              imgSrc={Wallet}
              amount={formatCurrency(
                parseFloat(data?.walletBalance) + parseFloat(data?.topUpBalance)
              )}
              type={"cash"}
            />
            {parseFloat(data?.walletBalance) + parseFloat(data?.topUpBalance) < 500 ? (
              <ErrorText text="Low Balance" />
            ) : null}
          </Grid>
          <Grid sx={{ paddingBottom: "1.2rem" }} item sm={5} xs={12}>
            <AmountCard
              title={"BlueVerse Credits Balance "}
              imgSrc={Coins}
              amount={formatCurrency(data?.blueverseCredit, "")}
              type={"credit"}
            />
          </Grid>
        </Grid>
        <Grid item sx={styles.rechargeBox} container sm={4} xs={12}>
          <Box sx={styles.rechargeDate}>
            <Typography color="background.silver" variant="p3">
              Recharge Due Date
            </Typography>
            <Typography sx={styles.dueDate} color="text.red4">
              {getNextMonthStartDate()}
            </Typography>
          </Box>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center"
            }}>
            <Typography variant="p1">
              {formatCurrency(data?.machineSubscriptionSetting?.total)}
            </Typography>
            <Typography color="background.silver" sx={styles.dueDate}>
              (Incl. GST)
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Grid container sx={styles.transactionOuterBox1} style={{ marginTop: "2rem" }} item xs={12}>
        <Typography variant="h7">Monthly Price Agreement</Typography>
        <Grid item sx={styles.totalBox} justifyContent="space-between" xs={12} container>
          <Grid item md={4} xs={12}>
            <Stack>
              <Typography sx={styles.minimalFontSize} color="background.silver">
                Total Washes / Minimum Wash Commitment
              </Typography>
              <Typography style={{ marginTop: "0.4rem" }} variant="h7">
                {data?.washesDone || 0}/{" "}
                <Typography variant="p2">
                  {data?.machineSubscriptionSetting?.minimumWashCommitment || 0} Washes Done!
                </Typography>
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} sx={styles.amountBox} spacing={2} container>
            <Grid item xs={6} md={4}>
              <Stack>
                <Typography sx={styles.centerMinimalFontSize} color="background.silver">
                  Taxable Amount
                </Typography>
                <Typography style={{ marginTop: "0.4rem" }} variant="h7">
                  {formatCurrency(data?.machineSubscriptionSetting?.taxableAmount, "INR " || 0)}
                </Typography>
              </Stack>
            </Grid>
            <Box sx={styles.dividerBox}>
              <Divider orientation="vertical" />
            </Box>

            <Grid sx={styles.taxAmountBox} xs={6} md={0} item>
              <Grid sx={styles.taxAmount}>
                <Typography sx={styles.minimalFontSize} color="background.silver">
                  Cgst (9%)
                </Typography>
                <Typography sx={styles.minimalFontSize} style={{ marginLeft: "0.4rem" }}>
                  {formatCurrency(data?.machineSubscriptionSetting?.cgst, "INR " || 0)}
                </Typography>
              </Grid>
              <Grid style={{ display: "flex" }}>
                <Typography sx={styles.minimalFontSize} color="background.silver">
                  Scgst (9%)
                </Typography>
                <Typography sx={styles.minimalFontSize} style={{ marginLeft: "0.4rem" }}>
                  {formatCurrency(data?.machineSubscriptionSetting?.sgst) || 0}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={4} xs={12} container sx={styles.guranteeBox} gap={2}>
            <Stack>
              <Typography variant="p1">Minimum guarantee</Typography>
              <Typography color="background.silver" sx={styles.minimalFontSize} variant="h7">
                On Monthly Wash Revenue
              </Typography>
            </Stack>
            <Stack alignItems="flex-end">
              <Typography variant="h6">
                {formatCurrency(data?.machineSubscriptionSetting?.total, "INR " || 0)}
              </Typography>
              <Typography sx={styles.minimalFontSize} variant="h7">
                (Incl. GST)
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
      <Grid container justifyContent="space-between" gap={2} style={{ marginTop: "2rem" }}>
        {data?.machineSubscriptionSetting?.pricingTerms?.map((item, index) => (
          <WashCard item={item} key={index} />
        ))}
      </Grid>
      {loading && <AppLoader />}
    </Grid>
  )
}

export default WalletAgreement
