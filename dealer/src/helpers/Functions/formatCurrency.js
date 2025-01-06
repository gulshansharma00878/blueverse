export function formatCurrency(num, prefix = "INR ") {
  let num1

  if (typeof num === "string") {
    num1 = parseFloat(num)
  } else {
    num1 = num
  }

  if (!isNaN(num1)) {
    return prefix + num1?.toLocaleString("en-IN")
  } else {
    return prefix + 0
  }
}
