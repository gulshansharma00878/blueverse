import { Box, Divider, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useStyles } from "./WalletAgreementStyles"
import Coins from "assets/images/icons/coins.svg"
import Wallet from "assets/images/icons/WalletBalance.svg"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { ManageMachinesServices } from "network/manageMachinesServices"
import Toast from "components/utitlities-components/Toast/Toast"
import AmountCard from "components/utitlities-components/TransactionCards/AmountCard"
import ErrorText from "components/utitlities-components/InputField/ErrorText"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import AppLoader from "components/Loader/AppLoader"
import WashCard from "components/utitlities-components/WashCard"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import { getNextMonthStartDate } from "helpers/app-dates/dates"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import PopupModal from "components/PopupModal"
import AddMoneyPopup from "components/Wallet/AddMoneyPopup"
import { getMinPricePlan } from "helpers/Functions/dealerUtilities"
import { getPermissionJson } from "helpers/Functions/roleFunction"
function WalletAgreement({ machineId, startDate = "", endDate = "" }) {
  const styles = useStyles()
  const navigate = useNavigate()
  const user = userDetail()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)
  const [washBasePrice, setWashBasePrice] = useState(0)
  const [employeePermission, setEmployeePermission] = useState()

  useEffect(() => {
    getMachineTransaction()
  }, [startDate, endDate])

  useEffect(() => {
    dispatch(coreAppActions?.updatePopupModal(false))
    getAllpermission()
  }, [])

  const handlePopup = () => {
    countBaseAmount(data?.machineSubscriptionSetting?.pricingTerms)
    dispatch(coreAppActions?.updatePopupModal(true))
  }

  const countBaseAmount = (pricingTerms) => {
    let minTerms = getMinPricePlan(pricingTerms)

    let perWashPrice = pricingTerms?.find((x) => x?.type === minTerms)?.dealerPerWashPrice
    let manPowerPrice = pricingTerms?.find((x) => x?.type === minTerms)?.manpowerPricePerWash

    setWashBasePrice(Number(perWashPrice) + Number(manPowerPrice))
  }

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

  const handleNavigate = () => {
    navigate(`/${user?.role}/wallet/transaction-history`)
  }

  async function getAllpermission() {
    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "wallet")
        setEmployeePermission(permissionJson?.permissionObj)
      }
    }
  }

  return (
    <Grid style={{ marginTop: "2rem" }} container>
      <Grid sx={styles.transactionOuterBox} container>
        <Grid item container gap={2} md={5} xs={12}>
          <Grid item md={5} xs={12}>
            <AmountCard
              errorText={
                parseFloat(data?.walletBalance) + parseFloat(data?.topUpBalance) < 500
                  ? true
                  : false
              }
              title="Wallet Balance (incl.Gst)"
              imgSrc={Wallet}
              customStyles={{ height: isMobile ? "7rem" : "auto" }}
              amount={formatCurrency(
                parseFloat(data?.walletBalance) + parseFloat(data?.topUpBalance)
              )}
              type={"cash"}
            />
            {parseFloat(data?.walletBalance) + parseFloat(data?.topUpBalance) < 500 ? (
              <ErrorText text="Low Balance" />
            ) : null}
          </Grid>
          <Grid item md={6} xs={12}>
            <AmountCard
              title={"BlueVerse Credits Balance "}
              imgSrc={Coins}
              amount={formatCurrency(data?.blueverseCredit, "")}
              type={"credit"}
              customStyles={{ height: isMobile ? "7rem" : "auto" }}
            />
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between" item md={7} xs={12}>
          <Grid item sx={styles.rechargeBox} container md={6} xs={12}>
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
          <Grid item container md={4} xs={12} justifyContent="center" alignItems="center">
            <Typography
              onClick={handleNavigate}
              variant="p1"
              sx={styles.viewBox}
              color="primary.main">
              View Transaction
              <ChevronRightIcon fontSize="large" />
            </Typography>

            {user?.role === "employee" ? (
              employeePermission?.payPermission ? (
                <PrimaryButton
                  onClick={handlePopup}
                  size="large"
                  variant="contained"
                  type="submit"
                  sx={{ width: "100%", height: "5.6rem" }}>
                  Add Money
                </PrimaryButton>
              ) : null
            ) : (
              <PrimaryButton
                onClick={handlePopup}
                size="large"
                variant="contained"
                type="submit"
                sx={{ width: "100%", height: "5.6rem" }}>
                Add Money
              </PrimaryButton>
            )}
          </Grid>
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
        {data?.machineSubscriptionSetting?.pricingTerms.map((item, index) => (
          <WashCard item={item} key={index} />
        ))}
      </Grid>
      {loading && <AppLoader />}
      <PopupModal
        styles={{
          width: "80vw",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
        <AddMoneyPopup machineId={machineId} washBasePrice={washBasePrice} />
      </PopupModal>
    </Grid>
  )
}

export default WalletAgreement
