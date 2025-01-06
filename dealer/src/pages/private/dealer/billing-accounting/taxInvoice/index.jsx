/*
 * This file contains the code for the Tax invoice n Dealer Panel
 * * Dealer would be able to see the list of all the Tax invoices send
 * * * by the admin in the current month and view the invoices raised.
 */
import React, { useEffect, useState } from "react"
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import ListingTable from "components/utitlities-components/ListingTable"
import PaginationComponent from "components/utitlities-components/Pagination"
import styles from "./../BillingAccounting.module.scss"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import moment from "moment"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import { useSelector } from "react-redux"
import { fetchOutlets } from "helpers/Functions/getOutletListing"
import AppLoader from "components/Loader/AppLoader"
import { BillingService } from "network/billingServices"
import { createInvoiceData, exportDownload, getMonth } from "../billingUtilities"
import { dateMonthFormat, getMonthDays } from "helpers/app-dates/dates"

const TaxInvoice = ({ employeePermission }) => {
  const navigate = useNavigate()
  const user = userDetail()
  const userID = useSelector((state) => state?.app?.user?.userId)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [sort, setSort] = useState("DESC")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [startDate, setStartDate] = useState(getMonthDays()?.initialStartDate)
  const [endDate, setEndDate] = useState(getMonthDays()?.initialEndDate)
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [machines, setMachines] = useState([])
  const [outletData, setOutlets] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [memoTableData, setMemoTableData] = useState([])
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
    dropDownMachineData?.length,
    sort
  ])
  //eslint-disable-next-line no-unused-vars
  const handleRoutes = (list) => {
    // Routing of Memo is done inside this function
    navigate(`/${user?.role}/billing-accounting/taxinvoice-memo/${list?.machineMemoId}`)
  }
  const handleSorting = () => {
    sort === "DESC" ? setSort("ASC") : setSort("DESC")
  }
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }

  const handleFilter = (...params) => {
    const start = params[0]
    const end = params[1]
    setStartDate(start ? moment(start.toString()).format("YYYY-MM-DD") : "")
    setEndDate(end ? moment(params[1].toString()).format("YYYY-MM-DD") : "")
    setFilterUpdate(filterUpdate + 1)
    handlecloseFilter()
  }

  function handlecloseFilter() {
    setOpenDrawer(false)
  }
  const getMachines = async () => {
    setLoading(true)
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
    const getMachines = await fetchMachines(params)
    setMachines(getMachines)
    setLoading(false)
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
      id: "machine",
      label: "Machine",
      minWidth: 120
    },
    {
      id: "dateOfInvoice",
      label: (
        <Box className={styles.invoiceDate}>
          <Box>Invoice Date</Box>
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
      label: "Total Amount Incl. GST(INR)",
      minWidth: 120
    },
    {
      id: "action",
      label: "Action",
      minWidth: 120
    }
  ]

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const getBillingList = async () => {
    setLoading(true)
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
      type: "TAX_INVOICE",
      sort: sort
    }
    let billingResponse = await BillingService.getBillingList(param)
    if (billingResponse.code === 200 && billingResponse.success) {
      if (billingResponse?.data?.memoList?.length === 0) {
        setTotalRecord(0)
        setCurrentPage(1)
        setMemoTableData([])
      } else {
        setMemoTableData(billingResponse?.data?.memoList)
        setTotalRecord(billingResponse?.data?.pagination?.totalItems)
      }
      setLoading(false)
    } else {
      setMemoTableData([])
      setLoading(false)
      setTotalRecord(0)
      setCurrentPage(1)
    }
  }
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  let memoData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    memoTableData &&
    memoTableData.length > 0 &&
    memoTableData.map((list, i) => {
      return memoData.push(
        createInvoiceData(
          i + 1,
          list?.memoId,
          list?.outlet?.name,
          list?.machine?.name,
          dateMonthFormat(list?.createdAt, "DD/MM/YYYY"),
          getMonth(list?.month),
          list?.totalAmount,
          <Box onClick={handleRoutes.bind(null, list)} className={styles.viewText1}>
            View Invoice
          </Box>
        )
      )
    })
  const exportCSV = async () => {
    setLoading(true)
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
      type: "TAX_INVOICE",
      sort: sort
    }
    await exportDownload(param)
    setLoading(false)
  }
  return (
    <Box>
      {loading && <AppLoader />}
      <CommonHeader
        isFilterUsed={isFilterUsed}
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
        heading="Tax Invoice"
        searchEnabled={true}
        filterEnabled={true}
        setQuery={setSearchQuery}
        handleDrawer={handleDrawer}
        searchQuery={searchQuery}
        downloadEnabled={
          user?.role == "employee" ? (employeePermission?.exportPermission ? true : false) : true
        }
        handleDownload={exportCSV}
        setCurrentPage={setCurrentPage}
        isMobile={isMobile}
        selectedDate={{ initialStartDate: startDate, initialEndDate: endDate }}
      />{" "}
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
          label="Tax Invoices"
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

export default TaxInvoice
