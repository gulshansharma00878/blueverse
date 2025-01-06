import React, { useEffect, useState } from "react"
import { Grid, Typography } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { WalletService } from "network/walletService"
import AppLoader from "components/Loader/AppLoader"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import EmptyState from "components/utitlities-components/EmptyState"
import FailPaymentImage from "assets/images/placeholders/FailPayment.webp"
import { useStyles } from "../walletStyles"
import { userDetail } from "hooks/state"

const FailPayment = () => {
  const navigate = useNavigate()
  const params = useParams()
  const styles = useStyles()
  const user = userDetail()

  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getTransctionStatus()
  }, [])

  const getTransctionStatus = async () => {
    setLoader(true)
    let param = { txnId: params?.txnid }
    let statusResponse = await WalletService.paymentStatus(param)
    if (statusResponse.code === 200 && statusResponse.success) {
      if (statusResponse?.data?.status === "success") {
        navigate(`/${user?.role}/wallet/success-payment/${params?.txnid}`)
      }
    }
    setLoader(false)
  }

  const handleNavigate = () => {
    navigate(`/${user?.role}/wallet/transaction-history`)
  }
  return (
    <>
      <Grid container justifyContent="center" alignItems="center" direction="column">
        <EmptyState imgSrc={FailPaymentImage} />
        <Typography sx={styles.stateText} color="text.main">
          Payment Failed
        </Typography>
        <PrimaryButton
          style={{ marginRight: "2rem" }}
          type="submit"
          variant="contained"
          size="large"
          onClick={handleNavigate}>
          Go To Home
        </PrimaryButton>
      </Grid>
      {loader && <AppLoader />}
    </>
  )
}

export default FailPayment
