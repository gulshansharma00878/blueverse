import React, { useState, useEffect } from "react"
import { Box, IconButton, Tab, Tabs, Typography, useMediaQuery, useTheme } from "@mui/material"
import { TabPanel } from "components/utilities-components/TabPanel"
import MachineDetailHeader from "components/ManageMachine/MachineDetailHeader"
import Matrix from "./Matrix"
import WalletAgreement from "./WalletAgreement"
import ServiceRequest from "./ServiceRequest"
import MachineHealth from "./MachineHealth"
import { ManageMachinesServices } from "network/manageMachinesServices"
import { useParams } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import MachineWashes from "./MachineWashes"
import { useStyles } from "./../ManageMachinesStyles"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"
import { convertToISO } from "helpers/app-dates/dates"
import { FeedBackService } from "network/feedbackService"
import { feedBackActions, machineAction } from "redux/store"
import { sortMappedForms } from "pages/private/admin/Feedback/feedBackUtility"
import Toast from "components/utilities-components/Toast/Toast"
import { useSelector, useDispatch } from "react-redux"
function MachineDetailSection() {
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const params = useParams()
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const activeTab = useSelector((state) => state?.machine?.activeTab)
  const [machineData, setMachineData] = useState()
  const [loader, setLoader] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [machineHealth, setMachineHealth] = useState(0)
  useEffect(() => {
    getMachineDeatail()
    getMachineHealth()
  }, [params?.machineId])

  const getMachineDeatail = async () => {
    setLoader(true)
    let param = [params?.machineId]
    const machineResponse = await ManageMachinesServices.machineDetailsById(param)

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

  const handleNavigate = async (e, formId) => {
    setLoader(true)
    const response = await FeedBackService.getFormsList()
    if (response?.success && response?.code === 200) {
      const filteredListing = response?.data?.feedbacks.filter((item) => item.formId === formId)
      if (filteredListing && filteredListing.length > 0) {
        const sortedData = sortMappedForms(filteredListing)
        dispatch(feedBackActions.setFormDetails(sortedData[0]))
        navigate(`/${user?.role}/feedback/feedback-response/${formId}`)
      } else {
        Toast.showErrorToast("Feedback not found")
      }
      setLoader(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoader(false)
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
          {machineData?.responseReceivedCount > 0 ? (
            <>
              <Box sx={styles.feedback_box}>
                <Typography variant="p1" sx={{ fontWeight: 700 }}>
                  View feedbacks
                </Typography>
                <IconButton
                  sx={styles.icon_box}
                  disableRipple
                  onClick={(e) => handleNavigate(e, machineData?.feedbackFormId)}>
                  <ArrowForwardIosIcon sx={styles.arrow_icon} />
                </IconButton>
              </Box>
            </>
          ) : (
            " "
          )}
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
            />
          </TabPanel>
        </Box>
      )}
    </>
  )
}

export default MachineDetailSection
