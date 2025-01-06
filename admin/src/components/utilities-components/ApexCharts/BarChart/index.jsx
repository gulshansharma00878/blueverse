import React from "react"
import Chart from "react-apexcharts"
import { finalData, getDealerList, monthXAxis } from "../ApexUtility"
import { Grid, useMediaQuery } from "@mui/material"

const labelColor = Array(monthXAxis?.length).fill("#8692A4")

function BarChart({ handleRoutes = () => {}, data = [], totalData = [] }) {
  const isMobile = useMediaQuery("(max-width: 1606px)")
  var options = {
    xaxis: {
      type: "category",
      categories: getDealerList(totalData || []),
      labels: {
        show: finalData(data)?.length > 0,
        style: {
          colors: labelColor
        }
      },
      viewportMax: 10,
      viewportMin: 0,
      scrolling: "scroll"
    },
    legend: {
      position: "top",
      offsetY: 20,
      offsetX: 0,
      markers: {
        radius: 12
      }
    },
    yaxis: {
      type: "category",
      labels: {
        show: finalData(data)?.length > 0,
        style: {
          colors: ["#79A0DA"]
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: "none"
        }
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

    fill: {
      opacity: 1
    },

    dataLabels: {
      enabled: false
    },
    colors: ["#79A0DA"],
    chart: {
      id: "scrollable-bar",
      stacked: false,
      toolbar: {
        show: false // Remove the default toolbar
      },
      animations: {
        enabled: true
      },
      events: {
        dataPointSelection: (a, b, { dataPointIndex }) => {
          handleRoutes(totalData[dataPointIndex])
        }
      }
    }
  }

  const series = [
    {
      name: "",
      data: finalData(data)
    }
  ]

  return (
    <Grid container direction="column" sx={{ height: "100%" }}>
      <Grid item sx={{ width: "100%", height: "90%", overflowX: "scroll", overflowY: "hidden" }}>
        <Chart
          series={series}
          options={options}
          type="bar"
          width={data?.length < 30 ? "100%" : "150%"}
          height={isMobile ? "78%" : "100%"}
        />
      </Grid>
    </Grid>
  )
}

export default BarChart
