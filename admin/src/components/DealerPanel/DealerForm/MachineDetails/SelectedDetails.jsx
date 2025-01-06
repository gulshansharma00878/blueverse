// INFO : This component will render a strip that contains machine and outlet details after selection.
import React from "react"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import styles from "./machineDetails.module.scss"

const SelectedDetails = ({ selectedData, index, textWhite = false, editDataHandler = null }) => {
  return (
    <Grid container alignItems="center" sx={{ paddingX: "2rem", paddingY: "1.2rem" }}>
      <Grid item xs={6} sm={3}>
        <Stack>
          <Typography variant="s1" color={textWhite ? "text.white" : "text.main"}>
            {`Service Centre ${index + 1}`}
          </Typography>
          <Typography variant="p2" color={textWhite ? "text.white" : "text.main"}>
            {selectedData[index]?.outletName}
          </Typography>
          <Typography variant="p2" color={textWhite ? "text.white" : "text.gray"}>
            {selectedData[index]?.region} {selectedData[index]?.city} {selectedData[index]?.state}
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={6} sm={7} className={styles["machineLabelContainer"]}>
        {selectedData[index]?.machine?.map((x, index) => (
          <Box key={index} className={styles["machineLabel"]}>
            <Box>
              <Typography color="text.white" variant="s1">
                {x.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Grid>
      {editDataHandler !== null && (
        <Grid item xs={12} sm={2} container justifyContent="flex-end">
          <PrimaryButton
            className={styles["editButtonMD"]}
            onClick={editDataHandler.bind(null, index)}>
            Edit
          </PrimaryButton>
        </Grid>
      )}
    </Grid>
  )
}

export default SelectedDetails
