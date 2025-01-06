import React from "react"
import PrimaryButton from "../Button/CommonButton"
import Grid from "@mui/material/Grid"
import Stack from "@mui/system/Stack"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import "./emptyState.scss"

const EmptyState = ({ imgSrc, titleText, btnLabel, clickHandler = () => {} }) => {
  return (
    <Stack className="empty-state-box" xs={12}>
      <img src={imgSrc} alt="placeholder" />
      <Typography variant="s1" component="p" className="title-text">
        {titleText}
      </Typography>
      {btnLabel ? (
        <PrimaryButton
          style={{ height: "6.4rem" }}
          width="auto"
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
      ) : null}
    </Stack>
  )
}

export default EmptyState
