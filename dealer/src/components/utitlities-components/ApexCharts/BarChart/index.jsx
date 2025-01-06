import React from "react"
import Chart from "react-apexcharts"
import { axisDays, getWaterType, waterQualityLimit } from "../ApexUtility"
import { convertToHour, convertToMinute } from "pages/private/dealer/dashboard/dashboardUtility"
import { useMediaQuery } from "@mui/material"

function BarChart({ types, data = {}, timeline = "", waterQuality = "" }) {
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
      stacked: true
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            position: "bottom",
            offsetX: +40,
            offsetY: 0
          }
        }
      }
    ],

    xaxis: {
      type: "category",
      categories: axisDays(timeline?.value),
      crosshairs: {
        show: false
      }
    },
    states: {
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "darken",
          value: 1
        }
      },
      hover: {
        filter: {
          type: "none"
        }
      }
    },
    legend: {
      position: "top",
      offsetY: 10,
      offsetX: 270,
      markers: {
        radius: 12
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: [types ? "#FFB020" : "#4775FF"],
    crosshairs: {
      show: false
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        if (!types) {
          return (
            '<div style="padding: 8px; ">' +
            '<span style="color: #8692A4; font-size: 12px; font-weight: 700;">' +
            w.globals.labels[dataPointIndex] +
            " " +
            "</span>" +
            '<span style="color: #181A1E; font-size: 16px; font-weight: 600;">' +
            series[seriesIndex][dataPointIndex] +
            getWaterType(waterQuality) +
            `</span>` +
            "</div>"
          )
        } else {
          return (
            '<div style="padding: 8px; ">' +
            '<span style="color: #8692A4; font-size: 12px; font-weight: 700;">' +
            " " +
            "</span>" +
            '<span style="color: #181A1E; font-size: 16px; font-weight: 600;">' +
            (convertToHour(series[seriesIndex][dataPointIndex]) != 0
              ? convertToHour(series[seriesIndex][dataPointIndex]) + " hours "
              : "") +
            (convertToMinute(series[seriesIndex][dataPointIndex]) != 0
              ? convertToMinute(series[seriesIndex][dataPointIndex]) + " min "
              : "") +
            `</span>` +
            "</div>"
          )
        }
      }
    },
    ...(!types
      ? {
          annotations: {
            yaxis: [
              {
                y: waterQualityLimit(waterQuality),
                borderColor: "#FF4049"
              }
            ]
          }
        }
      : {}),
    yaxis: {
      show: true,

      decimalsInFloat: 0
    }
  }

  const series = [
    {
      data: data ? Object.values(data).map((value) => Number(value).toFixed(2)) : []
    }
  ]

  return (
    <Chart
      series={series}
      options={options}
      type="bar"
      width="100%"
      height={!types ? (isMobile ? "60%" : "75%") : "80%"}
    />
  )
}

export default BarChart
