import React, { useEffect, useState } from "react"
import { Box, Grid, Stack, Typography, useTheme } from "@mui/material"
import DashboardIcon from "assets/images/icons/DashboardIcon.svg"
import DashBoardWashes from "assets/images/icons/dashBoardWashes.svg"
import WaterIcon from "assets/images/icons/waterIcon.svg"
import RightIcon from "assets/images/icons/chevronRight.svg"
import DealershipIcon from "assets/images/icons/dealershipCount.svg"
import MachineIcons from "assets/images/icons/machineIcons.svg"
import TopDealershipIcon from "assets/images/icons/topDealership.svg"
import { useStyles } from "pages/private/admin/dashboard/DashboardStyles"
import Coins from "assets/images/icons/coins.svg"
import Wallet from "assets/images/icons/WalletBalance.svg"
import TotalMachine from "assets/images/icons/totalMachine.svg"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import moment from "moment"
import { convertToISO, dateOptionsDashboard } from "helpers/app-dates/dates"
import RadialChart from "components/utilities-components/ApexCharts/RadialChart"
import { DashboardService } from "network/dashboardServices"
import AmountCard from "components/utilities-components/AmountCard"
import DateFilter from "components/WashPanel/WashDashboard/DateFilter"
import DashboardPieChart from "components/utilities-components/ApexCharts/PieChart"
import StackedBarChart from "components/utilities-components/ApexCharts/StackedBarChart"
import LineChart from "components/utilities-components/ApexCharts/LineChart"
import Billing from "assets/images/icons/Billing.svg"
import { userDetail } from "hooks/state"
import { capitalizeWords } from "helpers/Functions/captalizeWords"
import MultipleSelect from "components/utilities-components/Mulit-Select/MultiSelect"
import { BillingService } from "network/billingServices"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility"
import GMap from "components/utilities-components/GoogleMap/Gmap"
import {
  convertDate,
  getDealerMachineCount,
  totalDealershipAmount
} from "components/utilities-components/ApexCharts/ApexUtility"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useNavigate } from "react-router-dom"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { subtractAndValidate } from "helpers/Functions/formateString"
import BarChart from "components/utilities-components/ApexCharts/BarChart"
import { FeedBackService } from "network/feedbackService"
import Toast from "components/utilities-components/Toast/Toast"

const dateFormat = (date) => {
  if (date) {
    let format_date = moment(date).format("DD/MM/YYYY")
    return format_date
  }
  return null
}

