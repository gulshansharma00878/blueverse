import React from "react"
import Chart from "react-apexcharts"
import { axisDays, monthXAxis, dynamicAxis } from "../ApexUtility"
import { useMediaQuery } from "@mui/material"
const labelColor = Array(monthXAxis?.length).fill("#8692A4")

function LineChart({ data = {}, timeline, xAxis = false }) {
  const isMobile = useMediaQuery("(max-width: 1606px)")

  const series = [
    {
      data: data ? Object.values(data).map((value) => Number(value).toFixed(2)) : []
    }
  ]
  const options = {
    chart: {
      height: 360,
      type: "line",
      zoom: {
        enabled: false
      },
      toolbar: {
        show: true,
        tools: {
          download: false
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "straight"
    },
    colors: ["#668CFF"],
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
        show: true,
        style: {
          colors: labelColor
        }
      }
    },
    yaxis: {
      show: true,
      decimalsInFloat: 0,
      labels: {
        formatter: function (val) {
          return val.toFixed(2)
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
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        return (
          '<div style="padding: 8px; ">' +
          '<span style="color: #8692A4; font-size: 12px; font-weight: 700;">' +
          w.globals.labels[dataPointIndex] +
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

  return (
    <Chart
      series={series}
      options={options}
      type="line"
      width="100%"
      height={isMobile ? "75%" : "90%"}
    />
  )
}

export default LineChart
