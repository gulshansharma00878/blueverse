import React from "react"
import PrimaryButton from "../Button/CommonButton"
import Grid from "@mui/material/Grid"
import Stack from "@mui/system/Stack"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import "./emptyState.scss"

const EmptyState = ({ imgSrc, titleText, btnLabel, clickHandler = () => {} }) => {
  return (
    <Stack className="empty-state-box" item xs={12}>
      <img style={{ width: "42.5rem", height: "42.5rem" }} src={imgSrc} alt="placeholder" />
      <Typography variant="s1" component="p" className="title-text">
        {titleText}
      </Typography>
      {btnLabel && (
        <PrimaryButton
          height={64}
          width={229}
          fontSize={16}
          fontWeight={600}
          onClick={clickHandler}>
          <Grid container alignItems="center" justifyContent="space-around">
            <Grid item sx={{ paddingTop: "0.4rem" }}>
              <AddIcon />
            </Grid>
            <Grid item>
              <Typography variant="p1">{btnLabel}</Typography>
            </Grid>
          </Grid>
        </PrimaryButton>
      )}
    </Stack>
  )
}

export default EmptyState
