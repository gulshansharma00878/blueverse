import React from "react"
import { PlanCard } from "../PlanCard.js/PlanCard"
import { Checkbox, Grid, Typography, useMediaQuery } from "@mui/material"
import { useStyles } from "../SubscriptionSettingStyles"
import { useSelector, useDispatch } from "react-redux"
import { dealerActions } from "redux/store"
import { checkMachineDataCompletion } from "components/DealerPanel/dealerUtilities"

function Cards({ index }) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const { pricing_terms } = useSelector((state) => state.dealer.subscriptionDetails)[index].machine
  const machineData = useSelector((state) => state.dealer.subscriptionDetails)[index].machine
  const isMobile = useMediaQuery("(max-width:600px)")

  const toggleEnableHandler = (idx) => {
    let singlePlan = { ...pricing_terms[idx] }
    singlePlan.isEnabled = !pricing_terms[idx].isEnabled
    // Checking data completion
    checkMachineDataCompletion(machineData, dispatch, dealerActions, index, singlePlan)
    dispatch(dealerActions.updatePricingTerms({ index: index, planIndex: idx, plan: singlePlan }))
  }

  const planUpdateHandler = (planIndex, fieldName, e) => {
    let singlePlan = { ...pricing_terms[planIndex] }
    let planData = { ...singlePlan["plan"] }

    planData[fieldName] = isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value)
    singlePlan["plan"] = planData
    // Checking data completion
    checkMachineDataCompletion(machineData, dispatch, dealerActions, index, singlePlan)
    dispatch(
      dealerActions.updatePricingTerms({ index: index, planIndex: planIndex, plan: singlePlan })
    )
  }

  const silverWashAlert = () => {
    alert("Silver wash is default wash and cannot be disabled")
  }
  return (
    <Grid sx={styles.planBox}>
      {pricing_terms?.map((item, i) => {
        const TermsCheckBox = () => {
          return (
            <Checkbox
              checked={item?.isEnabled}
              size="large"
              onChange={
                item?.plan?.type === "SILVER" ? silverWashAlert : toggleEnableHandler.bind(null, i)
              }
            />
          )
        }

        return (
          <Grid sx={styles.planCardBox_outerStyle} key={i} direction="column">
            <Grid item container alignItems="center">
              {isMobile ? <TermsCheckBox /> : null}
              <Typography variant="p2" color={item?.isEnabled ? "text.main" : "text.gray"}>
                {item?.isEnabled ? "Enabled" : "Disabled"}
              </Typography>
            </Grid>
            <PlanCard
              onUpdatePlan={planUpdateHandler.bind(null, i)}
              plan={item?.plan}
              isEnabled={item?.isEnabled}
            />
            {!isMobile ? (
              <Grid sx={{ ml: "38%" }}>
                <TermsCheckBox />
              </Grid>
            ) : null}
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Cards