function AdminDashboard() {
  const styles = useStyles()
  const user = userDetail()
  const theme = useTheme()
  const navigate = useNavigate()
  const [selectedWashDateOption, setSelectedWashDateOption] = useState(dateOptionsDashboard[0])
  const [selectedWaterDateOption, setSelectedWaterDateOption] = useState(dateOptionsDashboard[0])
  const [selectedDealershipCountDateOption, setSelectedDealershipCountDateOption] = useState(
    dateOptionsDashboard[0]
  )
  const [allMachine, setMachines] = useState()
  const [selectedTopDealershipDateOption, setSelectedTopDealershipDateOption] = useState(
    dateOptionsDashboard[0]
  )
  const [totalAmountDue, setTotalAmountDue] = useState(0)
  const [totalAmountReceive, setTotalAmountReceive] = useState(0)
  const [notify, setNotify] = useState(0)
  const [dealerName, setDealerName] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [dropDownTreatedWaterMachineData, setDropDownTreatedWaterMachineData] = useState([])
  const [dropDownDealerData, setDropDownDealerData] = useState([])

  const [selectedDealerDateOption, setSelectedDealerDateOption] = useState(dateOptionsDashboard[0])

  const [chartData, setChartDate] = useState({
    washChart: {},
    waterChart: {},
    dealershipCountChart: {},
    topDealershipChart: [],
    dealerChart: []
  })

  const [machineStatus, setMachineStatus] = useState({})

  const [machineList, setMachineList] = useState()

  const [loader, setLoader] = useState(false)

  const [notificationList, setNotificationList] = useState({
    notificationData: []
  })

  const [oems, setOems] = useState([])

  const [dealerPermission, setDealerPermission] = useState()
  const [manageWashPermission, setManageWashPermission] = useState()
  const [machineDetailPermission, setMachineDetailPermission] = useState()
  const [billingPermission, setBillingPermission] = useState()
  // eslint-disable-next-line no-unused-vars
  const [dealers, setDealers] = useState([])
  // const [selectedDealers, setSelectedDealers] = useState([])
  useEffect(() => {
    handleDealershipCountDateSelect(selectedDealershipCountDateOption)
    handleTopDealershipDateSelect(selectedTopDealershipDateOption)
    getMachineStatus()
    getMachineList()
    getMemoAmount()
    getNotification()
    getAllpermission()
    getOemList()
    getMapMachineList()
    getAllDealers()
  }, [])

  useEffect(() => {
    handleDealerDateSelect(selectedDealerDateOption)
  }, [dropDownDealerData])

  useEffect(() => {
    handleWaterDateSelect(selectedWaterDateOption)
  }, [dropDownTreatedWaterMachineData])

  useEffect(() => {
    handleWashDateSelect(selectedWashDateOption)
  }, [dropDownMachineData])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        const permissionArray = ["dealer", "machine details", "washes", "billingAccounting"]
        for (let i = 0; i < permissionArray.length; i++) {
          const permissionEle = permissionArray[i]
          if (permissionEle === "dealer") {
            let permissionJson = getPermissionJson(user, "dealer")
            setDealerPermission(permissionJson?.permissionObj)
          } else if (permissionEle === "machine details") {
            let machinePermissionJson = getPermissionJson(user, "machine details")
            setMachineDetailPermission(machinePermissionJson?.permissionObj)
          } else if (permissionEle === "washes") {
            let washPermissionJson = getPermissionJson(user, "washes")
            setManageWashPermission(washPermissionJson?.permissionObj)
          } else if (permissionEle === "billingAccounting") {
            let billingPermissionJson = getPermissionJson(user, "Billing & Accounting Advance Memo")
            setBillingPermission(billingPermissionJson?.permissionObj)
          }
        }
      }
    }
  }

  const getWashDetail = async (washStartDate, washEndDate) => {
    setLoader(true)

    let params = {
      fromDate: convertToISO(washStartDate),
      toDate: convertToISO(washEndDate),
      machineIds: dropDownMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await DashboardService.getWashDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, washChart: response?.data }))
    }
    setLoader(false)
  }
  const getAllDealers = async () => {
    setLoader(true)
    const response = await FeedBackService.getAllDealers()
    if (response.success && response.code === 200) {
      setLoader(false)
      const key = "userId"
      const labelKey = "username"

      const sortedData = sortData(labelKey, key, response?.data?.dealers)
      setDealers(sortedData)
    } else {
      setLoader(false)
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const getNotification = async () => {
    setLoader(true)
    const params = {
      limit: 3,
      offset: 2,
      type: "ADMIN_BILLING"
    }
    const response = await DashboardService.getNotification(params)

    if (response.success && response.code === 200) {
      const arr = response?.data?.records?.map(
        (item) => `${item?.message} on ${dateFormat(item?.updatedAt)}`
      )

      setNotificationList({ notificationData: arr })
    }
    setLoader(false)
  }

  const dealerColor = [
    theme?.palette?.background?.green5,
    theme?.palette?.background?.blue9,
    theme?.palette?.text?.red2,
    theme?.palette?.background?.gray4,
    theme?.palette?.background?.yellow2
  ]

  const getMachineStatus = async () => {
    const response = await DashboardService.getMachineStatus()
    if (response.success && response.code === 200) {
      setMachineStatus(response?.data)
    }
  }

  const getDealersipCountDetail = async (dealershipStartDate, dealershipEndDate) => {
    let params = {
      fromDate: convertToISO(dealershipStartDate),
      toDate: convertToISO(dealershipEndDate)
    }

    const response = await DashboardService.getDealersipCountDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, dealershipCountChart: response?.data }))
    }
  }

  const getWaterDetail = async (waterStartDate, waterEndDate) => {
    setLoader(true)
    let params = {
      fromDate: convertToISO(waterStartDate),
      toDate: convertToISO(waterEndDate),
      machineIds: dropDownTreatedWaterMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await DashboardService.getWaterDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, waterChart: response?.data }))
    }

    setLoader(false)
  }

  const getDealerDetail = async (dealerStartDate, dealerEndDate) => {
    setLoader(true)
    let params = {
      startDate: convertToISO(dealerStartDate),
      endDate: convertToISO(dealerEndDate),
      oemIds: dropDownDealerData
        ?.map((item) => {
          return item?.value
        })
        ?.join(",")
    }

    const response = await DashboardService.getDealerDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, dealerChart: response?.data }))
    }

    setLoader(false)
  }

  const getTopDealersipDetail = async (dealershipStartDate, dealershipEndDate) => {
    let params = {
      fromDate: convertToISO(dealershipStartDate),
      toDate: convertToISO(dealershipEndDate)
    }

    const response = await DashboardService.getTopDealersipDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({
        ...prev,
        topDealershipChart: response?.data?.dealers?.slice(0, 5)
      }))

      const dealerName = response?.data?.dealers?.slice(0, 5)?.map((item, index) => {
        return {
          name: item?.username,
          uniqueId: item?.uniqueId,
          total: Number(item?.total || 0),
          color: dealerColor[index],
          dealerId: item?.user_id
        }
      })
      setDealerName(dealerName)
    }
  }

  const getMapMachineList = async () => {
    const response = await DashboardService.getMapMachineList()

    if (response.success && response.code === 200) {
      setMachineList(response?.data)
    }
  }

  const getMachineList = async () => {
    const response = await DashboardService.getMachineList()

    if (response.success && response.code === 200) {
      const labelKey = "name"
      const key = "machineGuid"
      const sortedData = sortData(labelKey, key, response?.data)
      setMachines(sortedData)
      setDropDownMachineData(sortedData)
      setDropDownTreatedWaterMachineData(sortedData)
      if (sortedData?.length === 1) {
        setDropDownMachineData(sortedData)
        setDropDownTreatedWaterMachineData(sortedData)
      }
    }
  }

  const getOemList = async () => {
    const response = await FeedBackService.getOEM()
    if (response.success && response.code === 200) {
      const key = "oemId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setOems(sortedData)
      setDropDownDealerData(sortedData)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }

  const getMemoAmount = async () => {
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
    }
  }

  const handleWashDateSelect = (option) => {
    setSelectedWashDateOption(option)

    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")

    const endDateformat = moment().format("YYYY-MM-DD")

    getWashDetail(startDateformat, endDateformat)
  }

  const handleDealershipCountDateSelect = (option) => {
    setSelectedDealershipCountDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")

    getDealersipCountDetail(startDateformat, endDateformat)
  }

  const handleDealerDateSelect = (option) => {
    setSelectedDealerDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")
    getDealerDetail(startDateformat, endDateformat)
  }

  const handleWaterDateSelect = (option) => {
    setSelectedWaterDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")
    getWaterDetail(startDateformat, endDateformat)
  }

  const handleTopDealershipDateSelect = (option) => {
    setSelectedTopDealershipDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")
    getTopDealersipDetail(startDateformat, endDateformat)
  }

  return (
    <Grid container>
      {notificationList?.notificationData?.length != 0 ? (
        <Grid container justifyContent="space-between" xs={12} md={12} sx={styles.mainWrapper} item>
          <Box sx={styles.outerBox}>
            <img style={{ marginRight: "1.2rem" }} src={DashboardIcon} />
            <Typography variant="p3">{notificationList?.notificationData?.[notify]}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography color="text.main" variant="p1">
              {notify + 1} / {notificationList?.notificationData?.length}
            </Typography>
            <img
              onClick={() => {
                if (notify + 1 == notificationList?.notificationData?.length) {
                  setNotify(0)
                } else {
                  setNotify((prev) => prev + 1)
                }
              }}
              src={RightIcon}
              style={{ height: "2.4rem", width: "2.4rem", cursor: "pointer" }}
            />
          </Box>
        </Grid>
      ) : null}
      <Box sx={styles.adminInfoBox}>
        <Typography variant="h6">Hello, {capitalizeWords(user?.name)}</Typography>
      </Box>
      <Grid container justifyContent="space-between" item xs={12} gap={1}>
        {user.role === "subadmin" && !billingPermission?.viewPermission ? null : (
          <>
            <Grid item md={2.9} xs={12}>
              <AmountCard
                handleRoutes={() => navigate(`/${user.role}/billing-accounting`)}
                title="Total Amount Due (incl.Gst)"
                imgSrc={Wallet}
                amount={formatCurrency(totalAmountDue)}
                type={"cash"}
              />
            </Grid>
            <Grid item md={2.9} xs={12}>
              <AmountCard
                handleRoutes={() => navigate(`/${user.role}/billing-accounting`)}
                title={"Total Amount Pending"}
                imgSrc={Billing}
                amount={formatCurrency(totalAmountDue - totalAmountReceive)}
                type={"pending"}
              />
            </Grid>
            <Grid item md={2.9} xs={12}>
              <AmountCard
                handleRoutes={() => navigate(`/${user.role}/billing-accounting`)}
                title={"Total Amount Due Received"}
                imgSrc={Coins}
                amount={formatCurrency(totalAmountReceive)}
                type={"credit"}
              />
            </Grid>
          </>
        )}
        {user.role === "subadmin" && !machineDetailPermission?.viewPermission ? null : (
          <Grid item md={2.9} xs={12}>
            <Box
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/${user.role}/manage-machines`)}
              sx={styles.cardContainer}>
              <Box>
                <img
                  src={TotalMachine}
                  alt=""
                  style={{ width: "4.8rem", height: "4.8rem", marginRight: "1.2rem" }}
                />
              </Box>
              <Box>
                <Typography sx={[styles?.walletText]}>Total Machines</Typography>{" "}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={[styles?.walletAmount]}>
                    {Number(machineStatus?.inactiveMachine) +
                      Number(machineStatus?.activeMachine) +
                      Number(machineStatus?.suspendedMachine) || 0}
                  </Typography>
                  <Box sx={styles.machineStatus}>
                    <Typography color="text.main" variant="p5">
                      Active: &nbsp;
                    </Typography>
                    <Typography
                      sx={{
                        marginRight: "1.6rem"
                      }}
                      variant="s1"
                      color="background.green5">
                      {machineStatus?.activeMachine || 0}
                    </Typography>
                    <Typography variant="p5">Inactive: &nbsp;&nbsp;</Typography>
                    <Typography variant="s1" color="text.red1">
                      {machineStatus?.inactiveMachine || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
      <Grid container item xs={12} md={12} gap={1} justifyContent="space-between">
        {user.role === "subadmin" && !dealerPermission?.viewPermission ? null : (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            {window.google && <GMap data={machineList || []} />}
          </Grid>
        )}
        {user.role === "subadmin" && !manageWashPermission?.viewPermission ? null : (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={styles.runTimeChart}>
              <Box sx={styles.chartHeader}>
                <img src={DashBoardWashes} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Total Washes</Typography>
                  <Typography variant="h7">
                    {formatCurrency(chartData?.washChart?.totalWashes, "")}
                  </Typography>
                </Stack>
              </Box>
              <Grid container gap={3} justifyContent="flex-end">
                <Grid item sx={styles.machineBox}>
                  <MultipleSelect
                    style={{ width: "22rem" }}
                    items={allMachine}
                    onSelect={(values) => {
                      setDropDownMachineData(values)
                    }}
                    selectedItems={dropDownMachineData}
                    selectAll
                    label="Select Machine"
                  />
                </Grid>
                {/* <Grid item sx={styles.dateBox}> */}
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedWashDateOption}
                  handleDateSelect={handleWashDateSelect}
                  style={{ width: "16rem" }}
                />
                {/* </Grid> */}
              </Grid>
            </Box>
            <StackedBarChart
              handleRoutes={(date) => {
                let todaysDate
                let nextDayDate
                if (date?.split(" ")?.includes("PM") || date?.split(" ")?.includes("AM")) {
                  todaysDate = moment().startOf("day").format("YYYY-MM-DD")
                  nextDayDate = moment(todaysDate).format("YYYY-MM-DD")
                } else {
                  todaysDate = convertDate(date)
                  nextDayDate = moment(todaysDate).format("YYYY-MM-DD")
                }
                navigate(`/${user.role}/wash-list?startDate=${todaysDate}&endDate=${nextDayDate}`, {
                  state: { machineId: dropDownMachineData }
                })
              }}
              timeline={selectedWashDateOption}
              data={chartData?.washChart?.transactions}
            />
          </Grid>
        )}
        {user.role === "subadmin" && !dealerPermission?.viewPermission ? null : (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={styles.runTimeChart}>
              <Box sx={styles.chartHeader}>
                <img src={DealershipIcon} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Dealership Count</Typography>
                  <Typography variant="h7">
                    {formatCurrency(chartData?.dealershipCountChart?.count, "")}
                  </Typography>
                </Stack>
              </Box>
              {/* <Box sx={styles.dateBox}> */}{" "}
              <DateFilter
                dateOptions={dateOptionsDashboard}
                selectedDateOption={selectedDealershipCountDateOption}
                handleDateSelect={handleDealershipCountDateSelect}
                style={{ width: "16rem" }}
              />
              {/* </Box> */}
            </Box>
            <LineChart
              handleRoutes={(date) => {
                let todaysDate
                let nextDayDate
                if (date?.split(" ")?.includes("PM") || date?.split(" ")?.includes("AM")) {
                  todaysDate = moment().startOf("day").format("YYYY-MM-DD")
                  nextDayDate = moment(todaysDate).format("YYYY-MM-DD")
                } else {
                  todaysDate = convertDate(date)

                  nextDayDate = moment(todaysDate).format("YYYY-MM-DD")
                }
                navigate(`/${user.role}/dealers?startDate=${todaysDate}&endDate=${nextDayDate}`)
              }}
              type="dealershipCount"
              timeline={selectedDealershipCountDateOption}
              data={chartData?.dealershipCountChart?.dealers}
            />
          </Grid>
        )}
        {user.role === "subadmin" && !dealerPermission?.viewPermission ? null : (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={styles.chartHeader}>
                <img src={TopDealershipIcon} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Top Dealerships</Typography>
                  <Typography variant="h7">
                    {formatCurrency(totalDealershipAmount(chartData?.topDealershipChart), "INR ")}
                  </Typography>
                </Stack>
              </Box>
            </Box>

            <Grid
              container
              sx={{ height: "100%", display: "flex", justifyContent: "space-between" }}>
              <Grid
                item
                xs={5}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  width: "100%",
                  height: "80%",
                  marginTop: "5rem"
                }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingRight: "4rem",
                    marginBottom: "1.2rem"
                  }}>
                  <Typography variant="p4" color="text.gray">
                    Dealership
                  </Typography>
                  <Typography variant="p4" color="text.gray">
                    Revenue (Incl. GST)
                  </Typography>
                </Box>
                {dealerName?.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingRight: "4rem",
                      marginBottom: "1.2rem"
                    }}>
                    <Stack>
                      <Typography
                        onClick={() => navigate(`/${user?.role}/dealer-detail/${item?.dealerId}`)}
                        sx={{ textDecoration: "underline", cursor: "pointer" }}
                        variant="p3"
                        color="primary.main">
                        {item?.name}
                      </Typography>
                      <Typography variant="p5" color="text.gray3">
                        {item?.uniqueId}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          height: "1rem",
                          width: "1rem",
                          backgroundColor: item?.color,
                          marginRight: "1.2rem",
                          borderRadius: "100%"
                        }}
                      />
                      <Typography variant="p3" color="text.main">
                        {formatCurrency(item?.total)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
              <Grid xs={7} item container justifyContent="center" alignItems="center">
                <DashboardPieChart data={chartData?.topDealershipChart} />
              </Grid>
            </Grid>
          </Grid>
        )}
        {user.role === "subadmin" && !machineDetailPermission?.viewPermission ? null : (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={styles.chartHeader}>
                <img src={WaterIcon} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Treated Water</Typography>
                  <Typography variant="h7">
                    {parseFloat(
                      chartData?.waterChart?.WaterUsed ? chartData?.waterChart?.WaterUsed : 0
                    ).toFixed(2)}{" "}
                    <Typography variant="p5" color="text.main">
                      Litre
                    </Typography>
                  </Typography>
                </Stack>
              </Box>
              <Grid container gap={3} justifyContent="flex-end">
                <Grid item sx={styles.machineBox}>
                  <MultipleSelect
                    style={{ width: "22rem" }}
                    items={allMachine}
                    onSelect={(values) => {
                      setDropDownTreatedWaterMachineData(values)
                    }}
                    selectedItems={dropDownTreatedWaterMachineData}
                    selectAll
                    label="Select Machine"
                  />
                </Grid>
                {/* <Box sx={styles.dateBox}> */}
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedWaterDateOption}
                  handleDateSelect={handleWaterDateSelect}
                  style={{ width: "16rem" }}
                />
              </Grid>
            </Box>

            <Box sx={{ height: "100%", display: "flex" }}>
              <Box sx={{ width: "70%" }}>
                <RadialChart data={chartData?.waterChart} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Stack sx={styles.radialLegend1}>
                  <Typography variant="p2">Recycled Water</Typography>
                  <Typography variant="h7">
                    {chartData?.waterChart?.WaterUsed
                      ? subtractAndValidate(
                          Number(chartData?.waterChart?.WaterUsed),
                          Number(chartData?.waterChart?.WaterWastage)
                        )
                      : 0}{" "}
                    <Typography variant="p5" color="text.main">
                      Litre
                    </Typography>
                  </Typography>
                </Stack>
                <Stack sx={styles.radialLegend2}>
                  <Typography variant="p2">Fresh Water</Typography>
                  <Typography variant="h7">
                    {parseFloat(
                      chartData?.waterChart?.WaterWastage ? chartData?.waterChart?.WaterWastage : 0
                    ).toFixed(2)}{" "}
                    <Typography variant="p5" color="text.main">
                      Litre
                    </Typography>
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Hide for staging */}
        {user.role === "subadmin" && !machineDetailPermission?.viewPermission ? null : (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={styles.runTimeChart}>
              <Box sx={styles.chartHeader}>
                <img style={{ height: "60px", width: "60px" }} src={MachineIcons} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Total Machines</Typography>
                  <Typography variant="h7">
                    {getDealerMachineCount(chartData?.dealerChart)?.reduce((acc, item) => {
                      acc = acc + item
                      return acc
                    }, 0)}
                  </Typography>
                </Stack>
              </Box>
              <Grid container gap={3} justifyContent="flex-end">
                <Grid item sx={styles.machineBox}>
                  <MultipleSelect
                    style={{ width: "22rem" }}
                    items={oems}
                    onSelect={(values) => {
                      setDropDownDealerData(values)
                    }}
                    selectedItems={dropDownDealerData}
                    selectAll
                    label="Select Oem"
                  />
                </Grid>
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedDealerDateOption}
                  handleDateSelect={handleDealerDateSelect}
                  style={{ width: "16rem" }}
                />
              </Grid>
            </Box>
            <BarChart
              handleRoutes={(dealerDetail) => {
                navigate(`/${user.role}/dealer-detail/${dealerDetail?.dealerId}`)
              }}
              totalData={chartData?.dealerChart}
              data={
                getDealerMachineCount(chartData?.dealerChart)?.length < 10
                  ? [...getDealerMachineCount(chartData?.dealerChart), 0, 0, 0, 0, 0, 0, 0, 0]
                  : getDealerMachineCount(chartData?.dealerChart) || []
              }
            />
          </Grid>
        )}
        {/* {user.role === "subadmin" && !machineDetailPermission?.viewPermission ? null : (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={styles.chartHeader}>
                <img src={WaterIcon} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Treated Water</Typography>
                  <Typography variant="h7">
                    {parseFloat(
                      chartData?.waterChart?.WaterUsed ? chartData?.waterChart?.WaterUsed : 0
                    ).toFixed(2)}{" "}
                    <Typography variant="p5" color="text.main">
                      Litre
                    </Typography>
                  </Typography>
                </Stack>
              </Box>
              <Grid container gap={3} justifyContent="flex-end">
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedWaterDateOption}
                  handleDateSelect={handleWaterDateSelect}
                  style={{ width: "16rem" }}
                />
              </Grid>
            </Box>
            <Grid container gap={3} display={"flex"} justifyContent="flex-end" paddingTop={"1rem"}>
              <Grid item sx={styles.machineBox}>
                <MultipleSelect
                  style={{ width: "22rem" }}
                  items={dealers}
                  onSelect={(values) => {
                    setSelectedDealers(values)
                  }}
                  selectedItems={selectedDealers}
                  selectAll
                  label="Select Dealers"
                />
              </Grid>
              <Grid item sx={styles.machineBox}>
                <MultipleSelect
                  style={{ width: "22rem" }}
                  items={allMachine}
                  onSelect={(values) => {
                    setDropDownTreatedWaterMachineData(values)
                  }}
                  selectedItems={dropDownTreatedWaterMachineData}
                  selectAll
                  label="Select Machine"
                />
              </Grid>
            </Grid>
            <Box sx={{ height: "100%", display: "flex" }}>
              <Box sx={{ width: "70%" }}>
                <RadialChart data={chartData?.waterChart} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Stack sx={styles.radialLegend1}>
                  <Typography variant="p2">Recycled Water</Typography>
                  <Typography variant="h7">
                    {chartData?.waterChart?.WaterUsed
                      ? subtractAndValidate(
                          Number(chartData?.waterChart?.WaterUsed),
                          Number(chartData?.waterChart?.WaterWastage)
                        )
                      : 0}{" "}
                    <Typography variant="p5" color="text.main">
                      Litre
                    </Typography>
                  </Typography>
                </Stack>
                <Stack sx={styles.radialLegend2}>
                  <Typography variant="p2">Fresh Water</Typography>
                  <Typography variant="h7">
                    {parseFloat(
                      chartData?.waterChart?.WaterWastage ? chartData?.waterChart?.WaterWastage : 0
                    ).toFixed(2)}{" "}
                    <Typography variant="p5" color="text.main">
                      Litre
                    </Typography>
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid>
        )} */}
      </Grid>
      {loader && <AppLoader />}
    </Grid>
  )
}

export default AdminDashboard
