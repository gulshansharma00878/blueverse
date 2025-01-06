import React, { useEffect, useState } from "react"
import { Box } from "@mui/system"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utitlities-components/ListingTable"
import PaginationComponent from "components/utitlities-components/Pagination"
import WalletHeader from "components/Wallet/WalletHeader"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import { Grid, IconButton, Paper, Typography, useMediaQuery } from "@mui/material"
import { useStyles } from "./walletStyles"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import moment from "moment"
import { WalletService } from "network/walletService"
import {
  createMultipleMachineData,
  createMultipleOutletMachineData,
  createTransactionData,
  exportHistoryData,
  getNumbers
} from "./walletutilities"
import { useSelector } from "react-redux"
import AppLoader from "components/Loader/AppLoader"
import Toast from "components/utitlities-components/Toast/Toast"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import { fetchOutlets } from "helpers/Functions/getOutletListing"
import { useTheme } from "@mui/material"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"

const TransactionHistory = () => {
  const userID = useSelector((state) => state?.app?.user?.userId)
  const user = userDetail()
  const theme = useTheme()
  const styles = useStyles()
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
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [machines, setMachines] = useState([])
  const [outletData, setOutlet] = useState([])
  const [washTypeData, setWashType] = useState()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sourceType, setSourceType] = useState([])
  const [transactionType, setTransactionType] = useState([])
  const [singleOutletData, setSingleOutletData] = useState([])
  const [walletCreditBalance, setWalletCreditBalance] = useState(null)
  const [employeePermission, setEmployeePermission] = useState()

  useEffect(() => {
    fetchOutlets(userID, setOutlets)
    getMachineBalance()
    getAllpermission()
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
  const handleSorting = () => {
    sort === "DESC" ? setSort("ASC") : setSort("DESC")
  }
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  const setOutlets = (outletList) => {
    setOutlet(outletList)
  }
  const handleFilter = (startDate, endDate, selectedWashType, transactionType, sourceType) => {
    setStartDate(startDate ? moment(startDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(endDate ? moment(endDate.toString()).format("YYYY-MM-DD") : "")
    setWashType(selectedWashType)
    setSourceType(sourceType)
    setTransactionType(transactionType)
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
      offset: currentPage
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
                color={
                  item?.sourceType === "WALLET" || item?.sourceType === "TOPUP"
                    ? theme.palette.background.blue3
                    : theme.palette.text.gold2
                }
                variant="h6"
                sx={styles?.fontSize}
                component="div">
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
                color={item?.transactionType === "ADDED" && theme.palette.background.green}
                sx={styles?.fontSize}>
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
                variant="h6"
                sx={styles?.fontSize}
                color={item?.transactionType === "ADDED" ? "text.green" : "text.red1"}
                component="div">
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
    const response = await WalletService.getMachineBalance()
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
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const columns = [
    {
      id: "srNo",
      label: "Sr No.",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      label: "Transaction ID",
      id: "transID",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      label: "Source",
      id: "src",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      label: "Transaction Type",
      id: "transType",
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
      label: outletData?.length === 1 ? "Wallet Balance(INR)" : "Machine Wallet (INR)",
      id: "balance",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      label: outletData?.length === 1 ? "Credit Balance" : "Blueverse Credit",
      id: "credit",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "baseAmt",
      label: "Base Amount",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      label: "CGST (INR)9%",
      id: "cgst",
      minWidth: machines?.length === 1 ? 100 : 120
    },
    {
      id: "sgst",
      minWidth: machines?.length === 1 ? 100 : 120,
      label: "SGST (INR)9%"
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
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
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
      CSVType: "ALL_TRANSACTION"
    }
    return payload
  }
  const downloadDataHandler = () => {
    // Do something
    exportHistoryData(preparePayload(), setIsLoading)
  }

  async function getAllpermission() {
    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "wallet")
        setEmployeePermission(permissionJson?.permissionObj)
      }
    }
  }

  return (
    <>
      {isLoading && <AppLoader />}
      <WalletHeader
        role={user?.role}
        employeePermission={employeePermission}
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
              value: dropDownOutletData
            }
          }
          showDropDown2={
            machines?.length > 1 && {
              data: machines,
              handleDropDown: (val) => {
                setDropDownMachineData(val)
              },
              value: dropDownMachineData
            }
          }
          isFilterUsed={isFilterUsed}
          heading="Transaction History"
          // badgeData={washData?.length}
          searchEnabled={true}
          filterEnabled={true}
          handleDrawer={handleDrawer}
          searchQuery={searchQuery}
          setQuery={setSearchQuery}
          downloadEnabled={true}
          handleDownload={downloadDataHandler}
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
        showUsedFilter={showUsedFilter}
      />
    </>
  )
}

export default TransactionHistory
