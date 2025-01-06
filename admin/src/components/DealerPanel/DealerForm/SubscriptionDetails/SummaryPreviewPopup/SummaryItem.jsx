import React from "react"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
// import Divider from "@mui/material/Divider"
// import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import styles from "./summaryItem.module.scss"
import { Stack } from "@mui/material"
import { formatCurrency } from "helpers/Functions/formatCurrency"
// import { getOrdinal } from "components/DealerPanel/dealerUtilities"
import moment from "moment"

const SummaryItem = ({ oemName, outletDetails, machineDetails, minPricePlan }) => {
  const ItemRow = ({ label, value }) => {
    return (
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="p1" color="text.gray" sx={{ fontWeight: "500" }}>
            {label}
          </Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Typography variant="s1" color="text.main">
            {value}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box className={styles.summaryBox}>
      <Grid container className={styles.summaryHeader}>
        <Grid item xs={6}>
          <Typography
            variant="s1"
            component="p"
            color="text.main">{`${outletDetails?.name}, ${oemName}`}</Typography>
          <Typography
            variant="p2"
            color="text.gray"
            component="p">{`${outletDetails?.city?.state?.region?.name}-${outletDetails?.city?.state?.name}-${outletDetails?.city?.name}`}</Typography>
          <Typography variant="p2" component="p" color="text.main">
            GSTIN {outletDetails?.gstNo}
          </Typography>
        </Grid>
        <Grid item xs={6} className={styles.machinesSection}>
          <Typography className={styles.machineBox} variant="s1">
            {machineDetails.machineName}
          </Typography>
        </Grid>
      </Grid>
      <Stack sx={{ marginTop: "2rem" }} spacing={2}>
        <ItemRow
          label="Washes Opted"
          value={machineDetails?.pricing_terms
            ?.filter((x) => x.isEnabled)
            .map((x) => x.plan.type)
            .join(", ")}
        />
        <ItemRow label="Minimum Wash Commitment" value={machineDetails?.minimum_wash_commitment} />
        <ItemRow
          label="Commencement Date"
          value={moment(machineDetails?.invoice_date).format("DD/MM/YYYY")}
        />
        <ItemRow
          label="Security Deposit"
          value={formatCurrency(machineDetails?.security_deposited)}
        />
        <ItemRow
          label={minPricePlan + " Price (Per Wash)"}
          value={formatCurrency(
            machineDetails?.pricing_terms?.find((x) => x?.plan?.type === minPricePlan)?.plan
              ?.dealerPerWashPrice
          )}
        />
        <ItemRow
          label="Manpower Price (Per Wash)"
          value={formatCurrency(
            machineDetails?.pricing_terms?.find((x) => x?.plan?.type === minPricePlan)?.plan
              ?.manpowerPricePerWash
          )}
        />
        <ItemRow label="Taxable Amount" value={formatCurrency(machineDetails?.taxable_amount)} />
        <ItemRow label="CGST (9%)" value={formatCurrency(machineDetails?.cgst)} />
        <ItemRow label="SGST (9%)" value={formatCurrency(machineDetails?.sgst)} />
      </Stack>
      <Grid container sx={{ marginTop: "2.8rem" }}>
        <Grid item xs={6}>
          <Typography variant="s1" color="text.main">
            Total Amount Paid
          </Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Typography variant="h6" color="text.main">
            {formatCurrency(machineDetails?.total)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SummaryItem
