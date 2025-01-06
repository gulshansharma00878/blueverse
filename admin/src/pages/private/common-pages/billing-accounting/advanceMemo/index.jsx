import React, { useState, useEffect } from "react"
import { Box, Grid } from "@mui/material"
import ListingTable from "components/utilities-components/ListingTable"
import { useTheme } from "@mui/material"
import styles from "./../BillingAccounting.module.scss"
import PaginationComponent from "components/utilities-components/Pagination"
import BillingHeader from "components/BillingAccounting/BillingHeader"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import { useNavigate } from "react-router-dom"
import { BillingService } from "network/billingServices"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { dateMonthFormat, getMonthDays, getMonthName } from "helpers/app-dates/dates"
import { capitaliseString } from "helpers/Functions/formateString"
import moment from "moment"
import { exportDownload } from "../billingUtilities"
import { userDetail } from "hooks/state"
import Coins from "assets/images/icons/coins.svg"
import Billing from "assets/images/icons/Billing.svg"
import AmountCard from "components/utilities-components/AmountCard"
import Wallet from "assets/images/icons/Wallet.svg"
import { formatCurrency } from "helpers/Functions/formatCurrency"

function AdvanceMemo({ subAdminPermission = {} }) {
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
  const [loader, setLoader] = useState(false)
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [machineIds, setMachineIds] = useState([])
  const [memoFilter, setMemoFilter] = useState([])
  const [oemIds, setOemIds] = useState([])
  const [cityIds, setCityIds] = useState([])
  const [stateIds, setStateIds] = useState([])
  const [regionIds, setRegionIds] = useState([])
  const [dealerIds, setDealerIds] = useState([])
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [totalAmountDue, setTotalAmountDue] = useState(0)
  const [totalAmountReceive, setTotalAmountReceive] = useState(0)

  useEffect(() => {
    getBiilingList()
  }, [searchQuery, itemsPerPage, currentPage, filterUpdate])
  useEffect(() => {
    getMemoAmount()
  }, [])
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const getBiilingList = async () => {
    setLoader(true)
    const param = {
      search: searchQuery,
      fromDate: startDate,
      toDate: endDate,
      machineIds: machineIds.toString(),
      statuses: memoFilter.toString(),
      dealerIds: dealerIds.toString(),
      stateIds: stateIds.toString(),
      cityIds: cityIds.toString(),
      regionIds: regionIds.toString(),
      oemIds: oemIds.toString(),
      offset: currentPage,
      limit: itemsPerPage
    }
    let memoResponse = await BillingService.getBillingList(param)
    if (memoResponse.code === 200 && memoResponse.success) {
      setMemoTableData(memoResponse?.data?.memoList)
      if (memoResponse?.data?.pagination?.totalItems === 0) {
        setCurrentPage(1)
        setTotalRecord(0)
      } else {
        setTotalRecord(memoResponse?.data?.pagination?.totalItems)
      }
      setLoader(false)
    } else {
      setMemoTableData([])
      setLoader(false)
      setTotalRecord(0)
      setCurrentPage(1)
    }
  }
  const getMemoAmount = async () => {
    setLoader(true)
    const param = {
      startDate: moment().startOf("month").format("YYYY-MM-DD"),
      endDate: moment().endOf("month").format("YYYY-MM-DD")
    }
    let memoResponse = await BillingService.memoAmount(param)
    if (memoResponse.code === 200 && memoResponse.success) {
      setTotalAmountDue(
        memoResponse?.data?.totalAmountDue?.totalAmountDue
          ? memoResponse?.data?.totalAmountDue?.totalAmountDue
          : 0
      )
      setTotalAmountReceive(
        memoResponse?.data?.totalAmountDueReceived?.totalAmountDueReceived
          ? memoResponse?.data?.totalAmountDueReceived?.totalAmountDueReceived
          : 0
      )

      setLoader(false)
    } else {
      setMemoTableData([])
      setLoader(false)
    }
  }

  const handleDownload = async () => {
    setLoader(true)
    const param = {
      search: searchQuery,
      fromDate: startDate,
      toDate: endDate,
      machineIds: machineIds.toString(),
      statuses: memoFilter.toString(),
      dealerIds: dealerIds.toString(),
      stateIds: stateIds.toString(),
      cityIds: cityIds.toString(),
      regionIds: regionIds.toString(),
      oemIds: oemIds.toString(),
      offset: currentPage,
      limit: itemsPerPage
    }
    exportDownload(param)
    setLoader(false)
  }
  const columns = [
    {
      id: "no",
      label: "Sr No.",
      minWidth: 80
    },
    {
      id: "memoId",
      label: "Memo ID",
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
      id: "dateOfMemo",
      label: "Date Of Memo",
      minWidth: 150
    },
    {
      id: "dueDate",
      label: "Due Date",
      minWidth: 150
    },
    {
      id: "totalAmount",
      label: "Total Amount",
      minWidth: 120
    },
    {
      id: "month",
      label: "Month",
      minWidth: 120
    },
    {
      id: "status",
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
          list?.outlet?.name,
          list?.outlet?.dealer?.username,
          list?.outlet?.dealer?.oem?.name,
          list?.outlet?.city?.state?.region?.name,
          list?.outlet?.city?.state?.name,
          list?.outlet?.city?.name,
          list?.machine?.name,
          dateMonthFormat(list?.createdAt, "DD/MM/YYYY"),
          dateMonthFormat(list?.dueDate, "DD/MM/YYYY"),
          list?.totalAmount,
          getMonthName(list?.month),
          <Box
            color={list?.status === "PAID" ? theme.palette.text.green : theme.palette.error.main}>
            {capitaliseString(list?.status)}
          </Box>,
          <Box
            onClick={() => {
              navigate(`/${user?.role}/billing-accounting/advance-memo/${list?.machineMemoId}`)
            }}
            className={styles.viewText}>
            View Memo
          </Box>
        )
      )
    })
  function createData(
    no,
    memoId,
    serviceCentre,
    dealership,
    oem,
    region,
    state,
    city,
    machine,
    dateOfMemo,
    dueDate,
    totalAmount,
    month,
    status,
    action
  ) {
    return {
      no,
      memoId,
      serviceCentre,
      dealership,
      oem,
      region,
      state,
      city,
      machine,
      dateOfMemo,
      dueDate,
      totalAmount,
      month,
      status,
      action
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }

  function handlecloseFilter() {
    setOpenDrawer(false)
  }

  const handleFilter = (
    startDate,
    endDate,
    selectedWashType,
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
    setRegionIds(selectedRegion)
    setOemIds(selectedOEM)
    setCityIds(selectedCity)
    setStateIds(selectedState)
    setDealerIds(selectedDealer)
    setMachineIds(selectedMachine)
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
  }

  return (
    <>
      <Box>
        <BillingHeader
          heading="Advance Memo"
          searchEnabled={true}
          filterEnabled={true}
          badgeData={totalRecord}
          setQuery={setQuery}
          searchQuery={searchQuery}
          handleDrawer={handleDrawer}
          downloadEnabled={user.role === "subadmin" ? subAdminPermission?.exportPermission : true}
          handleDownload={handleDownload}
          setCurrentPage={setCurrentPage}
          totalAmountDue={totalAmountDue}
          amountCardVisible={false}
          totalAmountReceive={totalAmountReceive}
          selectedDate={{ initialStartDate: startDate, initialEndDate: endDate }}
          isFilterUsed={isFilterUsed}
        />
        <Grid container justifyContent="space-between" sx={{ mt: 2 }} gap={1}>
          <Grid xs={12} sm={3.5}>
            <AmountCard
              title="Total Amount Due (incl.Gst)"
              imgSrc={Wallet}
              amount={formatCurrency(totalAmountDue, "")}
              type={"cash"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <AmountCard
              title={"Total Amount Pending"}
              imgSrc={Billing}
              amount={formatCurrency(totalAmountDue - totalAmountReceive, "")}
              type={"pending"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <AmountCard
              title={"Total Amount Due Received"}
              imgSrc={Coins}
              amount={formatCurrency(totalAmountReceive, "")}
              type={"credit"}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: "20px" }}>
          <ListingTable columns={columns} tableData={memoData} />
        </Box>
        <Box sx={{ mt: "20px" }}>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalRecord={totalRecord}
            title={"Records"}
          />
        </Box>
        <FilterDrawer
          open={openDrawer}
          handleDrawer={handleDrawer}
          handleFilter={handleFilter}
          handlecloseFilter={handlecloseFilter}
          memoStatusFilter={true}
          onLoadDate={getMonthDays()}
          moduleType={true}
          showUsedFilter={showUsedFilter}
        />
      </Box>
      {loader && <AppLoader />}
    </>
  )
}

export default AdvanceMemo
