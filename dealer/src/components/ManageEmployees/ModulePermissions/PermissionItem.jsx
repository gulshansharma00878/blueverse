// INFO : This module will render one permission with its name and icon of being true or false
import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import styles from "./modulePermissions.module.scss"

const PermissionItem = ({ label, checked }) => {
  let icon = checked ? <CheckCircleIcon color="primary" /> : <CancelIcon color="error" />
  return (
    <Box className={styles["permissionItem"]}>
      <Typography variant="p2" component="p" color="text.main">
        {label}
      </Typography>
      <Box>{icon}</Box>
    </Box>
  )
}

export default PermissionItem
