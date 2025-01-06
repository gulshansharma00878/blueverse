const { sortData } = require("pages/private/admin/Feedback/feedBackUtility")

export const getRegionData = (response, setSelectedRegions) => {
  const regionArray = response?.map((item) => item?.region)
  const labelKey = "name"
  const key = "regionId"
  const sortedData = sortData(labelKey, key, regionArray)
  setSelectedRegions(sortedData)
}
export const getStateData = (response, setSelectedStates) => {
  const regionArray = response?.map((item) => item?.state)
  const key = "stateId"
  const labelKey = "name"
  const sortedData = sortData(labelKey, key, regionArray)
  setSelectedStates(sortedData)
}
export const getCityData = (response, setSelectedCitys) => {
  const regionArray = response?.map((item) => item?.city)
  const key = "cityId"
  const labelKey = "name"
  const sortedData = sortData(labelKey, key, regionArray)
  setSelectedCitys(sortedData)
}
export const getDealerData = (response, setSelectedDealers) => {
  const regionArray = response?.map((item) => item?.dealer)
  const key = "userId"
  const labelKey = "username"
  const sortedData = sortData(labelKey, key, regionArray)
  setSelectedDealers(sortedData)
}
