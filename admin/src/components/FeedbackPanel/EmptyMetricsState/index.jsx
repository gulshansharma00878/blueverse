const { Typography } = require("@mui/material")
const { Box } = require("@mui/system")
import React from "react"
import "./EmptyMetricsState.scss"

const EmptyMetricState = () => {
  return (
    <Box className="empty-metric-state">
      <Typography variant="p1" component="p" color="text.gray" sx={{ margin: "auto" }}>
        No Response
      </Typography>
    </Box>
  )
}

export default EmptyMetricState
