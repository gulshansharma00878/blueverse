/*
 * This file contains the code for the Blueverse Credit in Dealer Panel
 * * Dealer would be able to see the list of all the Blueverse Credit send
 * * * by the admin in the current month and view the credits view.
 */
import React, { useEffect, useState } from "react"
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material"
import styles from "./../BillingAccounting.module.scss"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import PaginationComponent from "components/utitlities-components/Pagination"
import ListingTable from "components/utitlities-components/ListingTable"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import { fetchOutlets } from "helpers/Functions/getOutletListing"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import { useSelector } from "react-redux"
import AppLoader from "components/Loader/AppLoader"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import moment from "moment"
import { BillingService } from "network/billingServices"
import { dateMonthFormat, getMonthDays } from "helpers/app-dates/dates"
import { createCreditData, exportDownload, getMonth } from "../billingUtilities"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"

const BlueVerseCredit = ({ employeePermission }) => {
  const userID = useSelector((state) => state?.app?.user?.userId)
  const user = userDetail()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [sort, setSort] = useState("DESC")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [updateFilter, setUpdateFilter] = useState(0)
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [machines, setMachines] = useState([])
  const [outletData, setOutlets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  //eslint-disable-next-line no-unused-vars
  const [memoTableData, setMemoTableData] = useState([])
  useEffect(() => {
    fetchOutlets(userID, setOutlets)
  }, [])
  useEffect(() => {
    getBillingList()
  }, [
    searchQuery,
    itemsPerPage,
    currentPage,
    updateFilter,
    dropDownOutletData?.length,
    dropDownMachineData?.length,
    sort
  ])
  useEffect(() => {
    getMachines()
  }, [dropDownOutletData?.length])

  const getMachines = async () => {
    setIsLoading(true)
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
    const getMachines = await fetchMachines(params)
    setMachines(getMachines)
    setIsLoading(false)
  }
  const handleSorting = () => {
    sort === "DESC" ? setSort("ASC") : setSort("DESC")
  }
  const handlePageChange = (page) => {
    setCurrentPage(page)
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
      id: "dateOfInvoice",
      label: (
        <Box className={styles.invoiceDate}>
          <Box> Invoice Date </Box>
          <IconButton onClick={handleSorting}>
            {sort === "ASC" ? (
              <ArrowDownwardOutlinedIcon color="primary" />
            ) : (
              <ArrowUpwardOutlinedIcon color="primary" />
            )}
          </IconButton>
        </Box>
      ),
      minWidth: 120
    },
    {
      id: "month",
      label: "Month",
      minWidth: 120
    },
    {
      id: "totalAmt",
      label: "Total Amount",
      minWidth: 120
    },
    {
      id: "action",
      label: "Action",
      minWidth: 120
    }
  ]

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const exportCSV = async () => {
    setIsLoading(true)
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
      type: "BLUEVERSE_CREDIT",

      sort: sort
    }
    await exportDownload(param)
    setIsLoading(false)
  }
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  function handlecloseFilter() {
    setOpenDrawer(false)
  }
  const handleFilter = (...params) => {
    const start = params[0]
    const end = params[1]
    setStartDate(start ? moment(start.toString()).format("YYYY-MM-DD") : "")
    setEndDate(end ? moment(params[1].toString()).format("YYYY-MM-DD") : "")
    setUpdateFilter(updateFilter + 1)
    handlecloseFilter()
  }
  const handleRoutes = (list) => {
    // Routing of Memo is done inside this function
    navigate(`/${user?.role}/billing-accounting/credits-memo/${list?.machineMemoId}`)
  }
  const getBillingList = async () => {
    setIsLoading(true)
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
      type: "BLUEVERSE_CREDIT",
      sort: sort
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
      setIsLoading(false)
    } else {
      setMemoTableData([])
      setIsLoading(false)
      setTotalRecord(0)
      setCurrentPage(1)
    }
  }

  let memoData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    memoTableData &&
    memoTableData.length > 0 &&
    memoTableData.map((list, i) => {
      return memoData.push(
        createCreditData(
          i + 1,
          list?.memoId,
          list?.outlet?.name,
          list?.machine?.name,
          dateMonthFormat(list?.createdAt, "DD/MM/YYYY"),
          getMonth(list?.month),
          Math.round(list?.creditRemainingBalance),
          <Box className={styles.viewText1} onClick={handleRoutes.bind(null, list)}>
            View Memo
          </Box>
        )
      )
    })
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  return (
    <Box>
      {isLoading && <AppLoader />}
      <CommonHeader
        showDropDown1={{
          data: outletData,
          handleDropDown: (val) => {
            setDropDownOutletData(val)
          },
          value: dropDownOutletData
        }}
        badgeData={totalRecord}
        showDropDown2={{
          data: machines,
          handleDropDown: (val) => {
            setDropDownMachineData(val)
          },
          value: dropDownMachineData
        }}
        heading="BlueVerse Credits"
        searchEnabled={true}
        filterEnabled={true}
        setQuery={setSearchQuery}
        handleDrawer={handleDrawer}
        searchQuery={searchQuery}
        isFilterUsed={isFilterUsed}
        downloadEnabled={
          user?.role == "employee" ? (employeePermission?.exportPermission ? true : false) : true
        }
        handleDownload={exportCSV}
        setCurrentPage={setCurrentPage}
        isMobile={isMobile}
        selectedDate={{ initialStartDate: startDate, initialEndDate: endDate }}
      />
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
          label="Credits"
        />
      </Box>
      <FilterDrawer
        open={openDrawer}
        handleDrawer={handleDrawer}
        handleFilter={handleFilter}
        handlecloseFilter={handlecloseFilter}
        hideWashType
        onLoadDate={getMonthDays()}
        moduleType={true}
        showUsedFilter={showUsedFilter}
      />
    </Box>
  )
}

export default BlueVerseCredit
