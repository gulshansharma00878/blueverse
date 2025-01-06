import React from "react"
import Box from "@mui/material/Box"
import "./horizontalStepper.scss"
import TripOriginIcon from "@mui/icons-material/TripOrigin"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { Typography } from "@mui/material"
// import Typography from "@mui/material/Typography"

const HorizontalStepper = ({ stepsArray, activeStep, style = {} }) => {
  const ConnectorInner = ({ borderColor, visible = "visible" }) => {
    return <Box className={`connectorInner ${borderColor}`} sx={{ visibility: `${visible}` }}></Box>
  }

  const ConnectorOuter = ({ borderColor }) => {
    // NOTE: Here 165px or 16.5rem is the width of one inner-box

    let coefficient = stepsArray.length
    let width = `calc((100% - (18.5rem * ${coefficient})) / ${coefficient - 1})`
    return (
      <div className="connectorOuter_OuterBox" style={{ width: width }}>
        <div className="innerBox">
          <div className={`connectorInner ${borderColor}`}></div>
        </div>
      </div>
    )
  }

  const StepperBox = ({ label, index, activeStep }) => {
    let coeff = stepsArray.length - 1
    let borderColor = index >= activeStep ? "inactiveBorder" : "activeBorder"
    return (
      <>
        <Box className={`outerBox ${index === activeStep && "activeBox"}`}>
          <Box className="innerBox">
            <ConnectorInner
              visible={index === 0 ? "hidden" : "visible"}
              borderColor={borderColor}
            />
            {index >= activeStep ? (
              <TripOriginIcon
                color={index === activeStep ? "primary" : "disable"}
                fontSize="large"
              />
            ) : (
              <CheckCircleIcon color="primary" fontSize="large" />
            )}
            <ConnectorInner
              visible={index === coeff ? "hidden" : "visible"}
              borderColor={borderColor}
            />
          </Box>
          <Typography className="labelText" variant="p1" sx={{ paddingTop: "0.5rem" }}>
            {label}
          </Typography>
        </Box>
        {index !== coeff && <ConnectorOuter borderColor={borderColor} />}
      </>
    )
  }

  return (
    <Box className="stepper-container" style={style}>
      {stepsArray.map((label, index) => (
        <StepperBox label={label} index={index} activeStep={activeStep} key={index} />
      ))}
    </Box>
  )
}

export default HorizontalStepper
