import React, { useState, useEffect } from "react"
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material"
import styles from "./BillingAccounting.module.scss"
import { TabPanel } from "components/utilities-components/TabPanel"
import AdvanceMemo from "./advanceMemo"
import TaxInvoice from "./taxInvoice"
import BlueVerseCredit from "./blueVerseCredits"
import TopUpMemo from "./topUpMemo"
import { useSelector } from "react-redux"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"

function BillingAccounting() {
  const user = userDetail()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const activeTabIndex = useSelector((state) => state.billing.billingTabActive)
  const [activeBillTab, setActiveBillTab] = useState(0)
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getAllpermission()
  }, [activeBillTab])

  useEffect(() => {
    setActiveBillTab(activeTabIndex)
  }, [activeTabIndex])

  const handleChange = (event, newValue) => {
    setActiveBillTab(newValue)
  }

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson
        if (activeBillTab === 0) {
          permissionJson = getPermissionJson(user, "Billing & Accounting Advance Memo")
        } else if (activeBillTab === 1) {
          permissionJson = getPermissionJson(user, "Billing & Accounting Top Up Memo")
        } else if (activeBillTab === 2) {
          permissionJson = getPermissionJson(user, "Billing & Accounting Tax Invoice")
        } else if (activeBillTab === 3) {
          permissionJson = getPermissionJson(user, "Billing & Accounting Blueverse credits")
        }
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    }
  }

  return (
    <Box>
      <Box className={styles.box_container}>
        <Box sx={{ borderColor: "divider" }}>
          <Tabs
            value={activeBillTab}
            onChange={handleChange}
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            variant={isMobile ? "scrollable" : "fullWidth"}
            sx={{ backgroundColor: theme.palette.background.gray6 }}>
            <Tab
              label="Advance Memo"
              className={activeBillTab === 0 ? styles.tablabel_active : styles.tablabel}
              {...a11yProps(0)}
            />
            <Tab
              label="Top Up Memo"
              className={activeBillTab === 1 ? styles.tablabel_active : styles.tablabel}
              {...a11yProps(1)}
            />
            <Tab
              label="Tax Invoice"
              className={activeBillTab === 2 ? styles.tablabel_active : styles.tablabel}
              {...a11yProps(2)}
            />
            <Tab
              label="BlueVerse Credits"
              className={activeBillTab === 3 ? styles.tablabel_active : styles.tablabel}
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <TabPanel value={activeBillTab} index={0} padding={0}>
          {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
            ""
          ) : (
            <>
              <Box className={styles.billingBox}>
                <AdvanceMemo subAdminPermission={subAdminPermission} />
              </Box>
            </>
          )}
        </TabPanel>
        <TabPanel value={activeBillTab} index={1} padding={0}>
          {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
            ""
          ) : (
            <>
              <Box className={styles.billingBox}>
                <TopUpMemo subAdminPermission={subAdminPermission} />
              </Box>
            </>
          )}
        </TabPanel>
        <TabPanel value={activeBillTab} index={2} padding={0}>
          {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
            ""
          ) : (
            <>
              <Box className={styles.billingBox}>
                <TaxInvoice subAdminPermission={subAdminPermission} />
              </Box>
            </>
          )}
        </TabPanel>
        <TabPanel value={activeBillTab} index={3} padding={0}>
          {user.role === "subadmin" && !subAdminPermission?.viewPermission ? (
            ""
          ) : (
            <>
              <Box className={styles.billingBox}>
                <BlueVerseCredit subAdminPermission={subAdminPermission} />
              </Box>
            </>
          )}
        </TabPanel>
      </Box>
    </Box>
  )
}

export default BillingAccounting
