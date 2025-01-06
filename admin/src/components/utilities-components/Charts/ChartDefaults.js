export const ChartColorMap = [
  "#FF8086",
  "#FFB020",
  "#3C68ED",
  "#5CA91D",
  "#75C7B3",
  "#1F59AF",
  "#94DD60",
  "#79A0DA",
  "#FF1925",
  "#a832a6"
]

export const getDataLabels = (theme, isMobile) => {
  return {
    anchor: "top",
    align: "top",
    offset: 24,
    display: "auto",
    formatter: (value) => {
      if (value === 0) {
        return ""
      } else {
        return Math.round(value) + "%"
      }
    },
    color: theme.palette.text.main,
    marginBottom: 0,
    font: {
      weight: "bold",
      size: isMobile ? 10 : 16,
      family: theme.typography.fontFamily
    }
  }
}

export const ChartScales = {
  x: {
    grid: {
      display: false
    },
    ticks: {
      display: false
    },
    border: {
      display: false
    }
  },
  y: {
    grid: {
      display: false
    },
    ticks: {
      display: false
    },
    border: {
      display: false
    }
  }
}
