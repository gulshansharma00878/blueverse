import React, { useEffect, useState } from "react"
import ListingTable from "components/utitlities-components/ListingTable"
import { Box, Divider, Grid, IconButton, Paper, Typography } from "@mui/material"
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined"
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined"
import { useStyles } from "../walletStyles"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import PaginationComponent from "components/utitlities-components/Pagination"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import WalletHistoryCard from "components/Wallet/WalletHistoryCard"
import Balance from "assets/images/Logo/WalletBalance.webp"
import { WalletService } from "network/walletService"
import AppLoader from "components/Loader/AppLoader"
import Toast from "components/utitlities-components/Toast/Toast"
import { dateMonthFormat } from "helpers/app-dates/dates"
import { createWalletHistoryData, exportHistoryData, fetchCreditBalance } from "../walletutilities"
import dayjs from "dayjs"
import { substractFromCurrentDate } from "helpers/app-dates/dates"
import { useParams } from "react-router-dom"
import { fetchMachines } from "helpers/Functions/getMachinesListing"
import AddMoneyPopup from "components/Wallet/AddMoneyPopup"
import PopupModal from "components/PopupModal"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import { getMinPricePlan } from "helpers/Functions/dealerUtilities"
import BackHeader from "components/utitlities-components/BackHeader"
import MachineCards from "components/utitlities-components/TransactionCards/MachineCards"

