// INFO : This component will render summary for each machine
import React from "react"
import Grid from "@mui/material/Grid"
import styles from "./machineSummary.module.scss"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import { useMediaQuery } from "@mui/material"

const MachineSummary = ({ taxableAmount, cgst, sgst, total }) => {
  const isMobile = useMediaQuery("(max-width:600px)")

  const PriceRow = (props) => {
    return (
      <Grid container className={styles["priceRow"]}>
        <Grid item xs={6}>
          <Typography color="text.gray" variant="p1">
            {props.value1}
          </Typography>
        </Grid>
        <Grid item xs={6} textAlign={{ xs: "right", sm: "center" }}>
          <Typography variant="s1" color="text.main">
            {props.value2}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid className={styles["outletSummaryBox"]} container>
      <Grid xs={12} sm={5.5}>
        <Stack spacing={1}>
          <PriceRow value1="Gross Amount" value2={formatCurrency(taxableAmount, "INR ")} />
          <PriceRow value1="CGST (9%)" value2={formatCurrency(cgst)} />
          <PriceRow value1="SGST 9%)" value2={formatCurrency(sgst)} />
        </Stack>
      </Grid>
      <Grid xs={12} sm={1}>
        <Divider orientation={isMobile ? "hortizontal" : "vertical"} />
      </Grid>
      <Grid xs={12} sm={5.5}>
        <Box className={styles["minimumGuaranteeText"]}>
          <Typography variant="p1" color="text.main">
            Minimum guarantee On Monthly Wash Revenue(Per Machine):
          </Typography>
        </Box>
        <Box className={styles["totalAmountBox"]}>
          <Typography variant="h7" color="text.white">
            {formatCurrency(total)}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

export default MachineSummary
