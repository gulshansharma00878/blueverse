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

export function convertToHour(second) {
  const seconds = parseFloat(second)
  const hours = Math.floor(seconds / 3600)

  const formattedHours = hours < 10 ? "0" + hours : hours

  let result = ""

  if (hours !== 0) {
    result += formattedHours
  }

  return result.trim() || 0
}

export function convertToMinute(second) {
  const seconds = parseFloat(second)
  const remainingSeconds = (seconds % 3600).toFixed(3)
  const minutes = Math.floor(remainingSeconds / 60)
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes

  let result = ""

  if (minutes !== 0) {
    result += formattedMinutes
  }

  return result.trim() || 0
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
