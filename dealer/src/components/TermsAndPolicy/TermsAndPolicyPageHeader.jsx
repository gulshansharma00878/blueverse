import { Toolbar, Typography } from "@mui/material"
import React from "react"
import { useStyles } from "./t&cStyles"
import { useNavigate } from "react-router-dom"
import earth from "assets/images/placeholders/bvEarth.svg"
const TermsAndPolicyPageHeader = () => {
  const navigate = useNavigate()
  const goHome = () => {
    navigate("/")
  }
  const styles = useStyles()
  return (
    <Toolbar sx={styles?.appbar}>
      <img src={earth} alt="logo" style={styles.marginRight} />
      <Typography
        variant="h6"
        component="div"
        sx={{ flexGrow: 1, cursor: "pointer" }}
        onClick={goHome}>
        Blueverse
      </Typography>
    </Toolbar>
  )
}

export default TermsAndPolicyPageHeader
