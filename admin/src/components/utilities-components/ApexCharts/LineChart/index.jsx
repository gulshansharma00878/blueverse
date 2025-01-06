import React from "react"
import Chart from "react-apexcharts"
import { axisDays, monthXAxis, dynamicAxis, daysWithYear } from "../ApexUtility"
import { Grid, useMediaQuery } from "@mui/material"
const labelColor = Array(monthXAxis?.length).fill("#8692A4")

function LineChart({
  data = {},
  timeline,
  type = "electricity",
  xAxis = false,
  handleRoutes = () => {}
}) {
  const isMobile = useMediaQuery("(max-width: 1606px)")
  const isTab = useMediaQuery("(min-width: 900px)")

  const series = [
    {
      data: data ? Object.values(data).map((value) => parseFloat(value?.toFixed(2))) : []
    }
  ]

  const options = {
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false
      },
      toolbar: {
        show: true,
        tools: {
          download: false
        }
      },
      events: {
        markerClick: function (_, chartContext, { dataPointIndex }) {
          const getDateArray = daysWithYear(timeline?.value)
          const selectedDate = getDateArray[dataPointIndex]
          handleRoutes(selectedDate, dataPointIndex)
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight"
    },
    colors: [type == "dealership" ? "#FED894" : "#668CFF"],
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5
      }
    },
    xaxis: {
      name: "category",
      categories: xAxis ? dynamicAxis(data, timeline?.value) : axisDays(timeline?.value),
      labels: {
        show: Object.values(data)?.length > 0,
        style: {
          colors: labelColor
        }
      }
    },
    yaxis: {
      show: Object.values(data)?.length > 0,
      decimalsInFloat: 0,
      labels: {
        formatter: function (val) {
          return type === "electricity" ? val.toFixed(2) : val.toFixed(0)
        }
      }
    },
    markers: {
      size: 6,
      colors: "#668CFF",
      strokeColors: "#fff",
      hover: {
        size: 6,
        sizeOffset: 3
      }
    },
    noData: {
      text: "No Data Available",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: "14px",
        fontFamily: undefined
      }
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        if (type == "dealership" || type == "dealershipCount") {
          return (
            '<div style="padding: 8px; ">' +
            '<span style="color: #8692A4; font-size: 12px; font-weight: 700;">' +
            w.globals.categoryLabels[dataPointIndex] +
            " " +
            "</span>" +
            '<span style="color: #181A1E; font-size: 16px; font-weight: 600;">' +
            series[seriesIndex][dataPointIndex] +
            `</span>` +
            "</div>"
          )
        } else {
          return (
            '<div style="padding: 8px; ">' +
            '<span style="color: #8692A4; font-size: 12px; font-weight: 700;">' +
            w.globals.categoryLabels[dataPointIndex] +
            " " +
            "</span>" +
            '<span style="color: #181A1E; font-size: 16px; font-weight: 600;">' +
            series[seriesIndex][dataPointIndex] +
            " kwh" +
            `</span>` +
            "</div>"
          )
        }
      }
    }
  }

  return (
    <Grid container direction="column" sx={{ height: "100%" }}>
      <Grid item sx={{ width: "100%", height: "85%", overflowX: "scroll", overflowY: "hidden" }}>
        <Chart
          series={series}
          options={options}
          type="line"
          width={Object.values(data)?.length < 30 ? "100%" : "150%"}
          height={isMobile && isTab ? "70%" : "100%"}
        />
      </Grid>
    </Grid>
  )
}

export default LineChart
