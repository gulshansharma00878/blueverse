import React from "react"
import { Box, Checkbox, FormControlLabel, Grid, Typography } from "@mui/material"
import styles from "./CreateRoleForm.module.scss"
import { capitalizeWords } from "helpers/Functions/captalizeWords"

function Permission(props) {
  const { name, item, handleCheckboxChange, handleModuleSelectAll, selectAllchecked } = props
  return (
    <Box sx={{ marginTop: "3.2rem" }}>
      <Typography variant="p1" className={styles.permission_title}>
        {capitalizeWords(name)}
      </Typography>
      <Box className={styles.permission_checkbox}>
        <Grid container rowGap="2rem">
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
                  checked={selectAllchecked ? selectAllchecked : false}
                  onChange={(e) => handleModuleSelectAll(e, item.name)}
                  disableRipple
                />
              }
              labelPlacement="end"
              label={<span className={styles.permission_label}>Select All</span>}
            />
          </Box>
          {Object.entries(item.permissions).map(([key, value], index) => (
            <Box key={index} className={styles.inner_grid_container}>
              <FormControlLabel
                control={
                  <Checkbox
                    // color={"primary"}
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
                    disableRipple
                    onChange={(e) => handleCheckboxChange(e, item.name, key)}
                  />
                }
                labelPlacement="end"
                label={<span className={styles.permission_label}>{capitalizeWords(key)}</span>}
              />
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default Permission
