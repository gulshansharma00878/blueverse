import React from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, Legend, BarElement, Tooltip } from "chart.js"
import { Bar } from "react-chartjs-2"
import { useTheme } from "@mui/system"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { ChartScales, getDataLabels } from "./ChartDefaults"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartDataLabels, Legend)

const VerticalBarChart = ({ data }) => {
  const theme = useTheme()

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    layout: {
      padding: {
        right: 52
      }
    },
    scales: {
      ...ChartScales,
      y: {
        ...ChartScales.y,
        ticks: {
          color: theme.palette.text.main,
          fontWeight: "600"
        }
      }
    },
    plugins: {
      tooltip: { enabled: false },
      datalabels: { ...getDataLabels(theme), offset: -46, anchor: "end", align: "start" },
      legend: {
        display: false
      }
    }
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        // label: "Dataset 1",
        data: data.dataArray,
        backgroundColor: "#FFB020",
        borderRadius: 10
      }
    ]
  }

  return <Bar options={options} data={chartData} />
}

export default VerticalBarChart
