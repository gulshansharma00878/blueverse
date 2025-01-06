// INFO : Stack all utility functions just exclusive to this module here.
// NOTE : If utility is reusable for other components, please add them to helpers folder.

import Toast from "components/utilities-components/Toast/Toast"
import { DealerService } from "network/dealerService"

export const getAllAvailableMachines = (selectedData, fullData, index) => {
  // This helper function will return available machines for current menu.
  // Will filter all machines selected by other machine menu

  const skippedSelf = [...selectedData]
  skippedSelf.splice(index, 1)
  const selected = skippedSelf.length
    ? skippedSelf
        ?.filter((x) => x?.machine.length)
        ?.flatMap((x) => x?.machine)
        ?.map((x) => x?.label)
    : []
  const nonSelected = fullData?.machines?.filter((x) => !selected.includes(x.label))
  return nonSelected
}

export const getAllAvailableOutlets = (selectedData, fullData, index) => {
  const skippedSelf = [...selectedData]
  skippedSelf.splice(index, 1)
  const selected = skippedSelf?.length
    ? skippedSelf?.filter((x) => x?.outlet).map((x) => x?.outlet)
    : []

  const nonSelected = fullData?.outlets?.filter((x) => !selected?.includes(x?.value))

  return nonSelected
}

/**
 * @description prepare outlet-machine mapping data when user trying to edit these mappings
 */

export const prepareCurrentMapping = (data = []) => {
  let currentData = data
    .filter((x) => x.machines.length)
    .map((x) => {
      let temp = {
        outlet: x?.outletId,
        city: x?.city?.name,
        machine: x?.machines?.map((y) => {
          return { label: y?.name, value: y?.machineGuid }
        }),
        outletName: x?.name,
        region: x?.city?.state?.region?.name,
        state: x?.city?.state?.name
      }

      return temp
    })

  return currentData
}

/**
 * @description prepare payload when outlet-machine mapping is to be CREATED ( means this is not edit-mode)
 */

export const prepareCreate_MO_Mapping = (data) => {
  let payload = data.map((item) => {
    return {
      outlet_id: item?.outlet,
      machine_ids: item?.machine?.map((val) => {
        return val?.value
      })
    }
  })

  return { data: payload }
}

/**
 * @description prepare payload when outlet-machine mapping is to be UPDATE ( means this is edit-mode)
 */

export const prepareEdit_MO_Mapping = (data, oldData) => {
  let payload = []

  for (let i = 0; i < oldData.length; i++) {
    if (data.find((x) => x.outlet === oldData[i].outletId)) {
      // This means previous selected outlet-machine map not deleted
      let oldMachineData = oldData[i]?.machines.map((x) => x.machineGuid)
      let currentMachineData = data
        .find((x) => x.outlet === oldData[i].outletId)
        ?.machine?.map((x) => x?.value)

      let deletedMachines = oldMachineData.filter((x) => !currentMachineData.includes(x))
      let addedMachines = currentMachineData.filter((x) => !oldMachineData.includes(x))
      let machines = []
      deletedMachines.forEach((x) => machines.push({ action: "DELETE", machineGuid: x }))
      addedMachines.forEach((x) => machines.push({ action: "CREATE", machineGuid: x }))
      payload.push({ outlet_id: oldData[i].outletId, machines: machines })
    } else {
      // If true, prev outlet-machine mapping deleted

      let machines = oldData[i]?.machines?.map((x) => {
        return {
          action: "DELETE",
          machineGuid: x?.machineGuid
        }
      })
      payload.push({ outlet_id: oldData[i].outletId, machines: machines })
    }
  }

  let filterWithMachineChanges = payload.filter((x) => x.machines.length)
  return { data: filterWithMachineChanges }
}

/**
 * @description this fn will return true if data in row at index has both outlet and machine data
 */
export const checkRowCompletion = (selectedData, index) => {
  const isComplete = selectedData[index].machine.length && selectedData[index].outlet ? true : false
  return isComplete
}

