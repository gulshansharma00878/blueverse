import React, { useState, useEffect } from "react"
import { Box, Typography, Tabs, Tab, Grid } from "@mui/material"
import { TabPanel } from "components/utilities-components/TabPanel"
import "./Washes.scss"
import SearchBar from "components/utilities-components/Search"
import WashTile from "components/WashPanel/WashDashboard/GenerateQR/WashTile"
import PaginationComponent from "components/utilities-components/Pagination"
import CustomerDetailsForm from "components/WashPanel/CustomerDetailsForm"
import Filter from "components/WashPanel/WashDashboard/Filter"
import DateFilter from "components/WashPanel/WashDashboard/DateFilter"
import IconButton from "@mui/material/IconButton"
import SwapVertIcon from "@mui/icons-material/SwapVert"
import { WashService } from "network/washService"
import Toast from "components/utilities-components/Toast/Toast"
import { useSelector } from "react-redux"
import moment from "moment"
import { FeedBackService } from "network/feedbackService"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import EmptyState from "components/utilities-components/EmptyState"
import WashesEmptyState from "assets/images/placeholders/WashesEmptyState.webp"

const dateOptions = [
  { label: "Today", value: 1 },
  { label: "Last 7 Days", value: 7 },
  { label: "Last 28 Days", value: 28 },
  { label: "Last 90 Days", value: 90 },
  { label: "Custom", value: "custom" }
]
const profileOptions = [
  { label: "Complete", value: "complete" },
  { label: "Incomplete", value: "incomplete" }
]

