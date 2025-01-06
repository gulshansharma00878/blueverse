import React from "react"
import { Box, Typography } from "@mui/material"
import styles from "./WaterMatrix.module.scss"
import { useTheme } from "@mui/system"
import waveImage from "../../../assets/images/Common/wave_1.webp"
import blueWaveImage from "../../../assets/images/Common/blue_wave.webp"
import { subtractAndValidate } from "helpers/Functions/formateString"

function WaterMatrix({ washData }) {
  const theme = useTheme()

  const waterData = [
    {
      liters: washData?.WaterUsed ? washData?.WaterUsed : 0,
      waterType: "Treated Water Used",
      src: waveImage
    },
    {
      liters: washData?.WaterWastage ? washData?.WaterWastage : 0,
      waterType: "Fresh Water Added",
      src: waveImage
    },
    {
      liters: washData?.WaterUsed
        ? subtractAndValidate(Number(washData?.WaterUsed), Number(washData?.WaterWastage))
        : 0,
      waterType: "Recycled Water",
      src: blueWaveImage
    }
  ]

  return (
    <>
      <Box sx={{ mt: "2rem", mb: "2rem" }} className={styles.water_container}>
        {waterData.map((item, i) => {
          return (
            <Box className={styles.water_box} key={i}>
              <Box className={styles.water_section1}>
                <Box className={styles.text_box}>
                  <Typography variant="h6" component={"div"} className={styles.line_div}>
                    {item.liters}
                    <Typography variant="p1"> Litres</Typography>
                  </Typography>
                  <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                    {item.waterType}
                  </Typography>
                </Box>
              </Box>
              <Box className={styles.water_section2}>
                <img src={item.src} alt="Wave" className={styles.wave_img} />
              </Box>
            </Box>
          )
        })}
      </Box>
    </>
  )
}

export default WaterMatrix