export const prepareCreateDealerPayload = (value) => {
  const payload = {
    oem_id: value?.oem,
    username: value?.dealerName,
    email: value?.email,
    phone: value?.phone,
    pan_no: value?.pan,
    outlets: value?.outlet.map((item) => {
      return {
        name: item?.outletName,
        gst_no: item?.gstin,
        city_id: item?.city,
        address: item?.address,
        latitude: item?.latitude?.toString(),
        longitude: item?.longitude?.toString()
      }
    }),
    documents: getDocs(value?.documents)
  }
  return payload
}
const getDocs = (documents) => {
  let documentMap = new Map()
  documents.forEach((doc) => {
    if (!documentMap.has(doc?.url)) {
      documentMap.set(doc?.url, doc)
    }
  })
  let documentsArray = Array.from(documentMap?.values())
  return documentsArray?.length > 0 ? documentsArray : []
}
export const prepareEditDealerPayload = (formData, completeData, deleteDocument) => {
  let payload = prepareCreateDealerPayload(formData)
  let oldOutletsLength = completeData.outlets.length

  // Parse payload for PUT request ==>prepareCreateDealerPayload
  // payload.is_active = true

  for (let i = 0; i < payload.outlets.length; i++) {
    if (i < oldOutletsLength) {
      payload.outlets[i].outlet_id = completeData.outlets[i].outletId
      payload.outlets[i].action = "UPDATE"
    } else {
      payload.outlets[i].action = "CREATE"
    }
  }

  // Document payload changing

  let newArr = []

  if (deleteDocument.length != 0) {
    newArr = deleteDocument.map((item) => ({
      action: "DELETE",
      url: item.url,
      name: item.name,
      document_id: item.dealerDocumentId
    }))
  }

  let documentsArray = [
    ...newArr,
    ...payload.documents
      .filter((obj) => !obj.dealerDocumentId)
      .map((obj) => ({ ...obj, action: "CREATE" }))
  ]
  let documentsMap = new Map()
  documentsArray.forEach((doc) => {
    if (!documentsMap.has(doc?.url)) {
      documentsMap.set(doc?.url, doc)
    }
  })
  let payLoadDocs = Array.from(documentsMap?.values())
  payload.documents = payLoadDocs
  return payload
}

/**
 * @description to fetch dealer details and fill in the formik form with the parsed data
 */
export async function getDealerDetails(dispatch, dealerActions, setIsLoading, dealerId) {
  setIsLoading(true)
  const response = await DealerService.getDealerDetails(dealerId)
  if (response?.success && response?.code === 200) {
    let temp = {
      oem: response?.data?.oem?.oemId,
      email: response?.data?.email,
      phone: response?.data?.phone,
      pan: response?.data?.panNo,
      dealerName: response?.data?.username,
      documents: response?.data?.documents,
      outlet: response?.data?.outlets.map((item) => {
        let outlet = {
          outletName: item.name,
          region: item.city.state.region.regionId,
          city: item.city.cityId,
          state: item.city.state.stateId,
          gstin: item.gstNo,
          address: item.address,
          latitude: item?.latitude,
          longitude: item?.longitude
        }
        return outlet
      })
    }

    dispatch(dealerActions.setDealerFormDetails(temp))
    dispatch(dealerActions.setDealerDetails(response?.data))
    dispatch(dealerActions.setDealerId(dealerId))
    setIsLoading(false)
    Toast.showInfoToast("Details fetched successfully")
  } else {
    setIsLoading(false)
    Toast.showErrorToast(response?.message)
  }
}

/**
 * @description function to check data completion for individual machine and return true if data is complete
 */

export const checkMachineDataCompletion = (
  data,
  dispatch,
  dealerActions,
  index,
  singlePlan = {}
) => {
  // 'csgt' and other fields excluded as they update after this function is run as data passed here is the old state.
  // Hence to enable fields when single digit entry is done, we need to remove these fields.
  // To better understand, just remove this filter and then try to enter only single digit in 'Minimum Wash Commitment', continue to preview will remain disabled.
  let allKeys = data
    ? Object.keys(data)
        .filter((key) => !["taxable_amount", "sgst", "total", "cgst"].includes(key))
        .find((key) => [""].includes(data[key]))
    : false
  let planCheck = data?.pricing_terms
    .filter((x) => x.isEnabled)
    .filter((y) => (singlePlan?.plan?.type ? y.plan.type !== singlePlan?.plan.type : true))
    .find((item) => [""].includes(item.plan.dealerPerWashPrice))
  let singlePlancheck // Means complete by default
  if (Object.keys(singlePlan).length !== 0) {
    if (singlePlan?.isEnabled) {
      singlePlancheck = [""].includes(singlePlan?.plan.dealerPerWashPrice)
    } else {
      singlePlancheck = false
    }
  }

  // any of the below check is tree means data is not complete
  if (!!allKeys || !!planCheck || !!singlePlancheck) {
    // If True means not-complete
    dispatch(dealerActions.setCompletionCounter({ index: index, check: false }))
  } else {
    // If true, means data complete
    dispatch(dealerActions.setCompletionCounter({ index: index, check: true }))
  }
}

export function getOrdinal(n) {
  if (!n) {
    return 1 + "st"
  }
  let ord = n + "th"
  if (n % 10 == 1 && n % 100 != 11) {
    ord = n + "st"
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = n + "nd"
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = n + "rd"
  }
  return ord
}

export const getMinPricePlan = (pricingTerms) => {
  let min = { total: null, plan: "" }
  let enabled = pricingTerms?.filter((x) => x?.isEnabled)

  for (let item of enabled) {
    let total = item?.plan?.dealerPerWashPrice + item?.plan?.manpowerPricePerWash
    if (min.total === null || total < min.total) {
      min["total"] = total
      min["plan"] = item?.plan?.type
    }
  }

  return min.plan
}
