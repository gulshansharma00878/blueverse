import React, { useState, useEffect } from "react" // , { useState }
import Accordion from "@mui/material/Accordion"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import Drawer from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import Toast from "components/utilities-components/Toast/Toast"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility.js"
import CloseIcon from "@mui/icons-material/Close"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import useFilterStyles from "./filterStyles"
import Selector from "components/utilities-components/Selector/Selector"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import DateSelect from "components/utilities-components/DatePicker/DatePicker"
import { FeedBackService } from "network/feedbackService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { Stack } from "@mui/material"
import ExpandMoreIcon from "assets/images/icons/expandMoreIcon.svg"
import { userDetail } from "hooks/state"
// import { DealerService } from "network/dealerService"
import dayjs from "dayjs"
import { ManageWashService } from "network/manageWashService"
import { DashboardService } from "network/dashboardServices"
// import moment from "moment"

export const transactionType = [
  { value: "ADDED", label: "Added" },
  { value: "DEBITED", label: "Deducted" }
]
export const source = [
  { value: "WALLET", label: "Wallet" },
  { value: "CREDIT", label: "Credit" },
  { value: "TOPUP", label: "Topup" }
]

let memoStatus = [
  {
    label: "Pending",
    value: "PENDING"
  },
  {
    label: "Processing",
    value: "PROCESSING"
  },
  {
    label: "Failed",
    value: "FAILED"
  },
  {
    label: "Paid",
    value: "PAID"
  }
]

let machineStatus = [
  {
    label: "Active",
    value: "ACTIVE"
  },
  {
    label: "Inactive",
    value: "INACTIVE"
  },
  {
    label: "Suspended",
    value: "SUSPENDED"
  }
]

