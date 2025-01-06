import { Grid } from "@mui/material"
import AccordionComponent from "components/utitlities-components/Accordian/AccordionComponent"
import React, { useEffect, useState } from "react"
import AccordionDetail from "./AccordionDetail/AccordionDetail"
import { SettingService } from "network/settingsService"
// import { userDetail } from "hooks/state"
import { sortResponseData } from "../settingsUtility"
import { useSelector } from "react-redux"
import AppLoader from "components/Loader/AppLoader"
function OutletSubscription() {
  const userID = useSelector((state) => state?.app?.user?.userId)
  const [outlets, setOutlets] = useState(null)
  const [loading, setLoading] = useState(null)
  useEffect(() => {
    getSubs()
  }, [])
  const getSubs = async () => {
    setLoading(true)
    const response = await SettingService.getSubscriptions(userID)
    if (response?.success && response?.code === 200) {
      const sortData = sortResponseData(response?.data?.outlets)
      setOutlets(sortData)
      setLoading(false)
    } else {
      setLoading(false)
      setOutlets(null)
    }
  }
  return (
    <Grid container sx={{ marginTop: "1rem" }}>
      {loading && <AppLoader />}
      {!loading && !outlets && "No Outlets Available"}
      {!loading &&
        outlets &&
        outlets.map((item, index) => {
          return (
            <Grid key={index} xs={12}>
              <AccordionComponent
                key={index}
                selectedName={item?.name}
                address={item?.address}
                city={item?.city}
                state={item?.state}
                region={item?.region}
                breakTxt={true}>
                {item?.machinesInfo.map((val, indx) => {
                  return <AccordionDetail key={indx} data={val} />
                })}
              </AccordionComponent>
            </Grid>
          )
        })}
    </Grid>
  )
}

export default OutletSubscription
