import React, { useState, useEffect } from "react"
import { Box, IconButton } from "@mui/material"
import BillingHeader from "components/BillingAccounting/BillingHeader"
import { getMonthName, dateMonthFormat, getMonthDays } from "helpers/app-dates/dates"
import ListingTable from "components/utilities-components/ListingTable"
import styles from "./../BillingAccounting.module.scss"
import PaginationComponent from "components/utilities-components/Pagination"
import { BillingService } from "network/billingServices"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import moment from "moment"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import { ArrowDownward } from "@mui/icons-material"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { exportDownload } from "../billingUtilities"

function BlueVerseCredit() {
  // const formattedDate = moment().clone().startOf("month")
  // const endOfMonth = moment().clone().endOf("month")
  const user = userDetail()
  const navigate = useNavigate()
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [creditDetailData, setCreditDetialData] = useState([])
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [totalRecord, setTotalRecord] = useState(0)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [oemId, setOemId] = useState([])
  const [cityId, setCityId] = useState([])
  const [machineId, setMachineId] = useState([])
  const [stateId, setStateId] = useState([])
  const [regionId, setRegionId] = useState([])
  const [dealerId, setDealerId] = useState([])
  const [sort, setSort] = useState("DESC")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getBiilingList()
  }, [searchQuery, itemsPerPage, currentPage, filterUpdate, sort])

  const getBiilingList = async () => {
    setLoading(true)
    const param = {
      search: searchQuery,
      type: "BLUEVERSE_CREDIT",
      fromDate: startDate,
      toDate: endDate,
      dealerIds: dealerId.toString(),
      machineIds: machineId.toString(),
      stateIds: stateId.toString(),
      regionIds: regionId.toString(),
      cityIds: cityId.toString(),
      oemIds: oemId.toString(),
      offset: currentPage,
      limit: itemsPerPage
    }
    let creditResponse = await BillingService.getBillingList(param)
    if (creditResponse.code === 200 && creditResponse.success) {
      setCreditDetialData(creditResponse?.data?.memoList)
      if (creditResponse?.data?.pagination?.totalItems === 0) {
        setCurrentPage(1)
        setTotalRecord(0)
      } else {
        setTotalRecord(creditResponse?.data?.pagination?.totalItems)
      }
      setLoading(false)
    } else {
      setCreditDetialData([])
      setLoading(false)
      setTotalRecord(0)
      setCurrentPage(1)
    }
  }

  const handleExport = async () => {
    setLoading(true)
    const param = {
      search: searchQuery,
      fromDate: startDate,
      toDate: endDate,
      type: "BLUEVERSE_CREDIT",
      sort: sort,
      machineIds: machineId.toString(),
      dealerIds: dealerId.toString(),
      stateIds: stateId.toString(),
      cityIds: cityId.toString(),
      regionIds: regionId.toString(),
      oemIds: oemId.toString(),
      offset: currentPage,
      limit: itemsPerPage
    }
    exportDownload(param)
    setLoading(false)
  }
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }

  const setSearch = (val) => {
    setSearchQuery(val)
  }

  let creditData = []

  // eslint-disable-next-line no-unused-vars
  let creatRow =
    creditDetailData &&
    creditDetailData.length > 0 &&
    creditDetailData.map((list, i) => {
      return creditData.push(
        createData(
          i + 1,
          list?.memoId,
          list?.outlet?.name,
          list?.outlet?.dealer?.username,
          list?.outlet?.dealer?.oem?.name,
          list?.outlet?.city?.state?.region?.name,
          list?.outlet?.city?.state?.name,
          list?.outlet?.city?.name,
          list?.machine?.name,
          getMonthName(list?.month),
          dateMonthFormat(list?.createdAt, "DD/MM/YYYY hh:mm A"),
          Math.round(list?.creditRemainingBalance),
          <Box
            className={styles.viewText}
            onClick={() => {
              navigate(`/${user?.role}/billing-accounting/blueverse-credit/${list?.machineMemoId}`)
            }}>
            View
          </Box>
        )
      )
    })

  const changePage = (page) => {
    setCurrentPage(page)
  }

  const changePageCount = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const onDrawerFilter = () => {
    setOpenDrawer((prev) => !prev)
  }

  function onCloseFilter() {
    setOpenDrawer(false)
  }

  const handleFilter = (
    startDate,
    endDate,
    washType,
    selectedRegion,
    selectedState,
    selectedCity,
    selectedOEM,
    selectedDealer,
    selectedMachine
  ) => {
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
    setStartDate(startDate ? moment(startDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(endDate ? moment(endDate.toString()).format("YYYY-MM-DD") : "")
    setRegionId(selectedRegion)
    setOemId(selectedOEM)
    setCityId(selectedCity)
    setStateId(selectedState)
    setDealerId(selectedDealer)
    setMachineId(selectedMachine)
  }

  function createData(
    no,
    invoiceId,
    serviceCentre,
    dealership,
    oem,
    region,
    state,
    city,
    machine,
    month,
    invoiceDate,
    totalAmount,
    action
  ) {
    return {
      no,
      invoiceId,
      serviceCentre,
      dealership,
      oem,
      region,
      state,
      city,
      machine,
      month,
      invoiceDate,
      totalAmount,
      action
    }
  }

  const columns = [
    {
      id: "no",
      label: "Sr No.",
      minWidth: 80
    },
    {
      id: "invoiceId",
      label: "Invoice ID",
      minWidth: 120
    },
    {
      id: "serviceCentre",
      label: "Service Centre",
      minWidth: 150
    },
    {
      id: "dealership",
      label: "Dealership",
      minWidth: 150
    },
    {
      id: "oem",
      label: "OEM",
      minWidth: 100
    },
    {
      id: "region",
      label: "Region",
      minWidth: 100
    },
    {
      id: "state",
      label: "State",
      minWidth: 100
    },
    {
      id: "city",
      label: "City",
      minWidth: 120
    },
    {
      id: "machine",
      label: "Machine",
      minWidth: 120
    },
    {
      id: "month",
      label: "Month",
      minWidth: 120
    },
    {
      id: "invoiceDate",
      label: (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Invoice Date
          <IconButton
            color="inherit"
            edge="start"
            aria-label="open drawer"
            className={styles.sortBox}
            onClick={handleSort.bind(null, sort)}>
            {sort === "DESC" ? (
              <ArrowUpwardIcon color="primary" />
            ) : (
              <ArrowDownward color="primary" />
            )}
          </IconButton>
        </Box>
      ),
      minWidth: 120
    },
    {
      id: "totalAmount",
      label: "Total Amount",
      minWidth: 120
    },
    {
      id: "action",
      label: "Action",
      minWidth: 120
    }
  ]

  return (
    <Box>
      {loading && <AppLoader />}
      <BillingHeader
        searchEnabled={true}
        filterEnabled={true}
        heading="BlueVerse Credits"
        badgeData={totalRecord}
        setQuery={setSearch}
        searchQuery={searchQuery}
        handleDrawer={onDrawerFilter}
        downloadEnabled={true}
        handleDownload={handleExport}
        setCurrentPage={setCurrentPage}
        amountCardVisible={false}
        selectedDate={{ initialStartDate: startDate, initialEndDate: endDate }}
        isFilterUsed={isFilterUsed}
      />
      <Box sx={{ mt: "20px" }}>
        <ListingTable columns={columns} tableData={creditData} />
      </Box>
      <Box sx={{ mt: "2rem" }}>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={Math.ceil(totalRecord / itemsPerPage)}
          onPageChange={changePage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={changePageCount}
          totalRecord={totalRecord}
          title={"Records"}
        />
      </Box>
      <FilterDrawer
        open={openDrawer}
        handleDrawer={onDrawerFilter}
        handleFilter={handleFilter}
        handlecloseFilter={onCloseFilter}
        onLoadDate={getMonthDays()}
        moduleType={true}
        showUsedFilter={showUsedFilter}
      />
    </Box>
  )
}

export default BlueVerseCredit
