export function getMachineBalance(machine) {
  const accumulator = machine.reduce(
    (acc, item) => {
      acc.totalValue += Number(item?.walletBalance) + Number(item?.topUpBalance)
      acc.itemCount++
      return acc
    },
    { totalValue: 0, itemCount: 0 }
  )

  return accumulator.totalValue || 0
}

export function getMachineCredit(machine) {
  const accumulator = machine.reduce(
    (acc, item) => {
      acc.totalValue += Number(item?.blueverseCredit)
      acc.itemCount++
      return acc
    },
    { totalValue: 0, itemCount: 0 }
  )

  return accumulator.totalValue || 0
}

export function getElectricityConsumed(data = {}) {
  const values = Object?.values(data)?.filter((item) => {
    return item != 0
  })

  const sum = values
    ?.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    ?.toFixed(2)

  return sum
}

export function getTotalMachineRuntime(data = {}) {
  const values = Object?.values(data)
  const sum = values
    ?.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    ?.toFixed(2)

  return sum
}

export function convertToHour(minutes) {
  const totalMinutes = parseFloat(minutes)
  const hours = Math.floor(totalMinutes / 60)
  const formattedHours = hours < 10 ? "0" + hours : hours

  let result = ""

  if (hours !== 0) {
    result += formattedHours
  }

  return result.trim() || "0"
}

export function convertToMinute(seconds) {
  const totalSeconds = parseFloat(seconds)
  const remainingMinutes = Math.floor(totalSeconds / 60)
  const formattedMinutes = totalSeconds % 60

  let result = ""

  if (remainingMinutes !== 0) {
    result += formattedMinutes
  }

  return result.trim() || "0"
}
