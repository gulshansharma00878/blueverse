// INFO : This compnent will render row for individual module
import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PermissionItem from "./PermissionItem"
import styles from "./modulePermissions.module.scss"

const permissionsArrayMap = {
  exportPermission: "Export",
  createPermission: "Create",
  deletePermission: "Delete",
  updatePermission: "Edit",
  viewPermission: "View"
}

const PermissionRow = ({ row }) => {
  let permissionsArray = []

  if (row?.permissionObj) {
    permissionsArray = Object.keys(row?.permissionObj)?.map((key) => {
      let temp = {
        label: permissionsArrayMap[key],
        checked: row?.permissionObj[key]
      }

      return temp
    })
  }

  return (
    <Box sx={{ marginTop: "2rem" }}>
      <Typography variant="p1" component="p" color="text.gray">
        {row?.module?.name}
      </Typography>
      <Box className={styles["row"]}>
        {permissionsArray.map((x, index) => (
          <PermissionItem label={x?.label} checked={x?.checked} key={index} />
        ))}
      </Box>
    </Box>
  )
}

export default PermissionRow
