import React, { Fragment, useEffect, useState } from "react"
import "./subscriptionDetails.scss"
import AccordionComponent from "./AccordionComponent"
import GrandTotal from "./GrandTotal"
import SummaryPreviewPopup from "./SummaryPreviewPopup"
import FormFooter from "components/DealerPanel/FormFooter"
import { coreAppActions } from "redux/store"
import { Box, Divider, Typography } from "@mui/material"
import { DealerService } from "network/dealerService"
import Toast from "components/utilities-components/Toast/Toast"
import { useSelector, useDispatch } from "react-redux"
import { dealerActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"

const templateSubSettings = {
  security_deposited: "",
  billing_cycle: "1",
  invoice_date: "",
  minimum_wash_commitment: "",
  pricing_terms: [
    {
      isEnabled: true,
      plan: {
        manpowerPricePerWash: "",
        dealerPerWashPrice: "",
        type: "SILVER"
      }
    },
    {
      isEnabled: false,
      plan: {
        manpowerPricePerWash: "",
        dealerPerWashPrice: "",
        type: "GOLD"
      }
    },
    {
      isEnabled: false,
      plan: {
        manpowerPricePerWash: "",
        dealerPerWashPrice: "",
        type: "PLATINUM"
      }
    }
  ],
  taxable_amount: 0,
  cgst: 0,
  sgst: 0,
  total: 0
}

const SubscriptionDetails = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = userDetail()
  const subscriptionDetails = useSelector((state) => state.dealer.subscriptionDetails)
  const dataCompletionArray = useSelector((state) => state.dealer.completionCounter)

  const outletDetails = useSelector((state) => state.dealer.outletDetails)
  const dealerID = useSelector((state) => state.dealer.dealerID)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  useEffect(() => {
    fetchDealerDetails()
  }, [])

  const dataCompletionCheck = () => {
    let complete = false
    if (dataCompletionArray.length) {
      complete = dataCompletionArray.filter((x) => x === false).length === 0
    }
    return complete
  }

  async function fetchDealerDetails() {
    const response = await DealerService.getDealerDetails(dealerID)
    if (response?.success && response?.code === 200) {
      const outletDetails = response?.data?.outlets ? response?.data?.outlets : []
      dispatch(dealerActions.setDealerDetails(response?.data)) // Storing complete dealer details
      dispatch(dealerActions.setOutletDetails(outletDetails)) // Storing only outlet details

      // Creating Subscription Settings Object :
      let temp = []
      let editModeFlag = 0
      if (outletDetails?.length) {
        outletDetails?.forEach((x, index) => {
          for (let machine of x.machines) {
            let subSettings
            let editMode = machine?.machineSubscriptionSetting?.pricingTerms === null ? false : true
            // Possible that sub-settings present only for few machines and not for all.
            if (editMode) {
              editModeFlag++
              let allPlans = ["SILVER", "GOLD", "PLATINUM"]
              // we need to parse sub-settings received from server to store into redux
              let settingsResponse = machine?.machineSubscriptionSetting
              subSettings = {
                security_deposited: settingsResponse?.securityDeposited,
                billing_cycle: settingsResponse?.billingCycle,
                invoice_date: settingsResponse?.invoiceDate,
                minimum_wash_commitment: settingsResponse?.minimumWashCommitme,
                taxable_amount: settingsResponse?.taxableAmount,
                cgst: settingsResponse?.cgst,
                sgst: settingsResponse?.sgst,
                total: settingsResponse?.total,
                pricing_terms: allPlans.map((plan_name) => {
                  let planIndex = settingsResponse?.pricingTerms?.findIndex(
                    (x) => x?.type === plan_name
                  )

                  let term = {
                    isEnabled: planIndex >= 0 ? true : false,
                    plan: {
                      manpowerPricePerWash:
                        planIndex >= 0
                          ? settingsResponse?.pricingTerms[planIndex]?.manpowerPricePerWash
                          : "",
                      dealerPerWashPrice:
                        planIndex >= 0
                          ? settingsResponse?.pricingTerms[planIndex]?.dealerPerWashPrice
                          : "",
                      type: plan_name
                    }
                  }

                  return term
                })
              }
            } else {
              subSettings = templateSubSettings
            }
            temp.push({
              outlet_id: x?.outletId,
              outletIndexName: "Service Centre " + (index + 1),
              outletName: x?.name,
              machine: {
                machine_id: machine?.machineGuid,
                machineName: machine?.name,
                ...subSettings
              }
            })
          }
        })
      }
      setIsEditMode(!!editModeFlag) // If value more than zero means it is edit mode
      dispatch(dealerActions.setSubscriptionDetails(temp))
      setIsLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setIsLoading(false)
    }
  }

  const openPreviewHandler = () => {
    dispatch(coreAppActions.updatePopupModal(true))
  }

  const handleNavigate = () => {
    navigate(`/${user?.role}/dealers`)
  }
  return (
    <Fragment>
      {isLoading ? (
        <AppLoader />
      ) : !isLoading && subscriptionDetails.length ? (
        subscriptionDetails.map((item, index) => (
          <AccordionComponent
            key={index}
            index={index}
            outlet={outletDetails.find((x) => x?.outletId === item?.outlet_id)}
            machineDetails={item}
          />
        ))
      ) : (
        <Box className="no_record">
          <Typography variant="p4">{"No Data Found. Please assign machine."}</Typography>
          <PrimaryButton height={40} width={140} fontSize={10} onClick={handleNavigate}>
            Back to Dealer Listing
          </PrimaryButton>
        </Box>
      )}
      <Divider sx={{ marginTop: "3.6rem", marginBottom: "3.6rem" }} />
      {dataCompletionCheck() ? <GrandTotal /> : null}
      <FormFooter
        btnDisable={!dataCompletionCheck()}
        clickHandler={openPreviewHandler}
        btnLabel="Continue to Preview"
        style={{ alignItems: "center", marginTop: "3.6rem" }}
      />
      <SummaryPreviewPopup isEditMode={isEditMode} />
    </Fragment>
  )
}

export default SubscriptionDetails
