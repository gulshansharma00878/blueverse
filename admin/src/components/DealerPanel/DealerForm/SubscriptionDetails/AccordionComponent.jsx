import React from "react"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import SubscriptionSetting from "./SubscriptionSetting/SubscriptionSetting"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import styles from "./accordionComponent.module.scss"
import EllipseIcon from "../../../../assets/images/icons/ellipseIcon.svg"
import { useSelector } from "react-redux"
import { formatCurrency } from "helpers/Functions/formatCurrency"

const AccordionComponent = ({ index, machineDetails, outlet }) => {
  const machineTotal = useSelector((state) => state.dealer.subscriptionDetails)[index].machine.total
  const dataCompletionCheck = useSelector((state) => state.dealer.completionCounter)[index]
  const SummaryComponent = () => {
    return (
      <Grid container alignItems="center" sx={{ paddingX: "2rem", paddingY: "1.2rem" }}>
        <Grid item xs={12} sm={3}>
          <Stack>
            <Typography variant="s1" color="text.white">
              {machineDetails.outletIndexName}
            </Typography>
            <Typography variant="p2" color="text.white">
              {outlet.name}
            </Typography>
            <Typography variant="p2" color="text.white">
              {outlet?.city?.state?.region?.name} - {outlet?.city?.state?.name} -{" "}
              {outlet?.city?.name}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={9} className={styles["machineLabelContainer"]} container>
          <Grid item xs={5} sm="auto" className={styles["machineLabel"]}>
            <Typography color="text.white" variant="s1">
              {machineDetails.machine.machineName}
            </Typography>
          </Grid>
          {dataCompletionCheck && (
            <Grid item xs={7} sm="auto" textAlign="center" paddingLeft="0.5rem">
              <img src={EllipseIcon} style={{ width: "0.9rem", height: "0.9rem" }} />
              <Typography variant="p1">Total: &nbsp;</Typography>
              <Typography variant="h7">{formatCurrency(machineTotal)}</Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    )
  }

  return (
    <Accordion className={styles["mappingAccordionContainer"]}>
      <AccordionSummary
        expandIcon={
          <Box className={styles["expandMoreIconStyle"]}>
            <ExpandMoreIcon fontSize="large" />
          </Box>
        }
        className={styles["mappingAccordionSummary"]}
        aria-controls="panel1a-content"
        id="panel1a-header">
        <SummaryComponent />
      </AccordionSummary>
      <AccordionDetails>
        <SubscriptionSetting index={index} />
      </AccordionDetails>
    </Accordion>
  )
}

export default AccordionComponent
