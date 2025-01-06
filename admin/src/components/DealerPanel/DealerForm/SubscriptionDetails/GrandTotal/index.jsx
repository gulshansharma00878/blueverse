// INFO : This component will render grand total ( summary ) when all outlets price data is filled.
import React from "react"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { Stack } from "@mui/material"
import "./grandTotal.scss"
import { useSelector } from "react-redux"
import { formatCurrency } from "helpers/Functions/formatCurrency"

const GrandTotal = () => {
  const subscriptionDetails = useSelector((state) => state.dealer.subscriptionDetails)

  const ItemRow = ({ leftPart, rightPart }) => {
    return (
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="s1">{leftPart}</Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Typography variant="h7"> {formatCurrency(rightPart)}</Typography>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box className="grandTotalContainer">
      <Typography variant="h6" sx={{ fontWeight: "700" }}>
        Total
      </Typography>
      <Box className="dottedDivider"></Box>
      <Stack spacing={1}>
        {subscriptionDetails.map((x, index) => (
          <ItemRow
            leftPart={`${index + 1}. ${x?.outletName}: ${x?.machine?.machineName}`}
            rightPart={x?.machine?.total}
            key={index}
          />
        ))}
      </Stack>
      <Box className="dottedDivider"></Box>
      <Grid container alignItems="center">
        <Grid item xs={6}>
          <Typography variant="h5" sx={{ fontWeight: "700" }}>
            Grand Total
          </Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: "right" }}>
          <Typography variant="h5" sx={{ fontWeight: "700" }} component="p">
            {subscriptionDetails.length
              ? formatCurrency(
                  subscriptionDetails
                    .map((x) => (x.machine.total ? x.machine.total : 0))
                    .reduce((x, y) => parseInt(x) + parseInt(y))
                )
              : formatCurrency(0)}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "700" }} component="p">
            (Inc. GST)
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

export default GrandTotal
