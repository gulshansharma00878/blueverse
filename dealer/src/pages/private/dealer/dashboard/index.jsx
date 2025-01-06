import React, { useEffect, useState } from "react"
import { Box, Grid, Stack, Typography } from "@mui/material"
import SecondaryButton from "components/utitlities-components/SecondaryButton/SecondaryButton"
import DashboardIcon from "assets/images/icons/dashboardIcon.svg"
import DashBoardWashes from "assets/images/icons/dashBoardWashes.svg"
import WaterIcon from "assets/images/icons/waterIcon.svg"
import RadialChart from "components/utitlities-components/ApexCharts/RadialChart"
import ElectricityIcon from "assets/images/icons/electricityConsumed.svg"
import WaterQualityIcon from "assets/images/icons/waterQuality.svg"
import MachineRunTimeIcon from "assets/images/icons/machineRuntime.svg"
import StackedBarChart from "components/utitlities-components/ApexCharts/StackedBarChart"
import LineChart from "components/utitlities-components/ApexCharts/LineChart"
import RightIcon from "assets/images/icons/chevronRight.svg"
import BarChart from "components/utitlities-components/ApexCharts/BarChart"
import DateFilter from "components/utitlities-components/DateFilter"
import {
  convertToISO,
  dateNoTodayOptionsDashboard,
  dateOptionsDashboard
} from "helpers/app-dates/dates"
import { useStyles } from "./DashboardStyles"
import Coins from "assets/images/icons/coins.svg"
import Wallet from "assets/images/icons/WalletBalance.svg"
import TotalMachine from "assets/images/icons/totalMachine.svg"
import AmountCard from "components/utitlities-components/TransactionCards/AmountCard"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import moment from "moment"
import { DashboardService } from "network/dashboardServices"
import { ManageWashService } from "network/manageWashService"
import {
  convertToHour,
  convertToMinute,
  getElectricityConsumed,
  getMachineBalance,
  getMachineCredit,
  getTotalMachineRuntime
} from "./dashboardUtility"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import { sortData } from "components/utitlities-components/Drawer/drawerSort"
import { dateFormat } from "helpers/Functions/dateFormat"
import AppLoader from "components/Loader/AppLoader"
import { capitaliseString, subtractAndValidate } from "helpers/Functions/formateString"
import MultipleSelect from "components/utitlities-components/Mulit-Select/MultiSelect"
import InfoIcon from "@mui/icons-material/Info"
import LightTooltip from "components/utitlities-components/LightTooltip"
import { convertDate } from "components/utitlities-components/ApexCharts/ApexUtility"

