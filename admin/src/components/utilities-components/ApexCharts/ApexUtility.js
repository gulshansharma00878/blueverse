const moment = require("moment")

function sevenDays() {
  const lastSevenDays = []
  const currentDate = moment()

  for (let i = 6; i >= 0; i--) {
    const day = moment(currentDate).subtract(i, "days")

    let date = `${day.format("DD MMM")} ( ${day.format("ddd")} )`
    lastSevenDays.push(date)
  }

  return lastSevenDays
}

function fifteenDays() {
  const lastFifteenDays = []
  const currentDate = moment()

  for (let i = 14; i >= 0; i--) {
    const day = moment(currentDate).subtract(i, "days")
    let date = `${day.format("DD MMM")} ( ${day.format("ddd")} )`
    lastFifteenDays.push(date)
  }

  return lastFifteenDays
}

function wholeMonthDays() {
  const lastThirtyDays = []
  const currentDate = moment()
  let daysIn = moment().daysInMonth()
  for (let i = daysIn == 31 ? 29 : 30; i >= 0; i--) {
    const day = moment(currentDate).subtract(i, "days")
    let date = `${day.format("DD MMM")} ( ${day.format("ddd")} )`
    lastThirtyDays.push(date)
  }

  return lastThirtyDays
}

export const todayXAxis = [
  "12 AM",
  "1 AM",
  "2 AM",
  "3 AM",
  "4 AM",
  "5 AM",
  "6 AM",
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM"
]

function extractKeys(data) {
  // Extract keys from the object and return as an array
  return Object.keys(data)
}

function formatTimeWithTimestamps(timestamps) {
  const formattedTimes = timestamps.map((timestamp) => {
    const formattedTime = moment(timestamp).format("h A") // 'hA' format gives hours in 12-hour clock and 'A' displays AM/PM
    return formattedTime
  })
  return formattedTimes
}

export const dynamicAxis = (data, key) => {
  const keysArray = extractKeys(data)
  const formattedTimes = formatTimeWithTimestamps(keysArray)
  switch (key) {
    case 1:
      return formattedTimes
    case 7:
      return sevenDays()
    case 15:
      return fifteenDays()
    case 30:
      return wholeMonthDays()

    default:
      return todayXAxis
  }
}

// using for styles of X Axis
export const monthXAxis = wholeMonthDays()

export const axisDays = (key) => {
  switch (key) {
    case 1:
      return todayXAxis
    case 7:
      return sevenDays()
    case 15:
      return fifteenDays()
    case 30:
      return wholeMonthDays()

    default:
      return todayXAxis
  }
}

export const waterQualityLimit = (key) => {
  switch (key) {
    case "PHValue":
      return 8.5
    case "TDSValue":
      return 2100
    case "TSSValue":
      return 50
    case "OilAndGreaseValue":
      return 10
    case "CODValue":
      return 150

    default:
      return 8.5
  }
}

export const getWaterType = (key) => {
  switch (key) {
    case "PHValue":
      return " Ph"
    case "TDSValue":
      return " Tds"
    case "TSSValue":
      return " Tss"
    case "OilAndGreaseValue":
      return " Oil & Grease"
    case "CODValue":
      return " Cod"

    default:
      return " Ph"
  }
}

export const totalDealerAmount = (data = []) => {
  const accumulator = data?.reduce((sum, item) => {
    let total = parseFloat(item?.count)
    return sum + total
  }, 0)

  return accumulator
}

export const totalDealershipAmount = (data = []) => {
  const accumulator = data?.reduce((sum, item) => {
    let total = parseFloat(item?.total)
    return sum + total
  }, 0)
  return accumulator
}

export const getDealerMachineCount = (data = []) => {
  return data?.map((item) => {
    return item?.machineCount
  })
}

export const getDealerList = (data = []) => {
  return data?.map((item) => {
    let str = item?.dealerName

    if (str?.length <= 15) {
      return str
    } else {
      return str?.substring(0, 15 - 3) + "..."
    }
  })
}

export function convertDate(dateString) {
  // const currentDate = moment()
  // const year = currentDate.format("YYYY")
  const formattedDate = moment(dateString, "DD MMM YYYY").format("YYYY-MM-DD")
  return formattedDate
}

export const finalData = (data) => {
  return data?.reduce((acc, item) => {
    acc = acc + item

    if (acc == 0) {
      return []
    } else {
      return data
    }
  }, 0)
}

function sevenDaysWithYear() {
  const lastSevenDaysWithYear = []
  const currentDate = moment()

  for (let i = 6; i >= 0; i--) {
    const day = moment(currentDate).subtract(i, "days")

    let date = `${day.format("DD MMM YYYY")}`
    lastSevenDaysWithYear.push(date)
  }

  return lastSevenDaysWithYear
}

function fifteenDaysWithYear() {
  const lastFifteenDaysWithYear = []
  const currentDate = moment()

  for (let i = 14; i >= 0; i--) {
    const day = moment(currentDate).subtract(i, "days")
    let date = `${day.format("DD MMM YYYY")}`
    lastFifteenDaysWithYear.push(date)
  }

  return lastFifteenDaysWithYear
}

function wholeMonthDaysWithYear() {
  const lastThirtyDaysWithYear = []
  const currentDate = moment()
  let daysIn = moment().daysInMonth()
  for (let i = daysIn == 31 ? 29 : 30; i >= 0; i--) {
    const day = moment(currentDate).subtract(i, "days")
    let date = `${day.format("DD MMM YYYY")}`
    lastThirtyDaysWithYear.push(date)
  }

  return lastThirtyDaysWithYear
}
export const daysWithYear = (key) => {
  switch (key) {
    case 1:
      return todayXAxis
    case 7:
      return sevenDaysWithYear()
    case 15:
      return fifteenDaysWithYear()
    case 30:
      return wholeMonthDaysWithYear()

    default:
      return todayXAxis
  }
}
