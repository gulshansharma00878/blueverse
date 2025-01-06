import React, { useState, useEffect } from "react"
import { Box, Divider } from "@mui/material"
import "./WashDetails.scss"
import BackHeader from "components/utilities-components/BackHeader"
import CustomerSection from "components/WashManagement/CustomerDetail"
import WaterMatrix from "components/WashManagement/WaterMatrix"
import MatrixSection from "components/WashManagement/MatrixSection"
import { useParams } from "react-router-dom"
import { ManageWashService } from "network/manageWashService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import Toast from "components/utilities-components/Toast/Toast"

function WashDetails() {
  const params = useParams()
  const [washData, setWashData] = useState({})
  const [loader, setLoader] = useState(true)
  useEffect(() => {
    getWashDetail()
  }, [])

  const getWashDetail = async () => {
    let param = [params.washId]
    setLoader(true)
    let wasgDetailRes = await ManageWashService.getWashDetail(param)
    if (wasgDetailRes.code === 200 && wasgDetailRes.success) {
      setWashData(wasgDetailRes?.data?.records)
      setLoader(false)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  return (
    <Box>
      {loader ? (
        <AppLoader />
      ) : (
        <>
          <BackHeader title={`${washData?.SkuNumber} - Wash Details`} />
          <Box>
            <CustomerSection customerData={washData} />
            {washData?.washType?.Name !== "PREWASH" && <WaterMatrix washData={washData} />}
            <Divider />
            <MatrixSection washData={washData} />
          </Box>
        </>
      )}
    </Box>
  )
}

export default WashDetails
