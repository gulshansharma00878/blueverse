import { Grid, Paper, Typography } from "@mui/material"
import { Box } from "@mui/system"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import React from "react"
import { useStyles } from "../feedbackStyles"
import { getMachinesAgents } from "../feedbackutilities"
import Toast from "components/utilities-components/Toast/Toast"
import { FeedBackService } from "network/feedbackService"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"

const ConfirmAgent = (props) => {
  const { handleClose, data, dropDownData } = props
  const navigate = useNavigate()
  const user = userDetail()
  const styles = useStyles()
  const getOutletMachinesName = (machines) => {
    const getMachineWithAgents = machines.filter((machine) => machine?.agents?.length > 0)
    const getAllMachineName = getMachineWithAgents.map((machine) => machine.name)
    return (
      <Box sx={[styles?.display, styles?.machineBoxContaiiner, styles?.alignEnd]}>
        {getAllMachineName.map((name, i) => (
          <Box key={i} sx={[styles?.machineBox, styles?.display, styles?.justify, styles?.align]}>
            {name}
          </Box>
        ))}
      </Box>
    )
  }
  const postFormMapping = () => {
    const getMachinesAgent = getMachinesAgents(data)
    if (getMachinesAgent?.length > 0) {
      let payload = {}
      payload.regionId = dropDownData?.selectedRegion
      payload.cityId = dropDownData?.selectedCity
      payload.stateId = dropDownData?.selectedState
      payload.oemId = dropDownData?.selectedOem
      payload.dealerIds = dropDownData?.selectedDealers.map((dealer) => dealer?.value)
      payload.machineAgentData = getMachinesAgent
      postMapDetails(payload)
    } else {
      Toast.showErrorToast("No Agents Are selected to Assign")
    }
  }
  const postMapDetails = async (payload) => {
    const response = await FeedBackService.mapDetails(payload, dropDownData?.formId)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(`${response?.message}`)
      navigate(`/${user.role}/feedback/form-mapping`)
      handleClose()
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  return (
    <Box sx={styles.container}>
      <Grid container>
        <Grid item xs={12} sx={[styles?.display, styles?.justify, styles?.align, styles.column]}>
          <Typography sx={styles?.popUpTitle}>Confirm Agent&apos;s Assignments</Typography>
          <Typography sx={[styles?.popUpSubTitle]}>
            Do you want to assign agents to following results?
          </Typography>
        </Grid>
      </Grid>
      <Paper sx={styles?.detailContainer}>
        {data.map((outlet, index) => {
          return (
            <Grid key={index} container sx={[styles?.outletContainer]}>
              <Grid item xs={6}>
                <Typography sx={[styles.outletName]}>{outlet?.name}</Typography>
                <Typography sx={[styles?.outletAddress]}>{outlet?.dealerName}</Typography>
                <Typography sx={[styles?.outletSubTitle]}>{outlet?.address}</Typography>
              </Grid>
              <Grid
                item
                xs={6}
                sx={[styles?.display, styles?.alignEnd, styles?.justify, styles?.column]}>
                <Typography sx={[styles.outletName]}>
                  {outlet?.totalAgentsCount} {outlet?.totalAgentsCount === 1 ? "Agent" : "Agents"}
                </Typography>
                {getOutletMachinesName(outlet.machines)}
              </Grid>
            </Grid>
          )
        })}

        <Box sx={[styles.display, styles.justifySpace, styles.align, styles?.buttonContainer]}>
          <SecondaryButton style={styles.popupButton} onClick={handleClose}>
            NO
          </SecondaryButton>
          <PrimaryButton style={styles.popupButton} onClick={postFormMapping}>
            Yes
          </PrimaryButton>
        </Box>
      </Paper>
    </Box>
  )
}

export default ConfirmAgent
