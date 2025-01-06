import React, { useState, useEffect } from "react"
import { Box, IconButton, useTheme } from "@mui/material"
import ListingTable from "components/utilities-components/ListingTable"
import styles from "./../BillingAccounting.module.scss"
import PaginationComponent from "components/utilities-components/Pagination"
import BillingHeader from "components/BillingAccounting/BillingHeader"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import { useNavigate } from "react-router-dom"
import { BillingService } from "network/billingServices"
import { dateMonthFormat, getMonthDays } from "helpers/app-dates/dates"
import { capitaliseString } from "helpers/Functions/formateString"
import moment from "moment"
import { ArrowDownward } from "@mui/icons-material"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { exportDownload } from "../billingUtilities"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"

function TopUpMemo({ subAdminPermission = {} }) {
  // const formattedDate = moment().clone().startOf("month")
  // const endOfMonth = moment().clone().endOf("month")
  const theme = useTheme()
  const user = userDetail()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [memoTableData, setMemoTableData] = useState([])
  const [totalRecord, setTotalRecord] = useState(0)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [machineId, setMachineId] = useState([])
  const [memoFilter, setMemoFilter] = useState([])
  const [oemId, setOemId] = useState([])
  const [cityId, setCityId] = useState([])
  const [stateId, setStateId] = useState([])
  const [regionId, setRegionId] = useState([])
  const [dealerId, setDealerId] = useState([])
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [sort, setSort] = useState("DESC")
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  useEffect(() => {
    getBiilingList()
  }, [searchQuery, itemsPerPage, currentPage, filterUpdate, sort])

  const getBiilingList = async () => {
    setLoading(true)
    const param = {
      search: searchQuery,
      fromDate: startDate,
      toDate: endDate,
      type: "TOPUP_MEMO",
      sort: sort,
      machineIds: machineId.toString(),
      statuses: memoFilter.toString(),
      dealerIds: dealerId.toString(),
      stateIds: stateId.toString(),
      cityIds: cityId.toString(),
      regionIds: regionId.toString(),
      oemIds: oemId.toString(),
      offset: currentPage,
      limit: itemsPerPage
    }
    let billingResponse = await BillingService.getBillingList(param)
    if (billingResponse.code === 200 && billingResponse.success) {
      setMemoTableData(billingResponse?.data?.memoList)
      if (billingResponse?.data?.pagination?.totalItems === 0) {
        setCurrentPage(1)
        setTotalRecord(0)
      } else {
        setTotalRecord(billingResponse?.data?.pagination?.totalItems)
      }
      setLoading(false)
    } else {
      setTotalRecord(0)
      setCurrentPage(1)
      setMemoTableData([])
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setLoading(true)
    const param = {
      search: searchQuery,
      fromDate: startDate,
      toDate: endDate,
      type: "TOPUP_MEMO",
      sort: sort,
      machineIds: machineId.toString(),
      statuses: memoFilter.toString(),
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
  const handleSort = (changeSort) => {
    changeSort === "ASC" ? setSort("DESC") : setSort("ASC")
  }
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const columns = [
    {
      id: "srNO",
      label: "Sr No.",
      minWidth: 80
    },
    {
      id: "memoID",
      label: "Memo ID",
      minWidth: 120
    },
    {
      id: "dealershipName",
      label: "Dealership",
      minWidth: 150
    },
    {
      id: "serviceCentreName",
      label: "Service Centre",
      minWidth: 150
    },
    {
      id: "oemName",
      label: "OEM",
      minWidth: 100
    },
    {
      id: "regionName",
      label: "Region",
      minWidth: 100
    },
    {
      id: "stateName",
      label: "State",
      minWidth: 100
    },
    {
      id: "cityName",
      label: "City",
      minWidth: 120
    },
    {
      id: "machineName",
      label: "Machine",
      minWidth: 120
    },
    {
      id: "invoiceDate",
      label: (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Invoice Date
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            className={styles.sortBox}
            onClick={handleSort.bind(null, sort)}>
            {sort === "ASC" ? (
              <ArrowUpwardIcon color="primary" />
            ) : (
              <ArrowDownward color="primary" />
            )}
          </IconButton>
        </Box>
      ),
      minWidth: 135
    },

    {
      id: "totalAmount",
      label: "Total Amount",
      minWidth: 120
    },
    {
      id: "statusTitle",
      label: "Status",
      minWidth: 120
    },
    {
      id: "action",
      label: "Action",
      minWidth: 120
    }
  ]
  let memoData = []

  // eslint-disable-next-line no-unused-vars
  let creatRow =
    memoTableData &&
    memoTableData.length > 0 &&
    memoTableData.map((list, i) => {
      return memoData.push(
        createData(
          i + 1,
          list?.memoId,
          list?.outlet?.dealer?.username,
          list?.outlet?.name,
          list?.outlet?.dealer?.oem?.name,
          list?.outlet?.city?.state?.region?.name,
          list?.outlet?.city?.state?.name,
          list?.outlet?.city?.name,
          list?.machine?.name,
          dateMonthFormat(list?.createdAt, "DD/MM/YYYY hh:mm A"),
          list?.totalAmount,
          <Box
            color={list?.status === "PAID" ? theme.palette.text.green : theme.palette.error.main}>
            {capitaliseString(list?.status === "PENDING" ? "Processing" : list?.status)}
          </Box>,
          <Box
            onClick={() => {
              navigate(`/${user?.role}/billing-accounting/topup-memo/${list?.machineMemoId}`)
            }}
            className={styles.viewText}>
            View Memo
          </Box>
        )
      )
    })
  function createData(
    srNO,
    memoID,
    dealershipName,
    serviceCentreName,
    oemName,
    regionName,
    stateName,
    cityName,
    machineName,
    invoiceDate,
    totalAmount,
    statusTitle,
    action
  ) {
    return {
      srNO,
      memoID,
      dealershipName,
      serviceCentreName,
      oemName,
      regionName,
      stateName,
      cityName,
      machineName,
      invoiceDate,
      totalAmount,
      statusTitle,
      action
    }
  }

  const changePage = (page) => {
    setCurrentPage(page)
  }

  const changePageCount = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const setSearch = (val) => {
    setSearchQuery(val)
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
    selectedMachine,
    selectedMemoFilter
  ) => {
    setStartDate(startDate ? moment(startDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(endDate ? moment(endDate.toString()).format("YYYY-MM-DD") : "")
    setMemoFilter(selectedMemoFilter)
    setRegionId(selectedRegion)
    setOemId(selectedOEM)
    setCityId(selectedCity)
    setStateId(selectedState)
    setDealerId(selectedDealer)
    setMachineId(selectedMachine)
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
  }

  return (
    <>
      <Box>
        {loading && <AppLoader />}

        <BillingHeader
          heading="Topup Memo"
          searchEnabled={true}
          filterEnabled={true}
          badgeData={totalRecord}
          setQuery={setSearch}
          searchQuery={searchQuery}
          handleDrawer={onDrawerFilter}
          downloadEnabled={user.role === "subadmin" ? subAdminPermission?.exportPermission : true}
          handleDownload={handleExport}
          setCurrentPage={setCurrentPage}
          amountCardVisible={false}
          isFilterUsed={isFilterUsed}
          selectedDate={{ initialStartDate: startDate, initialEndDate: endDate }}
        />
        <Box sx={{ mt: "20px" }}>
          <ListingTable columns={columns} tableData={memoData} />
        </Box>
        <Box sx={{ mt: "20px" }}>
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
          memoStatusFilter={true}
          onLoadDate={getMonthDays()}
          moduleType={true}
          showUsedFilter={showUsedFilter}
        />
      </Box>
    </>
  )
}

export default TopUpMemo
