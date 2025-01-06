import React, { useState } from "react"
// import Box from "@mui/system/Box"
import { useStyles } from "./AccountSettingStyles.js"
import { Grid, Tab, Tabs } from "@mui/material"
import AccountProfile from "components/AccountSetting/AccountProfile/AccountProfile.jsx"
import OutletSubscription from "components/AccountSetting/Outlet/OutletSubscription.jsx"
import { userDetail } from "hooks/state.js"

const tabArr = ["Profile", "Outlet & Subscription", "Manage Payments"]

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      key={index}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ maxHeight: "75vh" }}>
      {value === index && <div style={{ overflow: "auto" }}>{children}</div>}
    </div>
  )
}

const AccountSetting = () => {
  const styles = useStyles()
  const [activeTab, setActiveTab] = useState(0)
  const user = userDetail()

  const handleChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    }
  }

  return (
    <Grid sx={{ borderColor: "divider", marginTop: "5rem", overflowX: "scroll" }}>
      <Grid sx={{ width: "75%" }}>
        {user?.role == "dealer" && (
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="fullWidth"
            sx={styles.tabContainer}>
            {tabArr.map((item, index) => {
              return (
                <Tab
                  key={index}
                  label={item}
                  sx={activeTab == index ? styles.activeTab : styles.inactiveTab}
                  {...a11yProps(index)}
                />
              )
            })}
          </Tabs>
        )}
      </Grid>
      <TabPanel value={activeTab} index={0}>
        <AccountProfile />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <OutletSubscription />
      </TabPanel>
    </Grid>
  )
}

export default AccountSetting
