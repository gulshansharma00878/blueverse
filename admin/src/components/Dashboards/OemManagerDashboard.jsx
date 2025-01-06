import React, { useEffect, useState } from "react"
import { Box, Grid, Stack, Typography, useTheme } from "@mui/material"
import DashBoardWashes from "assets/images/icons/dashBoardWashes.svg"
import WaterIcon from "assets/images/icons/waterIcon.svg"
import TopDealershipIcon from "assets/images/icons/topDealership.svg"
import { useStyles } from "pages/private/admin/dashboard/DashboardStyles"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import moment from "moment"
import { convertToISO, dateOptionsDashboard } from "helpers/app-dates/dates"
import RadialChart from "components/utilities-components/ApexCharts/RadialChart"
import { DashboardService } from "network/dashboardServices"
import DateFilter from "components/WashPanel/WashDashboard/DateFilter"
import DashboardPieChart from "components/utilities-components/ApexCharts/PieChart"
import StackedBarChart from "components/utilities-components/ApexCharts/StackedBarChart"
import LineChart from "components/utilities-components/ApexCharts/LineChart"
import { userDetail } from "hooks/state"
import { capitalizeWords } from "helpers/Functions/captalizeWords"
import MultipleSelect from "components/utilities-components/Mulit-Select/MultiSelect"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility"
import GMap from "components/utilities-components/GoogleMap/Gmap"
import ElectricityIcon from "assets/images/icons/electricityConsumed.svg"
import { getElectricityConsumed } from "pages/private/admin/dashboard/dashboardUtility"
import {
  convertDate,
  totalDealerAmount
} from "components/utilities-components/ApexCharts/ApexUtility"
import { subtractAndValidate } from "helpers/Functions/formateString"
import { useNavigate } from "react-router-dom"

