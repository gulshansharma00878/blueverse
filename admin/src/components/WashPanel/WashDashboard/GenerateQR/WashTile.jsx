import PrimaryButton from "components/utilities-components/Button/CommonButton"
import React from "react"
// import Edit from "assets/images/washType/edit.webp"
import Edit from "assets/images/washType/edit.webp"
import ButtonBarcode from "assets/images/washType/ButtonBarcode.webp"
import Barcodee from "assets/images/washType/BarCodee.webp"
import "./washTile.scss"
import { Typography, Box } from "@mui/material"
import { useStyles } from "./completedFeedback"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import { useDispatch } from "react-redux"
import { coreAppActions, washActions } from "redux/store"
import WashTypeFlag from "components/utilities-components/WashTypeFlag"
import moment from "moment"
const WashTile = (props) => {
  const { type, item } = props
  const dispatch = useDispatch()
  const handleModal = (value, key, tileData) => {
    dispatch(coreAppActions?.updatePopupModal(value))
    dispatch(washActions?.setPopupModalName(key))
    dispatch(washActions?.setIsEditable(false))
    dispatch(washActions?.setTileDetails(tileData))
  }
  const handleCrudForm = (value, key, customerData) => {
    dispatch(coreAppActions?.updatePopupModal(value))
    dispatch(washActions?.setPopupModalName(key))
    dispatch(washActions?.setIsEditable(true))
    dispatch(washActions.setUserDetails(customerData))
  }
  const style = useStyles()

  const dateFormat = (date) => {
    if (date) {
      let format_date = moment(date).format("MMMM DD, h:mm A")
      return format_date
    }
    return null
  }
  return (
    <>
      {type == "GenerateQR" && (
        <div className="wash_box_container">
          <WashTypeFlag rightPosition={false} withWash={false} washType={item?.transactionType} />
          <div className="text_container">
            <Typography sx={style.textStyle}>{item?.SkuNumber}</Typography>
            <Typography sx={style.washTime}>
              Wash Time : <span className="time">{dateFormat(item?.WashTime)}</span>
            </Typography>
          </div>
          <div className="btn_container ">
            <PrimaryButton
              height="44px"
              width="100%"
              onClick={handleModal.bind(null, true, "DetailsForm", item)}
              className="btn_style">
              Generate QR Code
            </PrimaryButton>
          </div>
        </div>
      )}
      {type == "captureFeedback" && (
        <div className="cf_box_container">
          <div className="cf_box_container_child">
            <WashTypeFlag rightPosition={false} withWash={false} washType={item?.transactionType} />

            <div>
              <Typography className="cf_skuNumber">{item?.skuNumber}</Typography>
            </div>
            <div
              style={{ padding: "5px" }}
              onClick={handleCrudForm.bind(null, true, "DetailsForm", item)}>
              <img className="cusror-pointer " src={Edit} alt="edit logo" />
            </div>
          </div>
          <div className="hrsp_container">
            <Typography className="hrsp_text" sx={style.hrsp_text}>
              {item?.hsrpNumber}
            </Typography>
            <Box className="icon_box">
              {item?.isProfileCompleted ? (
                <CheckCircleIcon fontSize="large" sx={{ color: "#94DD60" }} />
              ) : (
                <ErrorOutlineOutlinedIcon fontSize="large" sx={{ color: "#FF8086" }} />
              )}
            </Box>
          </div>
          <div className="name_box">
            <Typography sx={style.customer_name}>
              {item?.name}, {item?.phone}
            </Typography>
          </div>
          <div className="bike_box">
            <Typography sx={style.vechile_name}>
              {item?.manufacturer} {item?.bikeModel}
            </Typography>
          </div>
          <div className="generated_container">
            <div className="generated_container_2">
              <Typography sx={style.generated_text}>
                Generated on: {dateFormat(item?.createdAt)}
              </Typography>
            </div>
          </div>
          <div className="capture_feedback_container">
            <PrimaryButton
              className="btnStyle"
              height="44px"
              width="100%"
              onClick={handleCrudForm.bind(null, true, "QRCodeCard", item)}>
              <img src={ButtonBarcode} alt="btn" className="btn_barcode" />
              Capture Feedback
            </PrimaryButton>
          </div>
        </div>
      )}
      {type == "feedbackCompleted" && (
        <div className="feedback_container">
          <div className="feedback_container_child">
            <WashTypeFlag rightPosition={false} withWash={false} washType={item?.transactionType} />
            <div>
              <Typography sx={style.sku_heading}>{item?.skuNumber}</Typography>
            </div>
          </div>
          <div className="vechileNumber">
            <Typography sx={style.vechileNumber_text}>{item?.hsrpNumber}</Typography>
          </div>
          <div>
            <Typography sx={style.fc_customer_name}>{item?.name}</Typography>
          </div>
          <div>
            <Typography sx={style.fc_wash_time}>
              Wash Time:<span className="fc_date"> {dateFormat(item?.updatedAt)}</span>
            </Typography>
          </div>
          <div className="fc_barcode_container">
            <div className="fc_barcode_container2">
              <img src={Barcodee} alt="barcode" />
            </div>
            <div>
              <Typography sx={style.fc_generated_text}>Generated on</Typography>
              <Typography sx={style.fc_date_text}>{dateFormat(item?.createdAt)} </Typography>
              <Typography sx={style.fc_generated_text}>Submitted on</Typography>
              <Typography sx={style.fc_date_text}>{dateFormat(item?.completedAt)}</Typography>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default WashTile
