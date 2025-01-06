import React, { useEffect } from "react"
import { Grid, Divider, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useStyles } from "./walletComponentStyles"
import FilledWallet from "assets/images/icons/filledWallet.svg"
import DarkWallet from "assets/images/icons/smallWallet.webp"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import Coins from "assets/images/icons/coins.svg"
import { useNavigate } from "react-router-dom"
import { coreAppActions } from "redux/store"
import { useDispatch } from "react-redux"
import { userDetail } from "hooks/state"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import Toast from "components/utilities-components/Toast/Toast"
import AmountCard from "components/utilities-components/AmountCard"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import SingleAmountCard from "components/utilities-components/SingleAmountCard"

const WalletHeader = (props) => {
  const {
    machineLength,
    creditBalance,
    machineId,
    machines,
    areTransactions,
    dealerId = ""
  } = props
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"))
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = userDetail()
  useEffect(() => {
    dispatch(coreAppActions?.updatePopupModal(false))
  }, [machineId])

  const ViewBalanceHandler = () => {
    return (
      <PrimaryButton
        height="6rem"
        width="100%"
        sx={{ marginTop: isMobile ? "1.6rem" : 0, borderRadius: "8px" }}
        endIcon={<KeyboardArrowRightIcon fontSize="large" color="white" />}
        onClick={() =>
          areTransactions
            ? navigate(`/${user?.role}/wallet/view-balance/${dealerId}`)
            : Toast.showWarnToast(`No Transactions Available`)
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
          <SingleAmountCard dealerId={dealerId} creditBalance={creditBalance} machines={machines} />
        </Grid>
        <Grid
          container
          item
          xs={12}
          sm={"auto"}
          flexDirection={{ sm: "column", xs: "column-reverse" }}
          justifyContent="center"
          alignItems="center">
          <Typography
            onClick={() => {
              areTransactions
                ? navigate(
                    `/${user?.role}/wallet/machine-transaction?mId=${machineId}&dId=${dealerId}`
                  )
                : Toast.showInfoToast(`No Transactions Available`)
            }}
            style={styles.viewTransactions}>
            View Transactions &gt;
          </Typography>
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
      </Grid>
      {isTablet && checkMachine()}
      {isMobile && machineLength > 1 ? <ViewBalanceHandler /> : null}
    </>
  )
}

export default WalletHeader
