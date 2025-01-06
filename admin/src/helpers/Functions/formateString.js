export function capitaliseString(str) {
  let words = str?.split(" ")
  for (let i = 0; i < words?.length; i++) {
    words[i] = words[i]?.charAt(0)?.toUpperCase() + words[i]?.slice(1)?.toLowerCase()
  }

  let pascalCaseStr = words?.join(" ")
  return pascalCaseStr
}

export function subtractAndValidate(a, b) {
  const result = a - b
  const roundedResult = Math.round(result * 100) / 100 // round to two decimal places
  return roundedResult.toFixed(2) // convert to string with two decimal places
}

export function sumAndValidate(a, b, c) {
  const result = a + b + c
  const roundedResult = Math.round(result * 100) / 100 // round to two decimal places
  return roundedResult.toFixed(2) // convert to string with two decimal places
}
