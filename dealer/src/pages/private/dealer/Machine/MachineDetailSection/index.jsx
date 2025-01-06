import React, { useState, useEffect } from "react"
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material"
import { TabPanel } from "components/utitlities-components/TabPanel"
import MachineDetailHeader from "components/Machines/MachineDetailHeader"
import Matrix from "./Matrix"
import { ManageMachinesServices } from "network/manageMachinesServices"
import { useParams } from "react-router-dom"
import AppLoader from "components/Loader/AppLoader"
import MachineWashes from "./MachineWashes"
import MachineHealth from "./MachineHealth"
import WalletAgreement from "./WalletAgreement"
import ServiceRequest from "components/Machines/ServiceRequest"
import { convertToISO } from "helpers/app-dates/dates"
import { machineAction } from "redux/store"
import { useSelector, useDispatch } from "react-redux"
function MachineDetailSection() {
  const params = useParams()

  const dispatch = useDispatch()
  const activeTab = useSelector((state) => state?.machine?.activeTab)
  const [machineData, setMachineData] = useState()
  const [loader, setLoader] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [machineHealth, setMachineHealth] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  useEffect(() => {
    getMachineDeatail()
    getMachineHealth()
  }, [params?.machineId])

  const getMachineDeatail = async () => {
    setLoader(true)
    let param = [params?.machineId]
    console.log("param is", param)
    const machineResponse = await ManageMachinesServices.machineDetailsById(param[0])

    if (machineResponse.success && machineResponse.code === 200) {
      setMachineData(machineResponse?.data)
      setLoader(false)
    } else {
      setLoader(false)
    }
  }

  // For Machine Health Percentage
  const getMachineHealth = async () => {
    let param = [params?.machineId]
    const response = await ManageMachinesServices.machinesHealth(param)
    if (response.success && response.code === 200) {
      let totalCount = 0
      response?.data?.map((item) => {
        if (item?.Status == true) {
          totalCount++
        }
      })
      setMachineHealth(
        response?.data?.length <= 0 ? 0 : (totalCount / response?.data?.length) * 100
      )
    }
  }

  const handleChange = (event, newValue) => {
    dispatch(machineAction.setActiveTab(newValue))
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    }
  }

  return (
    <>
      {loader ? (
        <AppLoader />
      ) : (
        <Box>
          <MachineDetailHeader
            title={`${machineData?.name} Details`}
            dealer={machineData?.outlet?.dealer?.username}
            outlet={machineData?.outlet?.name}
            address={machineData?.outlet?.address}
            dateFilter={true}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            progressBarEnabled={true}
            progressBarValue={machineHealth}
          />
          <Box sx={{ borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleChange}
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
              variant={isMobile ? "scrollable" : "fullWidth"}
              sx={{ backgroundColor: "#F5F6F8" }}>
              <Tab
                label="Metrics"
                className={activeTab === 0 ? "tablabel_active" : "tablabel"}
                {...a11yProps(0)}
              />
              <Tab
                label="Health"
                className={activeTab === 1 ? "tablabel_active" : "tablabel"}
                {...a11yProps(1)}
              />
              <Tab
                label="Washes"
                className={activeTab === 2 ? "tablabel_active" : "tablabel"}
                {...a11yProps(2)}
              />
              <Tab
                label="Wallet & Agreement"
                className={activeTab === 3 ? "tablabel_active" : "tablabel"}
                {...a11yProps(3)}
              />
              <Tab
                label="Service Requests"
                className={activeTab === 4 ? "tablabel_active" : "tablabel"}
                {...a11yProps(4)}
              />
            </Tabs>
          </Box>
          <TabPanel value={activeTab} index={0} padding={0} style={{ paddingTop: "2rem" }}>
            <Matrix startDate={convertToISO(startDate)} endDate={convertToISO(endDate, true)} />
          </TabPanel>
          <TabPanel value={activeTab} index={1} padding={0} style={{ paddingTop: "2rem" }}>
            <MachineHealth machineId={params?.machineId} />
          </TabPanel>
          <TabPanel value={activeTab} index={2} padding={0} style={{ paddingTop: "2rem" }}>
            <MachineWashes
              startDate={convertToISO(startDate)}
              endDate={convertToISO(endDate, true)}
              machineId={params?.machineId}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={3} padding={0} style={{ paddingTop: "2rem" }}>
            <WalletAgreement
              startDate={convertToISO(startDate)}
              endDate={convertToISO(endDate, true)}
              machineId={params?.machineId}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={4} padding={0} style={{ paddingTop: "2rem" }}>
            <ServiceRequest
              startDate={convertToISO(startDate)}
              endDate={convertToISO(endDate, true)}
              machineName={machineData?.name}
            />{" "}
          </TabPanel>
        </Box>
      )}
    </>
  )
}

export default MachineDetailSection
