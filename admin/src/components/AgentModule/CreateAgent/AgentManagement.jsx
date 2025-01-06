import { Grid, Typography } from "@mui/material"
import React from "react"
import Company from "assets/images/Agent/company.webp"
import { useNavigate } from "react-router-dom"
import { useStyles } from "./AgentModuleStyle"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import AddIcon from "assets/images/icons/addIcon.svg"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { userDetail } from "hooks/state"

function AgentManagement() {
  const styles = useStyles()
  const user = userDetail()
  const navigate = useNavigate()
  const handleRoute = () => {
    navigate(`/${user.role}/agent/add`)
  }

  return (
    <Grid container>
      <CommonHeader heading="Agent Management" />
      <Grid sx={styles.innerBox} item xs={12}>
        <Grid>
          <img height="385px" width="425px" src={Company} alt="agent logo" />
        </Grid>
        <Grid>
          <Typography sx={styles.heading} variant="s1">
            Add Blueverse agents profile details here
          </Typography>
        </Grid>
        <Grid>
          <PrimaryButton
            height={64}
            width={229}
            fontSize={16}
            fontWeight={600}
            onClick={handleRoute}
            sx={styles.buttonBox}>
            <Grid sx={styles.imgTag}>
              <img src={AddIcon} alt="button logo" style={{ width: "2.4rem", height: "2.4rem" }} />
            </Grid>
            Create Agent Profile
          </PrimaryButton>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default AgentManagement
