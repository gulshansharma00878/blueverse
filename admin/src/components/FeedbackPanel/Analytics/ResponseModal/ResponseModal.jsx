import Box from "@mui/system/Box"
import Grid from "@mui/material/Grid"
import React, { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import CloseIcon from "@mui/icons-material/Close"
import cssStyles from "./responseModal.module.scss"
import { useStyles } from "./tableStyles"
import { FeedBackService } from "network/feedbackService"
import Toast from "components/utilities-components/Toast/Toast"
import { parseQuestionData } from "components/FeedbackPanel/feedbackutilities"

const ResponseModal = ({ data, closeHandler, loadingQuestion }) => {
  const styles = useStyles()
  const { questionTitle, responseCount, questionId } = data.question
  const [details, setDetails] = useState([])

  useEffect(() => {
    fetchQuestionDetails()
  }, [])

  const fetchQuestionDetails = async () => {
    loadingQuestion(true)
    const response = await FeedBackService.getQuestionDetails(questionId)

    if (response.success && response.code === 200) {
      setDetails(parseQuestionData(response.data?.feedbackAnswerList))
      loadingQuestion(false)
    } else {
      Toast.showErrorToast(response.message)
      loadingQuestion(false)
    }
  }

  return (
    <Box className={cssStyles["response-modal-container"]}>
      <Grid container justifyContent="space-between" className={cssStyles["modal-header"]}>
        <Grid item xs={10}>
          <Typography variant="s1" component="p" color="text.main">
            Q{data.index + 1}: &nbsp; {questionTitle}
          </Typography>
        </Grid>
        <Grid item xs={2} className={cssStyles["close-button-container"]}>
          <PrimaryButton onClick={closeHandler} className={cssStyles["close-button"]}>
            <CloseIcon fontSize="large" />
          </PrimaryButton>
        </Grid>
      </Grid>
      <Typography sx={{ color: "primary.main", marginBottom: "2.4rem" }} variant="p1" component="p">
        {`(${responseCount} ${responseCount > 1 ? "responses" : "response"})`}
      </Typography>

      <Box className={cssStyles["table-body"]}>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ border: 0 }}>Sr No</TableCell>
                <TableCell align="center" sx={{ border: 0 }}>
                  Customer Name
                </TableCell>
                <TableCell align="center" sx={{ border: 0 }}>
                  Wash Type
                </TableCell>
                <TableCell align="center" sx={{ border: 0 }}>
                  Wash Time
                </TableCell>
                <TableCell align="center" sx={{ border: 0 }}>
                  Answer
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details?.map((row, index) => (
                <TableRow
                  key={index}
                  className={cssStyles["table-row"]}
                  sx={{ color: "text.main" }}>
                  <TableCell align="center" sx={styles.tableRow}>
                    {index + 1}
                  </TableCell>
                  <TableCell align="center" sx={styles.tableRow}>
                    {row.customerName}
                  </TableCell>
                  <TableCell align="center" sx={styles.tableRow}>
                    {row.washType}
                  </TableCell>
                  <TableCell align="center" sx={styles.tableRow}>
                    {row.washTime}
                  </TableCell>
                  <TableCell align="center" sx={styles.tableRow}>
                    {row.response}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default ResponseModal