function OemManagerDashboard() {
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
  const [selectedElectricityDateOption, setSelectedElectricityDateOption] = useState(
    dateOptionsDashboard[0]
  )

  const [dropDownElectrityMachineData, setDropDownElectricityMachineData] = useState([])

  const [dropDownTreatedMachineData, setDropDownTreatedMachineData] = useState([])
  const [dealerName, setDealerName] = useState([])
  const [dropDownMachineData, setDropDownMachineData] = useState([])
  const [chartData, setChartDate] = useState({
    washChart: {},
    waterChart: {},
    dealershipCountChart: {},
    topDealershipChart: [],
    electricityChart: {}
  })

  const [machineList, setMachineList] = useState()

  useEffect(() => {
    handleDealershipCountDateSelect(selectedDealershipCountDateOption)
    handleTopDealershipDateSelect(selectedTopDealershipDateOption)
    getMachineList()
  }, [])

  useEffect(() => {
    handleWaterDateSelect(selectedWaterDateOption)
  }, [dropDownTreatedMachineData])

  useEffect(() => {
    handleElectricityDateSelect(selectedElectricityDateOption)
  }, [dropDownElectrityMachineData])

  useEffect(() => {
    handleWashDateSelect(selectedWashDateOption)
  }, [dropDownMachineData])

  const dealerColor = [
    theme?.palette?.background?.green5,
    theme?.palette?.background?.blue9,
    theme?.palette?.text?.red2,
    theme?.palette?.background?.gray4,
    theme?.palette?.background?.yellow2
  ]

  const getDealersipCountDetail = async (dealershipStartDate, dealershipEndDate) => {
    let params = {
      fromDate: convertToISO(dealershipStartDate),
      toDate: convertToISO(dealershipEndDate)
    }

    const response = await DashboardService.getOemDealersipCountDetail(params)
    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, dealershipCountChart: response?.data }))
    }
  }

  const getTopDealersipDetail = async (dealershipStartDate, dealershipEndDate) => {
    let params = {
      fromDate: convertToISO(dealershipStartDate),
      toDate: convertToISO(dealershipEndDate)
    }

    const response = await DashboardService.getOemTopDealersipDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({
        ...prev,
        topDealershipChart: response?.data?.slice(0, 5)
      }))

      const dealerName = response?.data?.slice(0, 5)?.map((item, index) => {
        return {
          username: item?.username,
          uniqueId: item?.uniqueId,
          count: Number(item?.count || 0),
          color: dealerColor[index]
        }
      })
      setDealerName(dealerName)
    }
  }

  const getWashDetail = async (washStartDate, washEndDate) => {
    let params = {
      fromDate: convertToISO(washStartDate),
      toDate: convertToISO(washEndDate),
      machineIds: dropDownMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await DashboardService.getoemWashDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, washChart: response?.data }))
    }
  }

  const getElectricityDetail = async (electricityStartDate, electricityEndDate) => {
    let params = {
      fromDate: convertToISO(electricityStartDate),
      toDate: convertToISO(electricityEndDate),
      machineIds: dropDownElectrityMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await DashboardService.getOemElectricityDetail(params)
    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, electricityChart: response?.data }))
    }
  }

  const getWaterDetail = async (waterStartDate, waterEndDate) => {
    let params = {
      fromDate: convertToISO(waterStartDate),
      toDate: convertToISO(waterEndDate),
      machineIds: dropDownTreatedMachineData
        ?.map((item) => {
          return item?.value
        })
        .join(",")
    }

    const response = await DashboardService.getOemWaterDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, waterChart: response?.data }))
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

  const getMachineList = async () => {
    const response = await DashboardService.getOemMachineList()

    if (response.success && response.code === 200) {
      setMachineList(response?.data)

      const labelKey = "name"
      const key = "machineGuid"
      const sortedData = sortData(labelKey, key, response?.data)
      setMachines(sortedData)
      setDropDownMachineData(sortedData)
      setDropDownTreatedMachineData(sortedData)
      setDropDownElectricityMachineData(sortedData)
      if (sortedData?.length === 1) {
        setDropDownMachineData(sortedData)
        setDropDownTreatedMachineData(sortedData)
        setDropDownElectricityMachineData(sortedData)
      }
    }
  }

  const handleElectricityDateSelect = (option) => {
    setSelectedElectricityDateOption(option)
    const startDateformat = moment()
      .subtract(option?.value - 1, "days")
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

  const handleDealershipCountDateSelect = (option) => {
    setSelectedDealershipCountDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")

    getDealersipCountDetail(startDateformat, endDateformat)
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
      <Box sx={styles.infoBox}>
        <Typography variant="h6">Hello, {capitalizeWords(user?.name)}</Typography>
      </Box>
      <Grid container md={12} gap={1} item xs={12} justifyContent="space-between">
        <Grid sx={styles.chartWrapper} md={5.9} xs={12}>
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
            <Box sx={styles.machineBox}>
              <MultipleSelect
                items={allMachine}
                selectedItems={dropDownMachineData}
                selectAll
                style={{ width: "22rem" }}
                label="Select Machine"
                onSelect={(values) => {
                  setDropDownMachineData(values)
                }}
              />
            </Box>
            <DateFilter
              style={{ width: "16rem" }}
              selectedDateOption={selectedWashDateOption}
              handleDateSelect={handleWashDateSelect}
              dateOptions={dateOptionsDashboard}
            />
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
            data={chartData?.washChart?.transactions}
            timeline={selectedWashDateOption}
          />
        </Grid>
        <Grid sx={styles.chartWrapper} xs={12} md={5.9} item>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={styles.chartHeader}>
              <img src={TopDealershipIcon} />
              <Stack sx={{ marginLeft: "1.2rem" }}>
                <Typography variant="p2">Top DealerShips</Typography>
                <Typography variant="h7">
                  {totalDealerAmount(chartData?.topDealershipChart) || 0}{" "}
                  <Typography variant="p5" color="text.main">
                    Washes
                  </Typography>
                </Typography>
              </Stack>
            </Box>
            <DateFilter
              dateOptions={dateOptionsDashboard}
              selectedDateOption={selectedTopDealershipDateOption}
              handleDateSelect={handleTopDealershipDateSelect}
            />
          </Box>

          {dealerName?.length != 0 ? (
            <Grid container justifyContent="space-between" sx={{ height: "100%" }}>
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
                    Washes
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
                      <Typography variant="p3" color="text.main">
                        {item?.username}
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
                        {formatCurrency(item?.count, "")}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
              <Grid xs={7} item container justifyContent="center" alignItems="center">
                <DashboardPieChart type data={chartData?.topDealershipChart} />
              </Grid>
            </Grid>
          ) : (
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%"
              }}>
              <Typography variant="s1" color="text.main">
                {" "}
                No Data
              </Typography>
            </Grid>
          )}
        </Grid>
        <Grid sx={styles.chartWrapper} xs={12} md={5.9}>
          {window.google && <GMap data={machineList || []} />}
        </Grid>
        <Grid sx={styles.chartWrapper} md={5.9} xs={12}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={styles.chartHeader}>
              <img src={WaterIcon} />
              <Stack sx={{ marginLeft: "1.2rem" }}>
                <Typography variant="p2">Treated Water</Typography>
                <Typography variant="h7">
                  {parseFloat(
                    chartData?.waterChart?.WaterUsed ? chartData?.waterChart?.WaterUsed : 0
                  ).toFixed(2)}{" "}
                  <Typography color="text.main" variant="p5">
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
                  label="Select Machine"
                  onSelect={(values) => {
                    setDropDownTreatedMachineData(values)
                  }}
                  selectAll
                  selectedItems={dropDownTreatedMachineData}
                />
              </Grid>
              <DateFilter
                style={{ width: "16rem" }}
                handleDateSelect={handleWaterDateSelect}
                dateOptions={dateOptionsDashboard}
                selectedDateOption={selectedWaterDateOption}
              />
            </Grid>
          </Box>

          <Box sx={{ display: "flex", height: "100%" }}>
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
                  <Typography color="text.main" variant="p5">
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
                  <Typography color="text.main" variant="p5">
                    Litre
                  </Typography>
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>
        <Grid sx={styles.chartWrapper} md={5.9} xs={12}>
          <Box sx={styles.runTimeChart}>
            <Box sx={styles.chartHeader}>
              <img src={ElectricityIcon} />
              <Stack sx={{ marginLeft: "1.2rem" }}>
                <Typography variant="p2">Electricity Consumed</Typography>
                <Typography variant="h7">
                  {getElectricityConsumed(chartData?.electricityChart)}{" "}
                  <Typography color="text.main" variant="p5">
                    kwh
                  </Typography>
                </Typography>
              </Stack>
            </Box>{" "}
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
                style={{ width: "16rem" }}
                dateOptions={dateOptionsDashboard}
                handleDateSelect={handleElectricityDateSelect}
                selectedDateOption={selectedElectricityDateOption}
              />
            </Grid>
          </Box>
          <LineChart
            timeline={selectedElectricityDateOption}
            data={chartData?.electricityChart}
            xAxis={true}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OemManagerDashboard
