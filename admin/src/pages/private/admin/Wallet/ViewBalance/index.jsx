import React, { useEffect, useState } from "react"
import BalanceCard from "components/Wallet/BalanceCard"
import { Box } from "@mui/material"
import { WalletService } from "network/walletService"
import BackHeader from "components/utilities-components/BackHeader"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useParams } from "react-router-dom"

const ViewBalance = () => {
  const params = useParams()
  const [machineData, setMachineData] = useState([])
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getMachineDetails()
  }, [])

  const getMachineDetails = async () => {
    setLoader(true)
    let param = [params?.dealerId]
    let detailsResponse = await WalletService.getMachineDetail(param)
    if (detailsResponse.code === 200 && detailsResponse.success) {
      setMachineData(detailsResponse?.data)
      setLoader(false)
    } else {
      setMachineData([])
      setLoader(false)
    }
  }
  return (
    <Box>
      {loader ? (
        <AppLoader />
      ) : (
        <>
          <BackHeader title="View Machine Balance" />
          <BalanceCard dealerId={params?.dealerId} balanceData={machineData} />
        </>
      )}
    </Box>
  )
}

export default ViewBalance
