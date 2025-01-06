import React from "react"
import Chart from "react-apexcharts"
import { totalDealerAmount, totalDealershipAmount } from "../ApexUtility"
import { useTheme } from "@mui/material"

function DashboardPieChart({ data = [], type }) {
  const theme = useTheme()
  let getTotalAmount = type ? totalDealerAmount(data) : totalDealershipAmount(data)
  var options = {
    chart: {
      width: 380,
      type: "pie"
    },
    legend: {
      show: false
    },
    labels: data?.map((item) => {
      return item?.username
    }),
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ],
    fill: {
      colors: [
        theme?.palette?.background?.green5,
        theme?.palette?.background?.blue9,
        theme?.palette?.text?.red2,
        theme?.palette?.background?.gray4,
        theme?.palette?.background?.yellow2
      ]
    },
    tooltip: {
      custom: function ({ series, seriesIndex }) {
        return (
          '<div style="padding: 8px; ">' +
          '<span style="color: #FFF; font-size: 12px; font-weight: 700;">' +
          " " +
          "</span>" +
          '<span style="color: #FFFF; font-size: 16px; font-weight: 600;">' +
          series[seriesIndex]?.toFixed(2) +
          `</span>` +
          "</div>"
        )
      }
    }
  }

  const series = data?.map((item) => {
    if (type) {
      return (parseFloat(item?.count || 0) / getTotalAmount || 1) * 100
    } else {
      return (parseFloat(item?.total || 0) / getTotalAmount || 1) * 100
    }
  })

  return <Chart series={series} options={options} type="pie" height="75%" width="100%" />
}

export default DashboardPieChart
