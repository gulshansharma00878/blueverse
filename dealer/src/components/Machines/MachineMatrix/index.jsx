import React from "react"
import { Box, Grid, IconButton, Typography } from "@mui/material"
import styles from "./MachineMatrix.module.scss"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import waveMobileImage from "../../../assets/images/Common/wave_1.webp"
import blueWaveMobileImage from "../../../assets/images/Common/blue_wave.webp"
import { useTheme } from "@mui/material"
import { subtractAndValidate, sumAndValidate } from "helpers/Functions/formateString"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"
function MachineMatrix({ waterQualityData, waterConsumptionData, machineId }) {
  const theme = useTheme()
  const user = userDetail()
  const navigate = useNavigate()

  const waterQualityDate = [
    {
      qualityNo: waterQualityData?.totalPHValue ? waterQualityData?.totalPHValue : 0,
      unit: "Ph",
      background: "#E7FAF0"
    },
    {
      qualityNo: waterQualityData?.totalTDSValue ? waterQualityData?.totalTDSValue : 0,
      unit: "Tds",
      background: "#E7FAF0"
    },
    {
      qualityNo: waterQualityData?.totalTSSValue ? waterQualityData?.totalTSSValue : 0,
      unit: "Tss",
      background: "#E7FAF0"
    },
    {
      qualityNo: waterQualityData?.totalCODValue ? waterQualityData?.totalCODValue : 0,
      unit: "Cod",
      background: "#E7FAF0"
    },
    {
      qualityNo: waterQualityData?.totalOilAndGreaseValue
        ? waterQualityData?.totalOilAndGreaseValue
        : 0,
      unit: "Oil & Grees",
      background: "#E7FAF0"
    }
  ]

  const waterData = [
    {
      liters: waterQualityData?.totalWaterUsed ? waterQualityData?.totalWaterUsed : 0,
      waterType: "Treated Water",
      src: waveMobileImage
    },
    {
      liters: waterQualityData?.totalWaterWastage ? waterQualityData?.totalWaterWastage : 0,
      waterType: "Fresh Water",
      src: waveMobileImage
    },
    {
      liters: waterQualityData?.totalWaterUsed
        ? subtractAndValidate(
            Number(waterQualityData?.totalWaterUsed),
            Number(waterQualityData?.totalWaterWastage)
          )
        : 0,
      waterType: "Recycled Water",
      src: blueWaveMobileImage
    }
  ]

  const waterUsedData = [
    {
      title: "Chemical Used",
      naviagte: `/${user?.role}/machines/details/chemical-performance/${machineId}`,
      silver: sumAndValidate(
        Number(waterConsumptionData?.SILVER?.totalFoamUsed),
        Number(waterConsumptionData?.SILVER?.totalShampooUsed),
        Number(waterConsumptionData?.SILVER?.totalWaxUsed)
      ),
      gold: sumAndValidate(
        Number(waterConsumptionData?.SILVER?.totalFoamUsed),
        Number(waterConsumptionData?.GOLD?.totalShampooUsed),
        Number(waterConsumptionData?.GOLD?.totalWaxUsed)
      ),
      platinum: sumAndValidate(
        Number(waterConsumptionData?.PLATINUM?.totalFoamUsed),
        Number(waterConsumptionData?.PLATINUM?.totalShampooUsed),
        Number(waterConsumptionData?.SILVER?.totalWaxUsed)
      ),
      unit: "ml"
    },
    {
      title: "Electricity Cosumption",
      naviagte: `/${user?.role}/machines/details/electricity-consumption/${machineId}`,
      silver: waterConsumptionData?.SILVER?.totalElectricityUsed
        ? waterConsumptionData?.SILVER?.totalElectricityUsed
        : 0,
      gold: waterConsumptionData?.GOLD?.totalElectricityUsed
        ? waterConsumptionData?.GOLD?.totalElectricityUsed
        : 0,
      platinum: waterConsumptionData?.PLATINUM?.totalElectricityUsed
        ? waterConsumptionData?.PLATINUM?.totalElectricityUsed
        : 0,
      unit: "kwh"
    },
    {
      title: "Washes",
      naviagte: `/${user?.role}/machines/details/water-washes/${machineId}`,
      silver: waterConsumptionData?.SILVER?.totalWaterUsed
        ? waterConsumptionData?.SILVER?.totalWaterUsed
        : 0,
      gold: waterConsumptionData?.GOLD?.totalWaterUsed
        ? waterConsumptionData?.GOLD?.totalWaterUsed
        : 0,
      platinum: waterConsumptionData?.PLATINUM?.totalWaterUsed
        ? waterConsumptionData?.PLATINUM?.totalWaterUsed
        : 0,
      unit: "L"
    }
  ]

  const handleNavigate = (e, path) => {
    navigate(path)
  }
  const BoxTitileComponent = (titleText, path) => (
    <Box className={styles.title_box}>
      <Typography variant="s1">{titleText}</Typography>
      <IconButton className={styles.icon_box} onClick={(e) => handleNavigate(e, path)}>
        <ArrowForwardIosIcon color="primary" />
      </IconButton>
    </Box>
  )

  return (
    <Box className={styles.matrix_container}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <Box className={styles.matrix_box}>
            {BoxTitileComponent(
              "Water Quality",
              `/${user?.role}/machines/details/water-quality/${machineId}`
            )}
            <Box className={styles.quality_box}>
              {waterQualityDate.map((item, index) => {
                return (
                  <Box
                    key={index}
                    sx={{ background: item.background }}
                    className={styles.quality_inner_box}>
                    <Typography variant="s1"> {item.qualityNo}</Typography>
                    <Typography variant="p3" component={"div"}>
                      {" "}
                      {item.unit}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <Box className={styles.matrix_box}>
            {BoxTitileComponent(
              "Water Consumption",
              `/${user?.role}/machines/details/water-consumption/${machineId}`
            )}
            <Box className={styles.water_box}>
              {waterData.map((item, i) => {
                return (
                  <Box className={styles.water_inner_box} key={i}>
                    <Box className={styles.water_section1}>
                      {/* <Box className={styles.text_box}> */}
                      <Typography variant="h7" component={"div"} className={styles.line_div}>
                        {item.liters}
                      </Typography>
                      <Typography variant="h7"> L</Typography>
                      <Typography variant="p3" color={"text.gray"}>
                        {item.waterType}
                      </Typography>
                      {/* </Box> */}
                    </Box>
                    <Box className={styles.water_section2}>
                      <img src={item.src} alt="Wave" className={styles.wave_img} />
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Grid>
        {waterUsedData.map((item, index) => {
          return (
            <Grid item xs={12} sm={4} md={4} lg={4} xl={4} key={index}>
              <Box className={styles.matrix_box}>
                {BoxTitileComponent(item?.title, item?.naviagte)}
                <Box className={styles.matrix_inner_box}>
                  <Box
                    className={styles.matrix_inner_row}
                    sx={{ background: theme.palette.background.gray3 }}>
                    <Box>
                      <Typography variant="s1">{item.silver}</Typography>
                      <Typography variant="p4" sx={{ ml: "1rem" }}>
                        {item.unit}
                      </Typography>
                    </Box>
                    <Typography component={"div"} variant="p2">
                      Silver
                    </Typography>
                  </Box>
                  <Box
                    className={styles.matrix_inner_row}
                    sx={{ background: theme.palette.background.pink5 }}>
                    <Box>
                      <Typography variant="s1">{item.gold}</Typography>
                      <Typography variant="p4" sx={{ ml: "1rem" }}>
                        {item.unit}
                      </Typography>
                    </Box>
                    <Typography component={"div"} variant="p2">
                      Gold
                    </Typography>
                  </Box>
                  <Box
                    className={styles.matrix_inner_row}
                    sx={{ background: theme.palette.background.pink4 }}>
                    <Box>
                      <Typography variant="s1">{item.platinum}</Typography>
                      <Typography variant="p4" sx={{ ml: "1rem" }}>
                        {item.unit}
                      </Typography>
                    </Box>
                    <Typography component={"div"} variant="p2">
                      Platinum
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default MachineMatrix
