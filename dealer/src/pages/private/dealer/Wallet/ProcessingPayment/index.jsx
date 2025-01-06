/*eslint-disable no-unused-vars */

import React, { useEffect } from "react"
import { Box, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { userDetail } from "hooks/state"

const ProcessingPayment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = userDetail()

  useEffect(() => {
    // For testing
    const queryParams = new URLSearchParams(location.search)
    const txnID = queryParams.get("txnid")
  }, [location])

  const handleNavigate = () => {
    navigate(`/${user?.role}/wallet/transaction-history`)
  }

  return (
    <Box>
      <Box>Success Payment</Box>
      <Button variant="contained" onClick={handleNavigate}>
        Go To Home
      </Button>
    </Box>
  )
}

export default ProcessingPayment
