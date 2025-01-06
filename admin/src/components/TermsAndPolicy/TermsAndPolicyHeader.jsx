import React from "react"
import { Grid, IconButton } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useNavigate } from "react-router-dom"
const TermsAndPolicyHeader = ({ title }) => {
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(-1)
  }
  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          // sx={[styles?.display, styles?.align]}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            className="filtericonBox"
            // style={styles?.smallMarginLeft}
            onClick={handleBack}>
            <ArrowBackIcon color="primary" />
          </IconButton>
        </Grid>
        <Grid item xs={6}>
          <h2>{title}</h2>
        </Grid>
      </Grid>
    </>
  )
}

export default TermsAndPolicyHeader
