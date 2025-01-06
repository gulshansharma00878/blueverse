import React, { useState, useEffect } from "react"
import { Box, Button, Divider, Grid, Typography } from "@mui/material"
import styles from "./BalanceCard.module.scss"
import { useTheme } from "@mui/material"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useNavigate } from "react-router-dom"
import { countDaysLeft } from "helpers/app-dates/dates"
import PopupModal from "components/PopupModal"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import AddMoneyPopup from "../AddMoneyPopup"
import { WalletService } from "network/walletService"
import moment from "moment"
import ViewAdvanceMemo from "components/BillingAccount/AdvanceMemo"
import Toast from "components/utitlities-components/Toast/Toast"
import { getMinPricePlan } from "helpers/Functions/dealerUtilities"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { formatCurrency } from "helpers/Functions/formatCurrency"

function BalanceCard({ balanceData }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [daysCount, setDaysCount] = useState()
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [machineId, setMachineId] = useState("")
  const [memoId, setMemoId] = useState("")
  const [popUp, setPopUp] = useState(null)
  const [employeePermission, setEmployeePermission] = useState()
  const [washBasePrice, setWashBasePrice] = useState(0)
  const user = userDetail()

  useEffect(() => {
    dispatch(coreAppActions?.updatePopupModal(false))
  }, [balanceData])

  useEffect(() => {
    if (memoId) {
      dispatch(coreAppActions.updatePopupModal(true))
    }
  }, [memoId])

  useEffect(() => {
    getAllpermission()
  }, [])

  const handleRedirect = (e, id) => {
    // currently defining dummy machine id for testing purpose
    navigate(`/${user?.role}/wallet/machine-transaction/${id}`)
  }

  const handlePopup = async (e, days, machineSubscriptionData, machineID, memoStatus) => {
    if (memoStatus === "PENDING" || memoStatus === "FAILED") {
      const params = [`${machineID}?month=${moment().month()}&year=${moment().format("YYYY")}`]
      let memoResponse = await WalletService.getMemoDetail(params)
      if (memoResponse.success && memoResponse.code === 200) {
        if (memoResponse?.data) {
          setPopUp("memoPopUp")
          setMemoId(memoResponse?.data?.machineMemoId)
          dispatch(coreAppActions?.updatePopupModal(true))
        } else {
          Toast.showErrorToast(`Advance memo is not Generated`)
        }
      } else {
        setPopUp("addMoneyPopUp")
      }
    } else {
      setPopUp("addMoneyPopUp")
      setDaysCount(days)
      setMonthlyTotal(machineSubscriptionData?.total)
      setMachineId(machineID)
      countBaseAmount(machineSubscriptionData?.pricingTerms)
      dispatch(coreAppActions?.updatePopupModal(true))
    }
  }

  const countBaseAmount = (pricingTerms) => {
    let minTerms = getMinPricePlan(pricingTerms)

    let perWashPrice = pricingTerms?.find((x) => x?.type === minTerms)?.dealerPerWashPrice
    let manPowerPrice = pricingTerms?.find((x) => x?.type === minTerms)?.manpowerPricePerWash

    setWashBasePrice(Number(perWashPrice) + Number(manPowerPrice))
  }
  const handleClosePopup = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  async function getAllpermission() {
    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "wallet")
        setEmployeePermission(permissionJson?.permissionObj)
      }
    }
  }

  const handlePayment = async (e, data) => {
    const payLoad = {
      type: "WALLET",
      furl: `${process.env.REACT_APP_API_URL}/${user?.role}/wallet/fail-payment`,
      surl: `${process.env.REACT_APP_API_URL}/${user?.role}/wallet/success-payment`,
      machineId: data?.machineId,
      machineMemoId: data?.machineMemoId,
      amount: data?.totalAmount
    }
    let addMoney = await WalletService.createPayment(payLoad)
    if (addMoney.success && addMoney.code === 200) {
      const hash = addMoney.data.hash
      const paymentFormContainer = document.getElementById("payment-form-container")
      paymentFormContainer.innerHTML = hash
      paymentFormContainer.querySelector("form").submit()
    } else {
      Toast.showErrorToast(`${addMoney?.message}`)
    }
  }

  let popupMap = {
    addMoneyPopUp: (
      <Grid
        styles={{
          width: "80vw",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
        <AddMoneyPopup
          daysCount={daysCount}
          monthlyTotal={monthlyTotal}
          machineId={machineId}
          washBasePrice={washBasePrice}
        />
      </Grid>
    ),
    memoPopUp: (
      <Grid
        style={{
          height: "calc(100vh - 10rem)",
          width: "calc(100vw - 10rem)",
          overflow: "scroll"
        }}>
        <ViewAdvanceMemo
          popupMemoId={memoId}
          payment
          closePopup={handleClosePopup}
          handlePayment={handlePayment}
        />
      </Grid>
    )
  }
  return (
    <>
      <Box className={styles.containerBox}>
        {balanceData?.outlets &&
          balanceData?.outlets
            ?.filter((item) => item?.machines?.length !== 0)
            ?.map((item, i) => {
              return (
                <Box key={i}>
                  <Box>
                    <Typography variant="s1" component={"div"} sx={{ marginBottom: "24px" }}>
                      {item?.name}
                      {item?.address ? ", " + item?.address : ""}
                    </Typography>
                    <Box className={styles.machineRow}>
                      {item?.machines.map((data, index) => {
                        console.log("View Machine Balance", data)
                        let daysLeft = countDaysLeft(
                          data?.machineSubscriptionSetting?.billingCycle
                            ? data?.machineSubscriptionSetting?.billingCycle
                            : 0
                        )
                        return (
                          <Box key={index} className={styles.machineBox}>
                            <Box className={styles.rowBox}>
                              <Typography
                                variant="p3"
                                color={
                                  daysLeft <= 5 ? theme.palette.error.main : theme.palette.text.gray
                                }>
                                {daysLeft < 0 ? 0 : daysLeft} Days Left
                              </Typography>
                              <Box
                                className={styles.viewBox}
                                onClick={(e) => handleRedirect(e, data?.machineGuid)}>
                                <Typography variant="p2" color={theme.palette.primary.main}>
                                  View Transaction
                                </Typography>
                                <Box className={styles.iconBox}>
                                  <ChevronRightIcon color="primary" />
                                </Box>
                              </Box>
                            </Box>
                            <Box className={styles.balanceBox}>
                              <Box className={styles.ractangleBox}>{data?.name}</Box>
                              <Box>
                                <Typography variant="p2" color={theme.palette.text.gray}>
                                  Balance <span className={styles.textp1}>(Incl. GST)</span>
                                </Typography>
                                <Typography
                                  variant="h7"
                                  component="div"
                                  color={
                                    Number(data?.walletBalance) + Number(data?.topUpBalance) <= 500
                                      ? theme.palette.error.main
                                      : theme.palette.text.main
                                  }>
                                  {formatCurrency(
                                    parseFloat(data?.walletBalance) +
                                      parseFloat(data?.topUpBalance),
                                    "INR "
                                  )}
                                </Typography>
                              </Box>
                            </Box>

                            <Box className={styles.rowBox}>
                              {data?.blueverseCredit && (
                                <Typography variant="p3" color={theme.palette.text.green}>
                                  Blueverse Credits:{" "}
                                  <span className={styles.textp2}>
                                    {formatCurrency(data?.blueverseCredit, "")}
                                  </span>
                                </Typography>
                              )}
                            </Box>
                            <Box className={styles.balanceBox}>
                              {Number(data?.walletBalance) + Number(data?.topUpBalance) <= 500 ||
                              daysLeft <= 3 ? (
                                <>
                                  <Box className={styles.iconBox}>
                                    <ErrorOutlineOutlinedIcon
                                      sx={{ color: theme.palette.text.red1 }}
                                    />
                                  </Box>
                                  <Typography
                                    variant="p4"
                                    color={theme.palette.text.red1}
                                    component={"div"}>
                                    Recharge to avoid suspension
                                  </Typography>
                                </>
                              ) : (
                                ""
                              )}
                            </Box>
                            <Box className={styles.rowBox}>
                              <Typography variant="p3" color={theme.palette.text.gray}>
                                Monthly Agreement:{" "}
                                <span className={styles.textp1}>
                                  {formatCurrency(data?.machineSubscriptionSetting?.total, "INR ")}{" "}
                                  (Incl. GST)
                                </span>
                              </Typography>
                            </Box>
                            {user?.role == "employee" ? (
                              employeePermission?.payPermission ? (
                                <Box className={styles.rowBox}>
                                  <Button
                                    variant="contained"
                                    className={styles.addBtn}
                                    onClick={(e) =>
                                      handlePopup(
                                        e,
                                        daysLeft,
                                        data?.machineSubscriptionSetting,
                                        data?.machineGuid,
                                        data?.memo?.status
                                      )
                                    }>
                                    {data?.memo && data?.memo?.status !== "PAID"
                                      ? "Pay Now"
                                      : "Add Money"}
                                  </Button>
                                </Box>
                              ) : null
                            ) : (
                              <Box className={styles.rowBox}>
                                <Button
                                  variant="contained"
                                  className={styles.addBtn}
                                  onClick={(e) =>
                                    handlePopup(
                                      e,
                                      daysLeft,
                                      data?.machineSubscriptionSetting,
                                      data?.machineGuid,
                                      data?.memo?.status
                                    )
                                  }>
                                  {data?.memo && data?.memo?.status !== "PAID"
                                    ? "Pay Now"
                                    : "Add Money"}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                  {i !== balanceData?.length - 1 ||
                    (item?.machines?.length !== 0 && <Divider sx={{ marginTop: "2.4rem" }} />)}
                </Box>
              )
            })}
      </Box>
      <PopupModal handleClose={handleClosePopup}>{popupMap[popUp]}</PopupModal>
      <div id="payment-form-container"></div>
    </>
  )
}

export default BalanceCard