function Washes() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeTabStatus, setActiveTabStatus] = useState("FEEDBACK_NOT_STARTED")
  const [sortStatus, setSortStatus] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [skuData, setSkuData] = useState([])
  const [totalRecord, setTotalRecord] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedProfileOptions, setSelectedProfileOptions] = useState([])
  const [selectedDateOption, setSelectedDateOption] = useState(dateOptions[0])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filterOptions, setFilterOptions] = useState([])
  const [loader, setLoader] = useState(false)

  const tileUpdate = useSelector((state) => state.wash.tileUpdateCount)

  useEffect(() => {
    getWashTypes()
  }, [])
  useEffect(() => {
    handleDateSelect(selectedDateOption)
  }, [activeTab])

  useEffect(() => {
    getData()
  }, [
    itemsPerPage,
    currentPage,
    searchQuery,
    sortStatus,
    selectedOptions,
    selectedProfileOptions,
    tileUpdate,
    startDate,
    endDate
  ])
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
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

  const handleSort = () => {
    setSortStatus(!sortStatus)
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  //  handle tabs state
  useEffect(() => {
    setItemsPerPage(10)
    setCurrentPage(1)
    setSearchQuery("")
    setSortStatus(true)
    setSelectedOptions([])
    setSkuData([])
    setSelectedDateOption(dateOptions[0])
    switch (activeTab) {
      case 0:
        setActiveTabStatus("FEEDBACK_NOT_STARTED")
        break
      case 1:
        setActiveTabStatus("FEEDBACK_IN_PROGRESS")
        break
      case 2:
        setActiveTabStatus("FEEDBACK_COMPLETED")
        break
      default:
        setActiveTabStatus("FEEDBACK_NOT_STARTED")
    }
  }, [activeTab])

  // for filter

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedOptions(filterOptions.map((option) => option.value))
    } else {
      setSelectedOptions([])
    }
  }
  const handleSelectAllStatus = (event) => {
    if (event.target.checked) {
      setSelectedProfileOptions(profileOptions.map((option) => option.value))
    } else {
      setSelectedProfileOptions([])
    }
  }
  const getWashTypes = async () => {
    const response = await FeedBackService.getWashTypes()
    if (response?.success && response?.code === 200) {
      const labelKey = `Name`
      const key = `Guid`
      const sortResponse = sortData(labelKey, key, response?.data?.records)
      setFilterOptions(sortResponse)
    }
  }
  const handleSelectOption = (event) => {
    const value = event.target.value
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value))
    } else {
      setSelectedOptions([...selectedOptions, value])
    }
  }

  const handleDateSelect = (option) => {
    setSelectedDateOption(option)
    if (option.label === "Select") {
      setStartDate("")
      setEndDate("")
    } else if (option.label === "Custom") {
      option.value?.startRangeDate && setStartDate(option.value?.startRangeDate)
      option.value?.endRangeDate && setEndDate(option.value?.endRangeDate)
    } else {
      const startDateformat = moment()
        .subtract(option.value - 1, "days")
        .format("YYYY-MM-DD")
      const endDateformat = moment().format("YYYY-MM-DD")
      if (option.value === 1) {
        setStartDate(startDateformat)
        setEndDate(startDateformat)
      } else {
        setStartDate(startDateformat)
        setEndDate(endDateformat)
      }
    }
  }

  const handleProfileSelect = (event) => {
    const value = event.target.value
    if (selectedProfileOptions.includes(value)) {
      setSelectedProfileOptions(selectedProfileOptions.filter((option) => option !== value))
    } else {
      setSelectedProfileOptions([...selectedProfileOptions, value])
    }
  }

  function checkDataStatus(data) {
    if (data.includes("complete")) {
      if (data.includes("incomplete")) {
        return null
      } else {
        return true
      }
    } else {
      if (data.includes("incomplete")) {
        return false
      } else {
        if (data.length === 0) {
          return null
        }
        return null
      }
    }
  }

  // listing API call
  const getData = async () => {
    setLoader(true)
    const payLoad = {
      sort_by: sortStatus ? "NEWEST" : "OLDEST",
      filters: {
        wash_type: selectedOptions,
        date_range: {
          from_date: startDate,
          to_date: endDate
        }
      },

      status: activeTabStatus,
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage
    }
    if (activeTab === 1) {
      payLoad.is_profile_completed = checkDataStatus(selectedProfileOptions)
    }
    const response = await WashService.getAllWashTile(payLoad)
    if (response.success && response.code === 200) {
      setSkuData(response?.data?.records ? response?.data?.records : [])
      setTotalRecord(response?.data?.pagination?.totalItems)
      setLoader(false)
    } else {
      setSkuData([])
      Toast.showErrorToast(`Something Went Wrong!`)
      setLoader(false)
    }
  }

  return (
    <Box>
      <Box className="header_box">
        <Typography variant="h6">Washes</Typography>
        <DateFilter
          dateOptions={dateOptions}
          selectedDateOption={selectedDateOption}
          handleDateSelect={handleDateSelect}
          activeTab={activeTab}
          style={{ width: "22rem" }}
        />
      </Box>
      <Box className="container">
        <Box sx={{ borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="fullWidth">
            <Tab
              label="Generate QR"
              className={activeTab === 0 ? "tablabel_active" : "tablabel"}
              {...a11yProps(0)}
            />
            <Tab
              label="Capture Feedback"
              className={activeTab === 1 ? "tablabel_active" : "tablabel"}
              {...a11yProps(1)}
            />
            <Tab
              label="Feedback Completed"
              className={activeTab === 2 ? "tablabel_active" : "tablabel"}
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <Box className="filterBox">
          <Box className="filterBox__sortBox">
            <Box>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                className="sorticonBox"
                onClick={handleSort}>
                <SwapVertIcon color="primary" />
              </IconButton>
            </Box>
            <Typography className="sortText" variant="p2" component="div">
              {sortStatus ? "Newest" : "Oldest"}
            </Typography>
          </Box>
          <Box className="icon_box">
            <SearchBar setQuery={setQuery} searchQuery={searchQuery} />
            <Filter
              filterOptions={filterOptions}
              handleSelectAll={handleSelectAll}
              handleSelectOption={handleSelectOption}
              selectedOptions={selectedOptions}
              selectedProfileOptions={selectedProfileOptions}
              profileStatus={activeTab === 1 ? true : false}
              profileOptions={profileOptions}
              handleSelectAllStatus={handleSelectAllStatus}
              handleProfileSelect={handleProfileSelect}
            />
          </Box>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            {skuData?.length ? (
              skuData.map((item, index) => {
                return (
                  <Grid item sm={6} md={4} key={index} xs={12} lg={3}>
                    <WashTile type={"GenerateQR"} item={item} />
                  </Grid>
                )
              })
            ) : (
              <Box sx={{ width: "100%" }}>
                <EmptyState imgSrc={WashesEmptyState} titleText="No Records Found" />
              </Box>
            )}
          </Grid>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2}>
            {skuData?.length ? (
              skuData.map((item, index) => {
                return (
                  <Grid item sm={6} xs={12} md={4} lg={3} key={index}>
                    <WashTile item={item} type={"captureFeedback"} />
                  </Grid>
                )
              })
            ) : (
              <Box sx={{ width: "100%" }}>
                <EmptyState imgSrc={WashesEmptyState} titleText="No Records Found" />
              </Box>
            )}
          </Grid>
        </TabPanel>
        <TabPanel index={2} value={activeTab}>
          <Grid spacing={2} container>
            {skuData?.length ? (
              skuData.map((item, index) => {
                return (
                  <Grid item md={4} sm={6} lg={3} xs={12} key={index}>
                    <WashTile item={item} type={"feedbackCompleted"} />
                  </Grid>
                )
              })
            ) : (
              <Box sx={{ width: "100%" }}>
                <EmptyState imgSrc={WashesEmptyState} titleText="No Records Found" />
              </Box>
            )}
          </Grid>
        </TabPanel>
        <CustomerDetailsForm />
      </Box>
      {skuData?.length ? (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={Math.ceil(totalRecord / itemsPerPage)}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalRecord={totalRecord}
          title={"Wash Cards"}
        />
      ) : null}
      {loader ? <AppLoader /> : null}
    </Box>
  )
}
export default Washes
