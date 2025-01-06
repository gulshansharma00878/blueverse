import React from "react"
import { Box, CircularProgress } from "@mui/material"

function AppLoader() {
  return (
    <Box
      style={{
        position: "fixed",
        zIndex: 5000,
        top: 0,
        left: 0,
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "rgba(0,0,0,0.2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
      <CircularProgress />
    </Box>
  )
}

export default AppLoader
