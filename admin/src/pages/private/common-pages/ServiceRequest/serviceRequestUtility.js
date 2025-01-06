import { dateMonthFormat } from "helpers/app-dates/dates"

export const sortRequestData = (responseData) => {
  const requiredData = responseData.map((data) => {
    return {
      id: data?.serviceRequestId,
      requestId: data.serviceId,
      machine: data?.machine?.name,
      oem: data?.machine?.outlet?.dealer?.oem?.name,
      dealerShip: data?.machine?.outlet?.name,
      region: data?.machine?.outlet?.city?.state?.region?.name,
      state: data?.machine?.outlet?.city?.state?.name,
      city: data?.machine?.outlet?.city?.name,
      date: dateMonthFormat(data?.createdAt, "DD/MM/YYYY hh:mm A")
    }
  })
  return requiredData
}

export const createData = (
  requestIds,
  machines,
  oems,
  dealerShips,
  regions,
  states,
  citys,
  dates
) => {
  return { requestIds, machines, oems, dealerShips, regions, states, citys, dates }
}
