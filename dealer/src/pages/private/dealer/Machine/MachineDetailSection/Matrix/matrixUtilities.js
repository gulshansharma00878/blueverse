import Toast from "components/utitlities-components/Toast/Toast"
import { ManageMachinesServices } from "network/manageMachinesServices"

export const exportMachineTranscation = async (param) => {
  const response = await ManageMachinesServices.exportMachineTransaction(param)
  if (response.code == 200 && response.success) {
    const a = document.createElement("a")
    a.href = response?.data?.records
    a.download = "transaction.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    Toast.showInfoToast(response?.message)
  } else {
    Toast.showErrorToast(`Something went wrong`)
  }
}
