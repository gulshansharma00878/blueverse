// INFO : This component will render QR Code which user can scan and route to customer PWA
import { Grid, Typography, Box } from "@mui/material"
import WashDetialsCard from "components/Cards/WashDetailsCard/WashDetailsCard"
import CustomerDetailsCard from "components/Cards/CustomerDetailsCard/CustomerDetailsCard"
import ModalHeader from "./ModalHeader/ModalHeader"
import React from "react"
import { QRCodeSVG } from "qrcode.react"
import InfoIcon from "@mui/icons-material/Info"
import "./QRCodeCard.scss"
import { useSelector } from "react-redux"
import moment from "moment"

const QRCodeCard = ({ handleClose }) => {
  const customerInfo = useSelector((state) => state.wash.userDetails)
  const subTitle = "Your Wash has been completed!"
  const waterSavedText = `You have saved ${180} litres of water from this bike wash!`

  const dateFormat = (date) => {
    if (date) {
      let format_date = moment(date).format("MMMM DD, h:mm A")
      return format_date
    }
    return null
  }

  return (
    <Box>
      <ModalHeader
        title={`Congratulations ${customerInfo?.name}!`}
        subTitle={subTitle}
        waterSaved={waterSavedText}
        handleClose={handleClose}
      />
      <Grid container className="cardWrapper">
        <Grid item xs={12} className="details-box">
          <CustomerDetailsCard
            email={customerInfo?.emailId || customerInfo?.email_id}
            mobileNumber={customerInfo?.phone}
            name={customerInfo?.name}
          />
          <WashDetialsCard
            manufacturer={customerInfo?.manufacturer}
            bikeModel={customerInfo?.bike_model || customerInfo?.bikeModel}
            bikeNumber={customerInfo?.hsrp_number || customerInfo?.hsrpNumber}
            washType={customerInfo?.transactionType}
            generatedDate={dateFormat(customerInfo?.createdAt)}
          />
        </Grid>
        <Grid item xs={12}>
          <Box className="qr-box">
            <div className={`qrBorder`}>
              <QRCodeSVG
                value={`${process.env.REACT_APP_FEEDBACK_PWA_URL}/customer/${customerInfo?.skuNumber}`}
                size="18.4rem"
              />
            </div>
          </Box>
          <Box className="info-banner">
            <InfoIcon
              style={{ marginRight: "2px" }}
              sx={{ fontSize: 40 }}
              className="info-banner-icon"
            />
            <Typography style={{ marginLeft: "2px" }} variant="p1">
              Scan this QR code from your mobile to give your valuable feedback
            </Typography>
          </Box>
          <Box className="privacy-info-text">
            <Typography variant="p2" color="text.gray" sx={{ fontWeight: "400" }}>
              Your privacy is important to us. We promise to keep any personal information you
              provide confidential and use it only to improve our services. We won&apos;t share your
              information with third parties unless required by law and with your consent. By
              submitting feedback, you agree to our privacy policy. Contact us for any questions or
              concerns.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default QRCodeCard
