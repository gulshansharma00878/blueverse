import { Badge, Box, Grid, IconButton, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import Balance from "assets/images/Logo/WalletBalance.webp"
import Credit from "assets/images/Logo/CreditBalance.webp"
import { useStyles } from "./MachineTransactionHistoryStyles"
import FilterIcon from "../../../assets/images/icons/filterIcon.svg"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import DownloadIcon from "../../../assets/images/icons/downloadIcon.svg"
import { WalletService } from "network/walletService"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import { capitaliseString } from "helpers/Functions/formateString"
import { useNavigate } from "react-router-dom"
import moment from "moment"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import { userDetail } from "hooks/state"
import MachineCards from "components/utilities-components/MachineCards"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import SearchBar from "components/utilities-components/Search"
import PaginationComponent from "components/utilities-components/Pagination"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import { exportHistoryData } from "pages/private/admin/Wallet/walletutilities"
import ListingTable from "components/utilities-components/ListingTable"
import BackHeader from "components/utilities-components/BackHeader"
import Toast from "components/utilities-components/Toast/Toast"

function createData(
  srno,
  transactionid,
  source,
  transactiontype,
  sku,
  dateandtime,
  washtype,
  baseamount,
  cgst,
  sgst,
  totalamount,
  walletbalance,
  creditbalance
) {
  return {
    srno,
    transactionid,
    source,
    transactiontype,
    sku,
    dateandtime,
    washtype,
    baseamount,
    cgst,
    sgst,
    totalamount,
    walletbalance,
    creditbalance
  }
}

function MachineTransactionHistory() {
  const styles = useStyles()
  const navigate = useNavigate()
  const user = userDetail()
  const [searchQuery, setSearchQuery] = useState("")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [sortingDescending, setSortingDescending] = useState("DESC")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [listData, setListData] = useState([])
  const [machineBalance, setMachineBalance] = useState()
  const [sourceType, setSourceType] = useState([])
  const [transactionType, setTransactionType] = useState([])
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [washTypeData, setWashType] = useState()
  const [machines, setMachines] = useState([])
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  const searchParams = new URLSearchParams(window.location.search)
  const dId = searchParams.get("dId")
  const mId = searchParams.get("mId")

  useEffect(() => {
    getMachineList()
  }, [
    searchQuery,
    sortingDescending,
    washTypeData?.length,
    filterUpdate,
    currentPage,
    itemsPerPage
  ])

  useEffect(() => {
    getMachineBalance()
    getMachines()
  }, [dId])
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const getMachineList = async () => {
    setLoading(true)
    const payload = {
      filters: {
        sourceType: sourceType,
        transactionType: transactionType,
        outletIds: false,
        machineIds: [mId],
        washTypeId: washTypeData?.length > 0 && washTypeData.map((item) => item),
        startDate: startDate,
        endDate: endDate
      },
      sort_by: {
        key: "Date",
        type: sortingDescending
      },
      dealerId: dId,
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage
    }
    const response = await WalletService.getTransactionHistory(payload)

    if (response?.success && response?.code === 200) {
      if (searchQuery == "") {
        Toast.showInfoToast(response?.message)
      }
      // setCurrentPage(response?.data?.pagination?.currentPage)
      setTotalPages(response?.data?.pagination?.totalPages)
      setTotalRecords(response?.data?.pagination?.totalItems)
      setItemsPerPage(response?.data?.pagination?.perPage)
      setListData(response?.data?.transactions)
    } else {
      Toast.showErrorToast(response?.message)
    }

    setLoading(false)
  }

  const getMachines = async () => {
    const getMachines = await fetchMachines()
    const machineList = getMachines?.filter((item) => {
      return item?.value == mId
    })
    setMachines(machineList)
  }

  const getMachineBalance = async () => {
    setLoading(true)
    const payload = {
      filters: {
        machineIds: [mId]
      },
      dealerId: dId
    }
    const response = await WalletService.getMachineBalance(payload)
    setMachineBalance(response?.data?.transactions)

    setLoading(false)
  }

  const preparePayload = () => {
    const payload = {
      filters: {
        sourceType: sourceType,
        transactionType: transactionType,
        outletIds: false,
        machineIds: [mId],
        washTypeId: washTypeData?.length > 0 && washTypeData.map((item) => item),
        startDate: startDate,
        endDate: endDate
      },
      sort_by: {
        key: "Date",
        type: sortingDescending
      },
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage,
      CSVType: "ONE_MACHINE_TRANSACTION",
      dealerId: dId
    }
    return payload
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
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

  function handlecloseFilter() {
    setOpenDrawer(false)
  }

  const handleSorting = () => {
    sortingDescending == "DESC" ? setSortingDescending("ASC") : setSortingDescending("DESC")
  }

  const downloadDataHandler = () => {
    // Do something
    exportHistoryData(preparePayload(), setLoading)
  }

  const tableData = listData?.map((list, index) => {
    return createData(
      index + 1,
      list?.uniqueId || "N.A.",
      list?.sourceType == "WALLET" || list?.sourceType == "TOPUP" ? (
        <Typography sx={styles.rowField} color="background.blue4">
          Wallet
        </Typography>
      ) : (
        <Typography sx={styles.rowField} color="text.gold2">
          Credits
        </Typography>
      ),
      <Typography
        sx={styles.rowField}
        color={list?.transactionType === "ADDED" ? "text.green" : "text.red1"}>
        {list?.transactionType == "DEBITED" ? "Deducted" : "Added"}
      </Typography>,
      list?.skuNumber || "N.A.",
      moment(list?.createdAt).format("DD/MM/YYYY hh:mm A"),
      capitaliseString(list?.transactions?.washType?.Name) || "N.A.",
      formatCurrency(list?.baseAmount, "" || 0) || "N.A.",
      formatCurrency(list?.cgst, "" || 0) || "N.A.",
      formatCurrency(list?.sgst, "" || 0) || "N.A.",
      formatCurrency(list?.totalAmount, "" || 0) || "N.A.",
      formatCurrency(parseFloat(list?.walletBalance) + parseFloat(list?.topUpBalance), "") ||
        "N.A.",
      list?.blueverseCredit
    )
  })

  const columns = [
    {
      id: "srno",
      label: "Sr No."
    },
    {
      id: "transactionid",
      label: "Transaction ID"
    },
    {
      id: "source",
      label: "Source"
    },
    {
      id: "transactiontype",
      label: "Transaction Type"
    },
    {
      id: "sku",
      label: "SKU"
    },
    {
      id: "dateandtime",
      label: (
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Box>Date & Time</Box>
          <IconButton onClick={handleSorting}>
            {sortingDescending == "DESC" ? (
              <ArrowDownwardOutlinedIcon color="primary" />
            ) : (
              <ArrowUpwardOutlinedIcon color="primary" />
            )}
          </IconButton>
        </Box>
      )
    },
    {
      id: "washtype",
      label: "Wash Type"
    },

    {
      id: "baseamount",
      label: "Base Amount (INR)"
    },
    {
      id: "cgst",
      label: "Cgst (INR) 9%"
    },
    {
      id: "sgst",
      label: "Sgst (INR) 9%"
    },
    {
      id: "totalamount",
      label: "Total Amount (INR)"
    },
    {
      id: "walletbalance",
      label: "Wallet Balance (INR)"
    },
    {
      id: "creditbalance",
      label: "Credits Balance"
    }
  ]

  return (
    <>
      <BackHeader title={"Transaction History " + (machines?.[0]?.label || "")} />

      <Grid container>
        {loading && <AppLoader />}
        <Grid sx={styles.walletBox} item md={6} xs={12}>
          <MachineCards
            img={Balance}
            xs={6}
            boxHeading="Wallet Balance "
            subHeading=" (Incl. GST)"
            handleText="View History"
            handleToggle={() =>
              navigate(`/${user?.role}/wallet/wallet-balance-history?mId=${mId}&dId=${dId}`)
            }
            customStyles={{ padding: "1.6rem" }}
            currency="INR "
            amount={machineBalance?.walleteBalance}
          />
        </Grid>
        <Grid sx={styles.creditBox} item md={6} xs={12}>
          <MachineCards
            img={Credit}
            xs={6}
            boxHeading="Blueverse Credit Balance"
            handleText="View History"
            handleToggle={() =>
              navigate(`/${user?.role}/wallet/credit-balance-history?mId=${mId}&dId=${dId}`)
            }
            toolTipData="1 BlueVerse Credit = 1 INR"
            customStyles={{ padding: "1.6rem" }}
            amount={machineBalance?.blueverseCredit}
          />
        </Grid>
        <Grid sx={styles.tableBox} xs={12}>
          <Grid justifyContent="space-between" alignItems="center" container sx={styles.searchBox}>
            <Grid xs item>
              <Typography color="text.gray" variant="p2">
                {totalRecords} Records
              </Typography>
            </Grid>
            <Grid
              xs={4}
              item
              container
              direction="row"
              justifyContent="flex-end"
              alignItems="center">
              <SearchBar
                setCurrentPage={setCurrentPage}
                setQuery={setQuery}
                searchQuery={searchQuery}
              />
              <Badge color="primary" variant="dot" invisible={!isFilterUsed}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  // className="filtericonBox"
                  sx={[styles?.iconBox, styles?.marginLeft]}
                  onClick={handleDrawer}>
                  <img src={FilterIcon} style={styles.icon} />
                </IconButton>
              </Badge>
              <Grid sx={[styles?.marginLeft, styles?.borderLeft]}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  sx={[styles?.iconBox, styles?.marginLeft]}
                  onClick={downloadDataHandler}>
                  <img src={DownloadIcon} style={styles.icon} />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <ListingTable columns={columns} tableData={tableData} />
          <Grid style={{ marginTop: "2rem" }}>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecord={totalRecords}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(val) => setItemsPerPage(val)}
              onPageChange={(val) => setCurrentPage(val)}
              label="Transactions"
            />
          </Grid>
        </Grid>
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
      </Grid>
    </>
  )
}

export default MachineTransactionHistory
