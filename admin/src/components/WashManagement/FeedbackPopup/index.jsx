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
import WashTypeFlag from "components/utilities-components/WashTypeFlag"
import QuestionItem from "./QuestionItem"
import FooterSection from "./FooterSection"
import { dateMonthFormat } from "helpers/app-dates/dates"

const FeedbackPopup = (props) => {
  const { feedbackData } = props
  const dispatch = useDispatch()
  const outletDetails = {
    formName: feedbackData?.form?.name,
    region: feedbackData?.transactions?.machine?.outlet?.city?.state?.region?.name,
    state: feedbackData?.transactions?.machine?.outlet?.city?.state?.name,
    city: feedbackData?.transactions?.machine?.outlet?.city?.name,
    oemName: feedbackData?.transactions?.machine?.outlet?.dealer?.oem?.name,
    outletName: feedbackData?.transactions?.machine?.outlet?.name,
    agentName: feedbackData?.agent?.username,
    machine: feedbackData?.transactions?.machine?.name,
    qrGeneratedDateTime: feedbackData?.createdAt,
    feedbackSubmittedDateTime: feedbackData?.completedAt ? feedbackData?.completedAt : ""
  }
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
                  {feedbackData?.name}
                </Typography>
                <Typography variant="p2" color="text.main" component="p">
                  {feedbackData?.phone}
                </Typography>
                <Typography variant="p2" color="text.gray" component="p">
                  {feedbackData?.emailId}
                </Typography>
                <Typography variant="p3" color="text.gray" component="p">
                  {"SKU - " + feedbackData?.skuNumber}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Box className={styles.flag}>
                <WashTypeFlag
                  position="left"
                  withWash={false}
                  washType={feedbackData?.transactions?.washType?.Name}
                />
              </Box>
              <Stack sx={{ textAlign: "right", marginTop: "4px" }} spacing={0.5}>
                <Typography variant="p3" color="text.gray" component="p">
                  {feedbackData?.hsrpNumber}
                </Typography>
                <Typography variant="p3" color="text.gray" component="p">
                  {feedbackData?.manufacturer} {feedbackData?.bikeModel}
                </Typography>
                <Typography variant="p3" color="text.main" component="p">
                  {feedbackData?.washTime
                    ? dateMonthFormat(feedbackData?.washTime, "DD/MM/YYYY hh:mm A")
                    : ""}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider className={styles.divider} />
          <Stack spacing={2} className={styles.questionsSection}>
            {feedbackData?.formResponse &&
              feedbackData?.formResponse.length > 0 &&
              feedbackData?.formResponse.map((x, index) => (
                <QuestionItem
                  key={index}
                  index={index + 1}
                  question={x?.questionText}
                  answer={x?.questionResponse}
                  isMandatory={x?.question?.isOptional}
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
