import React from "react"
import { Box, Typography } from "@mui/material"
import styles from "./MatrixSection.module.scss"
import { useTheme } from "@mui/system"

function MatrixSection(props) {
  const { washData } = props
  const theme = useTheme()

  const matrixData = [
    {
      used: washData?.ElectricityUsed ? washData?.ElectricityUsed : "--",
      messureUnit: "kwh",
      type: "Electricity Used",
      typesPrice: washData?.ElectricityPrice ? washData?.ElectricityPrice : "--",
      priceUnit: "INR/Unit",
      typesName: "Electricity Price",
      color: theme.palette.secondary.main
    },
    {
      used: washData?.FoamUsed ? washData?.FoamUsed : "--",
      messureUnit: "ml",
      type: "Foam Used",
      typesPrice: washData?.FoamPrice ? washData?.FoamPrice : "--",
      priceUnit: "INR/Unit",
      typesName: "Foam Price",
      color: theme.palette.background.blue6
    },
    {
      used: washData?.ShampooUsed ? washData?.ShampooUsed : "--",
      messureUnit: "ml",
      type: "Shampoo Used",
      typesPrice: washData?.ShampooPrice ? washData?.ShampooPrice : "--",
      priceUnit: "INR/Unit",
      typesName: "Shampoo Price",
      color: theme.palette.background.pink1
    },
    {
      used: washData?.WaterUsed ? washData?.WaterUsed : "--",
      messureUnit: "L",
      type: "Water Used",
      typesPrice: washData?.WaterPrice ? washData?.WaterPrice : "--",
      priceUnit: "INR/L",
      typesName: "Water Price",
      color: theme.palette.background.pink2
    },
    {
      used: washData?.WaxUsed ? washData?.WaxUsed : "--",
      messureUnit: "ml",
      type: "Wax Used",
      typesPrice: washData?.WaxPrice ? washData?.WaxPrice : "--",
      priceUnit: "INR/Unit",
      typesName: "Wax Price",
      color: theme.palette.secondary.main
    }
  ]
  return (
    <>
      <Box sx={{ mt: "2rem" }} className={styles.matrix_container}>
        {matrixData.map((item, i) => {
          return (
            <Box className={styles.matrix_box} key={i}>
              <Box className={styles.section1} sx={{ backgroundColor: item.color }}>
                <Box className={styles.line_div}>
                  <Typography variant="h6">{item.used}</Typography>
                  <Typography variant="p2">{item.messureUnit}</Typography>
                </Box>
                <Box>
                  <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                    {item.type}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>
    </>
  )
}

export default MatrixSection
