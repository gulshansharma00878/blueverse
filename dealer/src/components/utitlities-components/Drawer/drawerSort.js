export const sortData = (labelKey, key, data) => {
  const sortedData = data.map(({ [labelKey]: label, [key]: value, ...rest }) => ({
    label,
    value,
    ...rest
  }))
  return sortedData
}
// transactionType = 'ADDED', 'DEBITED'
export const transactionType = [
  { value: "ADDED", label: "Added" },
  { value: "DEBITED", label: "Deducted" }
]
// sourceType = "WALLET", "CREDIT", "TOPUP"
export const source = [
  { value: "WALLET", label: "Wallet" },
  { value: "CREDIT", label: "Credit" },
  { value: "TOPUP", label: "Topup" }
]
