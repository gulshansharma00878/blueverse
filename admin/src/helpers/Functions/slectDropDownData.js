export const slectDropDownData = (regionData) => {
  const newArray = []
  regionData.forEach((item) => {
    const newItem = {
      label: item.name,
      value: item.regionId
    }
    newArray.push(newItem)
  })
  return newArray
}
