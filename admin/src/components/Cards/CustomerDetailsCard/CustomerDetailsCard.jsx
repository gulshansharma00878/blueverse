import { Typography, Stack } from "@mui/material"
import React from "react"

const CustomerDetailsCard = ({ name, mobileNumber, email }) => {
  return (
    <Stack sx={{ color: "text.gray" }} spacing={0.25}>
      <Typography variant="p2">{name}</Typography>
      <Typography variant="p2">{mobileNumber}</Typography>
      <Typography variant="p2">{email}</Typography>
    </Stack>
  )
}

export default CustomerDetailsCard
