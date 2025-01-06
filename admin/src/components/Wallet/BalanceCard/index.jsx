import React, { useEffect } from "react"
import { Box, Divider, Typography } from "@mui/material"
import styles from "./BalanceCard.module.scss"
import { useTheme } from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useNavigate } from "react-router-dom"
import { countDaysLeft } from "helpers/app-dates/dates"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import { userDetail } from "hooks/state"
import { formatCurrency } from "helpers/Functions/formatCurrency"

function BalanceCard({ balanceData, dealerId = "" }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const user = userDetail()

  useEffect(() => {
    dispatch(coreAppActions?.updatePopupModal(false))
  }, [balanceData])

  const handleRedirect = (e, id) => {
    // currently defining dummy machine id for testing purpose
    navigate(`/${user?.role}/wallet/machine-transaction?mId=${id}&dId=${dealerId}`)
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
                            <Box className={styles.rowBox}>
                              <Typography variant="p3" color={theme.palette.text.gray}>
                                Monthly Agreement:{" "}
                                <span className={styles.textp1}>
                                  {formatCurrency(data?.machineSubscriptionSetting?.total, "INR ")}{" "}
                                  (Incl. GST)
                                </span>
                              </Typography>
                            </Box>
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
    </>
  )
}

export default BalanceCard
