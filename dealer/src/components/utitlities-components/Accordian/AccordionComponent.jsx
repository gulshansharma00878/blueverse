import React from "react"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Box from "@mui/material/Box"
import "./accordionComponent.scss"
import { Typography } from "@mui/material"

const AccordionComponent = ({
  selectedName = "name",
  city = "",
  state = "",
  region = "",
  address = "",
  children
}) => {
  const addresstext = `${address}-${city}`
  const getAddressCity = (addrressValue) => {
    const addressArray = addrressValue.split(",")
    if (addressArray?.length > 4) {
      const middleIndex = Math.ceil(addressArray.length / 2)

      const firstHalf = addressArray.splice(0, middleIndex)
      const firstAddress = firstHalf.join(",")
      const secondHalf = addressArray.splice(-middleIndex)
      const secondAddress = secondHalf.join(",")

      return (
        <Box>
          <Box>{firstAddress}</Box>
          <Box>{secondAddress}</Box>
        </Box>
      )
    } else {
      return address
    }
  }
  return (
    <Accordion className="mappingAccordionContainer">
      <AccordionSummary
        expandIcon={
          <Box className="expandMoreIconStyle">
            <ExpandMoreIcon fontSize="large" />
          </Box>
        }
        className="mappingAccordionSummary"
        aria-controls="panel1a-content"
        id="panel1a-header">
        <Box>
          <Typography> {selectedName}</Typography>
          <Typography> {getAddressCity(addresstext)}</Typography>
          <Typography> {`${region}-${state}`}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}

export default AccordionComponent
