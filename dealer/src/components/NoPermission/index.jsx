import React from "react"
import styles from "./NoPermission.module.scss"
import { Box } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
function NoPermission() {
  const navigate = useNavigate()
  const user = userDetail()
  const handleNavigate = () => {
    navigate(`/${user?.role}/dashboard`)
  }
  return (
    <Box className={styles.error_outer_container}>
      <Box className={styles.error_subtext}>No Permission</Box>
      <PrimaryButton sx={{ mt: "2rem" }} onClick={handleNavigate}>
        Back to Home
      </PrimaryButton>
    </Box>
  )
}

export default NoPermission
