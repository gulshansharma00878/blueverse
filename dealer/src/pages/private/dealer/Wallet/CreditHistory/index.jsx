// INFO : This component will render Blueverse Credit History for individual machine
import React, { useEffect, useState } from "react"
import Divider from "@mui/material/Divider"
import Box from "@mui/system/Box"
import IconButton from "@mui/material/IconButton"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utitlities-components/ListingTable"
import PaginationComponent from "components/utitlities-components/Pagination"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import MachineCards from "components/utitlities-components/TransactionCards/MachineCards"
import AppLoader from "components/Loader/AppLoader"
import { substractFromCurrentDate } from "helpers/app-dates/dates"
import { useParams } from "react-router-dom"
import Credit from "assets/images/Logo/CreditBalance.webp"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import dayjs from "dayjs"
import { fetchCreditBalance, fetchCreditHistory, exportHistoryData } from "../walletutilities"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import BackHeader from "components/utitlities-components/BackHeader"
import { useStyles } from "../walletStyles"
import { Paper } from "@mui/material"

const CreditHistory = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [sortingDescending, setSortingDescending] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [startDate, setStartDate] = useState(dayjs(substractFromCurrentDate(30)))
  const [endDate, setEndDate] = useState(dayjs(new Date()))
  const [toggleFilter, setToggleFilter] = useState(false)
  const [creditBalance, setCreditBalance] = useState("NA")
  const [transactionTypesList, setTransactionTypesList] = useState([])
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const styles = useStyles()
  //eslint-disable-next-line no-unused-vars
  const [machines, setMachines] = useState(new Map())

  useEffect(() => {
    fetchCreditBalance(params?.machineId, setCreditBalance, "credit")
  }, [])
  useEffect(() => {
    getMachines()
  }, [])

  useEffect(() => {
    fetchCreditHistory(
      setIsLoading,
      setCurrentPage,
      setTotalPages,
      setTotalRecords,
      setItemsPerPage,
      setTableData,
      preparePayload()
    )
  }, [
    itemsPerPage,
    currentPage,
    sortingDescending,
    transactionTypesList,
    searchQuery,
    startDate,
    endDate
  ])

  const preparePayload = () => {
    const payload = {
      filters: {
        sourceType: ["CREDIT"], // TODO: We need to update this to CREDIT,
        machineIds: [`${params?.machineId}`], // TODO: Update this to when prashant updates on machine transaction [params?.machineId],
        transactionType: transactionTypesList,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      },
      sort_by: { key: "Date", type: sortingDescending ? "DESC" : "ASC" },
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage,
      CSVType: "BLUEVERSECREDIT_BALANCE_TRANSACTION"
    }
    return payload
  }

  const columns = [
    {
      id: "sr",
      label: "Sr No."
    },
    {
      id: "transactionId",
      label: "Transaction ID"
    },
    {
      id: "transactionType",
      label: "Transaction Type"
    },
    {
      id: "sku",
      label: "SKU"
    },
    {
      id: "washType",
      label: "Wash Type"
    },
    {
      id: "totalAmount",
      label: "Total Amount"
    },
    {
      id: "baseAmount",
      label: "Base Amount"
    },
    {
      id: "cgst",
      label: "Cgst 9%"
    },
    {
      id: "sgst",
      label: "Sgst 9%"
    },
    {
      id: "creditBalance",
      label: "Credits Balance"
    },
    {
      id: "dataTime",
      label: (
        <Box sx={styles.dateColumn}>
          <Box>Date & Time</Box>
          <IconButton
            onClick={() => {
              setSortingDescending((prev) => !prev)
            }}>
            {sortingDescending ? (
              <ArrowDownwardOutlinedIcon color="primary" />
            ) : (
              <ArrowUpwardOutlinedIcon color="primary" />
            )}
          </IconButton>
        </Box>
      )
    }
  ]
  const getMachines = async () => {
    setIsLoading(true)
    const getMachines = await fetchMachines()
    let machineMap = new Map()
    getMachines.forEach((machine) => {
      if (!machineMap.has(machine?.value)) {
        machineMap.set(machine?.value, machine)
      }
    })
    setMachines(machineMap.get(params?.machineId))
    setIsLoading(false)
  }
  const downloadDataHandler = () => {
    // Do something
    exportHistoryData(preparePayload(), setIsLoading)
  }

  const filterDrawerHandler = (...params) => {
    setToggleFilter(false)
    setTransactionTypesList(params[3])
  }

  const startDateHandler = (e) => {
    setStartDate(e?.set("hour", 0).set("minute", 0).set("second", 0))
    // Resettting enddate if start date selected is greater than end date
    if (e > endDate) setEndDate(null)
  }

  const endDateHandler = (e) => {
    setEndDate(e?.set("hour", 23).set("minute", 59).set("second", 59))
    // Resettting start if end date selected is lesser than start date
    if (e < startDate) setStartDate(null)
  }

  return (
    <div>
      <BackHeader
        title={
          machines?.label
            ? "BlueVerse Credits History " + machines?.label
            : "BlueVerse Credits History"
        }
      />
      <Divider sx={{ marginBottom: "2.2rem" }} />
      <CommonHeader
        searchEnabled={true}
        searchQuery={searchQuery}
        setQuery={setSearchQuery}
        downloadEnabled={true}
        handleDownload={downloadDataHandler}
        handleDrawer={() => setToggleFilter(true)}
        showCard={true}
        startDateLabel="Start Date"
        startDatevalue={startDate}
        startDateHandle={startDateHandler}
        endDateLabel="End Date"
        endDatevalue={endDate}
        endDateHandle={endDateHandler}
        maxStartDate={endDate}
        minEndDate={startDate}
        maxEndDate={dayjs(new Date())}
        CardComponent={
          <Box sx={{ width: "38rem" }}>
            <MachineCards
              boxHeading="BlueVerse Credits Balance "
              img={Credit}
              toolTipData="1 BlueVerse Credit = 1 INR"
              amount={creditBalance}
            />
          </Box>
        }
      />
      <Paper sx={styles.paper}>
        <Box sx={{ marginBottom: "2.4rem" }}>
          <ListingTable columns={columns} tableData={tableData} />
        </Box>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecord={totalRecords}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => setItemsPerPage(val)}
          onPageChange={(val) => setCurrentPage(val)}
          label="Records"
        />
      </Paper>
      <FilterDrawer
        open={toggleFilter}
        handleDrawer={() => setToggleFilter(false)}
        handlecloseFilter={() => setToggleFilter(false)}
        showTransactionType
        handleFilter={filterDrawerHandler}
        hideDate
        hideWashType
      />
      {isLoading ? <AppLoader /> : null}
    </div>
  )
}

export default CreditHistory
