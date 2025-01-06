import React from "react"
import { Box, Typography } from "@mui/material"
import styles from "./CreateRoleForm.module.scss"
import { dateMonthFormat } from "helpers/app-dates/dates"
import EditPermission from "./EditPermission"
import { capitalizeWords } from "helpers/Functions/captalizeWords"
function ViewRoleForm({ subRoleDetail }) {
  return (
    <Box>
      <Box className={styles.viewrole_box}>
        <Box className={styles.viewdetail_box}>
          <Box className={styles.typography_box}>
            <Typography variant="p1" className={styles.permission_title}>
              Role Name
            </Typography>
            <Typography variant="s1" component={"div"}>
              {subRoleDetail?.name}
            </Typography>
          </Box>
          <Box className={styles.typography_box}>
            <Typography variant="p1" className={styles.permission_title}>
              Description
            </Typography>
            <Typography variant="s1" component={"div"}>
              {subRoleDetail?.description || "N.A."}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.viewdetail_box}>
          <Box className={styles.typography_box}>
            <Typography variant="p1" className={styles.permission_title}>
              Status
            </Typography>
            <Typography variant="s1" component={"div"}>
              {subRoleDetail?.isActive === true ? "Active" : "In-Active"}
            </Typography>
          </Box>
          <Box className={styles.typography_box}>
            <Typography variant="p1" className={styles.permission_title}>
              Created date
            </Typography>
            <Typography variant="s1" component={"div"}>
              {dateMonthFormat(subRoleDetail?.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={styles.permission_box}>
        <Box className={styles.permission_header}>
          <Typography variant="h7">Module Level Permissions</Typography>
        </Box>
        <Box className={styles.checkbox_box_container}>
          <Box className={styles.permission_list_container}>
            {subRoleDetail?.permission &&
              subRoleDetail?.permission.length > 0 &&
              subRoleDetail?.permission.map((item, index) => (
                <EditPermission
                  key={index}
                  name={capitalizeWords(item?.module?.name)}
                  item={item}
                  isEdit={false}
                />
              ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ViewRoleForm