const FilterDrawer = (props) => {
  const {
    open,
    handleDrawer,
    handleFilter,
    washTypeFilter = false,
    memoStatusFilter = false,
    showDate = true,
    machineStatusFilter = false,
    outletFilter = false,
    oemFilter = true,
    machineFilter = true,
    dealerFilter = true,
    stateFilter = true,
    cityFilter = true,
    regionFilter = true,
    showTransactionType = false,
    showSource = false,
    moduleType = false,
    onLoadDate = {},
    onLoadMachine = [],
    startofMonth,
    endofMonth,
    showUsedFilter,
    showMachinesOnly = false
  } = props
  const monthStart = dayjs(startofMonth)
  const monthEnd = dayjs(endofMonth)
  // console.log(monthStart, monthEnd)
  const filterStyles = useFilterStyles()
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(false)
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [oems, setOems] = useState([])
  const [washType, setWashType] = useState([])
  const [machines, setMachines] = useState([])
  const [selectedWashType, setSelectedWashType] = useState(new Set())
  const [selectedMemoFilter, setSelectedMemoFilter] = useState(new Set())
  const [selectedRegion, setSelectedRegion] = useState(new Set())
  const [selectedDealer, setSelectedDealer] = useState(new Set())
  const [selectedOEM, setSelectedOEM] = useState(new Set())
  const [selectedMachine, setSelectedMachine] = useState(new Set())
  const [selectedCity, setSelectedCity] = useState(new Set())
  const [selectedState, setSelectedState] = useState(new Set())
  const [dealers, setDealers] = useState([])
  const [startDate, setStartDate] = useState(startofMonth ? monthStart : null)
  const [endDate, setEndDate] = useState(endofMonth ? monthEnd : null)
  const [selectedTransactionType, setSelectedTransactionType] = useState(new Set())
  const [selectedMachineStatusFilter, setSelectedMachineStatusFilter] = useState(new Set())
  const [outlets, setOutlets] = useState([])
  const [selectedOutlets, setSelectedOutlets] = useState(new Set())
  const [selectedSource, setSelectedSource] = useState(new Set())
  const [onlyMachines, setOnlyMachines] = useState([])
  const [machinesSet, setMachinesSet] = useState(new Set())
  const user = userDetail()
  const now = dayjs(new Date())

  useEffect(() => {
    getServiceCenter()
    getRegion()
    if (user?.role !== "areaManager" && user?.role !== "oemManager") {
      getMachines()
      getAllDealers()
    }
    if (washTypeFilter) {
      getWashType()
    }
    if (showMachinesOnly) {
      getMachineList()
    }
  }, [])
  const getMachineList = async () => {
    const response = await DashboardService.getMachineList()

    if (response.success && response.code === 200) {
      const labelKey = "name"
      const key = "machineGuid"
      const sortedData = sortData(labelKey, key, response?.data)
      setOnlyMachines(sortedData)
    }
  }
  useEffect(() => {
    const selectedSet = new Set(
      onLoadMachine &&
        onLoadMachine?.map((item) => {
          return item?.value
        })
    )
    setMachineName(selectedSet)
  }, [])

  useEffect(() => {
    const dateObject = dayjs(onLoadDate?.initialStartDate)
    const dateObject1 = dayjs(onLoadDate?.initialEndDate)
    if (moduleType) {
      setAllDates(dateObject, dateObject1)
    }
  }, [])

  useEffect(() => {
    selectedRegion?.size && getState()
  }, [selectedRegion?.size])
  useEffect(() => {
    selectedState?.size && getCity()
  }, [selectedState?.size])
  useEffect(() => {
    if (user?.role !== "areaManager" && user?.role !== "oemManager") {
      getOEMS()
    } else {
      getOemForm()
    }
  }, [])
  useEffect(() => {
    if (user?.role === "areaManager" || user?.role === "oemManager") {
      selectedCity?.size > 0 ? getOemDealers() : resetDealerMachine()
    }
  }, [selectedCity?.size])
  //==========> Region Part Starts
  const handleSelectRegion = (value) => {
    const selectedSet = new Set(selectedRegion)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedRegion(selectedSet)
    setStates([])
  }
  const getOemForm = () => {
    const oemSet = new Set()
    if (!oemSet.has(user?.oemId)) {
      oemSet.add(user?.oemId)
    }
    setSelectedOEM(oemSet)
  }

  const setMachineName = (selectedSet) => {
    setSelectedMachine(selectedSet)
  }

  const setAllDates = (dateObject, dateObject1) => {
    setStartDate(dateObject)
    setEndDate(dateObject1)
  }

  const resetDealerMachine = () => {
    setDealers([])
    setMachines([])
  }

  const handleSelectWashType = (value) => {
    const selectedSet = new Set(selectedWashType)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedWashType(selectedSet)
  }
  const handleSelectMemoStatus = (value) => {
    const selectedSet = new Set(selectedMemoFilter)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedMemoFilter(selectedSet)
  }

  const handleSelectSourceType = (value) => {
    const selectedSet = new Set(selectedSource)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedSource(selectedSet)
  }

  const handleSelectMachineStatus = (value) => {
    const selectedSet = new Set(selectedMachineStatusFilter)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedMachineStatusFilter(selectedSet)
  }

  const handleSelectDealer = (value) => {
    const selectedSet = new Set(selectedDealer)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedDealer(selectedSet)
  }

  const handleSelectOutlets = (value) => {
    const selectedSet = new Set(selectedOutlets)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedOutlets(selectedSet)
  }

  const handleSelectOEM = (value) => {
    const selectedSet = new Set(selectedOEM)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedOEM(selectedSet)
  }
  const handleSelectState = (value) => {
    const selectedSet = new Set(selectedState)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedState(selectedSet)
    setCities([])
  }
  const handleSelectMachine = (value) => {
    const selectedSet = new Set(selectedMachine)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedMachine(selectedSet)
  }

  const handleSelectCity = (value) => {
    const selectedSet = new Set(selectedCity)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedCity(selectedSet)
  }
  const handleMachineSet = (value) => {
    const selectedSet = new Set(machinesSet)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setMachinesSet(selectedSet)
  }
  const handleChange = (key, value) => {
    key === "start" && setStartDate(value)
    key === "end" && setEndDate(value)
  }

  const getWashType = async () => {
    const response = await FeedBackService.getWashTypes()
    if (response.success && response.code === 200) {
      const labelKey = "Name"
      const key = "Guid"
      const sortedData = sortData(labelKey, key, response?.data?.records)
      setWashType(sortedData)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const getRegion = async () => {
    setLoading(true)
    let params = {}
    if (user?.role === "areaManager" || user?.role === "oemManager") {
      params.manageWash = true
    }
    const response = await FeedBackService.getRegion({}, params)
    if (response.success && response.code === 200) {
      setLoading(false)
      const labelKey = "name"
      const key = "regionId"
      const sortedData = sortData(labelKey, key, response?.data)
      setRegions(sortedData)
    } else {
      setLoading(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const getState = async () => {
    setLoading(true)
    let key = `filters[regionId][]`
    let params = { [key]: Array.from(selectedRegion) }
    if (user?.role === "areaManager" || user?.role === "oemManager") {
      params.manageWash = true
    }
    const response = await FeedBackService.getState(params)
    if (response.success && response.code === 200) {
      setLoading(false)
      const key = "stateId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setStates(sortedData)
    } else {
      setLoading(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const getCity = async () => {
    setLoading(true)
    let key = `filters[stateId][]`
    let params = { [key]: Array.from(selectedState) }
    if (user?.role === "areaManager" || user?.role === "oemManager") {
      params.manageWash = true
    }
    const response = await FeedBackService.getCity(params)
    if (response.success && response.code === 200) {
      setLoading(false)
      const key = "cityId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setCities(sortedData)
    } else {
      setLoading(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const getOEMS = async () => {
    setLoading(true)
    const response = await FeedBackService.getOEM()
    if (response.success && response.code === 200) {
      setLoading(false)
      const key = "oemId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setOems(sortedData)
    } else {
      setLoading(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const getMachines = async () => {
    setLoading(true)
    const response = await FeedBackService.getMachines()
    if (response.success && response.code === 200) {
      setLoading(false)
      const key = "machineGuid"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setMachines(sortedData)
    } else {
      setLoading(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }

  const getServiceCenter = async () => {
    setLoading(true)
    const response = await FeedBackService.getOutlets()
    if (response.success && response.code === 200) {
      setLoading(false)
      const key = "outletId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setOutlets(sortedData)
    } else {
      setLoading(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }

  const getAllDealers = async () => {
    setLoading(true)
    const response = await FeedBackService.getAllDealers()
    if (response.success && response.code === 200) {
      setLoading(false)
      const key = "userId"
      const labelKey = "username"

      const sortedData = sortData(labelKey, key, response?.data?.dealers)
      setDealers(sortedData)
    } else {
      setLoading(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }

  const getOemDealers = async () => {
    setLoading(true)
    let params
    params =
      user?.role === "areaManager"
        ? {
            areaManagerId: user?.userId,
            oemIds: user.oemId,
            cityId: Array.from(selectedCity).toString()
          }
        : {
            oemManagerId: user?.userId,
            oemIds: user.oemId,
            cityId: Array.from(selectedCity).toString()
          }
    const response = await ManageWashService.getOEMDealer(params)
    if (response?.success && response?.code === 200) {
      let dealerArray
      dealerArray =
        user?.role === "areaManager"
          ? response?.data?.records?.areaManagerDealers.map((item) => item?.dealer)
          : response?.data?.records?.oemManagerDealers.map((item) => item?.dealer)
      const labelKey = "username"
      const key = "userId"
      const sortDealerArray = sortData(labelKey, key, dealerArray)
      setDealers(sortDealerArray)
      const outletArray = sortDealerArray.map((dealer) => dealer?.outlets)
      const flatOutletArray = outletArray.flat()
      const machineArray = flatOutletArray.map((outlet) => outlet?.machines)
      const flatMachineArray = machineArray.flat()
      const machineLabelKey = "name"
      const machineIdKey = "machineGuid"
      const sortMachineArray = sortData(machineLabelKey, machineIdKey, flatMachineArray)
      setMachines(sortMachineArray)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }
  const handleSelectTransactionType = (value) => {
    const selectedSet = new Set(selectedTransactionType)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedTransactionType(selectedSet)
  }

  const resetFilters = () => {
    setSelectedCity(new Set())
    setSelectedWashType(new Set())
    setSelectedTransactionType(new Set())
    setSelectedSource(new Set())
    setSelectedDealer(new Set())
    setSelectedState(new Set())
    setSelectedMachine(new Set())
    user?.role !== "areaManager" && user?.role !== "oemManager" && setSelectedOEM(new Set())
    setSelectedRegion(new Set())
    setSelectedWashType(new Set())
    setSelectedMemoFilter(new Set())
    setStartDate(null)
    setEndDate(null)
    setSelectedOutlets(new Set())
    setSelectedMachineStatusFilter(new Set())
    setMachinesSet(new Set())
    /**
     * @description
     * if any additional filter is being added then update the below given function as well
     ** to keep parameters from losing their places
     */
    handleFilter(
      null,
      null,
      [],
      [],
      [],
      [],
      user?.role === "areaManager" || user?.role === "oemManager" ? Array.from(selectedOEM) : [],
      [],
      [],
      [],
      [],
      [],
      []
    )
    showUsedFilter(false)
  }
  const applyFilters = () => {
    /**
     * @description
     * if any additional filter is being added then update the below given function as well
     ** to keep parameters from losing their places
     */
    handleFilter(
      startDate ? startDate : "",
      endDate ? endDate : "",
      selectedWashType?.size > 0 ? Array.from(selectedWashType) : [],
      selectedRegion?.size > 0 ? Array.from(selectedRegion) : [],
      selectedState?.size > 0 ? Array.from(selectedState) : [],
      selectedCity?.size > 0 ? Array.from(selectedCity) : [],
      selectedOEM?.size > 0 ? Array.from(selectedOEM) : [],
      selectedDealer?.size > 0 ? Array.from(selectedDealer) : [],
      selectedMachine?.size > 0 ? Array.from(selectedMachine) : [],
      selectedMemoFilter?.size > 0 ? Array.from(selectedMemoFilter) : [],
      selectedMachineStatusFilter?.size > 0 ? Array.from(selectedMachineStatusFilter) : [],
      selectedOutlets?.size > 0 ? Array.from(selectedOutlets) : [],
      Array.from(selectedTransactionType),
      Array.from(selectedSource),
      Array.from(machinesSet)
    )
    if (
      startDate ||
      endDate ||
      selectedWashType?.size ||
      selectedRegion?.size ||
      selectedState?.size ||
      selectedCity?.size ||
      selectedOEM?.size ||
      selectedDealer?.size ||
      selectedMachine?.size ||
      selectedMemoFilter?.size ||
      selectedMachineStatusFilter?.size ||
      selectedOutlets?.size ||
      selectedTransactionType?.size ||
      selectedSource?.size ||
      machinesSet?.size
    ) {
      showUsedFilter(true)
    } else {
      showUsedFilter(false)
    }
  }
  const AccordionIcon = () => {
    return <img src={ExpandMoreIcon} style={{ width: "2.4rem", height: "2.4rem" }} />
  }
  const getDisabled = () => {
    if (startDate && !endDate) {
      return true
    } else if (startDate && endDate) {
      return false
    } else {
      return false
    }
  }

  return (
    <Drawer
      anchor={"right"}
      open={open}
      sx={filterStyles.drawer}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleDrawer() // toggleDrawer(anchor, false)
        }
      }}>
      {loading && <AppLoader />}
      <Box sx={filterStyles.filterHeader}>
        <Typography variant="s1" color="text.main">
          Filters
        </Typography>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={filterStyles.closeIcon}
          onClick={handleDrawer}>
          <CloseIcon color="primary" fontSize="large" />
        </IconButton>
      </Box>
      <Stack container sx={filterStyles.filterWrapper} spacing={1}>
        {showDate ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Date
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.dateSelect} className="dateWrapper">
                  <DateSelect
                    label="Start Date"
                    value={startDate}
                    onChange={(value) => handleChange("start", value)}
                    maxDate={endDate ? endDate : now}
                  />
                  <DateSelect
                    label="End Date"
                    value={endDate}
                    onChange={(value) => handleChange("end", value)}
                    minDate={startDate}
                    maxDate={now}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ) : null}
        {washTypeFilter && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Wash Type
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector
                    items={washType}
                    select={handleSelectWashType}
                    selected={selectedWashType}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        )}
        {memoStatusFilter && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Status
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector
                    items={memoStatus}
                    select={handleSelectMemoStatus}
                    selected={selectedMemoFilter}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        )}
        {machineStatusFilter && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Status
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector
                    items={machineStatus}
                    select={handleSelectMachineStatus}
                    selected={selectedMachineStatusFilter}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        )}
        {regionFilter ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Region
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector items={regions} select={handleSelectRegion} selected={selectedRegion} />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        ) : null}
        {stateFilter ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  State
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {selectedRegion?.size > 0 ? (
                  <Box sx={filterStyles.accordianDiv}>
                    {!loading && states?.length === 0 ? (
                      <Typography variant="p1" color="text.gray">
                        No States Found
                      </Typography>
                    ) : states?.length > 0 ? (
                      <Selector
                        items={states}
                        select={handleSelectState}
                        selected={selectedState}
                      />
                    ) : (
                      <Typography variant="p1" color="text.gray">
                        Loading...
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="p1" color="text.gray">
                    Please Select Regions First
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        ) : null}
        {cityFilter ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  City
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {selectedState?.size > 0 ? (
                  <Box sx={filterStyles.accordianDiv}>
                    {!loading && cities?.length === 0 ? (
                      <Typography variant="p1" color="text.gray">
                        No Cities Found
                      </Typography>
                    ) : cities?.length > 0 ? (
                      <Selector items={cities} select={handleSelectCity} selected={selectedCity} />
                    ) : (
                      <Typography variant="p1" color="text.gray">
                        Loading...
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="p1" color="text.gray">
                    Please Select States First
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        ) : null}

        {user?.role !== "oemManager" && user?.role !== "areaManager" && oemFilter && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  OEM
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector items={oems} select={handleSelectOEM} selected={selectedOEM} />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        )}
        {dealerFilter ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Dealership
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector items={dealers} select={handleSelectDealer} selected={selectedDealer} />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        ) : null}
        {showMachinesOnly ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Machines
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector items={onlyMachines} select={handleMachineSet} selected={machinesSet} />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        ) : null}
        {outletFilter ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Outlets
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector
                    items={outlets}
                    select={handleSelectOutlets}
                    selected={selectedOutlets}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        ) : null}
        {machineFilter ? (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Machine
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  {" "}
                  <Selector
                    items={machines}
                    select={handleSelectMachine}
                    selected={selectedMachine}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        ) : null}
        {showTransactionType && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Transaction Type
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector
                    items={transactionType}
                    select={handleSelectTransactionType}
                    selected={selectedTransactionType}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        )}

        {showSource && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Source
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector
                    items={source}
                    select={handleSelectSourceType}
                    selected={selectedSource}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        )}
      </Stack>
      <Box sx={filterStyles.filterFooter}>
        <Box sx={filterStyles.filterDrawerButton}>
          <SecondaryButton onClick={resetFilters}>Clear All</SecondaryButton>
        </Box>
        <Box sx={filterStyles.filterDrawerButton}>
          <PrimaryButton onClick={applyFilters} disabled={getDisabled()}>
            Apply Filter
          </PrimaryButton>
        </Box>
      </Box>
    </Drawer>
  )
}

export default FilterDrawer
