import { Grid } from "@mui/material"
import AdminDashboard from "components/Dashboards/AdminDashboard"
import AreaManagerDashboard from "components/Dashboards/AreaManagerDashboard"
import OemManagerDashboard from "components/Dashboards/OemManagerDashboard"
import { userDetail } from "hooks/state"
import React from "react"

function Dashboard() {
  const user = userDetail()

  const getDashboard = (key) => {
    switch (key) {
      case "admin":
        return <AdminDashboard />
      case "areaManager":
        return <AreaManagerDashboard />
      case "oemManager":
        return <OemManagerDashboard />
      default:
        return <AdminDashboard />
    }
  }

  return <Grid>{getDashboard(user?.role)}</Grid>
}

export default Dashboard
