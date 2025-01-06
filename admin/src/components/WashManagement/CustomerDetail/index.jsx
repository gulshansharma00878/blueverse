import React, { useEffect, useState } from "react"
import { Box, IconButton, Typography } from "@mui/material"
import styles from "./CustomerDetail.module.scss"
import { useTheme } from "@mui/system"
import earthImage from "../../../assets/images/Logo/earth-logo.webp"
import DownloadIcon from "assets/images/icons/downloadIconTransparent.svg"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import FeedbackPopup from "components/WashManagement/FeedbackPopup"
import WashTypeFlag from "components/utilities-components/WashTypeFlag"
import { ManageWashService } from "network/manageWashService"
import { dateMonthFormat } from "helpers/app-dates/dates"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import CertificateTemp from "../CertificateTemp"
import { pdf } from "@react-pdf/renderer"

function CustomerSection(props) {
  const { customerData } = props
  const [feedbackData, setFeedbackData] = useState({})
  const theme = useTheme()
  const dispatch = useDispatch()

  useEffect(() => {
    getFeedbackDetails()
  }, [customerData])
  const getFeedbackDetails = async () => {
    if (customerData?.transactionFeedback?.transactionFeedbackId) {
      let param = [customerData?.transactionFeedback?.transactionFeedbackId]
      let feedbackResponse = await ManageWashService.getFeedBackDetail(param)
      if (feedbackResponse.code === 200 && feedbackResponse.success) {
        setFeedbackData(feedbackResponse?.data?.records)
      } else {
        setFeedbackData({})
      }
    } else {
      setFeedbackData({})
    }
  }
  const viewFeedbackHandler = () => {
    dispatch(coreAppActions.updatePopupModal(true))
  }

  const handleDownload = async (e, certificateData) => {
    const certificatePdf = <CertificateTemp certificateData={certificateData} />
    const blob = await pdf(certificatePdf).toBlob()
    // Create an anchor element with the download attribute
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "certificate.pdf")
    document.body.appendChild(link)
    link.click()
  }

  return (
    <Box className={styles.customer_container}>
      <Box className={styles.detail_container}>
        {customerData?.transactionFeedback?.name && (
          <Box className={styles.section1}>
            <Box className={styles.inner_box}>
              <Typography variant="s1">
                {customerData?.transactionFeedback?.name
                  ? customerData?.transactionFeedback?.name
                  : "--"}
              </Typography>
            </Box>
            <Box className={styles.inner_box}>
              <Typography variant="p2">
                {customerData?.transactionFeedback?.manufacturer
                  ? customerData?.transactionFeedback?.manufacturer
                  : ""}{" "}
                {customerData?.transactionFeedback?.bikeModel
                  ? customerData?.transactionFeedback?.bikeModel + ","
                  : ""}{" "}
                {customerData?.transactionFeedback?.hsrpNumber
                  ? customerData?.transactionFeedback?.hsrpNumber
                  : ""}
              </Typography>
            </Box>
            <Box className={styles.inner_box}>
              <Typography variant="p2">
                {customerData?.transactionFeedback?.phone
                  ? customerData?.transactionFeedback?.phone
                  : ""}
              </Typography>
            </Box>
            <Box className={styles.inner_box}>
              <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                {customerData?.transactionFeedback?.emailId
                  ? customerData?.transactionFeedback?.emailId
                  : ""}
              </Typography>
            </Box>
          </Box>
        )}
        <Box className={styles.section2}>
          <Box className={styles.inner_box}>
            {/* <Typography variant="s1">Gold Wash</Typography> */}
            <Box className={styles.flag}>
              <WashTypeFlag rightPosition={false} washType={customerData?.washType?.Name} />
            </Box>
            <Typography variant="s1" component={"div"}>
              Machine: {customerData?.machine?.name ? customerData?.machine?.name : "--"}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2">
              {customerData?.machine?.outlet?.name ? customerData?.machine?.outlet?.name : "--"}
              {customerData?.machine?.outlet?.address
                ? " - " + customerData?.machine?.outlet?.address
                : "--"}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
              {customerData?.machine?.outlet?.city?.state?.region?.name} -{" "}
              {customerData?.machine?.outlet?.city?.state?.name},{" "}
              {customerData?.machine?.outlet?.city?.name}
            </Typography>
          </Box>
          <Box className={styles.inner_box}>
            <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
              Wash Time :{" "}
            </Typography>
            <Typography variant="p2">
              {dateMonthFormat(customerData?.AddDate, "DD/MM/YYYY hh:mm A")}
            </Typography>
          </Box>
        </Box>
        {customerData?.washType?.Name !== "PREWASH" && (
          <Box className={styles.section3}>
            <Box className={styles.inner_box}>
              <Typography variant="s1">
                Total:{" "}
                {customerData?.machineWallet
                  ? "INR " +
                    Number(
                      customerData?.machineWallet?.totalAmount
                        ? customerData?.machineWallet?.totalAmount
                        : 0
                    )
                  : "NA"}
              </Typography>
            </Box>
            <Box className={styles.inner_box}>
              <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                Base Price:
              </Typography>
              <Typography variant="p2">
                {customerData?.machineWallet?.baseAmount
                  ? "INR " + customerData?.machineWallet?.baseAmount
                  : "NA"}
              </Typography>
            </Box>
            <Box className={styles.inner_box}>
              <Typography variant="p2">
                <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                  Cgst (9%):{" "}
                </Typography>
                {customerData?.machineWallet?.cgst
                  ? "INR " + customerData?.machineWallet?.cgst
                  : "NA"}
              </Typography>
              <Typography variant="p2">
                <Typography variant="p2" sx={{ color: theme.palette.text.gray }}>
                  Sgst (9%):{" "}
                </Typography>
                {customerData?.machineWallet?.sgst
                  ? "INR " + customerData?.machineWallet?.sgst
                  : "NA"}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      {customerData?.washType?.Name !== "PREWASH" && (
        <Box className={styles.banner_container}>
          <Box className={styles.earth_banner}>
            <img src={earthImage} alt="Earth" className={styles.image} />
            <Box className={styles.text_box}>
              <Typography variant="s1" component={"div"}>
                Congratulations!{" "}
              </Typography>
              <Typography variant="p4" component={"div"}>
                You Have{" "}
                <Typography variant="p1">Recycled and Reuse {180} Litres Of Water</Typography> From
                This Bike Wash!
              </Typography>
            </Box>
          </Box>
          {customerData?.transactionFeedback?.certificate && (
            <Box className={styles.feedback_banner}>
              <Box className={styles.certificate_box}>
                <Box>
                  <Typography variant="p5" component={"div"}>
                    Certificate No:
                  </Typography>
                  <Typography variant="s1" component={"div"}>
                    {customerData?.transactionFeedback?.certificate}
                  </Typography>
                </Box>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  className={styles.icon_box}
                  onClick={(e) => handleDownload(e, customerData?.transactionFeedback)}>
                  <img src={DownloadIcon} alt="download" />
                </IconButton>
              </Box>
              <Box className={styles.buttonBox}>
                <PrimaryButton onClick={viewFeedbackHandler}>View Feedback</PrimaryButton>
                <Typography variant="p5" sx={{ textAlign: "center" }} component={"div"}>
                  Submitted on:{" "}
                  {customerData?.transactionFeedback?.completedAt
                    ? dateMonthFormat(customerData?.transactionFeedback?.completedAt, "DD/MM/YYYY")
                    : ""}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
      <FeedbackPopup feedbackData={feedbackData} />
    </Box>
  )
}

export default CustomerSection
