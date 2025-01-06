import React from "react"
import Chart from "react-apexcharts"
import { axisDays, daysWithYear, monthXAxis } from "../ApexUtility"
import { useMediaQuery } from "@mui/material"

const labelColor = Array(monthXAxis?.length).fill("#8692A4")

function StackedBarChart({ data = {}, timeline, handleRoutes = () => {} }) {
  const isMobile = useMediaQuery("(max-width: 1606px)")

  var options = {
    chart: {
      type: "bar",
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      events: {
        dataPointSelection: (a, b, { dataPointIndex }) => {
          const getDateArray = daysWithYear(timeline?.value)
          const selectedDate = getDateArray[dataPointIndex]
          handleRoutes(selectedDate, dataPointIndex)
        }
      },
      stacked: true
    },

    xaxis: {
      type: "category",
      categories: axisDays(timeline?.value),
      labels: {
        show: true,
        style: {
          colors: labelColor
        }
      }
    },
    yaxis: {
      type: "category",
      labels: {
        show: true,
        style: {
          colors: ["#8692A4"]
        }
      }
    },
    legend: {
      position: "top",
      markers: {
        radius: 12
      }
    },
    fill: {
      opacity: 1
    },

    dataLabels: {
      enabled: false
    },
    colors: ["#8692A4", "#EFCB8A", "#B29FCB"],
    states: {
      hover: {
        filter: {
          type: "none"
        }
      }
    }
  }

  const series = [
    {
      name: "Silver",
      data: data && data.SILVER ? Object.values(data.SILVER) : []
    },
    {
      name: "Gold",
      data: data && data.GOLD ? Object.values(data.GOLD) : []
    },
    {
      name: "Platinum",
      data: data && data.PLATINUM ? Object.values(data.PLATINUM) : []
    }
  ]

  return (
    <Chart
      series={series}
      options={options}
      type="bar"
      width="100%"
      height={isMobile ? "70%" : "90%"}
    />
  )
}

export default StackedBarChart
