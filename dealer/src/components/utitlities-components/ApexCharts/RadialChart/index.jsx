import { useMediaQuery } from "@mui/material"
import { subtractAndValidate } from "helpers/Functions/formateString"
import React, { useEffect } from "react"
import Chart from "react-apexcharts"

function RadialChart({ data }) {
  const isMobile = useMediaQuery("(max-width: 1606px)")

  useEffect(() => {
    getWaterUsed()
    getRecycleWater()
    getFreshWater()
  }, [data])

  const getWaterUsed = () => {
    return data?.WaterUsed ? data?.WaterUsed : 0
  }

  const getRecycleWater = () => {
    const recycleWater = data?.WaterUsed
      ? subtractAndValidate(Number(data?.WaterUsed), Number(data?.WaterWastage))
      : 0

    const totalWater = data?.WaterUsed ? data?.WaterUsed : 1

    return ((recycleWater / totalWater) * 100).toFixed(2)
  }

  const getFreshWater = () => {
    const water = data?.WaterWastage ? data?.WaterWastage : 0
    const totalWater = data?.WaterUsed ? data?.WaterUsed : 1

    return ((water / totalWater) * 100).toFixed(2)
  }

  var options = {
    chart: {
      type: "radialBar"
    },
    colors: ["#CBE8FC", "#4775FF", "#94DD60"],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "40%"
        },

        dataLabels: {
          enabled: false,
          name: {
            offsetY: -10,
            show: false,
            color: "#888",
            fontSize: "13px"
          },
          value: {
            color: "#111",
            fontSize: "30px",
            show: true
          }
        }
      }
    },
    stroke: {
      lineCap: "round"
    },
    labels: ["Progress"],
    states: {
      hover: {
        filter: {
          type: "none"
        }
      }
    }
  }

  const series = [100, getRecycleWater(), getFreshWater()]

  return (
    <Chart series={series} options={options} type="radialBar" height={isMobile ? "70%" : "90%"} />
  )
}

export default RadialChart
