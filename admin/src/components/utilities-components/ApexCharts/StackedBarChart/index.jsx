import React from "react"
import Chart from "react-apexcharts"
import { axisDays, finalData, monthXAxis, daysWithYear } from "../ApexUtility"
import { useMediaQuery } from "@mui/material"

const labelColor = Array(monthXAxis?.length).fill("#8692A4")

function StackedBarChart({ data = {}, timeline, handleRoutes = () => {} }) {
  let silverData = data && data.SILVER && finalData(Object.values(data.SILVER))?.length > 0
  let goldData = data && data.GOLD && finalData(Object.values(data.GOLD))?.length > 0
  let platinumData = data && data.PLATINUM && finalData(Object.values(data.PLATINUM))?.length > 0

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
      stacked: true,
      events: {
        dataPointSelection: (a, b, { dataPointIndex }) => {
          const getDateArray = daysWithYear(timeline?.value)
          const selectedDate = getDateArray[dataPointIndex]
          handleRoutes(selectedDate, dataPointIndex)
        }
      }
    },
    xaxis: {
      type: "category",
      categories: axisDays(timeline?.value),
      labels: {
        show: silverData || goldData || platinumData,
        style: {
          colors: labelColor
        }
      }
    },
    yaxis: {
      type: "category",
      labels: {
        show: silverData || goldData || platinumData,
        style: {
          colors: ["#8692A4"]
        }
      }
    },
    legend: {
      position: "top",
      offsetY: 20,
      offsetX: 0,
      markers: {
        radius: 12
      }
    },
    fill: {
      opacity: 1
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
      data: data && data.SILVER ? finalData(Object.values(data.SILVER)) : []
    },
    {
      name: "Gold",
      data: data && data.GOLD ? finalData(Object.values(data.GOLD)) : []
    },
    {
      name: "Platinum",
      data: data && data.PLATINUM ? finalData(Object.values(data.PLATINUM)) : []
    }
  ]

  return (
    <Chart
      series={series}
      options={options}
      type="bar"
      width="100%"
      height={isMobile ? "73%" : "90%"}
    />
  )
}

export default StackedBarChart
