import React, { useState, useEffect } from "react"
import { Box, Grid, Typography, useMediaQuery } from "@mui/material"
import ListingTable from "components/utitlities-components/ListingTable"
import { useTheme } from "@mui/material"
import styles from "./../BillingAccounting.module.scss"
import PaginationComponent from "components/utitlities-components/Pagination"
import FilterDrawer from "components/utitlities-components/Drawer/Drawer"
import { useNavigate } from "react-router-dom"
import { BillingService } from "network/billingServices"
import AppLoader from "components/Loader/AppLoader"
import { dateMonthFormat, getMonthDays, getMonthName } from "helpers/app-dates/dates"
import { capitaliseString } from "helpers/Functions/formateString"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import moment from "moment"
import { ManageWashService } from "network/manageWashService"
import { userDetail } from "hooks/state"
import { sortData } from "components/utitlities-components/Drawer/drawerSort"
import Toast from "components/utitlities-components/Toast/Toast"
import { billingActions, coreAppActions } from "redux/store"
import ViewAdvanceMemo from "components/BillingAccount/AdvanceMemo"
import { useDispatch } from "react-redux"
import PopupModal from "components/PopupModal"
import { WalletService } from "network/walletService"
import { exportDownload } from "../billingUtilities"
import { doesSectionHaveLeadingZeros } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils"
import { fetchMachines } from "helpers/Functions/getMachinesListing"

