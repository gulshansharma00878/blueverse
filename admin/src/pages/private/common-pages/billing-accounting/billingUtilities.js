import Toast from "components/utilities-components/Toast/Toast"
import { BillingService } from "network/billingServices"
export const exportDownload = async (param) => {
  const response = await BillingService.exportAdvanceMemo(param)
  if (response.code == 200 && response.success) {
    const a = document.createElement("a")
    a.href = response?.data?.records
    a.download = "advance-memo.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    Toast.showInfoToast(`CSV Downloaded succesfully`)
  } else {
    Toast.showErrorToast(`Something went wrong`)
  }
}
