import { getDealerNames } from "../OemManager/oemManagerUtility"

export const sortAreaManagerData = (receivedData) => {
  const requiredtableData = receivedData.map((areaManager) => {
    return {
      id: areaManager?.uniqueId,
      name: areaManager?.username,
      mail: areaManager?.email,
      contact: areaManager?.phone,
      region: getOEMNames("region", areaManager?.userArea),
      state: getOEMNames("state", areaManager?.userArea),
      city: getOEMNames("city", areaManager?.userArea),
      oem: areaManager?.oem?.name,
      dealers: getDealerNames(areaManager?.areaManagerDealers),
      isActive: areaManager?.isActive,
      areaMangerID: areaManager?.userId
    }
  })
  return requiredtableData
}
export const getOEMNames = (key, oem) => {
  let regionSet
  let regionArr
  if (key === "region" || key === "state") {
    let newArr = oem.map((item) => item?.[key]?.name)
    regionSet = new Set(newArr)
    regionArr = Array.from(regionSet)
  }
  if (oem === "NA") {
    return oem
  } else if (oem?.length > 0) {
    if (key === "region" || key === "state") {
      return regionArr.length === 1
        ? regionArr[0]
        : regionArr?.length === 2
        ? `${regionArr[0]} , ${regionArr[1]}`
        : `${regionArr[0]} , ${regionArr[1]} + ${regionArr?.length - 2}more`
    } else {
      return oem.length === 1
        ? oem[0]?.[key]?.name
        : oem?.length === 2
        ? `${oem[0]?.[key]?.name} , ${oem[1]?.[key]?.name}`
        : `${oem[0]?.[key]?.name} , ${oem[1]?.[key]?.name} + ${oem?.length - 2}more `
    }
  }
}

export const createAreaManagerData = (
  id,
  name,
  mail,
  number,
  region,
  state,
  city,
  oem,
  dealers,
  status,
  action
) => {
  return { id, name, mail, number, region, state, city, oem, dealers, status, action }
}
