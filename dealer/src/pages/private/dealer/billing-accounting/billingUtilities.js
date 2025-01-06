import Toast from "components/utitlities-components/Toast/Toast"
import { months } from "constants/months"
import { BillingService } from "network/billingServices"

export const createTopUpData = (
  no,
  memoId,
  serviceCentre,
  machine,
  dateOfMemo,
  totalAmount,
  status,
  action
) => {
  return {
    no,
    memoId,
    serviceCentre,
    machine,
    dateOfMemo,
    totalAmount,
    status,
    action
  }
}

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

export const createInvoiceData = (
  no,
  invoiceId,
  serviceCentre,
  machine,
  dateOfInvoice,
  month,
  totalAmt,
  action
) => {
  return {
    no,
    invoiceId,
    serviceCentre,
    machine,
    dateOfInvoice,
    month,
    totalAmt,
    action
  }
}
export const getMonth = (recievedMonth) => {
  const filteredMonth = months.filter((month) => month?.value === parseInt(recievedMonth))

  return filteredMonth[0]?.label
}

export const createCreditData = (
  no,
  memoId,
  serviceCentre,
  machine,
  dateOfInvoice,
  month,
  totalAmt,
  action
) => {
  return { no, memoId, serviceCentre, machine, dateOfInvoice, month, totalAmt, action }
}
