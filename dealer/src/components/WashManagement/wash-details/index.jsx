import React, { useState, useEffect } from "react"
import { Box, Divider } from "@mui/material"
import { useParams } from "react-router-dom"
import { ManageWashService } from "network/manageWashService"
import AppLoader from "components/Loader/AppLoader"
import CustomerSection from "../CustomerDetail"
import WaterMatrix from "../WaterMatrix"
import MatrixSection from "../MatrixSection copy"
import BackHeader from "components/utitlities-components/BackHeader"

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
      setWashData({})
      // setLoader(false)
    }
  }

  return (
    <Box>
      {loader ? (
        <AppLoader />
      ) : (
        <>
          <Box>
            <BackHeader title={`${washData?.SkuNumber} - Wash Details`} />
            <CustomerSection customerData={washData} />
            <WaterMatrix washData={washData} />
            <Divider />
            <MatrixSection washData={washData} />
          </Box>
        </>
      )}
    </Box>
  )
}

export default WashDetails
