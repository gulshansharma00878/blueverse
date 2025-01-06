import React, { useEffect, useState } from "react"
import { Box } from "@mui/material"
import MachineMatrix from "components/ManageMachine/MachineMatrix"
import { ManageMachinesServices } from "network/manageMachinesServices"
import { useParams } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader"
function Matrix({ startDate, endDate }) {
  const params = useParams()
  const [waterQualityData, setWaterQualityData] = useState()
  const [waterConsumptionData, setWaterConsumptionData] = useState()
  const [loader, setLoader] = useState(false)
  useEffect(() => {
    getWaterQuality()
    getWaterConsumption()
  }, [startDate, endDate])

  const getWaterQuality = async () => {
    setLoader(true)
    let param = [`${params?.machineId}?fromDate=${startDate}&toDate=${endDate}`]
    const machineResponse = await ManageMachinesServices.machineWaterQuality(param)

    if (machineResponse.success && machineResponse.code === 200) {
      setWaterQualityData(machineResponse?.data ? machineResponse?.data[0] : {})
      setLoader(false)
    } else {
      setLoader(false)
    }
  }

  const getWaterConsumption = async () => {
    setLoader(true)
    let param = [`${params?.machineId}?fromDate=${startDate}&toDate=${endDate}`]
    const consumptionResponse = await ManageMachinesServices.machineWaterConsumption(param)

    if (consumptionResponse.success && consumptionResponse.code === 200) {
      setWaterConsumptionData(consumptionResponse?.data ? consumptionResponse?.data : {})
      setLoader(false)
    } else {
      setLoader(false)
    }
  }
  return (
    <>
      {loader ? (
        <AppLoader />
      ) : (
        <Box>
          <MachineMatrix
            waterQualityData={waterQualityData}
            waterConsumptionData={waterConsumptionData}
            machineId={params?.machineId}
          />
        </Box>
      )}
    </>
  )
}

export default Matrix
