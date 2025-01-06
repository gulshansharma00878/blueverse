import { Grid, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import TotalWashes from "assets/images/icons/totalWashes.svg"
import TotalRevenue from "assets/images/icons/totalRevenue.svg"
import TotalRunTime from "assets/images/icons/totalRunTime.svg"
import { ManageMachinesServices } from "network/manageMachinesServices"
import { convertSecondToHour } from "helpers/Functions/convertSecondToHour"
import { formatCurrency } from "helpers/Functions/formatCurrency"
import MachineWashesCard from "components/utitlities-components/MachinesWashesCard"
import AppLoader from "components/Loader/AppLoader"
import Toast from "components/utitlities-components/Toast/Toast"

function MachineWashes({ machineId, startDate, endDate }) {
  const theme = useTheme()
  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMachinesWashes()
  }, [startDate, endDate])

  const getMachinesWashes = async () => {
    setLoading(true)
    let params = [`${machineId}?fromDate=${startDate}&toDate=${endDate}`]

    const response = await ManageMachinesServices.machinesWashes(params)
    if (response.success && response.code === 200) {
      setData(response?.data)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoading(false)
  }

  let ans = [
    [
      {
        key: "Total Washes",
        value: data?.reduce((accumulator, obj) => accumulator + (obj?.count || 0), 0),
        icons: TotalWashes,
        bgColor: theme?.palette?.primary?.main,
        fontColor: theme?.palette?.background?.default
      },
      {
        key: "Silver Washes",
        value: data?.[0]?.count,
        bgColor: theme?.palette?.background?.gray3
      },
      {
        key: "Gold Washes",
        value: data?.[2]?.count,
        bgColor: theme?.palette?.background?.pink5
      },
      {
        key: "Platinum Washes",
        value: data?.[1]?.count,
        bgColor: theme?.palette?.background?.pink4
      }
    ],
    [
      {
        key: "Total Run Time",
        value: convertSecondToHour(
          data?.reduce((accumulator, obj) => accumulator + (obj?.totalWashTime || 0), 0)
        ),
        bgColor: theme?.palette?.background?.blue3,
        icons: TotalRunTime,
        fontColor: theme?.palette?.background?.default
      },
      {
        key: "Silver Washes",
        value: convertSecondToHour(parseFloat(data?.[0]?.totalWashTime) || 0),
        avgTime: convertSecondToHour(parseFloat(data?.[0]?.avgWashTime) || 0),
        bgColor: theme?.palette?.background?.gray3
      },
      {
        key: "Gold Washes",
        value: convertSecondToHour(parseFloat(data?.[2]?.totalWashTime) || 0),
        avgTime: convertSecondToHour(parseFloat(data?.[2]?.avgWashTime) || 0),
        bgColor: theme?.palette?.background?.pink5
      },
      {
        key: "Platinum Washes",
        value: convertSecondToHour(parseFloat(data?.[1]?.totalWashTime) || 0),
        avgTime: convertSecondToHour(parseFloat(data?.[1]?.avgWashTime) || 0),
        bgColor: theme?.palette?.background?.pink4
      }
    ],
    [
      {
        key: "Total Revenue",
        value: formatCurrency(
          data?.reduce(
            (accumulator, obj) =>
              accumulator +
              (parseFloat(obj?.totalBaseAmount) +
                parseFloat(obj?.totalcgst) +
                parseFloat(obj?.totalsgst) || 0),
            0
          )
        ),
        bgColor: theme?.palette?.text?.green,
        icons: TotalRevenue,
        fontColor: theme?.palette?.background?.default
      },
      {
        key: "Silver Washes",
        value: formatCurrency(
          parseFloat(data?.[0]?.totalBaseAmount) +
            parseFloat(data?.[0]?.totalcgst) +
            parseFloat(data?.[0]?.totalsgst)
        ),
        bgColor: theme?.palette?.background?.gray3
      },
      {
        key: "Gold Washes",
        value: formatCurrency(
          parseFloat(data?.[2]?.totalBaseAmount) +
            parseFloat(data?.[2]?.totalcgst) +
            parseFloat(data?.[2]?.totalsgst)
        ),
        bgColor: theme?.palette?.background?.pink5
      },
      {
        key: "Platinum Washes",
        value: formatCurrency(
          parseFloat(data?.[1]?.totalBaseAmount) +
            parseFloat(data?.[1]?.totalcgst) +
            parseFloat(data?.[1]?.totalsgst)
        ),
        bgColor: theme?.palette?.background?.pink4
      }
    ]
  ]

  return (
    <>
      {ans?.map((item, index) => {
        return (
          <Grid container style={{ marginBottom: "2rem" }} key={index} spacing={3}>
            {item?.map((val, index) => (
              <Grid item sm={3} xs={12} key={index}>
                <MachineWashesCard
                  bgColor={val?.bgColor}
                  type={val?.key}
                  value={val?.value}
                  avgTime={val?.avgTime}
                  icons={val?.icons}
                  fontColor={val?.fontColor}
                />
              </Grid>
            ))}
          </Grid>
        )
      })}
      {loading && <AppLoader />}
    </>
  )
}

export default MachineWashes
