import React, { useEffect, useState } from "react"
import { Grid, Divider, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useStyles } from "./walletComponentStyles"
import FilledWallet from "assets/images/icons/filledWallet.svg"
import DarkWallet from "assets/images/icons/smallWallet.webp"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import Coins from "assets/images/icons/coins.svg"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import { useNavigate } from "react-router-dom"
import AmountCard from "components/utitlities-components/TransactionCards/AmountCard"
import SingleAmountCard from "components/utitlities-components/TransactionCards/SingleAmountCard"
import PopupModal from "components/PopupModal"
import AddMoneyPopup from "./AddMoneyPopup"
import { coreAppActions } from "redux/store"
import { useDispatch } from "react-redux"
import { userDetail } from "hooks/state"
import Toast from "components/utitlities-components/Toast/Toast"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import { getMinPricePlan } from "helpers/Functions/dealerUtilities"

const WalletHeader = (props) => {
  const {
    machineLength,
    creditBalance,
    machineId,
    machines,
    areTransactions,
    employeePermission,
    role
  } = props
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"))
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = userDetail()
  const [washBasePrice, setWashBasePrice] = useState(0)
  useEffect(() => {
    dispatch(coreAppActions?.updatePopupModal(false))
  }, [machineId])

  const handlePopup = () => {
    countBaseAmount(machines[0]?.machineSubscriptionSetting?.pricingTerms)
    dispatch(coreAppActions?.updatePopupModal(true))
  }

  const countBaseAmount = (pricingTerms) => {
    let minTerms = getMinPricePlan(pricingTerms)

    let perWashPrice = pricingTerms?.find((x) => x?.type === minTerms)?.dealerPerWashPrice
    let manPowerPrice = pricingTerms?.find((x) => x?.type === minTerms)?.manpowerPricePerWash

    setWashBasePrice(Number(perWashPrice) + Number(manPowerPrice))
  }

  const ViewBalanceHandler = () => {
    return (
      <PrimaryButton
        height="6rem"
        width="100%"
        sx={{ marginTop: isMobile ? "1.6rem" : 0, borderRadius: "8px" }}
        endIcon={<KeyboardArrowRightIcon fontSize="large" color="white" />}
        onClick={() =>
          areTransactions
            ? navigate(`/${user?.role}/wallet/view-balance`)
            : Toast.showInfoToast(`No Transactions Available`)
        }>
        {" "}
        View Machines Balance
      </PrimaryButton>
    )
  }

  const checkMachine = () => {
    return machineLength > 1 ? (
      <Grid item xs={12} md={"auto"} container justifyContent="space-between" spacing={1}>
        <Grid item xs={12} sm={6} lg={"auto"}>
          <AmountCard
            title="Wallet Balance(incl.Gst)"
            imgSrc={DarkWallet}
            amount={formatCurrency(creditBalance?.walletBalance, "")}
            type={"cash"}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={"auto"}>
          <AmountCard
            title={"BlueVerse Credits Balance"}
            imgSrc={Coins}
            amount={formatCurrency(creditBalance?.creditBalance, "")}
            type={"credit"}
          />
        </Grid>
      </Grid>
    ) : machineLength !== 0 ? (
      <Grid
        item
        xs={12}
        md={"auto"}
        container
        justifyContent="space-between"
        gap="2.4rem"
        rowGap="1.6rem">
        <Grid item xs={12} sm="auto">
          <SingleAmountCard creditBalance={creditBalance} machines={machines} />
        </Grid>
        <Grid
          container
          item
          xs={12}
          sm={"auto"}
          spacing="2rem"
          flexDirection={{ sm: "column", xs: "column-reverse" }}>
          <Grid item textAlign={{ xs: "center", sm: "left" }}>
            <Typography
              onClick={() => {
                areTransactions
                  ? navigate(`/${user?.role}/wallet/machine-transaction/${machineId}`)
                  : Toast.showInfoToast(`No Transactions Available`)
              }}
              style={styles.viewTransactions}>
              View Transactions &gt;
            </Typography>
          </Grid>
          <Grid item sx={{ textAlign: "center", minWidth: "27.4rem" }}>
            {role === "employee" ? (
              employeePermission?.payPermission ? (
                <PrimaryButton onClick={handlePopup} height="4.8rem" width="100%">
                  Add Money
                </PrimaryButton>
              ) : null
            ) : (
              <PrimaryButton onClick={handlePopup} height="4.8rem" width="100%">
                Add Money
              </PrimaryButton>
            )}
          </Grid>
        </Grid>
      </Grid>
    ) : null
  }
  return (
    <>
      <Grid container sx={styles.headerContainer}>
        <Grid item container gap="1.2rem" alignItems="center" xs={12} sm={"auto"}>
          <img src={FilledWallet} alt="wallet" style={styles.walletIcon} />
          <Typography sx={[styles?.walletHeading]}>Manage Wallet</Typography>
        </Grid>
        <Grid
          item
          container
          justifyContent="space-between"
          xs="auto"
          spacing={4}
          alignItems="center">
          {!isTablet && checkMachine()}
          {!isTablet && (
            <Grid item>
              <Divider orientation="vertical" sx={{ height: "6rem" }} />
            </Grid>
          )}
          {!isMobile && machineLength > 1 ? (
            <Grid item xs="auto" paddingTop={0}>
              <ViewBalanceHandler />
            </Grid>
          ) : null}
        </Grid>
        <PopupModal
          styles={{
            width: "80vw",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
          <AddMoneyPopup machineId={machineId} washBasePrice={washBasePrice} />
        </PopupModal>
      </Grid>
      {isTablet && checkMachine()}
      {isMobile && machineLength > 1 ? <ViewBalanceHandler /> : null}
    </>
  )
}

export default WalletHeader
