import React, { useState, useEffect } from "react" // , { useState }
import {
  Accordion,
  Grid,
  Typography,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  Box,
  Stack
} from "@mui/material"
import { sortData, source, transactionType } from "./drawerSort"
import CloseIcon from "@mui/icons-material/Close"
import { ManageWashService } from "network/manageWashService"
import Toast from "../Toast/Toast"
import DateSelect from "../DatePicker/DatePicker"
import Selector from "../Selector/Selector"
import SecondaryButton from "../SecondaryButton/SecondaryButton"
import PrimaryButton from "../Button/CommonButton"
import "./drawer.scss"
import useFilterStyles from "./filterStyles"
import { months } from "constants/months"
import ExpandMoreIcon from "assets/images/icons/expandMoreIcon.svg"
import dayjs from "dayjs"

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
const FilterDrawer = (props) => {
  /**
   * @description
   * Working OF Filter Drawer
   ** All The API's required will be placed in the drawer itself
   ***and condition to call and render will be passed where the Drawer is being used
   **** Using which the API calls will be reduced all over the Platform
   */
  const {
    open,
    handleDrawer,
    handleFilter,
    handlecloseFilter,
    showTransactionType,
    showSource,
    hideDate,
    hideWashType,
    showMonth,
    onLoadDate,
    moduleType = false,
    memoStatusFilter = false,
    showUsedFilter
  } = props
  const filterStyles = useFilterStyles()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [selectedWashType, setSelectedWashType] = useState(new Set())
  const [selectedTransactionType, setSelectedTransactionType] = useState(new Set())
  const [selectedSource, setSelectedSource] = useState(new Set())
  const [washType, setWashType] = useState([])
  const [selectedMonths, setSelectedMonth] = useState(new Set())
  const [selectedMemoFilter, setSelectedMemoFilter] = useState(new Set())

  useEffect(() => {
    const dateObject = dayjs(onLoadDate?.initialStartDate)
    const dateObject1 = dayjs(onLoadDate?.initialEndDate)
    if (moduleType) {
      setStartDate(dateObject)
      setEndDate(dateObject1)
    }
  }, [])

  useEffect(() => {
    !hideWashType && getWashType()
  }, [])

  //==========> Region Part Starts

  const handleSelectWashType = (value) => {
    const selectedSet = new Set(selectedWashType)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedWashType(selectedSet)
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

  const handleSelectMonths = (value) => {
    const selectedSet = new Set(selectedMonths)
    if (!selectedSet.has(value)) {
      selectedSet.add(value)
    } else {
      selectedSet.delete(value)
    }
    setSelectedMonth(selectedSet)
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

  const handleChange = (key, value) => {
    key === "start" && setStartDate(value)
    key === "end" && setEndDate(value)
  }

  const getWashType = async () => {
    const response = await ManageWashService.getWashType()
    if (response.success && response.code === 200) {
      const key = "Guid"
      const labelKey = "Name"
      const sortedData = sortData(labelKey, key, response?.data?.records)
      setWashType(sortedData)
    } else {
      Toast.showErrorToast(`${response.message}`)
    }
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

  const resetFilters = () => {
    setStartDate(null)
    setEndDate(null)
    handlecloseFilter()
    setSelectedWashType(new Set())
    setSelectedTransactionType(new Set())
    setSelectedSource(new Set())
    setSelectedMonth(new Set())
    setSelectedMemoFilter(new Set())
    handleFilter(null, null, [], [], [], [], [])
    showUsedFilter(false)
  }
  const applyFilters = () => {
    handleFilter(
      startDate,
      endDate,
      Array.from(selectedWashType),
      Array.from(selectedTransactionType),
      Array.from(selectedSource),
      Array.from(selectedMonths),
      selectedMemoFilter?.size > 0 ? Array.from(selectedMemoFilter) : []
    )
    if (
      startDate ||
      endDate ||
      selectedTransactionType?.size ||
      selectedWashType?.size ||
      selectedSource?.size ||
      selectedMonths?.size ||
      selectedMemoFilter?.size
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
        {!hideDate && (
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
                <Box sx={filterStyles.dateSelect}>
                  <DateSelect
                    label="Start Date"
                    value={startDate}
                    onChange={(value) => handleChange("start", value)}
                    maxDate={endDate}
                    futureDisable={true}
                  />
                  <DateSelect
                    label="End Date"
                    value={endDate}
                    onChange={(value) => handleChange("end", value)}
                    minDate={startDate}
                    futureDisable={true}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
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
        {showMonth && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<AccordionIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="p1" color="text.main">
                  Month
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={filterStyles.accordianDiv}>
                  <Selector items={months} select={handleSelectMonths} selected={selectedMonths} />
                </Box>
              </AccordionDetails>
            </Accordion>{" "}
          </Grid>
        )}
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
        {!hideWashType && (
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
