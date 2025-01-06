import React, { useEffect, useState } from "react"
import { Typography } from "@mui/material"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import { useStyles } from "../walletComponentStyles"
import { Box } from "@mui/system"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
const WalletHistoryCard = (props) => {
  const { monthlyAgreement, handleAddMoneyPopup } = props
  const styles = useStyles()
  const user = userDetail()

  const [employeePermission, setEmployeePermission] = useState()

  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "wallet")
        setEmployeePermission(permissionJson?.permissionObj)
      }
    }
  }

  return (
    <Box sx={[styles?.displayFlex, styles?.fullWidth, styles?.justifyEnd]}>
      <Box>
        <Typography sx={[styles?.monthlyTitle]}>Monthly Agreement</Typography>
        <Typography sx={[styles?.monthlyCost]}>{monthlyAgreement} (Incl. GST)</Typography>
      </Box>
      <Box>
        {user?.role == "employee" ? (
          employeePermission?.payPermission ? (
            <PrimaryButton style={{ ...styles?.walletHistoryButton }} onClick={handleAddMoneyPopup}>
              Add Money
            </PrimaryButton>
          ) : null
        ) : (
          <PrimaryButton style={{ ...styles?.walletHistoryButton }} onClick={handleAddMoneyPopup}>
            Add Money
          </PrimaryButton>
        )}
      </Box>
    </Box>
  )
}

export default WalletHistoryCard
