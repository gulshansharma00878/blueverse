import React from "react"
import { Divider, Box, Typography } from "@mui/material"
import NoFeedBacks from "assets/images/placeholders/feedbackEmptyState.webp"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { useStyles } from "./feedBackStyles"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"

const Feedback = () => {
  const styles = useStyles()
  const user = userDetail()
  const navigate = useNavigate()
  const createForm = () => {
    navigate(`/${user.role}/feedback/create-feedback`)
  }
  return (
    <Box>
      <Typography style={styles?.title}>Feedback Form Management</Typography>
      <Divider />
      <Box style={styles?.container}>
        <img src={NoFeedBacks} alt="no-feedbacks" />
        <Typography style={styles?.subTitle}>
          Build your first feedback form for your customers
        </Typography>
        <PrimaryButton style={styles?.btn} onClick={createForm}>
          Create feedback form
        </PrimaryButton>
      </Box>
    </Box>
  )
}

export default Feedback
