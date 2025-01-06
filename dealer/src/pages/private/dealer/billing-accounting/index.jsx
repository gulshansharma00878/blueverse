import React, { useEffect, useState } from "react"
import { Box, Tab, Tabs, Typography } from "@mui/material"
import styles from "./BillingAccounting.module.scss"
import { TabPanel } from "components/utitlities-components/TabPanel"
import AdvanceMemo from "./advanceMemo"
import TaxInvoice from "./taxInvoice"
import BlueVerseCredit from "./blueVerseCredits"
import TopUpMemo from "./topUpMemo"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import LightTooltip from "components/utitlities-components/LightTooltip"
import InfoIcon from "@mui/icons-material/Info"
import { useSelector } from "react-redux"

function BillingAccounting() {
  const user = userDetail()
  const activeTabIndex = useSelector((state) => state.billing.billingTabActive)

  const [activeBillTab, setActiveBillTab] = useState(0)
  const [employeePermission, setEmployeePermission] = useState({
    advance: {},
    topup: {},
    taxInvoice: {},
    blueverseCredit: {}
  })

  useEffect(() => {
    getAllpermission()
  }, [activeBillTab])

  useEffect(() => {
    setActiveBillTab(activeTabIndex)
  }, [activeTabIndex])

  const handleChange = (event, newValue) => {
    setActiveBillTab(newValue)
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    }
  }

  async function getAllpermission() {
    if (user.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "Billing & Accounting Advance Memo")
        let topupPermissionJson = getPermissionJson(user, "Billing & Accounting Top Up Memo")
        let taxInvoicePermissionJson = getPermissionJson(user, "Billing & Accounting Tax Invoice")
        let creditPermissionJson = getPermissionJson(user, "Billing & Accounting Blueverse credits")

        setEmployeePermission({
          ...employeePermission,
          advance: permissionJson?.permissionObj,
          topup: topupPermissionJson?.permissionObj,
          taxInvoice: taxInvoicePermissionJson?.permissionObj,
          blueverseCredit: creditPermissionJson?.permissionObj
        })
      }
    }
  }

  return (
    <Box>
      <Box className={styles.box_container}>
        <Box sx={{ borderColor: "divider" }}>
          <Tabs
            value={activeBillTab}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="fullWidth"
            sx={{ backgroundColor: "#F5F6F8" }}>
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
              label=<div
                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography
                  variant="p1"
                  color="text.secondary"
                  marginTop={"0.2rem"}
                  marginRight={"0.2rem"}
                  fontSize={"1.6rem"}
                  fontWeight={500}
                  lineHeight={"20px"}>
                  Blueverse Credit
                </Typography>
                <LightTooltip
                  title={
                    <Typography variant="p1" color="text.main">
                      1 BlueVerse Credit = 1 Rupee
                    </Typography>
                  }>
                  <InfoIcon color="primary" sx={styles.infoBox} />
                </LightTooltip>
              </div>
              className={activeBillTab === 3 ? styles.tablabel_active : styles.tablabel}
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>

        {user?.role == "employee" ? (
          employeePermission?.advance?.viewPermission ? (
            <TabPanel value={activeBillTab} index={0}>
              <Box className={styles.billingBox}>
                <AdvanceMemo employeePermission={employeePermission?.advance} role={user?.role} />
              </Box>
            </TabPanel>
          ) : null
        ) : (
          <TabPanel value={activeBillTab} index={0}>
            <Box className={styles.billingBox}>
              <AdvanceMemo />
            </Box>
          </TabPanel>
        )}
        {user?.role == "employee" ? (
          employeePermission?.topup?.viewPermission ? (
            <TabPanel value={activeBillTab} index={1}>
              <Box className={styles.billingBox}>
                <TopUpMemo employeePermission={employeePermission?.topup} role={user?.role} />
              </Box>
            </TabPanel>
          ) : null
        ) : (
          <TabPanel value={activeBillTab} index={1}>
            <Box className={styles.billingBox}>
              <TopUpMemo />
            </Box>
          </TabPanel>
        )}

        {user?.role == "employee" ? (
          employeePermission?.taxInvoice?.viewPermission ? (
            <TabPanel value={activeBillTab} index={2}>
              <Box className={styles.billingBox}>
                <TaxInvoice employeePermission={employeePermission?.taxInvoice} role={user?.role} />
              </Box>
            </TabPanel>
          ) : null
        ) : (
          <TabPanel value={activeBillTab} index={2}>
            <Box className={styles.billingBox}>
              <TaxInvoice />
            </Box>
          </TabPanel>
        )}

        {user?.role == "employee" ? (
          employeePermission?.blueverseCredit?.viewPermission ? (
            <TabPanel value={activeBillTab} index={3}>
              <Box className={styles.billingBox}>
                <BlueVerseCredit employeePermission={employeePermission?.blueverseCredit} />
              </Box>
            </TabPanel>
          ) : null
        ) : (
          <TabPanel value={activeBillTab} index={3}>
            <Box className={styles.billingBox}>
              <BlueVerseCredit />
            </Box>
          </TabPanel>
        )}
      </Box>
    </Box>
  )
}

export default BillingAccounting
