import React, { useEffect, useState } from "react"
import { Box, Grid, Stack, Typography, useTheme } from "@mui/material"
import DashBoardWashes from "assets/images/icons/dashBoardWashes.svg"
import WaterIcon from "assets/images/icons/waterIcon.svg"
import DealershipIcon from "assets/images/icons/dealershipCount.svg"
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
import TvsIcon from "assets/images/icons/tvsMotors.svg"

import { getElectricityConsumed } from "pages/private/admin/dashboard/dashboardUtility"
import {
  convertDate,
  totalDealerAmount
} from "components/utilities-components/ApexCharts/ApexUtility"
import { subtractAndValidate } from "helpers/Functions/formateString"
import { useNavigate } from "react-router-dom"

function AreaManagerDashboard() {
  const styles = useStyles()
  const user = userDetail()
  const theme = useTheme()
  const navigate = useNavigate()

  const [selectedElectricityDateOption, setSelectedElectricityDateOption] = useState(
    dateOptionsDashboard[0]
  )
  const [selectedWashDateOption, setSelectedWashDateOption] = useState(dateOptionsDashboard[0])
  const [selectedWaterDateOption, setSelectedWaterDateOption] = useState(dateOptionsDashboard[0])

  const [allMachine, setMachines] = useState()
  const [selectedTopDealershipDateOption, setSelectedTopDealershipDateOption] = useState(
    dateOptionsDashboard[0]
  )

  const [dealerName, setDealerName] = useState([])

  const [dropDownMachineData, setDropDownMachineData] = useState([])

  const [dropDownElectrityMachineData, setDropDownElectricityMachineData] = useState([])

  const [dropDownTreatedMachineData, setDropDownTreatedMachineData] = useState([])

  const [chartData, setChartDate] = useState({
    areaWashChart: {},
    waterChart: {},
    dealershipCountChart: {},
    topDealershipChart: [],
    electricityChart: {}
  })
  const [selectedDealershipCountDateOption, setSelectedDealershipCountDateOption] = useState(
    dateOptionsDashboard[0]
  )

  const [machineList, setMachineList] = useState()

  useEffect(() => {
    handleWashDateSelect(selectedWashDateOption)
  }, [dropDownMachineData])

  useEffect(() => {
    handleWaterDateSelect(selectedWaterDateOption)
  }, [dropDownTreatedMachineData])

  useEffect(() => {
    handleElectricityDateSelect(selectedElectricityDateOption)
  }, [dropDownElectrityMachineData])

  useEffect(() => {
    handleDealershipCountDateSelect(selectedDealershipCountDateOption)
    handleTopDealershipDateSelect(selectedTopDealershipDateOption)
    getMachineList()
  }, [])

  const getDealersipCountDetail = async (dealershipStartDate, dealershipEndDate) => {
    let params = {
      fromDate: convertToISO(dealershipStartDate),
      toDate: convertToISO(dealershipEndDate)
    }

    const response = await DashboardService.getAreaManagerDealersipCountDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, dealershipCountChart: response?.data }))
    }
  }

  const dealerColor = [
    theme?.palette?.background?.green5,
    theme?.palette?.background?.blue9,
    theme?.palette?.text?.red2,
    theme?.palette?.background?.gray4,
    theme?.palette?.background?.yellow2
  ]

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

    const response = await DashboardService.getAreaManagerWashDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, areaWashChart: response?.data }))
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

    const response = await DashboardService.getAreaManagerElectricityDetail(params)
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

    const response = await DashboardService.getAreaManagerWaterDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({ ...prev, waterChart: response?.data }))
    }
  }

  const getMachineList = async () => {
    const response = await DashboardService.getAreaManagerMachineList()

    if (response.success && response.code === 200) {
      let dealerArray = response?.data?.dealers?.areaManagerDealers.map((item) => item?.dealer)
      const labelKey = "username"
      const key = "userId"
      const sortDealerArray = sortData(labelKey, key, dealerArray)
      const outletArray = sortDealerArray.map((dealer) => dealer?.outlets)
      const flatOutletArray = outletArray.flat()
      const machineArray = flatOutletArray.map((outlet) => outlet?.machines)
      const flatMachineArray = machineArray.flat()
      setMachineList(response?.data?.machines)
      const machineLabelKey = "name"
      const machineIdKey = "machineGuid"
      const sortMachineArray = sortData(machineLabelKey, machineIdKey, flatMachineArray)
      setMachines(sortMachineArray)
      setDropDownMachineData(sortMachineArray)
      setDropDownElectricityMachineData(sortMachineArray)
      setDropDownTreatedMachineData(sortMachineArray)
      if (sortMachineArray?.length === 1) {
        setDropDownMachineData(sortMachineArray)
        setDropDownElectricityMachineData(sortMachineArray)
        setDropDownTreatedMachineData(sortMachineArray)
      }
    }
  }

  const handleWaterDateSelect = (option) => {
    setSelectedWaterDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")
    getWaterDetail(startDateformat, endDateformat)
  }

  const handleWashDateSelect = (option) => {
    setSelectedWashDateOption(option)

    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")

    const endDateformat = moment().format("YYYY-MM-DD")
    getWashDetail(startDateformat, endDateformat)
  }

  const handleElectricityDateSelect = (option) => {
    setSelectedElectricityDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")

    getElectricityDetail(startDateformat, endDateformat)
  }

  const handleTopDealershipDateSelect = (option) => {
    setSelectedTopDealershipDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")
    getTopDealersipDetail(startDateformat, endDateformat)
  }

  const handleDealershipCountDateSelect = (option) => {
    setSelectedDealershipCountDateOption(option)
    const startDateformat = moment()
      .subtract(option.value - 1, "days")
      .format("YYYY-MM-DD")
    const endDateformat = moment().format("YYYY-MM-DD")

    getDealersipCountDetail(startDateformat, endDateformat)
  }

  const getTopDealersipDetail = async (dealershipStartDate, dealershipEndDate) => {
    let params = {
      toDate: convertToISO(dealershipEndDate),
      fromDate: convertToISO(dealershipStartDate)
    }

    const response = await DashboardService.getAreaManagerTopDealersipDetail(params)

    if (response.success && response.code === 200) {
      setChartDate((prev) => ({
        ...prev,
        topDealershipChart: response?.data?.slice(0, 5)
      }))

      const dealerName = response?.data?.slice(0, 5)?.map((item, index) => {
        return {
          username: item?.username,
          color: dealerColor[index],
          count: Number(item?.count || 0),
          uniqueId: item?.uniqueId
        }
      })
      setDealerName(dealerName)
    }
  }

  return (
    <Grid container>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <Box sx={styles.infoBox}>
          <Typography variant="h6">Hello, {capitalizeWords(user?.name)}</Typography>
        </Box>
        <Box sx={styles.oemBox}>
          <Box>
            <img src={TvsIcon} style={{ height: "100%", marginRight: "1.2rem" }} />
          </Box>
          <Stack>
            <Typography variant="p2" color="text.gray">
              OEM
            </Typography>
            <Typography variant="p1" color="text.main">
              TVS
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Grid container item md={12} gap={1} justifyContent="space-between" xs={12}>
        <Grid md={5.9} sx={styles.chartWrapper} xs={12}>
          <Box sx={styles.runTimeChart}>
            <Box sx={styles.chartHeader}>
              <img src={DashBoardWashes} />
              <Stack sx={{ marginLeft: "1.2rem" }}>
                <Typography variant="p2">Total Washes</Typography>
                <Typography variant="h7">
                  {formatCurrency(chartData?.areaWashChart?.totalWashes, "")}
                </Typography>
              </Stack>
            </Box>
            <Box sx={styles.machineBox}>
              <MultipleSelect
                style={{ width: "22rem" }}
                items={allMachine}
                label="Select Machine"
                onSelect={(values) => {
                  setDropDownMachineData(values)
                }}
                selectAll
                selectedItems={dropDownMachineData}
              />
            </Box>
            <DateFilter
              style={{ width: "16rem" }}
              handleDateSelect={handleWashDateSelect}
              selectedDateOption={selectedWashDateOption}
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
            timeline={selectedWashDateOption}
            data={chartData?.areaWashChart?.transactions}
          />
        </Grid>
        <Grid sx={styles.chartWrapper} xs={12} md={5.9} item>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={styles.chartHeader}>
              <img src={TopDealershipIcon} />
              <Stack sx={{ marginLeft: "1.2rem" }}>
                <Typography variant="p2">Top DealerShips</Typography>
                <Typography variant="h7">
                  {totalDealerAmount(chartData?.topDealershipChart)}{" "}
                  <Typography variant="p5" color="text.main">
                    Washes
                  </Typography>
                </Typography>
              </Stack>
            </Box>

            <DateFilter
              style={{ width: "16rem" }}
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
                  justifyContent: "center",

                  flexDirection: "column",
                  height: "80%",
                  marginTop: "5rem",
                  width: "100%"
                }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1.2rem",
                    paddingRight: "4rem"
                  }}>
                  <Typography variant="p4" color="text.gray">
                    Dealership
                  </Typography>
                  <Typography color="text.gray" variant="p4">
                    Washes
                  </Typography>
                </Box>
                {dealerName?.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      marginBottom: "1.2rem",
                      paddingRight: "4rem",
                      justifyContent: "space-between"
                    }}>
                    <Stack>
                      <Typography variant="p3" color="text.main">
                        {item?.username}
                      </Typography>
                      <Typography color="text.gray3" variant="p5">
                        {item?.uniqueId}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          height: "1rem",
                          backgroundColor: item?.color,
                          width: "1rem",
                          borderRadius: "100%",
                          marginRight: "1.2rem"
                        }}
                      />
                      <Typography color="text.main" variant="p3">
                        {formatCurrency(item?.count, "")}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
              <Grid xs={7} item container justifyContent="center" alignItems="center">
                <DashboardPieChart type="area" data={chartData?.topDealershipChart} />
              </Grid>
            </Grid>
          ) : (
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                justifyContent: "center"
              }}>
              <Typography color="text.main" variant="s1">
                {" "}
                No Data
              </Typography>
            </Grid>
          )}
        </Grid>
        <Grid xs={12} sx={styles.chartWrapper} md={5.9}>
          <GMap data={machineList || []} />
        </Grid>
        <Grid md={5.9} sx={styles.chartWrapper} xs={12}>
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
                dateOptions={dateOptionsDashboard}
                handleDateSelect={handleWaterDateSelect}
                selectedDateOption={selectedWaterDateOption}
              />
            </Grid>
          </Box>

          <Box sx={{ height: "100%", display: "flex" }}>
            <Box sx={{ width: "70%" }}>
              <RadialChart data={chartData?.waterChart} />
            </Box>
            <Box sx={{ flexDirection: "column", justifyContent: "center", display: "flex" }}>
              <Stack sx={styles.radialLegend1}>
                <Typography variant="p2">Recycled Water</Typography>
                <Typography variant="h7">
                  {chartData?.waterChart?.WaterUsed
                    ? subtractAndValidate(
                        Number(chartData?.waterChart?.WaterUsed),
                        Number(chartData?.waterChart?.WaterWastage)
                      )
                    : 0}{" "}
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
                  <Typography variant="p5" color="text.main">
                    Litre
                  </Typography>
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>
        <Grid md={5.9} sx={styles.chartWrapper} xs={12}>
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
                handleDateSelect={handleElectricityDateSelect}
                dateOptions={dateOptionsDashboard}
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
        <Grid md={5.9} sx={styles.chartWrapper} xs={12}>
          <Box sx={styles.runTimeChart}>
            <Box sx={styles.chartHeader}>
              <img src={DealershipIcon} />
              <Stack sx={{ marginLeft: "1.2rem" }}>
                <Typography variant="p2">Dealership Count</Typography>
                <Typography variant="h7">
                  {formatCurrency(chartData?.dealershipCountChart?.count, "")}
                </Typography>
              </Stack>
            </Box>{" "}
            <DateFilter
              style={{ width: "16rem" }}
              selectedDateOption={selectedDealershipCountDateOption}
              handleDateSelect={handleDealershipCountDateSelect}
              dateOptions={dateOptionsDashboard}
            />
          </Box>
          <LineChart
            type="dealership"
            timeline={selectedDealershipCountDateOption}
            data={chartData?.dealershipCountChart?.dealers}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default AreaManagerDashboard
