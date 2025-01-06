// INFO : This component will render the wash type flag

import React from "react"
import styles from "./washTypeFlag.module.scss"
import Box from "@mui/material/Box"
import { capitaliseString } from "helpers/Functions/formateString"
/**
 * @description rightPosition : true or false, washType : gold, silver, platinum , other values.
 *  */
const WashTypeFlag = ({ washType, rightPosition = true, withWash = true, alignEnd = false }) => {
  const getStyle = () => {
    switch (true) {
      case washType?.toLowerCase() === "gold":
        return { label: `Gold ${withWash ? "Wash" : ""}`, class: "gold-wash" }
      case washType?.toLowerCase() === "silver":
        return { label: `Silver ${withWash ? "Wash" : ""}`, class: "silver-wash" }
      case washType?.toLowerCase() === "platinum":
        return { label: `Platinum ${withWash ? "Wash" : ""}`, class: "platinum-wash" }
      default:
        return {
          label: capitaliseString(washType + `${withWash ? " Wash" : ""}`),
          class: "other-wash"
        }
    }
  }

  return (
    <div className={alignEnd ? styles.washFlagBox : ""}>
      <Box
        className={[
          styles.washFlag,
          styles[getStyle().class],
          rightPosition ? styles.rightPosition : styles.leftPosition
        ]}>
        {getStyle().label}
        {/* <Typography variant="p3" >
          {getStyle().label}
        </Typography> */}
      </Box>
    </div>
  )
}

export default WashTypeFlag
