import moment from "moment"

export const dateFormat = (date, format = "MMMM DD, h:mm A") => {
  if (date) {
    let format_date = moment(date).format(format)
    return format_date
  }
  return null
}
