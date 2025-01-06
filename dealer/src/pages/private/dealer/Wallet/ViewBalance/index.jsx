import React, { useEffect, useState } from "react"
import BalanceCard from "components/Wallet/BalanceCard"
import { Box } from "@mui/material"
import { WalletService } from "network/walletService"
import { userDetail } from "hooks/state"
import AppLoader from "components/Loader/AppLoader"
import BackHeader from "components/utitlities-components/BackHeader"
const ViewBalance = () => {
  const user = userDetail()
  const [machineData, setMachineData] = useState([])
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getMachineDetails()
  }, [])

  const getMachineDetails = async () => {
    setLoader(true)
    let param = [`${user?.userId}?memoRequired=${true}`]
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
          <BalanceCard balanceData={machineData} />
        </>
      )}
    </Box>
  )
}

export default ViewBalance
