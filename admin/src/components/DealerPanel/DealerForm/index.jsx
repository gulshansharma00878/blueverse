import React, { useEffect } from "react"
import Box from "@mui/system/Box"
import HorizontalStepper from "components/utilities-components/Stepper/HorizontalStepper"
import "./dealerForm.scss"
import { useSelector, useDispatch } from "react-redux"
import DealerDetail from "components/DealerPanel/DealerForm/DealerDetail/DealerDetail"
import SubscriptionDetails from "./SubscriptionDetails"
import MachineDetails from "./MachineDetails"
import { dealerActions } from "redux/store"

const steps = ["Dealership Details", "Assign Machine", "Subscription Settings"]

const DealerForm = ({ isEdit = false }) => {
  const activeStep = useSelector((state) => state.dealer.activeStep)
  const dispatch = useDispatch()

  useEffect(() => {
    // This code will avoid issue raised at ticket # BLUEVERSE-896
    if (activeStep !== 2) {
      dispatch(dealerActions.resetCompletionCounter())
    }
  }, [activeStep])

  const getFormComponent = () => {
    switch (true) {
      case activeStep === 0:
        return <DealerDetail />
      case activeStep === 1:
        return <MachineDetails isEdit={isEdit} />
      case activeStep === 2:
        return <SubscriptionDetails />
      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: "87.9rem" }}>
      <Box className="formSection" component="section">
        <Box className="innerFormSection" component="div">
          <Box className="stepperContainer">
            <HorizontalStepper
              activeStep={activeStep}
              stepsArray={steps}
              // style={{ marginTop: "40px" }}
            />
          </Box>
          {/* Replace this section with your form */}
          {getFormComponent()}
        </Box>
      </Box>
    </Box>
  )
}

export default DealerForm
