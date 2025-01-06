import React from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { ChartColorMap, getDataLabels } from "./ChartDefaults"
import { useTheme } from "@mui/system"

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const PieChart = ({ data }) => {
  const theme = useTheme()
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1 | 1,
    layout: {
      padding: {
        top: 1,
        bottom: 1
      }
    },
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true
        }
      },
      datalabels: {
        ...getDataLabels(theme),
        align: "end",
        offset: "14",
        size: "12",
        color: theme.palette.background.default
      }
    }
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "# of Votes",
        data: data.dataArray,
        backgroundColor: ChartColorMap,
        borderColor: ChartColorMap
      }
    ]
  }
  return (
    <Pie data={chartData} options={options} style={{ marginLeft: "auto", marginRight: "auto" }} />
  )
}

export default PieChart
