import React from "react"
import { Box, Checkbox, FormControlLabel, Grid, Typography } from "@mui/material"
import styles from "./CreateRoleForm.module.scss"
import { checkAndModifyString } from "helpers/Functions/roleFunction"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import CancelRoundedIcon from "@mui/icons-material/CancelRounded"
import { capitalizeWords } from "helpers/Functions/captalizeWords"

function EditPermission(props) {
  const { name, item, handleCheckboxChange, handleModuleSelectAll, selectAllchecked, isEdit } =
    props
  return (
    <Box sx={{ marginTop: "3.2rem" }}>
      <Typography variant="p1" className={styles.permission_title}>
        {capitalizeWords(name)}
      </Typography>
      <Box className={styles.permission_checkbox}>
        <Grid container rowGap="2rem">
          {isEdit && (
            <Box className={styles.inner_grid_container}>
              <FormControlLabel
                control={
                  <Checkbox
                    className={styles.checkbox_icon}
                    sx={{
                      transform: "scale(0.8)",
                      "& .MuiSvgIcon-root": {
                        fontSize: 24,
                        color: selectAllchecked ? "primary" : "background.grey5"
                      }
                    }}
                    disableRipple
                    checked={selectAllchecked ? selectAllchecked : false}
                    onChange={(e) => handleModuleSelectAll(e, name)}
                  />
                }
                labelPlacement="end"
                label={<span className={styles.permission_label}>Select All</span>}
              />
            </Box>
          )}

          {item?.permissionObj &&
            Object.entries(item?.permissionObj).map(([key, value], index) => (
              <Box key={index} className={styles.inner_grid_container}>
                {isEdit ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        className={styles.checkbox_icon}
                        size="large"
                        sx={{
                          transform: "scale(0.8)",
                          "& .MuiSvgIcon-root": {
                            fontSize: 24,
                            color: value ? "primary" : "background.grey5"
                          }
                        }}
                        checked={value}
                        onChange={(e) => handleCheckboxChange(e, name, key)}
                        disableRipple
                      />
                    }
                    labelPlacement="end"
                    label={
                      <span className={styles.permission_label}>{checkAndModifyString(key)}</span>
                    }
                  />
                ) : (
                  <Box className={styles.option_box}>
                    {value === true ? (
                      <CheckCircleRoundedIcon color="primary" fontSize="large" />
                    ) : (
                      <CancelRoundedIcon className={styles.cancel_icon} fontSize="large" />
                    )}
                    <Typography variant="p2">{checkAndModifyString(key)}</Typography>
                  </Box>
                )}
              </Box>
            ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default EditPermission
