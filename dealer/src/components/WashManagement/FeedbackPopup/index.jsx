import React from "react"
import styles from "./feedbackPopup.module.scss"
import PopupModal from "components/PopupModal"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { Divider, Stack, Typography } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import FeedbackIcon from "assets/images/icons/feedbackIcon.svg"
import QuestionItem from "./QuestionItem"
import FooterSection from "./FooterSection"
import WashTypeFlag from "components/utitlities-components/WashTypeFlag"

const FeedbackPopup = () => {
  const dispatch = useDispatch()

  const outletDetails = {
    region: "North",
    state: "Delhi",
    city: "New Delhi",
    oemName: "TVS",
    outletName: "Avni Motors",
    agentName: "Rahul Sharma",
    machine: "M1",
    qrGeneratedDateTime: "10/03/2023 04:53 PM",
    feedbackSubmittedDateTime: "10/03/2023 05:31 PM"
  }

  const dummyData = [
    { question: "Did we cleaned on right time?", answer: "Yes", isMandatory: true },
    { question: "What did you liked the most?", answer: "Price, Quality", isMandatory: true },
    { question: "How was your experience?", answer: "Very good", isMandatory: false },
    {
      question: "Feedbacks",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      isMandatory: false
    },
    { question: "Overall Rating", answer: "4", isMandatory: false }
  ]

  const popupCloseHandler = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  return (
    <PopupModal handleClose={popupCloseHandler}>
      <Box className={styles.container}>
        <Grid container className={styles.header}>
          <Grid item xs={2}>
            <img src={FeedbackIcon} />
          </Grid>
          <Grid item xs={8} sx={{ textAlign: "center" }}>
            <Typography variant="h7" color="text.white">
              Customer Feedback
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Box onClick={popupCloseHandler} className={styles.button}>
              <CloseIcon color="primary" />
            </Box>
          </Grid>
        </Grid>
        <Box className={styles.bodySection}>
          <Grid container justifyContent="space-between">
            <Grid item xs={6}>
              <Stack spacing={0.5}>
                <Typography variant="p1" color="text.main" component="p">
                  Siddarth Bapna
                </Typography>
                <Typography variant="p2" color="text.main" component="p">
                  9876543210
                </Typography>
                <Typography variant="p2" color="text.gray" component="p">
                  siddarth@bluverse.com
                </Typography>
                <Typography variant="p3" color="text.gray" component="p">
                  SKU- SP170223075
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Box className={styles.flag}>
                <WashTypeFlag position="left" washType="gold" />
              </Box>
              <Stack sx={{ textAlign: "right", marginTop: "0.4rem" }} spacing={0.5}>
                <Typography variant="p3" color="text.gray" component="p">
                  DL 09 CAW 1234
                </Typography>
                <Typography variant="p3" color="text.gray" component="p">
                  Hero Splender
                </Typography>
                <Typography variant="p3" color="text.main" component="p">
                  March 02, 04:53 PM
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider className={styles.divider} />
          <Stack spacing={2} className={styles.questionsSection}>
            {dummyData.map((x, index) => (
              <QuestionItem
                key={index}
                index={index + 1}
                question={x?.question}
                answer={x?.answer}
                isMandatory={x?.isMandatory}
              />
            ))}
          </Stack>
          <Divider className={styles.divider} />
          <FooterSection props={outletDetails} />
        </Box>
      </Box>
    </PopupModal>
  )
}

export default FeedbackPopup
