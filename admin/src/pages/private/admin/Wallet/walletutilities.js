import moment from "moment"
import { WalletService } from "network/walletService"
import { dateMonthFormat } from "helpers/app-dates/dates"
import Toast from "components/utilities-components/Toast/Toast"

export const createTransactionData = (
  srNo,
  transID,
  src,
  transType,
  sku,
  date,
  type,
  balance,
  credit,
  baseAmt,
  cgst,
  sgst,
  total
) => {
  return {
    srNo,
    transID,
    src,
    transType,
    sku,
    date,
    type,
    balance,
    credit,
    baseAmt,
    cgst,
    sgst,
    total
  }
}

export const createMultipleMachineData = (
  srNo,
  transID,
  src,
  transType,
  sku,
  machines,
  type,
  balance,
  credit,
  baseAmt,
  cgst,
  sgst,
  total,
  date
) => {
  return {
    srNo,
    transID,
    src,
    transType,
    sku,
    machines,
    type,
    balance,
    credit,
    baseAmt,
    cgst,
    sgst,
    total,
    date
  }
}
export const createMultipleOutletMachineData = (
  srNo,
  transID,
  src,
  transType,
  sku,
  serviceCenter,
  type,
  machines,
  balance,
  credit,
  baseAmt,
  cgst,
  sgst,
  total,
  date
) => {
  return {
    srNo,
    transID,
    src,
    transType,
    sku,
    serviceCenter,
    type,
    machines,
    balance,
    credit,
    baseAmt,
    cgst,
    sgst,
    total,
    date
  }
}

/**
 * @description Use this function to create a list of month or year as required.
 ** exportMonths takes boolean for month as default. If passed false, it returns list of Year.
 ** This function returns list of required sorted and non-duplicates list
 */
export const getMonthsYearsList = (data, exportMonths = true) => {
  let result = []

  if (Array.isArray(data)) {
    if (exportMonths) {
      result = data.map((x) => moment(x?.createdAt).month() + 1) // +1 because months are zero-indexed
      result = [...new Set(result)] // remove duplicates

      result = result.map((x) => {
        let label = moment(x, "MM").format("MMMM")
        return { label: label, value: x }
      })
    } else {
      result = data.map((x) => new Date(x?.createdAt).getFullYear())
      result = [...new Set(result)] // remove duplicates
      result = result.map((x) => {
        return { label: x?.toString(), value: x }
      })
    }
  }
  return result
}

export const createWalletHistoryData = (
  srNo,
  transID,
  amt,
  transType,
  baseAmt,
  cgst,
  sgst,
  date
) => {
  return {
    srNo,
    transID,
    amt,
    transType,
    baseAmt,
    cgst,
    sgst,
    date
  }
}
function createData(
  sr,
  transactionId,
  transactionType,
  sku,
  washType,
  totalAmount,
  baseAmount,
  cgst,
  sgst,
  creditBalance,
  dataTime
) {
  return {
    sr,
    transactionId,
    transactionType,
    sku,
    washType,
    totalAmount,
    baseAmount,
    cgst,
    sgst,
    creditBalance,
    dataTime
  }
}

export async function fetchCreditHistory(
  setIsLoading,
  setCurrentPage,
  setTotalPages,
  setTotalRecords,
  setItemsPerPage,
  setTableData,
  payload
) {
  setIsLoading(true)
  const response = await WalletService.getTransactionHistory(payload)

  if (response?.success && response?.code === 200) {
    // Toast.showInfoToast(response?.message)
    let transactions = response?.data?.transactions
    let pagination = response?.data?.pagination

    if (transactions) {
      let data = transactions.map((item, index) =>
        createData(
          index + 1,
          item?.uniqueId || "NA",
          item?.transactionType == "DEBITED" ? "Deducted" : "Added" || "NA",
          item?.skuNumber || "NA",
          item?.transactions?.washType?.Name || "NA",
          item?.totalAmount || "NA",
          item?.baseAmount || "NA",
          item?.cgst || "NA",
          item?.sgst || "NA",
          item?.blueverseCredit || "NA",
          dateMonthFormat(item?.createdAt, "DD/MM/YYYY hh:mm A") || "NA"
        )
      )
      setTableData(data)
    }
    if (pagination) {
      setCurrentPage(pagination?.currentPage)
      setTotalPages(pagination?.totalPages)
      setTotalRecords(pagination?.totalItems)
      setItemsPerPage(pagination?.perPage)
    }
  } else {
    Toast.showErrorToast(response?.message)
  }
  setIsLoading(false)
}

export async function fetchCreditBalance(dealerId, machineId, setCreditBalance, key) {
  const payload = {
    filters: {
      machineIds: [machineId]
    },
    dealerId: dealerId
  }
  const response = await WalletService.getMachineBalance(payload)
  if (response?.success && response?.code === 200) {
    let balance
    balance =
      key === "credit"
        ? response?.data?.transactions?.blueverseCredit
        : response?.data?.transactions?.walleteBalance
    if (balance) {
      setCreditBalance(balance)
    }
  } else {
    Toast.showErrorToast(response?.message)
  }
}

export async function exportHistoryData(payload, setIsLoading) {
  setIsLoading(true)
  const response = await WalletService.exportHistory(payload)

  if (response?.success && response?.code === 200) {
    const downloadURL = response?.data?.transactions
    if (downloadURL) {
      const link = document.createElement("a")
      link.href = downloadURL
      link.setAttribute("download", "Credit_History.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link) // Remove child after download is complete
      Toast.showInfoToast(response?.message)
    } else {
      Toast.showErrorToast("Something Went wrong | Could not export data !")
    }
  } else {
    Toast.showErrorToast(response?.message)
  }

  setIsLoading(false)
}

export const getMachineAgreement = (responseData, machineId) => {
  let machineMap = new Map()
  responseData?.outlets?.forEach((outlet) => {
    if (machineMap.has(machineId)) {
      machineMap.get(machineId)
    } else {
      machineMap.set(machineId, getOutletMachine(outlet, machineId))
    }
  })

  return machineMap
}

const getOutletMachine = (outletObj, machineId) => {
  const machineArray = outletObj?.machines
  const filteredMachine = machineArray?.filter((machine) => machine?.machineGuid === machineId)
  const amount = filteredMachine[0]
  return amount
}
export const getNumbers = (topUp, wallet) => {
  const num1 = parseFloat(topUp)
  const num2 = parseFloat(wallet)
  const sum = num1 + num2
  return isNaN(sum.toFixed(2)) ? false : sum.toFixed(2)
}
