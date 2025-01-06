import React, { useEffect, useState } from "react"
import { Box } from "@mui/material"
import { useParams } from "react-router-dom"
import { WalletService } from "network/walletService"
import AppLoader from "components/Loader/AppLoader"
import PaymentSuccess from "components/BillingAccount/AdvanceMemo/PaymentSuccess"
import { BillingService } from "network/billingServices"
import { useNavigate } from "react-router-dom"
import Toast from "components/utitlities-components/Toast/Toast"
import { userDetail } from "hooks/state"
const SuccessPayment = () => {
  const params = useParams()
  const user = userDetail()
  const navigate = useNavigate()
  const [loader, setLoader] = useState(false)
  const [paymentData, setPaymentData] = useState()
  const [memoData, setMemoData] = useState()

  useEffect(() => {
    getTransctionStatus()
  }, [])

  const getTransctionStatus = async () => {
    setLoader(true)
    let param = { txnId: params?.txnid }
    let statusResponse = await WalletService.paymentStatus(param)
    if (statusResponse.code === 200 && statusResponse.success) {
      setPaymentData(statusResponse?.data)
      if (statusResponse?.data) {
        if (statusResponse?.data?.status === "success") {
          let memoParam = [statusResponse?.data?.transactionMemoDetail?.machineMemoId]
          let memoDetail = await BillingService.memoDetail(memoParam)
          if (memoDetail.code === 200 && memoDetail.success) {
            setMemoData(memoDetail?.data)
            setLoader(false)
          } else {
            setLoader(false)
            setMemoData({})
          }
        } else {
          navigate(`/${user?.role}/wallet/fail-payment/${params?.txnid}`)
        }
      }
    } else {
      setLoader(false)
      setPaymentData({})
      navigate("/dealer/wallet/transaction-history")
    }
  }

  const handleDownload = async () => {
    setLoader(true)
    let param = [memoData?.machineMemoId]
    const invoiceResponse = await BillingService.invoiceDetail(param)
    if (invoiceResponse.code === 200 && invoiceResponse.success) {
      const a = document.createElement("a")
      a.href = invoiceResponse?.data
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setLoader(false)
      Toast.showInfoToast(invoiceResponse?.message)
    } else {
      Toast.showErrorToast("Something went wrong..!")
      setLoader(false)
    }
  }

  return (
    <Box>
      {loader ? (
        <AppLoader />
      ) : (
        <PaymentSuccess
          paymentData={paymentData}
          memoData={memoData}
          handleDownload={handleDownload}
        />
      )}
    </Box>
  )
}

export default SuccessPayment