const WalletBalanceHistory = () => {
  const styles = useStyles()
  const params = useParams()
  const dispatch = useDispatch()
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [walletHistory, setWalletHistory] = useState([])
  const [openDrawer, setOpenDrawer] = useState(false)
  const [sort, setSort] = useState("DESC")
  const [filterUpdate, setFilterUpdate] = useState(0)
  const [startDate, setStartDate] = useState(dayjs(substractFromCurrentDate(30)))
  const [endDate, setEndDate] = useState(dayjs(new Date()))
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [creditBalance, setCreditBalance] = useState(0)
  const [machines, setMachines] = useState(new Map())
  const [washBasePrice, setWashBasePrice] = useState(0)

  useEffect(() => {
    getMachines()
    handleClosePopup()
  }, [])
  useEffect(() => {
    fetchCreditBalance(params?.machineId, setCreditBalance, "wallet")
  }, [])
  useEffect(() => {
    params?.machineId && getMachineBalane()
  }, [
    sort,
    filterUpdate,
    currentPage,
    itemsPerPage,
    params?.machineId,
    searchQuery,
    startDate,
    endDate
  ])
  const handleSorting = () => {
    sort === "DESC" ? setSort("ASC") : setSort("DESC")
  }

  const columns = [
    {
      id: "srNo",
      label: "Sr No.",
      minWidth: 100
    },
    {
      id: "transID",
      label: "Transaction ID",
      minWidth: 100
    },
    {
      id: "amt",
      label: "Total Amount",
      minWidth: 100
    },
    {
      id: "transType",
      label: "Type",
      minWidth: 100
    },

    {
      id: "baseAmt",
      label: "Base Amount",
      minWidth: 100
    },
    {
      id: "cgst",
      label: "CGST (INR)9%",
      minWidth: 100
    },
    {
      id: "sgst",
      label: "SGST (INR)9%",
      minWidth: 100
    },
    {
      id: "date",
      label: (
        <Box sx={styles.dateColumn}>
          <Box>Date & Time</Box>
          <IconButton onClick={handleSorting}>
            {sort === "DESC" ? (
              <ArrowDownwardOutlinedIcon color="primary" />
            ) : (
              <ArrowUpwardOutlinedIcon color="primary" />
            )}
          </IconButton>
        </Box>
      ),
      minWidth: 120
    }
  ]
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  const handlecloseFilter = () => {
    setOpenDrawer(false)
  }
  const handleFilter = () => {
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
  }
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  const preparePayload = () => {
    const payload = {
      filters: {
        sourceType: ["WALLET", "TOPUP"],
        machineIds: [`${params?.machineId}`],
        transactionType: ["ADDED"],
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      },
      sort_by: { key: "Date", type: sort },
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage,
      CSVType: "WALLET_BALANCE_TRANSACTION"
    }
    return payload
  }
  const downloadDataHandler = () => {
    // Do something
    exportHistoryData(preparePayload(), setLoading)
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
  const getMachineBalane = async () => {
    setLoading(true)
    const payload = {
      filters: {
        sourceType: ["WALLET", "TOPUP"],
        machineIds: [`${params?.machineId}`],
        transactionType: ["ADDED"],
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      },
      sort_by: { key: "Date", type: sort },
      search: searchQuery,
      limit: itemsPerPage,
      offset: currentPage
    }
    const response = await WalletService.getTransactionHistory(payload)
    if (response.success && response.code === 200) {
      let transactions = response?.data?.transactions
      let pagination = response?.data?.pagination

      if (transactions) {
        let data = transactions.map((item, index) =>
          createWalletHistoryData(
            index + 1,
            item?.uniqueId ?? "No Data",
            item?.totalAmount ?? "No Data",
            <Typography variant="h6" component="div" sx={styles?.fontSize} color="text.green">
              Added
            </Typography>,
            item?.baseAmount ?? "No Data",
            item?.cgst ?? "No Data",
            item?.sgst ?? "No Data",
            dateMonthFormat(item?.createdAt, "DD/MM/YYYY hh:mm A")
          )
        )
        setWalletHistory(data)
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
    setLoading(false)
  }
  const getMachines = async () => {
    setLoading(true)
    const getMachines = await fetchMachines()
    let machineMap = new Map()
    getMachines.forEach((machine) => {
      if (!machineMap.has(machine?.value)) {
        machineMap.set(machine?.value, machine)
      }
    })
    setMachines(machineMap.get(params?.machineId))
    setLoading(false)
  }

  const handleAddMoneyPopup = async () => {
    countBaseAmount(machines?.machineSubscriptionSetting?.pricingTerms)
    dispatch(coreAppActions.updatePopupModal(true))
  }

  const handleClosePopup = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const countBaseAmount = (pricingTerms) => {
    let minTerms = getMinPricePlan(pricingTerms)

    let perWashPrice = pricingTerms?.find((x) => x?.type === minTerms)?.dealerPerWashPrice
    let manPowerPrice = pricingTerms?.find((x) => x?.type === minTerms)?.manpowerPricePerWash

    setWashBasePrice(Number(perWashPrice) + Number(manPowerPrice))
  }
  return (
    <>
      {loading && <AppLoader />}
      <Grid container>
        <Grid item xs={6}>
          <BackHeader title={`Wallet Balance History ${machines?.label || ""}`} />
        </Grid>
        <Grid
          item
          xs={6}
          style={{ ...styles.displayFlex, ...styles.justifyEnd, ...styles?.alignCenter }}
          display="flex"
          justifyContent="flex-end">
          <WalletHistoryCard
            monthlyAgreement={
              machines?.machineSubscriptionSetting?.total
                ? machines?.machineSubscriptionSetting?.total
                : 0
            }
            handleAddMoneyPopup={handleAddMoneyPopup}
          />
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: "1.64rem" }} />
      <CommonHeader
        isFilterUsed={isFilterUsed}
        searchEnabled={true}
        searchQuery={searchQuery}
        setQuery={setSearchQuery}
        downloadEnabled={true}
        handleDownload={downloadDataHandler}
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
          <Box sx={{ width: "25rem", mr: 1 }}>
            <MachineCards
              boxHeading="Wallet Balance (incl. GST)"
              subHeading=""
              img={Balance}
              amount={creditBalance}
            />
          </Box>
        }
      />
      <Paper sx={styles.paper}>
        <Box sx={{ marginBottom: "2rem" }}>
          <ListingTable columns={columns} tableData={walletHistory} />
        </Box>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecord={totalRecords}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => setItemsPerPage(val)}
          onPageChange={(val) => setCurrentPage(val)}
          label="Transactions"
        />
        <FilterDrawer
          showUsedFilter={showUsedFilter}
          open={openDrawer}
          handleDrawer={handleDrawer}
          handleFilter={handleFilter}
          handlecloseFilter={handlecloseFilter}
          hideDate
          hideWashType
          showTransactionType
        />
      </Paper>
      <PopupModal handleClose={handleClosePopup}>
        <Grid
          styles={{
            width: "80vw",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
          <AddMoneyPopup machineId={params?.machineId} washBasePrice={washBasePrice} />
        </Grid>
      </PopupModal>
    </>
  )
}

export default WalletBalanceHistory
