import { Box, Grid, Stack, Typography } from "@mui/material"
import React from "react"
import { useStyles } from "./MachineWashesCardStyles"

function MachineWashesCard({ bgColor, type, value, icons, avgTime, fontColor }) {
  const styles = useStyles()
  return (
    <Grid
      container
      style={{ backgroundColor: bgColor, color: fontColor }}
      justifyContent="space-between"
      sx={styles.outerBox}>
      <Grid item xs={6}>
        <Stack>
          <Typography variant="p3">{type}</Typography>
          <Typography style={{ marginTop: "0.4rem" }} variant="s1">
            {value}
          </Typography>
        </Stack>
      </Grid>
      {icons ? (
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }} item>
          <img src={icons} alt="icons" />
        </Box>
      ) : null}
      {avgTime ? (
        <Stack>
          <Typography variant="p3">Avg. Time</Typography>
          <Typography style={{ marginTop: "0.4rem" }} variant="s1">
            {avgTime}
          </Typography>
        </Stack>
      ) : null}
    </Grid>
  )
}

export default MachineWashesCard
