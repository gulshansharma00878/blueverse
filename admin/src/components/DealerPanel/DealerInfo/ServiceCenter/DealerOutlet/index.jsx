import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material"
import React from "react"
import CommonDataCard from "./CommonDataCard"
import { useStyles } from "./DealerOuletStyles"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import AccordionData from "../AccordionData"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import AccordionIcon from "assets/images/icons/accordionIcon.svg"

function DealerOutlet({ item }) {
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  // Top header of box

  const serviceData = [
    { heading: "Service Centre name", value: item?.name },
    { heading: "GSTIN", value: item?.gstNo || "- -" },
    { heading: "Region", value: item?.city?.state?.region?.name || "- -" },
    { heading: "State", value: item?.city?.state?.name || "- -" },
    { heading: "City", value: item?.city?.name || "- -" },
    { heading: "Full Address", value: item?.address || "- -" }
  ]

  // machines ..
  const totalSection = (val) => (
    <Box sx={styles.amountBox}>
      {!isMobile && (
        <Box sx={styles.machineAgreement}>
          <FiberManualRecordIcon />
        </Box>
      )}
      <Box>
        <Typography variant="p1">Total: </Typography>
        <Typography style={{ marginLeft: "4px" }} variant="h7">
          {formatCurrency(val?.machineSubscriptionSetting?.total, "INR ")}
        </Typography>
      </Box>
    </Box>
  )
  return (
    <Grid container direction="column" sx={styles.mainOutletBox}>
      <Grid>
        <Typography variant="h7">Service Centre Info</Typography>
      </Grid>
      <Grid style={{ marginTop: "20px" }} container>
        {serviceData?.map((item, index) => {
          return (
            <Grid item xs={isMobile ? 12 : 4} key={index}>
              <CommonDataCard value1={item?.heading} value2={item?.value} />
            </Grid>
          )
        })}
      </Grid>
      <Grid sx={styles.machineBox}>
        {item?.machines?.map((val, index) => {
          return (
            <Accordion key={index} sx={styles.mappingAccordionContainer}>
              <Box sx={styles.mappingAccordionSummary}>
                <AccordionSummary
                  expandIcon={
                    <Box sx={styles.expandMoreIconStyle}>
                      <img src={AccordionIcon} />
                    </Box>
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  sx={{ padding: "0px" }}>
                  <Stack sx={styles.machineLabelContainer}>
                    <Box sx={styles.machineLabel}>
                      <Typography color="text.white" variant="s1">
                        {val?.name}
                      </Typography>
                    </Box>
                    <Box sx={styles.machineAgreement}>
                      <Typography color="text.white" variant="s1">
                        Price Agreement
                      </Typography>
                    </Box>
                    {isMobile ? null : totalSection(val)}
                  </Stack>
                </AccordionSummary>
                <Box> {isMobile ? totalSection(val) : null}</Box>
              </Box>
              <AccordionDetails>
                <AccordionData data={val} />
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Grid>
    </Grid>
  )
}

export default DealerOutlet