function AdvanceMemo({ employeePermission, role }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const user = userDetail()
  const navigate = useNavigate()
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
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [dropDownOutletData, setDropDownOutletData] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [machines, setMachines] = useState([])
  const [outletData, setOutlet] = useState([])
  const [memoId, setMemoid] = useState("")
  const [memoFilter, setMemoFilter] = useState([])

  useEffect(() => {
    getMachines()
    getOutlet()
    dispatch(billingActions.setIsTopUp(false))
    popupCloseHandler()
  }, [])
  useEffect(() => {
    getMachines()
  }, [dropDownOutletData?.length])
  useEffect(() => {
    getBiilingList()
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
  const getBiilingList = async () => {
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
      statuses: memoFilter.toString()
    }
    let bullingResponse = await BillingService.getBillingList(param)
    if (bullingResponse.code === 200 && bullingResponse.success) {
      setMemoTableData(bullingResponse?.data?.memoList)
      if (bullingResponse?.data?.memoList?.length === 0) {
        setTotalRecord(0)
        setCurrentPage(1)
      } else {
        setTotalRecord(bullingResponse?.data?.pagination?.totalItems)
      }

      setLoader(false)
    } else {
      setMemoTableData([])
      setLoader(false)
      setTotalRecord(0)
    }
  }

  const handleRoutes = (list) => {
    if (list?.status == "PAID") {
      dispatch(billingActions.setIsTopUp(false))
      navigate(`/${user?.role}/billing-accounting/advance-memo/${list?.machineMemoId}`)
    } else {
      if (user?.role == "employee" && employeePermission?.payPermission) {
        dispatch(coreAppActions.updatePopupModal(true))
        dispatch(billingActions.setIsTopUp(false))
        setMemoid(list?.machineMemoId)
      } else {
        if (user?.role == "dealer") {
          dispatch(coreAppActions.updatePopupModal(true))
          dispatch(billingActions.setIsTopUp(false))
          setMemoid(list?.machineMemoId)
        }
      }
    }
  }

  const handleDownload = async () => {
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
      statuses: memoFilter.toString()
    }
    await exportDownload(param)
    setLoader(false)
    doesSectionHaveLeadingZeros(false)
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
          list?.machine?.name,
          dateMonthFormat(list?.createdAt, "DD/MM/YYYY"),
          dateMonthFormat(list?.dueDate, "DD/MM/YYYY"),
          list?.totalAmount,
          getMonthName(list?.month),
          <Box
            color={list?.status === "PAID" ? theme.palette.text.green : theme.palette.error.main}>
            {capitaliseString(list?.status)}
          </Box>,
          role == "employee" ? (
            <Box
              onClick={() => {
                handleRoutes(list)
              }}>
              {list?.status == "PAID" ? (
                <Typography className={styles.viewText} variant="p3" color="primary.main">
                  View Memo
                </Typography>
              ) : employeePermission?.payPermission ? (
                <Typography className={styles.viewText} variant="p3" color="primary.main">
                  Pay Now
                </Typography>
              ) : (
                "NA"
              )}
            </Box>
          ) : (
            <Box
              onClick={() => {
                handleRoutes(list)
              }}
              className={styles.viewText1}>
              {list?.status == "PAID" ? "View Memo" : "Pay Now"}
            </Box>
          )
        )
      )
    })
  function createData(
    no,
    memoId,
    serviceCentre,
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

  const popupCloseHandler = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleClosePopup = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleFilter = (...params) => {
    const eDate = params[1]
    const sDate = params[0]
    const stat = params[6]
    setStartDate(sDate ? moment(sDate.toString()).format("YYYY-MM-DD") : "")
    setEndDate(eDate ? moment(eDate.toString()).format("YYYY-MM-DD") : "")
    setMemoFilter(stat)
    setFilterUpdate(filterUpdate + 1)
    setOpenDrawer(false)
  }

  const handlePayment = async (e, data) => {
    setLoader(true)
    const payLoad = {
      type: "WALLET",
      furl: `${process.env.REACT_APP_API_URL}/${user?.role}/wallet/fail-payment`,
      surl: `${process.env.REACT_APP_API_URL}/${user?.role}/wallet/success-payment`,
      machineId: data?.machineId,
      machineMemoId: data?.machineMemoId,
      amount: data?.totalAmount
    }
    let addMoney = await WalletService.createPayment(payLoad)
    if (addMoney.success && addMoney.code === 200) {
      setLoader(false)
      const hash = addMoney.data.hash
      const paymentFormContainer = document.getElementById("payment-form-container")
      paymentFormContainer.innerHTML = hash
      paymentFormContainer.querySelector("form").submit()
    } else {
      setLoader(false)
      Toast.showErrorToast(`${addMoney?.message}`)
    }
  }

  const getMachines = async () => {
    setLoader(true)
    const params = [`?outletIds=${dropDownOutletData.map((item) => item?.value)}`]
    const getMachines = await fetchMachines(params)
    setMachines(getMachines)
    setLoader(false)
  }

  const getOutlet = async () => {
    const params = [`?dealerIds=${user?.userId}`]
    const response = await ManageWashService.getOutlet(params)
    if (response.success && response.code === 200) {
      const key = "outletId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data?.outlets)
      setOutlet(sortedData)
    } else {
      Toast.showErrorToast(`${response.message}`)
    }
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
          heading="Advance Memo"
          searchEnabled={true}
          filterEnabled={true}
          setQuery={setQuery}
          handleDrawer={handleDrawer}
          searchQuery={searchQuery}
          downloadEnabled={
            user?.role == "employee" ? (employeePermission?.exportPermission ? true : false) : true
          }
          isFilterUsed={isFilterUsed}
          handleDownload={handleDownload}
          setCurrentPage={setCurrentPage}
          selectedDate={{ initialStartDate: startDate, initialEndDate: endDate }}
          isMobile={isMobile}
        />
        <Box sx={{ mt: "2rem" }}>
          <ListingTable cursor="default" columns={columns} tableData={memoData} />
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

      <PopupModal handleClose={popupCloseHandler}>
        <Grid
          style={{
            height: "80vh",
            width: "80vw",
            overflow: "scroll"
          }}>
          <ViewAdvanceMemo
            popupMemoId={memoId}
            payment
            closePopup={handleClosePopup}
            handlePayment={handlePayment}
          />
        </Grid>
      </PopupModal>
      <div id="payment-form-container"></div>
    </>
  )
}

export default AdvanceMemo
