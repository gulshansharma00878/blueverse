import { getOEMNames } from "../AreaManager/areaManagerUtilities"

export const sortOEMManagerData = (recievedData) => {
  const requiredtableData = recievedData.map((oemManager) => {
    return {
      id: oemManager?.uniqueId,
      name: oemManager?.username,
      mail: oemManager?.email,
      contact: oemManager?.phone,
      region: getOEMNames("region", oemManager?.userArea),
      state: getOEMNames("state", oemManager?.userArea),
      city: getOEMNames("city", oemManager?.userArea),
      oem: oemManager?.oem?.name,
      dealers: getDealerNames(oemManager?.oemManagerDealers),
      isActive: oemManager?.isActive,
      oemManagerId: oemManager?.userId
    }
  })
  return requiredtableData
}
export const getDealerNames = (dealers) => {
  if (dealers === "NA") {
    return dealers
  } else {
    return dealers?.length === 0
      ? "NA"
      : dealers.length === 1
      ? dealers[0]?.dealer?.username
      : dealers?.length === 2
      ? `${dealers[0]?.dealer?.username} , ${dealers[1]?.dealer?.username}`
      : `${dealers[0]?.dealer?.username} , ${dealers[1]?.dealer?.username} + ${
          dealers?.length - 2
        }more `
  }
}
export const createOemManagerData = (
  id,
  name,
  mail,
  number,
  region,
  state,
  city,
  oem,
  dealerShip,
  status,
  action
) => {
  return { id, name, mail, number, region, state, city, oem, dealerShip, status, action }
}
