import Toast from "components/utilities-components/Toast/Toast"
import { ManageWashService } from "network/manageWashService"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility"

export const fetchOutlets = async (userID, setOutlets) => {
  const params = [`?dealerIds=${userID}`]
  const response = await ManageWashService.getOutlet(params)
  if (response.success && response.code === 200) {
    const key = "outletId"
    const labelKey = "name"
    const sortedData = sortData(labelKey, key, response?.data?.outlets)
    setOutlets(sortedData)
  } else {
    Toast.showErrorToast(`${response.message}`)
    setOutlets([])
  }
}
