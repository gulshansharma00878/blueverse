import Toast from "components/utilities-components/Toast/Toast"
import { ManageWashService } from "network/manageWashService"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility"

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
