import React from "react"
import Box from "@mui/material/Box"

export const TabPanel = (props) => {
  const { children, value, index, style, padding = 2, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={style}
      {...other}>
      {value === index && (
        <Box
          sx={{
            p: padding
          }}>
          {children}
        </Box>
      )}
    </div>
  )
}