function Dashboard() {
  const styles = useStyles()
  const navigate = useNavigate()
  const user = userDetail()
  const [selectedWashDateOption, setSelectedWashDateOption] = useState(dateOptionsDashboard[0])
  const [selectedWaterDateOption, setSelectedWaterDateOption] = useState(dateOptionsDashboard[0])
  const [selectedElectricityDateOption, setSelectedElectricityDateOption] = useState(
    dateOptionsDashboard[0]
  )
  const [selectedMachineRunTimeDateOption, setSelectedMachineRunTimeOption] = useState(
    dateNoTodayOptionsDashboard[0]
  )
  const [selectedWaterQualityOption, setSelectedWaterQualityOption] = useState(
    dateOptionsDashboard[0]
  )

  const [selectedMachine, setSelectedMachine] = useState(0)

  const [selectedWaterQuality, setSelectedWaterQuality] = useState("PHValue")
  const [chartData, setChartDate] = useState({
    washChart: {},
    waterChart: {},
    electricityChart: {},
    machineChart: {},
    waterQuality: {}
  })
  const [machineName, setMachineName] = useState([])

  const [machineDetail, setMachineDetail] = useState({})

  const [machineStatus, setMachineStatus] = useState({})

  const [notificationList, setNotificationList] = useState({
    notificationData: []
  })
  const [loader, setLoader] = useState(false)

  const [allMachine, setMachines] = useState()

  const [notify, setNotify] = useState(0)

  const [dropDownMachineData, setDropDownMachineData] = useState([])

  const [dropDownTreatedWaterMachineData, setDropDownTreatedWaterMachineData] = useState([])

  const [dropDownElectrityMachineData, setDropDownElectricityMachineData] = useState([])

  const [dropDownQualityMachineData, setDropDownQualityMachineData] = useState([])

  const [permissions, setPermission] = useState({
    washPermission: {},
    machinePermission: {},
    walletPermission: {}
  })

  useEffect(() => {
    getMachines()
    getMachineStatus()
    getAllpermission()
    getNotification()
  }, [])

  useEffect(() => {
    handleWaterQualitySelect(selectedWaterQualityOption)
  }, [selectedWaterQuality, dropDownQualityMachineData])

  useEffect(() => {
    handleWashDateSelect(selectedWashDateOption)
  }, [dropDownMachineData])

  useEffect(() => {
    handleWaterDateSelect(selectedWaterDateOption)
  }, [dropDownTreatedWaterMachineData])

  useEffect(() => {
    handleMachineRunTimeDateSelect(selectedMachineRunTimeDateOption)
  }, [selectedMachine, machineDetail])

  useEffect(() => {
    handleElectricityDateSelect(selectedElectricityDateOption)
  }, [dropDownElectrityMachineData])

  const getWashDetail = async (washStartDate, washEndDate) => {
    let params = {
      fromDate: convertToISO(washStartDate),
      toDate: convertToISO(washEndDate, true),
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
  }

  async function getAllpermission() {
    if (user?.role == "dealer") {
      setPermission((prev) => ({
        ...prev,
        machinePermission: { viewPermission: true },
        washPermission: { viewPermission: true },
        walletPermission: { viewPermission: true }
      }))
    }

    if (user?.role == "employee") {
      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "manage washes")
        setPermission((prev) => ({
          ...prev,
          washPermission: permissionJson?.permissionObj
        }))
      }

      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "machine details")
        setPermission((prev) => ({
          ...prev,
          machinePermission: permissionJson?.permissionObj
        }))
      }

      if (user?.permissions?.permission?.length > 0) {
        let permissionJson = getPermissionJson(user, "wallet")
        setPermission((prev) => ({
          ...prev,
          walletPermission: permissionJson?.permissionObj
        }))
      }
    }
  }

  const getMachines = async () => {
    const response = await ManageWashService.getMachines()

    if (response?.success && response?.code === 200) {
      setMachineName(response?.data)
      setMachineDetail(response?.data?.[0])

      const labelKey = "name"
      const key = "machineGuid"
      const sortedData = sortData(labelKey, key, response?.data)
      setMachines(sortedData)
      setDropDownMachineData(sortedData)
      setDropDownTreatedWaterMachineData(sortedData)
      setDropDownElectricityMachineData(sortedData)
      setDropDownQualityMachineData(sortedData)

      if (sortedData?.length === 1) {
        setDropDownMachineData(sortedData)
        setDropDownTreatedWaterMachineData(sortedData)
        setDropDownElectricityMachineData(sortedData)
        setDropDownQualityMachineData(sortedData)
      }
    }
  }

  const getWaterQualityDetail = async (waterStartDate, waterEndDate) => {
    setLoader(true)
    let params = {
      fromDate: convertToISO(waterStartDate),
      toDate: convertToISO(waterEndDate),
      type: selectedWaterQuality,
      machineIds: dropDownQualityMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await DashboardService.getWaterQualityDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, waterQuality: response?.data }))
    }
    setLoader(false)
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

  const getMachineRunTimeDetail = async (machineStartDate, machineEndDate) => {
    let params = {
      fromDate: machineStartDate,
      toDate: machineEndDate,
      machineId: machineDetail?.machineGuid
    }

    const response = await DashboardService.getMachineRuntimeDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, machineChart: response?.data }))
    }
  }

  const getMachineStatus = async () => {
    const response = await DashboardService.getMachineStatus()

    if (response.success && response.code === 200) {
      setMachineStatus(response?.data)
    }
  }

  const getNotification = async () => {
    setLoader(true)
    const params = {
      limit: 3,
      offset: 2,
      type: "DEALER_BILLING"
    }
    const response = await DashboardService.getNotification(params)

    if (response.success && response.code === 200) {
      const arr = response?.data?.records?.map(
        (item) => `${item?.message} on ${dateFormat(item?.updatedAt, "DD/MM/YYYY")}`
      )

      setNotificationList({ notificationData: arr })
    }
    setLoader(false)
  }

  const getElectricityDetail = async (electricityStartDate, electricityEndDate) => {
    setLoader(true)
    let params = {
      fromDate: convertToISO(electricityStartDate),
      toDate: convertToISO(electricityEndDate, true),
      machineIds: dropDownElectrityMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await DashboardService.getElectricityDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, electricityChart: response?.data }))
    }
    setLoader(false)
  }

  const handleWashDateSelect = (option) => {
    setSelectedWashDateOption(option)

    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")

    const endDateformat = moment().format("YYYY-MM-DD")

    getWashDetail(startDateformat, endDateformat)
  }

  const handleWaterQualitySelect = (option) => {
    setSelectedWaterQualityOption(option)

    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")

    const endDateformat = moment().format("YYYY-MM-DD")

    getWaterQualityDetail(startDateformat, endDateformat)
  }

  const handleMachineRunTimeDateSelect = (option) => {
    setSelectedMachineRunTimeOption(option)

    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")

    const endDateformat = moment().format("YYYY-MM-DD")

    getMachineRunTimeDetail(startDateformat, endDateformat)
  }

  const handleElectricityDateSelect = (option) => {
    setSelectedElectricityDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")

    getElectricityDetail(startDateformat, endDateformat)
  }

  const handleWaterDateSelect = (option) => {
    setSelectedWaterDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")
    getWaterDetail(startDateformat, endDateformat)
  }

  return (
    <Grid container>
      {notificationList?.notificationData?.length != 0 ? (
        <Grid container justifyContent="space-between" xs={12} md={12} sx={styles.mainWrapper} item>
          <Box sx={styles.outerBox}>
            <img style={{ marginRight: "1.2rem" }} src={DashboardIcon} />
            <Typography variant="p3">{notificationList?.notificationData[notify]}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "13.7rem"
              }}>
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
            <SecondaryButton
              sx={styles.viewBtn}
              type="submit"
              variant="contained"
              size="large"
              onClick={() => navigate(`/${user?.role}/billing-accounting`)}>
              <Typography color="text.red1" sx={styles.viewText}>
                View{" "}
              </Typography>
            </SecondaryButton>
          </Box>
        </Grid>
      ) : null}

      <Box sx={styles.infoBox}>
        <Typography variant="h6">Hello, {capitaliseString(user?.name)}</Typography>
      </Box>
      <Grid container item xs={12} gap={1}>
        {permissions?.walletPermission?.viewPermission ? (
          <Grid item sm={3.9} xs={12}>
            <AmountCard
              customStyles={{ height: "9rem", cursor: "pointer" }}
              handleRoutes={() => navigate(`/${user.role}/wallet/transaction-history`)}
              title="Wallet Balance (incl.Gst)"
              imgSrc={Wallet}
              amount={formatCurrency(getMachineBalance(machineName || []))}
              type={"cash"}
            />
          </Grid>
        ) : null}
        {permissions?.walletPermission?.viewPermission ? (
          <Grid item sm={3.9} xs={12}>
            <AmountCard
              customStyles={{ height: "9rem", cursor: "pointer" }}
              handleRoutes={() => navigate(`/${user.role}/wallet/transaction-history`)}
              title={"BlueVerse Credits Balance "}
              imgSrc={Coins}
              amount={formatCurrency(getMachineCredit(machineName || []), "INR ")}
              type={"credit"}
            />
          </Grid>
        ) : null}
        {permissions?.machinePermission?.viewPermission ? (
          <Grid item sm={3.9} xs={12}>
            <Box
              onClick={() => navigate(`/${user.role}/machines`)}
              style={{ cursor: "pointer" }}
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
                    <Typography variant="s1" color="background.green5">
                      {machineStatus?.activeMachine || 0}
                    </Typography>
                    <Typography
                      sx={{
                        marginLeft: "1.6rem"
                      }}
                      variant="p5">
                      Inactive: &nbsp;&nbsp;
                    </Typography>
                    <Typography variant="s1" color="text.red1">
                      {machineStatus?.inactiveMachine || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        ) : null}
      </Grid>
      <Grid container item xs={12} md={12} gap={1} justifyContent="space-between">
        {permissions?.washPermission?.viewPermission ? (
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
                    label="Select Machine"
                    selectedItems={dropDownMachineData}
                    selectAll
                    onSelect={(values) => {
                      setDropDownMachineData(values)
                    }}
                  />
                </Grid>
                {/* <Box sx={styles.dateBox}> */}
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedWashDateOption}
                  handleDateSelect={handleWashDateSelect}
                  style={{ width: "22rem" }}
                />
              </Grid>
              {/* </Box> */}
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
        ) : null}
        {permissions?.washPermission?.viewPermission ? (
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
              {/* <Box sx={styles.dateBox}> */}
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
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedWaterDateOption}
                  handleDateSelect={handleWaterDateSelect}
                  style={{ width: "22rem" }}
                />
              </Grid>
              {/* </Box> */}
            </Box>
            <Box sx={{ height: "95%", display: "flex" }}>
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
                      : 0}
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
        ) : null}

        {permissions?.machinePermission?.viewPermission ? (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={styles.runTimeChart}>
              <Box sx={styles.chartHeader}>
                <img src={ElectricityIcon} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Electricity Consumed</Typography>
                  <Typography variant="h7">
                    {getElectricityConsumed(chartData?.electricityChart)}{" "}
                    <Typography variant="p5" color="text.main">
                      kwh
                    </Typography>
                  </Typography>
                </Stack>
              </Box>
              <Grid container gap={3} justifyContent="flex-end">
                <Grid item sx={styles.machineBox}>
                  <MultipleSelect
                    style={{ width: "22rem" }}
                    items={allMachine}
                    label="Select Machine"
                    onSelect={(values) => {
                      setDropDownElectricityMachineData(values)
                    }}
                    selectAll
                    selectedItems={dropDownElectrityMachineData}
                  />
                </Grid>
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedElectricityDateOption}
                  handleDateSelect={handleElectricityDateSelect}
                  style={{ width: "22rem" }}
                />
              </Grid>
            </Box>
            <LineChart
              timeline={selectedElectricityDateOption}
              data={chartData?.electricityChart}
              xAxis={true}
            />
          </Grid>
        ) : null}
        {permissions?.machinePermission?.viewPermission ? (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={styles.chartHeader}>
                <img src={WaterQualityIcon} />
                <Stack
                  sx={{
                    marginLeft: "1.2rem",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                  }}>
                  <Typography variant="p2">Water Quality</Typography>

                  <LightTooltip
                    title={
                      <Typography variant="p1" color="text.main">
                        Updated At :{" "}
                        {dateFormat(
                          chartData?.waterQuality?.lastFiveTransactionData?.updatedAt,
                          "MMMM DD YYYY, h:mm A"
                        )}
                      </Typography>
                    }>
                    <InfoIcon sx={styles.infoIcon} />
                  </LightTooltip>
                </Stack>
              </Box>
              <Grid container gap={3} justifyContent="flex-end">
                <Grid item sx={styles.machineBox}>
                  <MultipleSelect
                    style={{ width: "22rem" }}
                    items={allMachine}
                    label="Select Machine"
                    onSelect={(values) => {
                      setDropDownQualityMachineData(values)
                    }}
                    selectAll
                    selectedItems={dropDownQualityMachineData}
                  />
                </Grid>
                <DateFilter
                  dateOptions={dateOptionsDashboard}
                  selectedDateOption={selectedWaterQualityOption}
                  handleDateSelect={handleWaterQualitySelect}
                  style={{ width: "22rem" }}
                />
              </Grid>
            </Box>
            <Box sx={styles.waterQualityBox}>
              <Box
                onClick={() => {
                  setSelectedWaterQuality("PHValue")
                }}
                sx={
                  selectedWaterQuality == "PHValue"
                    ? [styles.selectedBtn, styles.waterQualityBtn]
                    : [styles.waterQualityBtn, styles.unSelectedBtn]
                }>
                <Typography variant="p1">
                  {chartData?.waterQuality?.lastFiveTransactionData?.ph || 0}
                  <Typography variant="p5"> Ph</Typography>{" "}
                </Typography>
              </Box>
              <Box
                onClick={() => {
                  setSelectedWaterQuality("TDSValue")
                }}
                sx={
                  selectedWaterQuality == "TDSValue"
                    ? [styles.selectedBtn, styles.waterQualityBtn]
                    : [styles.waterQualityBtn, styles.unSelectedBtn]
                }>
                <Typography variant="p1">
                  {chartData?.waterQuality?.lastFiveTransactionData?.tds || 0}{" "}
                  <Typography variant="p5"> Tds</Typography>{" "}
                </Typography>
              </Box>{" "}
              <Box
                onClick={() => {
                  setSelectedWaterQuality("TSSValue")
                }}
                sx={
                  selectedWaterQuality == "TSSValue"
                    ? [styles.selectedBtn, styles.waterQualityBtn]
                    : [styles.waterQualityBtn, styles.unSelectedBtn]
                }>
                <Typography variant="p1">
                  {chartData?.waterQuality?.lastFiveTransactionData?.tss || 0}
                  <Typography variant="p5"> Tss</Typography>{" "}
                </Typography>
              </Box>{" "}
              <Box
                onClick={() => {
                  setSelectedWaterQuality("CODValue")
                }}
                sx={
                  selectedWaterQuality == "CODValue"
                    ? [styles.selectedBtn, styles.waterQualityBtn]
                    : [styles.waterQualityBtn, styles.unSelectedBtn]
                }>
                <Typography variant="p1">
                  {chartData?.waterQuality?.lastFiveTransactionData?.cod || 0}{" "}
                  <Typography variant="p5"> Cod</Typography>{" "}
                </Typography>
              </Box>{" "}
              <Box
                onClick={() => {
                  setSelectedWaterQuality("OilAndGreaseValue")
                }}
                sx={
                  selectedWaterQuality == "OilAndGreaseValue"
                    ? [styles.selectedBtn, styles.waterQualityBtn]
                    : [styles.waterQualityBtn, styles.unSelectedBtn]
                }>
                <Typography variant="p1">
                  {chartData?.waterQuality?.lastFiveTransactionData?.oilAndGrease || 0}{" "}
                  <Typography variant="p5"> Oil & Grees</Typography>{" "}
                </Typography>
              </Box>
            </Box>
            <BarChart
              waterQuality={selectedWaterQuality}
              data={chartData?.waterQuality?.transactions || []}
              timeline={selectedWaterQualityOption}
            />
          </Grid>
        ) : null}
        {permissions?.machinePermission?.viewPermission ? (
          <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
            <Box sx={styles.runTimeChart}>
              <Box sx={styles.chartHeader}>
                <img src={MachineRunTimeIcon} />
                <Stack sx={{ marginLeft: "1.2rem" }}>
                  <Typography variant="p2">Machine Runtime</Typography>
                  <Box sx={{ display: "flex" }}>
                    {convertToHour(getTotalMachineRuntime(chartData?.machineChart)) != 0 && (
                      <Typography variant="h7">
                        {convertToHour(getTotalMachineRuntime(chartData?.machineChart))}{" "}
                        <Typography variant="p5">hours</Typography>
                        &nbsp;
                      </Typography>
                    )}
                    {convertToMinute(getTotalMachineRuntime(chartData?.machineChart)) != 0 && (
                      <Typography variant="h7">
                        {convertToMinute(getTotalMachineRuntime(chartData?.machineChart))}{" "}
                        <Typography variant="p5">minute</Typography>
                        &nbsp;
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
              {/* <Box sx={styles.dateBox}> */}{" "}
              <DateFilter
                dateOptions={dateNoTodayOptionsDashboard}
                selectedDateOption={selectedMachineRunTimeDateOption}
                handleDateSelect={handleMachineRunTimeDateSelect}
                style={{ width: "22rem" }}
              />
              {/* </Box> */}
            </Box>
            <Box sx={styles.machineChart}>
              {machineName?.map((item, index) => (
                <Box
                  key={index}
                  sx={
                    selectedMachine == index
                      ? [styles.machineName, styles.selectedMachineActive]
                      : [styles.machineName, styles.selectedMachineInactive]
                  }
                  onClick={() => {
                    setSelectedMachine(index)
                    setMachineDetail(item)
                  }}>
                  <Typography variant="p2" color="background.default">
                    {item?.name}
                  </Typography>
                </Box>
              ))}
            </Box>
            <BarChart
              data={chartData?.machineChart || {}}
              timeline={selectedMachineRunTimeDateOption}
              types="machines"
            />
          </Grid>
        ) : null}
      </Grid>
      {loader && <AppLoader />}
    </Grid>
  )
}

export default Dashboard
