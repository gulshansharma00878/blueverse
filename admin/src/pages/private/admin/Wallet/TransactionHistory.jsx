/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react"
import { Box } from "@mui/system"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import { Grid, IconButton, Paper, Typography, useMediaQuery } from "@mui/material"
import { useStyles } from "./walletStyles"
import moment from "moment"
import { WalletService } from "network/walletService"
import {
  createMultipleMachineData,
  createMultipleOutletMachineData,
  createTransactionData,
  exportHistoryData,
  getNumbers
} from "./walletutilities"
import { useTheme } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import { fetchOutlets } from "helpers/Functions/getOutletListing"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import WalletHeader from "components/Wallet/WalletHeader"
import { useParams } from "react-router-dom"

const TransactionHistory = () => {
  const theme = useTheme()
  const styles = useStyles()
  const param = useParams()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [sort, setSort] = useState("DESC")
  const [machines, setMachines] = useState([])
  const [outletData, setOutlet] = useState([])
  const [washTypeData, setWashType] = useState()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sourceType, setSourceType] = useState([])
  const [transactionType, setTransactionType] = useState([])
  const [singleOutletData, setSingleOutletData] = useState([])
  const [walletCreditBalance, setWalletCreditBalance] = useState(null)
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  useEffect(() => {
    fetchOutlets(param?.dealerId, setOutlets)
    getMachineBalance()
  }, [])

  useEffect(() => {
    getMachines()
  }, [dropDownOutletData?.length])
  useEffect(() => {
    fetchTransactionDetails()
  }, [
    outletData?.length,
    machines?.length,
    sort,
    filterUpdate,
    dropDownOutletData?.length,
    dropDownMachineData?.length,
    washTypeData?.length,
    searchQuery,
    itemsPerPage,
    currentPage
  ])
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const handleSorting = () => {
    sort === "DESC" ? setSort("ASC") : setSort("DESC")
  }
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  const setOutlets = (outletList) => {
    setOutlet(outletList)
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
    selectedMemoFilter,
    selectedMachineStatusFilter,
    selectedOutlets,
    selectedTransactionType,
    selectedSource
  ) => {
    setStartDate(startDate ? moment(startDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(endDate ? moment(endDate.toString()).format("YYYY-MM-DD") : "")
    setWashType(selectedWashType)
    setSourceType(selectedSource)
    setTransactionType(selectedTransactionType)
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
  }
  const handlecloseFilter = () => {
    setOpenDrawer(false)
  }

  async function fetchTransactionDetails() {
    setIsLoading(true)
    const payload = {
      filters: {
        sourceType: sourceType,
        transactionType: transactionType,
        outletIds: dropDownOutletData?.length > 0 && dropDownOutletData.map((item) => item?.value),
        machineIds:
          dropDownMachineData?.length > 0 && dropDownMachineData.map((item) => item?.value),
        washTypeId: washTypeData,
        startDate: startDate,
        endDate: endDate
      },
      sort_by: {
        key: "Date",
        type: sort
      },
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage,
      dealerId: param?.dealerId
    }
    const response = await WalletService.getTransactionHistory(payload)

    if (response.success && response.code === 200) {
      let transactions = response?.data?.transactions
      let pagination = response?.data?.pagination

      if (transactions) {
        let data = []
        if (machines?.length === 1 && outletData?.length === 1) {
          data = transactions.map((item, index) =>
            createTransactionData(
              <Grid key={item?.machineId}>{index + 1}</Grid>,
              item?.uniqueId || "N.A.",
              <Typography
                variant="h6"
                component="div"
                sx={styles?.fontSize}
                color={
                  item?.sourceType === "WALLET" || item?.sourceType === "TOPUP"
                    ? theme.palette.background.blue3
                    : theme.palette.text.gold2
                }>
                {item?.sourceType === "WALLET" || item?.sourceType === "TOPUP"
                  ? "Wallet"
                  : "Credits"}
              </Typography>,
              item?.transactionType == "DEBITED" ? "Deducted" : "Added",
              item?.skuNumber || "N.A.",
              moment(item?.createdAt).format("DD/MM/YYYY hh:mm A"),
              item?.transactions?.washType?.Name || "N.A.",
              getNumbers(item?.topUpBalance, item?.walletBalance) || "N.A.",
              item?.blueverseCredit || "N.A.",
              item?.baseAmount || "N.A.",
              item?.cgst || "N.A.",
              item?.sgst || "N.A.",
              <Typography
                variant="h6"
                component="div"
                sx={styles?.fontSize}
                color={item?.transactionType === "ADDED" && theme.palette.background.green}>
                {item?.totalAmount}
              </Typography>
            )
          )
        } else if (machines?.length > 1 && outletData?.length === 1) {
          data = transactions.map((item, index) => {
            return createMultipleMachineData(
              <Grid key={item?.machineId}>{index + 1}</Grid>,
              item?.uniqueId || "N.A.",
              <Typography
                component="div"
                variant="h6"
                sx={styles?.fontSize}
                color={
                  item?.sourceType === "WALLET" || item?.sourceType === "TOPUP"
                    ? theme.palette.background.blue3
                    : theme.palette.text.gold2
                }>
                {item?.sourceType === "WALLET" || item?.sourceType === "TOPUP"
                  ? "Wallet"
                  : "Credits"}
              </Typography>,
              item?.transactionType == "DEBITED" ? "Deducted" : "Added",
              item?.skuNumber || "N.A.",
              item?.machine?.name || "N.A.",
              item?.transactions?.washType?.Name || "N.A.",
              getNumbers(item?.topUpBalance, item?.walletBalance) || "N.A.",
              item?.blueverseCredit || "N.A.",
              item?.baseAmount || "N.A.",
              item?.cgst || "N.A.",
              item?.sgst || "N.A.",
              <Typography
                variant="h6"
                component="div"
                sx={styles?.fontSize}
                color={item?.transactionType === "ADDED" && theme.palette.background.green}>
                {item?.totalAmount || "N.A."}
              </Typography>,
              moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
            )
          })
        } else {
          data = transactions.map((item, index) =>
            createMultipleOutletMachineData(
              <Grid key={item?.machineId}>{index + 1}</Grid>,
              item?.uniqueId || "N.A.",
              <Typography
                variant="h6"
                component="div"
                sx={styles?.fontSize}
                color={
                  item?.sourceType === "WALLET" || item?.sourceType === "TOPUP"
                    ? theme.palette.background.blue3
                    : theme.palette.text.gold2
                }>
                {item?.sourceType === "WALLET" || item?.sourceType === "TOPUP"
                  ? "Wallet"
                  : "Credits"}
              </Typography>,
              <Typography
                sx={styles?.fontSize}
                variant="h6"
                component="div"
                color={item?.transactionType === "ADDED" ? "text.green" : "text.red1"}>
                {item?.transactionType == "DEBITED" ? "Deducted" : "Added"}
              </Typography>,
              item?.skuNumber || "N.A.",
              item?.machine?.outlet?.name || "N.A.",
              item?.transactions?.washType?.Name || "N.A.",
              item?.machine?.name || "N.A.",
              getNumbers(item?.topUpBalance, item?.walletBalance) || "N.A.",
              item?.blueverseCredit || "N.A.",
              item?.baseAmount || "N.A.",
              item?.cgst || "N.A.",
              item?.sgst || "N.A.",
              <Typography
                variant="h6"
                component="div"
                sx={styles?.fontSize}
                color={item?.transactionType === "ADDED" && theme.palette.background.green}>
                {item?.totalAmount || "N.A."}
              </Typography>,
              moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
            )
          )
        }
        setSingleOutletData(data)
      }
      if (pagination) {
        setCurrentPage(pagination?.currentPage)
        setTotalPages(pagination?.totalPages)
        setTotalRecords(pagination?.totalItems)
        setItemsPerPage(pagination?.perPage)
      }
    } else {
      Toast.showErrorToast(response?.message)
    }
    setIsLoading(false)
  }

  const getMachineBalance = async () => {
    setIsLoading(true)
    const payload = {
      dealerId: param?.dealerId
    }
    const response = await WalletService.getMachineBalance(payload)
    if (response?.success && response?.code === 200) {
      setWalletCreditBalance({
        walletBalance: response?.data?.transactions?.walleteBalance,
        creditBalance: response?.data?.transactions?.blueverseCredit
      })
      setIsLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setIsLoading(false)
    }
  }
  const columns = [
    {
      id: "srNo",
      label: "Sr No.",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "transID",
      label: "Transaction ID",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "src",
      label: "Source",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "transType",
      label: "Transaction Type",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "sku",
      label: "SKU",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "type",
      label: "Wash Type",
      minWidth: machines?.length === 1 ? 100 : 120
    },

    {
      id: "balance",
      label: outletData?.length === 1 ? "Wallet Balance(INR)" : "Machine Wallet (INR)",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "credit",
      label: outletData?.length === 1 ? "Credit Balance" : "Blueverse Credit",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "baseAmt",
      label: "Base Amount",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "cgst",
      label: "CGST (INR)9%",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "sgst",
      label: "SGST (INR)9%",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "total",
      label: "Total Amount",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "date",
      label: (
        <Box sx={styles.dateColumn}>
          <Box>Date & Time</Box>
          <IconButton onClick={handleSorting}>
            {sort === "ASC" ? (
              <ArrowUpwardOutlinedIcon color="primary" />
            ) : (
              <ArrowDownwardOutlinedIcon color="primary" />
            )}
          </IconButton>
        </Box>
      ),
      minWidth: machines?.length === 1 ? 100 : 120
    }
  ]

  machines?.length > 1 &&
    columns.splice(5, 0, {
      id: "machines",
      label: "Machine",
      minWidth: machines?.length === 1 ? 100 : 120
    })

  outletData?.length > 1 &&
    columns.splice(machines?.length > 1 ? 6 : 5, 0, {
      id: "serviceCenter",
      label: "Service Center",
      minWidth: machines?.length === 1 ? 100 : 120
    })

  const getMachines = async () => {
    setIsLoading(true)
    const params = [
      `?outletIds=${dropDownOutletData.map((item) => item?.value)}&dealerId=${param?.dealerId}`
    ]
    const getMachines = await fetchMachines(params)
    setMachines(getMachines)
    setIsLoading(false)
  }

  const preparePayload = () => {
    const payload = {
      filters: {
        sourceType: sourceType,
        transactionType: transactionType,
        outletIds: dropDownOutletData?.length > 0 && dropDownOutletData.map((item) => item?.value),
        machineIds:
          dropDownMachineData?.length > 0 && dropDownMachineData.map((item) => item?.value),
        washTypeId: washTypeData,
        startDate: startDate,
        endDate: endDate
      },
      sort_by: {
        key: "Date",
        type: sort
      },
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage,
      CSVType: "ALL_TRANSACTION",
      dealerId: param?.dealerId
    }
    return payload
  }
  const downloadDataHandler = () => {
    // Do something
    exportHistoryData(preparePayload(), setIsLoading)
  }

  return (
    <>
      {isLoading && <AppLoader />}
      <WalletHeader
        dealerId={param?.dealerId}
        machineLength={machines?.length}
        creditBalance={walletCreditBalance}
        machines={machines}
        machineId={
          singleOutletData?.length > 0 ? singleOutletData?.[0]?.srNo?.key : machines[0]?.value
        }
        areTransactions={singleOutletData?.length > 0}
      />
      <Paper sx={styles.paper}>
        <CommonHeader
          showDropDown1={
            outletData?.length > 1 && {
              data: outletData,
              handleDropDown: (val) => {
                setDropDownOutletData(val)
              },
              value: dropDownOutletData,
              label: "Select Outlet"
            }
          }
          showDropDown2={
            machines?.length > 1 && {
              data: machines,
              handleDropDown: (val) => {
                setDropDownMachineData(val)
              },
              value: dropDownMachineData,
              label: "Select Machine"
            }
          }
          heading="Transaction History"
          searchEnabled={true}
          filterEnabled={true}
          handleDrawer={handleDrawer}
          searchQuery={searchQuery}
          setQuery={setSearchQuery}
          downloadEnabled={true}
          handleDownload={downloadDataHandler}
          setCurrentPage={() => setCurrentPage()}
          isFilterUsed={isFilterUsed}
          isMobile={isMobile}
        />{" "}
        <Box sx={{ marginY: "2.4rem" }}>
          <ListingTable columns={columns} tableData={singleOutletData} />
        </Box>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecord={totalRecords}
          label="Transactions"
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => setItemsPerPage(val)}
          onPageChange={(val) => setCurrentPage(val)}
        />
      </Paper>
      <FilterDrawer
        open={openDrawer}
        handleDrawer={handleDrawer}
        handleFilter={handleFilter}
        handlecloseFilter={handlecloseFilter}
        showTransactionType
        showSource
        washTypeFilter
        oemFilter={false}
        machineFilter={false}
        dealerFilter={false}
        stateFilter={false}
        cityFilter={false}
        regionFilter={false}
        showUsedFilter={showUsedFilter}
      />
    </>
  )
}

export default TransactionHistory
