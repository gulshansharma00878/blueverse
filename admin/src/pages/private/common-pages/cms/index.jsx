import React, { useState, useEffect } from "react"
import { Box, Typography, Tabs, Tab, Button } from "@mui/material"
import { TabPanel } from "components/utilities-components/TabPanel"
import PageDetails from "./pagedetails"
import StateDetails from "./statedetails"
import CitiesDetails from "./citiesdetails"
import OemDetails from "./oemdetails"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material"
import "./Cms.scss"
import CommonFooter from "components/utilities-components/CommonFooter"

function Cms() {
  const user = userDetail()
  const navigateTo = useNavigate()
  const activeTabIndex = useSelector((state) => state.cms.tabActive)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [activeTab, setActiveTab] = useState(0)
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getAllpermission()
  }, [activeTab])
  useEffect(() => {
    setActiveTab(activeTabIndex)
    getAllpermission()
  }, [activeTabIndex])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson
        if (activeTab === 0) {
          permissionJson = getPermissionJson(user, "cms pages")
        } else if (activeTab === 1) {
          permissionJson = getPermissionJson(user, "cms states")
        } else if (activeTab === 2) {
          permissionJson = getPermissionJson(user, "cms cities")
        } else if (activeTab === 3) {
          permissionJson = getPermissionJson(user, "cms oem")
        }
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }
  const navigate = (route) => {
    navigateTo(route)
  }

  const handleChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    }
  }

  const cmsHeader = (cmsName, btnName, route, btnState = true, btnDissable = false) => {
    const ActionButton = () => {
      return (
        <Button
          variant="contained"
          className="cms_button"
          fullWidth={isMobile}
          onClick={() => navigate(route)}
          disabled={btnDissable}>
          {btnName}
        </Button>
      )
    }
    return (
      <>
        <Box className="cms_header">
          <Typography variant="h6">{cmsName}</Typography>
          {btnState && isMobile ? (
            <CommonFooter>
              <ActionButton />
            </CommonFooter>
          ) : btnState && !isMobile ? (
            <ActionButton />
          ) : null}
        </Box>
      </>
    )
  }

  return (
    <Box>
      <Typography variant="h6">Manage CMS</Typography>
      <Box className="cms_container">
        <Box sx={{ borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            variant={isMobile ? "scrollable" : "fullWidth"}
            sx={{
              backgroundColor: theme.palette.background.gray6
            }}
            className="cms_container_tab">
            <Tab
              label="Pages"
              className={activeTab === 0 ? "tablabel_active" : "tablabel"}
              {...a11yProps(0)}
            />
            <Tab
              label="States"
              className={activeTab === 1 ? "tablabel_active" : "tablabel"}
              {...a11yProps(1)}
            />
            <Tab
              label="Cities"
              className={activeTab === 2 ? "tablabel_active" : "tablabel"}
              {...a11yProps(2)}
            />
            <Tab
              label="OEM"
              className={activeTab === 3 ? "tablabel_active" : "tablabel"}
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <TabPanel value={activeTab} index={0} padding={0}>
          <Box className="cms_tabel_box">
            {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
              ""
            ) : (
              <>
                {cmsHeader("Page Details", "", `/${user?.role}/cms/create-page`, false)}
                <PageDetails subAdminPermission={subAdminPermission} />
              </>
            )}
          </Box>
        </TabPanel>
        <TabPanel value={activeTab} index={1} padding={0}>
          <Box className="cms_tabel_box">
            {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
              ""
            ) : (
              <>
                {cmsHeader(
                  "States Details",
                  "Add New State",
                  `/${user?.role}/cms/create-state`,
                  true,
                  user.role === "subadmin" && !subAdminPermission?.createPermission
                )}
                <StateDetails subAdminPermission={subAdminPermission} />
              </>
            )}
          </Box>
        </TabPanel>
        <TabPanel value={activeTab} index={2} padding={0}>
          <Box className="cms_tabel_box">
            {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
              ""
            ) : (
              <>
                {cmsHeader(
                  "Cities Details",
                  "Add New City",
                  `/${user?.role}/cms/create-cities`,
                  true,
                  user.role === "subadmin" && !subAdminPermission?.createPermission
                )}
                <CitiesDetails subAdminPermission={subAdminPermission} />
              </>
            )}
          </Box>
        </TabPanel>
        <TabPanel value={activeTab} index={3} padding={0}>
          <Box className="cms_tabel_box">
            {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
              ""
            ) : (
              <>
                {cmsHeader(
                  "OEM Details",
                  "Add New OEM",
                  `/${user?.role}/cms/create-oem`,
                  true,
                  user.role === "subadmin" && !subAdminPermission?.createPermission
                )}
                <OemDetails subAdminPermission={subAdminPermission} />
              </>
            )}
          </Box>
        </TabPanel>
      </Box>
    </Box>
  )
}

export default Cms
