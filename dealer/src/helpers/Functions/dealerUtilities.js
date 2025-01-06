export const getMinPricePlan = (pricingTerms) => {
  let min = { total: null, plan: "" }

  for (let item of pricingTerms) {
    let total = item?.dealerPerWashPrice + item?.manpowerPricePerWash
    if (min.total === null || total < min.total) {
      min["total"] = total
      min["plan"] = item?.type
    }
  }

  return min.plan
}
