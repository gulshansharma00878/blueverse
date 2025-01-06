// INFO:  This component will render blueverse logo and text and will be render on login, forgot-pass, reset-pass screens
import React from "react"
import { useStyles } from "../commonStyles"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import logo from "assets/images/Logo/Logo.webp"

const LogoContainer = ({ label }) => {
  const styles = useStyles()
  return (
    <Box sx={styles.logoContainer}>
      <Box style={styles.display}>
        <img src={logo} alt="blueverse" style={styles.logo} />
      </Box>
      <Typography sx={styles.topLabel} variant="subtitle" component="p">
        {label}
      </Typography>
    </Box>
  )
}

export default LogoContainer
