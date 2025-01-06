import React, { useState, useEffect } from "react"
import { Box, useMediaQuery } from "@mui/material"
import ListingTable from "components/utitlities-components/ListingTable"
import { useTheme } from "@mui/material"
import styles from "./../BillingAccounting.module.scss"
import PaginationComponent from "components/utitlities-components/Pagination"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import { BillingService } from "network/billingServices"
import AppLoader from "components/Loader/AppLoader"
import { dateMonthFormat, getMonthDays } from "helpers/app-dates/dates"
import { capitaliseString } from "helpers/Functions/formateString"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import moment from "moment"
import { useDispatch, useSelector } from "react-redux"
import { createTopUpData, exportDownload } from "../billingUtilities"
import { fetchOutlets } from "helpers/Functions/getOutletListing"
import { useNavigate } from "react-router-dom"
import { billingActions } from "redux/store"
import { userDetail } from "hooks/state"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
const ToopupMemo = ({ employeePermission }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const userID = useSelector((state) => state?.app?.user?.userId)
  const user = userDetail()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [memoTableData, setMemoTableData] = useState([])
  const [totalRecord, setTotalRecord] = useState(0)
  const [loader, setLoader] = useState(false)
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [machines, setMachines] = useState([])
  const [outletData, setOutlet] = useState([])
  const [memoFilter, setMemoFilter] = useState([])
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  useEffect(() => {
    fetchOutlets(userID, setOutlets)
  }, [])
  useEffect(() => {
    getMachines()
  }, [dropDownOutletData?.length])
  useEffect(() => {
    getBillingList()
  }, [
    searchQuery,
    itemsPerPage,
    currentPage,
    filterUpdate,
    dropDownOutletData?.length,
    dropDownMachineData?.length
  ])
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const getBillingList = async () => {
    setLoader(true)
    const param = {
      search: searchQuery,
      fromDate: startDate,
      toDate: endDate,
      outletIds:
        dropDownOutletData?.length > 0 && dropDownOutletData.map((item) => item?.value).toString(),
      machineIds:
        dropDownMachineData?.length > 0 &&
        dropDownMachineData.map((item) => item?.value).toString(),
      offset: currentPage,
      limit: itemsPerPage,
      type: "TOPUP_MEMO",
      statuses: memoFilter.toString()
    }
    let billingResponse = await BillingService.getBillingList(param)
    if (billingResponse.code === 200 && billingResponse.success) {
      setMemoTableData(billingResponse?.data?.memoList)
      if (billingResponse?.data?.memoList?.length === 0) {
        setTotalRecord(0)
        setCurrentPage(1)
      } else {
        setTotalRecord(billingResponse?.data?.pagination?.totalItems)
      }
      setLoader(false)
    } else {
      setMemoTableData([])
      setLoader(false)
      setCurrentPage(1)
      setTotalRecord(0)
    }
  }
  const handleRoutes = (list) => {
    dispatch(billingActions.setIsTopUp(true))
    navigate(`/${user?.role}/billing-accounting/topup-memo/${list?.machineMemoId}`)
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
      id: "totalAmount",
      label: "Total Amount",
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
        createTopUpData(
          i + 1,
          list?.memoId,
          list?.outlet?.name,
          list?.machine?.name,
          dateMonthFormat(list?.createdAt, "DD/MM/YYYY"),
          list?.totalAmount,
          <Box
            color={list?.status === "PAID" ? theme.palette.text.green : theme.palette.error.main}>
            {capitaliseString(list?.status)}
          </Box>,
          <Box onClick={handleRoutes.bind(null, list)} className={styles.viewText1}>
            View Memo
          </Box>
        )
      )
    })
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

  const handleFilter = (...params) => {
    const sDate = params[0]
    const eDate = params[1]
    const stat = params[6]
    setStartDate(sDate ? moment(sDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(eDate ? moment(eDate.toString()).format("YYYY-MM-DD") : "")
    setMemoFilter(stat)
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
  }

  const getMachines = async () => {
    setLoader(true)
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
    const getMachines = await fetchMachines(params)
    setMachines(getMachines)
    setLoader(false)
  }

  const setOutlets = (outletList) => {
    setOutlet(outletList)
  }
  const exportCSV = async () => {
    setLoader(true)
    const param = {
      search: searchQuery,
      fromDate: startDate,
      toDate: endDate,
      outletIds:
        dropDownOutletData?.length > 0 && dropDownOutletData.map((item) => item?.value).toString(),
      machineIds:
        dropDownMachineData?.length > 0 &&
        dropDownMachineData.map((item) => item?.value).toString(),
      offset: currentPage,
      limit: itemsPerPage,
      type: "TOPUP_MEMO",
      statuses: memoFilter.toString()
    }
    await exportDownload(param)
    setLoader(false)
  }
  return (
    <>
      <Box>
        <CommonHeader
          showDropDown1={{
            data: outletData,
            handleDropDown: (val) => {
              setDropDownOutletData(val)
            },
            value: dropDownOutletData
          }}
          showDropDown2={{
            data: machines,
            handleDropDown: (val) => {
              setDropDownMachineData(val)
            },
            value: dropDownMachineData
          }}
          heading="TopUp Memo"
          searchEnabled={true}
          filterEnabled={true}
          setQuery={setQuery}
          handleDrawer={handleDrawer}
          searchQuery={searchQuery}
          downloadEnabled={
            user?.role == "employee" ? (employeePermission?.exportPermission ? true : false) : true
          }
          handleDownload={exportCSV}
          setCurrentPage={setCurrentPage}
          isMobile={isMobile}
          selectedDate={{ initialStartDate: startDate, initialEndDate: endDate }}
          isFilterUsed={isFilterUsed}
        />
        <Box sx={{ mt: "2rem" }}>
          <ListingTable columns={columns} tableData={memoData} />
        </Box>
        <Box sx={{ mt: "2rem" }}>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalRecord={totalRecord}
            title={"Records"}
            label="Memo"
          />
        </Box>
        <FilterDrawer
          open={openDrawer}
          handleDrawer={handleDrawer}
          handleFilter={handleFilter}
          handlecloseFilter={handlecloseFilter}
          memoStatusFilter={true}
          hideWashType
          onLoadDate={getMonthDays()}
          moduleType={true}
          showUsedFilter={showUsedFilter}
        />
      </Box>
      {loader && <AppLoader />}
    </>
  )
}

export default ToopupMemo
