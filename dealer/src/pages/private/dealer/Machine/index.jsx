import { TabContext, TabPanel } from "@mui/lab"
import { Divider, Grid, Tab, Tabs } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useStyles } from "./MachineStyles"
import AllMachines from "components/Machines/AllMachines"
import AllServiceRequests from "components/Machines/AllServiceRequests"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { useDispatch } from "react-redux"
import { machineAction } from "redux/store"
function Machines() {
  const styles = useStyles()
  const user = userDetail()

  const [activeTab, setActiveTab] = useState("0")
  const [machinePermission, setMachinePermission] = useState()
  const [servicePermission, setServicePermission] = useState()
  const dispatch = useDispatch()
  useEffect(() => {
    getAllpermission()
  }, [])

  const handleChange = (event, newValue) => {
    setActiveTab(newValue)
    dispatch(machineAction.setActiveTab(0))
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    }
  }

  async function getAllpermission() {
    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "machine details")
        setMachinePermission(permissionJson?.permissionObj)
      }

      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "service request")
        setServicePermission(permissionJson?.permissionObj)
      }
    }
  }

  return (
    <TabContext value={activeTab}>
      <Grid
        style={{
          boxShadow: " 0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)"
        }}
        container>
        <Grid xs={12} item>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="fullWidth">
            <Tab
              label="All Machines"
              sx={activeTab === "0" ? styles.activeTab : styles.inactiveTab}
              {...a11yProps(0)}
              value="0"
            />
            <Tab
              label="Service Request"
              sx={activeTab === "1" ? styles.activeTab : styles.inactiveTab}
              {...a11yProps(1)}
              value="1"
            />
          </Tabs>
          <Divider />
        </Grid>

        <TabPanel value="0" index="0" padding={0} style={{ paddingTop: "2rem", width: "100%" }}>
          {user?.role == "employee" ? (
            machinePermission?.viewPermission ? (
              <AllMachines />
            ) : (
              false
            )
          ) : (
            <AllMachines />
          )}
        </TabPanel>
        <TabPanel value="1" index="1" padding={0} style={{ paddingTop: "2rem", width: "100%" }}>
          {user?.role == "employee" ? (
            servicePermission?.viewPermission ? (
              <AllServiceRequests permission={servicePermission} />
            ) : (
              false
            )
          ) : (
            <AllServiceRequests permission={servicePermission} />
          )}
        </TabPanel>
      </Grid>
    </TabContext>
  )
}

export default Machines
