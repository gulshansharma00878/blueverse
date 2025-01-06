import { sortData } from "components/utitlities-components/Drawer/drawerSort"
import Toast from "components/utitlities-components/Toast/Toast"
import { ManageWashService } from "network/manageWashService"

export const fetchMachines = async (params) => {
  const response = await ManageWashService.getMachines(params)
  if (response.success && response.code === 200) {
    const key = "machineGuid"
    const labelKey = "name"
    const sortedData = sortData(labelKey, key, response?.data)
    return sortedData
  } else {
    Toast.showErrorToast(`${response.message}`)
    return []
  }
}
