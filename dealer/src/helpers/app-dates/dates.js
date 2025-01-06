import moment from "moment"

export function Dates() {
  function addInCurrent(amount, unit = "minutes") {
    return moment(new Date()).add(amount, unit)
  }

  return {
    addInCurrent
  }
}

/**
 * @description This function takes data, optional data format and returns formatted date string
 */
export const dateMonthFormat = (date, dateFormat = "MMM DD, YYYY") => {
  if (date) {
    let checkFormat = moment(date).format(dateFormat)
    return checkFormat
  }
}

export const countDaysLeft = (billingCycle) => {
  const currentDate = moment()
  const daysInCurrentMonth = moment().daysInMonth()
  const remaingDay = daysInCurrentMonth - currentDate.date() + Number(billingCycle) - 1
  return remaingDay
}

/**
 * @description This function takes three parameters and returns past date equal as per 'amount' passed.
 * * amount : Pass numeric value like 30 which will be substracted from the date to return past date.
 * * current : Optional date parameter. If not passed, current date-time will be used.
 * * unit : Optional parameter and takes units accepted by moment.
 */
export const substractFromCurrentDate = (amount, current = null, unit = "days") => {
  let currentDate

  if (current) {
    currentDate = moment(current)
  } else {
    currentDate = moment()
  }

  return currentDate.subtract(amount, unit)
}

export const getMonthName = (monthNumber) => {
  if (monthNumber) {
    if (monthNumber === 0 || monthNumber > 12) {
      return "-"
    }
    return moment()
      .month(monthNumber - 1)
      .format("MMMM")
  }
  return "-"
}

export const getMonthDates = (monthNumber, dateFormat = "DD/MM/YYYY") => {
  // Create a Moment.js object for the given month
  const month = moment().month(monthNumber - 1)

  // Get the start date of the month
  const startDate = month.startOf("month").format(dateFormat)

  // Get the end date of the month
  const endDate = month.endOf("month").format(dateFormat)

  return { startDate, endDate }
}

export const getNextMonthStartDate = (dateFormat = "DD/MM/YYYY") => {
  // Create a Moment.js object for the given month
  const currentDate = moment()

  // Calculate the starting date of the next month
  const nextMonthStartDate = currentDate.add(1, "month").startOf("month")

  // Format the date as desired
  const formattedDate = nextMonthStartDate.format(dateFormat)

  return formattedDate
}

export const convertToISO = (date, isEnd = false) => {
  let isoDate

  if (isEnd) {
    isoDate = moment(date).endOf("day").toISOString()
  } else {
    isoDate = moment(date).startOf("day").toISOString()
  }

  return isoDate
}

export const dateOptions = [
  { label: "Today", value: 1 },
  { label: "Last 7 Days", value: 7 },
  { label: "Last 28 Days", value: 28 },
  { label: "Last 90 Days", value: 90 },
  { label: "Custom", value: "custom" }
]

export const dateOptionsDashboard = [
  { label: "Today", value: 1 },
  { label: "Last 7 Days", value: 7 },
  { label: "Last 15 Days", value: 15 },
  { label: "Last 30 Days", value: 30 }
]

export const dateNoTodayOptionsDashboard = [
  { label: "Last 7 Days", value: 7 },
  { label: "Last 15 Days", value: 15 },
  { label: "Last 30 Days", value: 30 }
]

export const getMonthDays = (dateFormat = "YYYY-MM-DD") => {
  const endDate = moment().format("YYYY-MM-DD")
  const startDate = moment(endDate).subtract(30, "days").format(dateFormat)

  return { initialStartDate: startDate, initialEndDate: endDate }
}
