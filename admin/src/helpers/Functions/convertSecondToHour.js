export function convertSecondToHour(second = 0) {
  const seconds = parseFloat(second) // 329.875

  const convertTime = new Date(seconds * 1000).toISOString().slice(11, 19)

  const formatTime = convertTime.split(":")

  let result = ""
  let hours = parseInt(formatTime[0])
  let minutes = parseInt(formatTime[1])
  let remainingSeconds = parseFloat(formatTime[2]).toFixed(0)

  if (hours !== 0) {
    result += hours + "h, "
  }

  if (minutes !== 0 || hours !== 0) {
    result += minutes + "m, "
  }

  result += remainingSeconds + "s"

  return result.trim()
}
