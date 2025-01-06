import { Bar } from "react-chartjs-2"
import React from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js"
import { ChartColorMap, ChartScales, getDataLabels } from "./ChartDefaults"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { useTheme } from "@mui/system"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels)

const HorizontalStackedBarChart = ({ data }) => {
  const theme = useTheme()

  const options = {
    indexAxis: "y",
    plugins: {
      tooltip: {
        enabled: true,
        xAlign: "center",
        yAlign: "top",
        usePointStyle: true
      },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true
        }
      },
      datalabels: getDataLabels(theme)
    },
    maintainAspectRatio: false,
    scales: {
      x: { ...ChartScales.x, stacked: true },
      y: { ...ChartScales.y, stacked: true }
    }
  }
  const chartData = {
    labels: ["Ratings"],

    datasets: data.dataArray.map((x, index) => {
      return {
        label: data.labels[index],
        data: [x],
        backgroundColor: ChartColorMap[index],
        borderRadius: 8,
        barThickness: 50
      }
    })
  }

  return <Bar data={chartData} options={options} />
}

export default HorizontalStackedBarChart
