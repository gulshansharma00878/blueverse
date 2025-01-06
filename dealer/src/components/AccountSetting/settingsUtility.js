export const sortResponseData = (apiData) => {
  const sortedData = apiData.map((outlet) => {
    return {
      name: outlet?.name,
      address: outlet?.address,
      city: outlet?.city?.name,
      state: outlet?.city?.state?.name,
      region: outlet?.city?.state?.region?.name,
      machinesInfo: getOutletMachines(outlet?.machines, outlet)
    }
  })
  return sortedData
}

const getOutletMachines = (outletMachines, outlet) => {
  const sortedMachinesData = outletMachines?.map((machine) => {
    return {
      machineName: machine?.name,
      machineId: machine?.machineGuid,
      subscriptionData: machine?.machineSubscriptionSetting,
      name: outlet?.name,
      address: outlet?.address,
      city: outlet?.city?.name,
      state: outlet?.city?.state?.name,
      region: outlet?.city?.state?.region?.name
    }
  })
  return sortedMachinesData
}
