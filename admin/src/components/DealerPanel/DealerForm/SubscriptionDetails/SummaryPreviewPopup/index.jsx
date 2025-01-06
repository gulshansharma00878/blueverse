import React, { useState } from "react"
import PopupModal from "components/PopupModal"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { coreAppActions } from "redux/store"
import styles from "./summaryPreviewPopup.module.scss"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import SummaryItem from "./SummaryItem"
import GrandTotal from "../GrandTotal"
import { useSelector, useDispatch } from "react-redux"
import { DealerService } from "network/dealerService"
import Toast from "components/utilities-components/Toast/Toast"
import { useNavigate } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getMinPricePlan } from "components/DealerPanel/dealerUtilities"

const SummaryPreviewPopup = () => {
  const dispatch = useDispatch()
  const user = userDetail()
  const subscriptionDetails = useSelector((state) => state.dealer.subscriptionDetails)
  const outletDetails = useSelector((state) => state.dealer.outletDetails)
  const dealerId = useSelector((state) => state.dealer.dealerID)
  const dealerDetails = useSelector((state) => state.dealer.dealerDetails)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const preparePayload = () => {
    const payloadData = outletDetails
      ?.map((outlet) => {
        let temp = []
        for (let item of subscriptionDetails) {
          if (item?.outlet_id === outlet?.outletId) {
            let machine = { ...item.machine }
            machine["pricing_terms"] = item?.machine?.pricing_terms
              .filter((x) => x.isEnabled)
              .map((x) => {
                // manpowerperwash is empty, send this as 0
                let plan = { ...x?.plan }
                plan["manpowerPricePerWash"] =
                  plan["manpowerPricePerWash"] === "" ? 0 : plan["manpowerPricePerWash"]
                return plan
              })
            delete machine.machineName
            temp.push(machine)
          }
        }
        return { outlet_id: outlet?.outletId, machines: temp }
      })
      .filter((x) => x.machines.length !== 0)

    return { policies: payloadData }
  }

  const submitDataHandler = async () => {
    // prepare Payload ==>
    setIsLoading(true)
    const payload = preparePayload()
    // NOTE: As per backend team, using POST, we can create and update subscription settings.
    let response = await DealerService.submitSubscriptionSettings(payload, dealerId)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      setIsLoading(false)
      navigate(`/${user?.role}/dealers`)
    } else {
      setIsLoading(false)
      Toast.showErrorToast(response?.message)
    }
  }

  return (
    <>
      <PopupModal handleClose={handleClose}>
        <div className={styles.previewPopupContainer}>
          <Grid container>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="s1" color="text.main" component="p">
                  {dealerDetails?.username}
                </Typography>
                <Typography variant="p2" color="text.main" component="p">
                  {dealerDetails?.phone}
                </Typography>
                <Typography variant="p2" color="text.gray" component="p">
                  {dealerDetails?.email}
                </Typography>
                <Typography variant="p3" color="text.gray" component="p">
                  {dealerDetails?.panNo}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: "right" }}>
              <Typography variant="p3" color="text.main" sx={{ fontWeight: "700" }} component="p">
                OEM
              </Typography>
              <Typography variant="s1" color="text.main" component="p">
                {dealerDetails?.oem?.name}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ marginTop: "3.6rem", marginBottom: "3.6rem" }} />
          <Box className={styles.outletSummarySection}>
            {subscriptionDetails.map((x, index) => (
              <SummaryItem
                key={index}
                data={x}
                oemName={dealerDetails?.oem?.name}
                outletDetails={outletDetails.find((y) => y?.outletId === x?.outlet_id)}
                machineDetails={x?.machine}
                minPricePlan={getMinPricePlan(x?.machine?.pricing_terms)}
              />
            ))}
            <Divider sx={{ marginTop: "3.6rem", marginBottom: "3.6rem" }} />
            <GrandTotal />
          </Box>
          <Grid container className={styles.buttonSectionSPP}>
            <Grid item xs={6}>
              <PrimaryButton onClick={handleClose} className={styles.previewButtonSPP} fullWidth>
                Back to Subscription Settings
              </PrimaryButton>
            </Grid>
            <Grid item xs={6}>
              <PrimaryButton fullWidth onClick={submitDataHandler}>
                Finish
              </PrimaryButton>
            </Grid>
          </Grid>
        </div>
      </PopupModal>
      {isLoading && <AppLoader />}
    </>
  )
}

export default SummaryPreviewPopup
