import { Stack, Typography } from "@mui/material"
import React from "react"
import "./WashDetailsCard.scss"
import WashTypeFlag from "components/utilities-components/WashTypeFlag"
const DetialsCard = ({ washType, manufacturer, bikeModel, bikeNumber, generatedDate }) => {
  return (
    <Stack spacing={0.5} sx={{ textAlign: "right", color: "text.gray" }}>
      {washType && (
        <WashTypeFlag rightPosition={true} withWash={false} washType={washType} alignEnd={true} />
      )}
      <Typography variant="p3">{bikeNumber}</Typography>
      <Typography variant="p3">
        {manufacturer} {bikeModel}
      </Typography>
      <Typography variant="p3">{generatedDate}</Typography>
    </Stack>
  )
}

export default DetialsCard
