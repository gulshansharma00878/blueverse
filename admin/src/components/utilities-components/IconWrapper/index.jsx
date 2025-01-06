// INFO : Use this wrapper to render any icon. It takes image src and optional styling
// ...  : It returns icon with theme-blue background
import React from "react"
import useStyles from "./iconWrapperStyles"
import Box from "@mui/material/Box"

const IconWrapper = ({ imgSrc, wrapperStyle = {}, disable = false, clickHandler = null }) => {
  const styles = useStyles()
  return (
    <Box
      sx={[
        styles.wrapper,
        !disable && clickHandler !== null && styles.pointer,
        disable && styles.disable,
        wrapperStyle
      ]}
      onClick={disable ? null : clickHandler}>
      <img src={imgSrc} style={styles.icon} alt="icon" />
    </Box>
  )
}
export default IconWrapper
