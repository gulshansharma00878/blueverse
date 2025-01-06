// INFO : Utility component for analytics which will ensure same styling for all feedback analytics cards.

import Box from "@mui/system/Box"
import Typography from "@mui/material/Typography"
import React from "react"
import "./MetricsCard.scss"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Stack from "@mui/system/Stack"

const MetricsCard = ({
  questionNo,
  questionTitle,
  responseCount,
  viewAllHandler,
  isChart = true,
  children,
  isMobile
}) => {
  const clickHandler = () => {
    viewAllHandler()
  }
  return (
    <Paper className="metric-card" elevation={3}>
      <Stack spacing={1}>
        <Typography sx={{ color: "text.gray2" }} variant="p1" component="p">
          Question {questionNo}
        </Typography>
        <Grid container justifyContent="space-between">
          <Grid item xs={8}>
            <Typography variant={isMobile ? "h7" : "p1"} sx={{ color: "text.main" }}>
              {questionTitle}
            </Typography>
          </Grid>
          {responseCount > 0 && (
            <Grid item xs={4} sx={{ textAlign: "right" }}>
              <Typography
                variant="p1"
                sx={{ color: "primary.main" }}
                onClick={clickHandler}
                className="cusror-pointer">
                View All
              </Typography>
            </Grid>
          )}
        </Grid>
        <Typography sx={{ color: "text.main" }} variant="p1" component="p">
          {`(${responseCount} ${responseCount > 1 ? "responses" : "response"})`}
        </Typography>
        <Box className={`chart ${!isChart && "feedback-response"}`}>{children}</Box>
      </Stack>
    </Paper>
  )
}

export default MetricsCard
