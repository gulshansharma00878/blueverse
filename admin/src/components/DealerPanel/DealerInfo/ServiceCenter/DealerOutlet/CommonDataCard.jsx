import React from "react"
import { Stack, Typography } from "@mui/material"
import { useStyles } from "../../DealerInfoStyles"

function CommonDataCard(props) {
  const styles = useStyles()
  return (
    <>
      <Stack sx={styles.outerCards}>
        <Typography color="text.gray" sx={styles.topBoxHeading}>
          {props.value1}
        </Typography>
        <Typography variant="s1" color="text.main">
          {props.value2}
        </Typography>
      </Stack>
    </>
  )
}

export default CommonDataCard
