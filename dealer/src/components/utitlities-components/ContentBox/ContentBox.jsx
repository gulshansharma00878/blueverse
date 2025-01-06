import { Grid, Typography } from "@mui/material"
import React from "react"
import Earth from "assets/images/Logo/Logo.webp"

import { useStyles } from "./ContentBoxStyles"

function ContentBox({ item, img, xs = 2, sm = 4 }) {
  const styles = useStyles()
  return (
    <Grid xs={xs} sm={sm} item container direction="row" alignItems="center">
      {img && (
        <Grid xs={3} item>
          <img height="60%" width="60%" src={Earth} alt="Earth" />
        </Grid>
      )}

      <Grid xs={9} container direction="column" item>
        {item?.map((content, index) => (
          <Grid key={index} sx={styles.contentBox} sm={12} item>
            <Typography
              style={{
                ...content?.style,
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word"
              }}
              sx={styles.value}>
              {content?.value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  )
}

export default ContentBox
