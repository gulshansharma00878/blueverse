// INFO : This component will render module level permissions in VIEW-ONLY mode for individual user.
import React from "react"
import styles from "./modulePermissions.module.scss"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PermissionRow from "./PermissionsRow"

const ModulePermissions = ({ data }) => {
  return (
    <Box className={styles["outerContainer"]}>
      <Typography variant="h7" component="p" color="text.main">
        Module Level Permissions
      </Typography>
      {data?.map((x, index) => (
        <PermissionRow row={x} key={index} />
      ))}
    </Box>
  )
}

export default ModulePermissions
