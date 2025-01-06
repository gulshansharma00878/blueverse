import React from "react"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import moment from "moment/moment"
import { Box } from "@mui/material"

const FooterSection = ({ props }) => {
  const {
    formName,
    region,
    state,
    city,
    oemName,
    outletName,
    agentName,
    machine,
    qrGeneratedDateTime,
    feedbackSubmittedDateTime
  } = props

  const getFormattedTimestamp = (dateTime) => {
    if (dateTime) {
      return moment(dateTime).format("DD/MM/YYYY h:mm A")
    }
  }
  return (
    <Grid container justifyContent="space-between">
      <Grid item xs={6}>
        <Stack spacing={0.5}>
          <Typography variant="p2" color="text.main" component="p">
            {`${formName} feedback`}
          </Typography>
          <Typography variant="p2" color="text.gray" component="p" sx={{ fontWeight: "700" }}>
            {`${region}-${state}-${city}`}
          </Typography>
          <Typography variant="p2" color="text.gray" component="p">
            {oemName}
          </Typography>
          <Typography variant="p3" color="text.gray" component="p">
            {outletName}
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack sx={{ textAlign: "right", marginTop: "4px" }} spacing={0.5}>
          <Typography variant="p3" color="text.main" component="p" sx={{ fontWeight: "700" }}>
            Agent Name : {agentName}
          </Typography>
          <Typography variant="p3" color="text.gray" component="p">
            Machine: {machine}
          </Typography>
          <Box>
            <Typography variant="p3" color="text.gray">
              QR generated on:&nbsp;&nbsp;
            </Typography>
            <Typography variant="p3" color="text.main">
              {getFormattedTimestamp(qrGeneratedDateTime)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="p3" color="text.gray">
              Feedback submitted on:&nbsp;&nbsp;
            </Typography>
            <Typography variant="p3" color="text.main">
              {getFormattedTimestamp(feedbackSubmittedDateTime)}
            </Typography>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default FooterSection
