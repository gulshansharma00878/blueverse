// This form will enable agent to fill in customer details.
import React, { useEffect } from "react"
import { Formik } from "formik"
import { useDispatch, useSelector } from "react-redux"
import { washActions } from "redux/store"
import { FormValidator } from "helpers/validators/detailForm"
import { Grid, Typography } from "@mui/material"
import InputField from "components/utilities-components/InputField/InputField"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import ModalHeader from "./ModalHeader/ModalHeader"
import Arrow from "assets/images/placeholders/submitArrow.svg"
import { WashService } from "network/washService"
import Toast from "components/utilities-components/Toast/Toast"
import { useStyles } from "./formStyles"
import Box from "@mui/system/Box"
import { FeedBackService } from "network/feedbackService"
import moment from "moment"
import ErrorText from "components/utilities-components/InputField/ErrorText"
const DetailsForm = ({ handleClose, isAbandoned, getAbandonedListing = () => {} }) => {
  const dispatch = useDispatch()
  const styles = useStyles()
  const isEditableForm = useSelector((state) => state.wash.isEditable)
  const tileDetails = useSelector((state) => state.wash.tileDetails)
  const customerInfo = useSelector((state) => state.wash.userDetails)
  let intialEditableValue = {
    name: "",
    mobile: "",
    email: "",
    hsrpNumber: "",
    maufacturer: "",
    modal: ""
  }

  useEffect(() => {
    if (isEditableForm) {
      intialEditableValue.name = customerInfo?.name ? customerInfo?.name : ""
      intialEditableValue.mobile = customerInfo?.phone ? customerInfo?.phone : ""
      intialEditableValue.email = customerInfo?.emailId ? customerInfo?.emailId : ""
      intialEditableValue.hsrpNumber = customerInfo?.hsrpNumber ? customerInfo?.hsrpNumber : ""
      intialEditableValue.maufacturer = customerInfo?.manufacturer ? customerInfo?.manufacturer : ""
      intialEditableValue.modal = customerInfo?.bikeModel ? customerInfo?.bikeModel : ""
    }
  }, [isEditableForm])

  const generateQR = async (values) => {
    const payload = {
      email_id: values.email,
      phone: values.mobile,
      name: values.name,
      manufacturer: values.maufacturer,
      hsrp_number: values.hsrpNumber,
      bike_model: values.modal
    }
    if (isEditableForm) {
      const updatedValues = {}
      if (values.name !== intialEditableValue.name) {
        updatedValues.name = values.name
      }
      if (values.email !== intialEditableValue.email) {
        updatedValues.email_id = values.email
      }
      if (values.mobile !== intialEditableValue.mobile) {
        updatedValues.phone = values.mobile
      }
      if (values.maufacturer !== intialEditableValue.maufacturer) {
        updatedValues.manufacturer = values.maufacturer
      }
      if (values.modal !== intialEditableValue.modal) {
        updatedValues.bike_model = values.modal
      }
      let param = [customerInfo?.transactionFeedbackId]
      let editForm
      {
        isAbandoned
          ? (editForm = await FeedBackService.editFeedback(payload, param))
          : (editForm = await WashService.editGenerateFeedback(updatedValues, param))
      }
      if (editForm?.success && editForm?.code === 200) {
        Toast.showInfoToast(`${editForm?.message}`)
        if (isAbandoned) {
          handleClose()
          getAbandonedListing()
        } else {
          payload.skuNumber = customerInfo?.skuNumber
          payload.transactionType = customerInfo?.transactionType
          payload.createdAt = customerInfo?.createdAt
          dispatch(washActions.setUserDetails(payload))
          dispatch(washActions?.setTileUpdateCounter())
          dispatch(washActions.setPopupModalName("QRCodeCard"))
        }
      } else {
        Toast.showErrorToast(`${editForm?.message}`)
      }
    } else {
      payload.transaction_guid = tileDetails?.transactionGuid
      payload.transactionType = tileDetails?.transactionType
      const response = await WashService.generateFeedback(payload)
      if (response?.success && response?.code === 200) {
        payload.skuNumber = tileDetails.SkuNumber
        payload.createdAt = moment().format()
        Toast.showInfoToast(`${response?.message}`)
        dispatch(washActions.setUserDetails(payload))
        dispatch(washActions?.setTileUpdateCounter())
        dispatch(washActions.setPopupModalName("QRCodeCard"))
      } else {
        Toast.showErrorToast(`${response?.message}`)
      }
    }
  }
  return (
    <Box>
      <ModalHeader title="Enter Customer Details" handleClose={handleClose} />
      <Box sx={styles.formDisplay}>
        <Formik
          validateOnMount
          initialValues={isEditableForm ? intialEditableValue : FormValidator.initialValues}
          validationSchema={FormValidator.validationSchema}
          onSubmit={generateQR}>
          {({ isValid, handleSubmit, values, handleChange, handleBlur, touched, errors }) => (
            <>
              <form>
                <Grid container justifyContent="center">
                  <Grid item xs={12}>
                    <InputField
                      size="medium"
                      name="name"
                      label="Customer Name*"
                      InputProps={{ disableUnderline: true }}
                      // disabled={isEditableForm}
                      value={values.name}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.name ? <ErrorText text={errors.name} /> : ""}
                      error={touched.name && Boolean(errors.name)}
                      type="email"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {" "}
                    <InputField
                      size="medium"
                      name="mobile"
                      label="Phone Number"
                      InputProps={{ disableUnderline: true }}
                      value={values.mobile}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.mobile ? <ErrorText text={errors.mobile} /> : ""}
                      error={touched.mobile && Boolean(errors.mobile)}
                      type="tel"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InputField
                      size="medium"
                      name="email"
                      label="Email Id"
                      InputProps={{ disableUnderline: true }}
                      value={values.email}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.email ? <ErrorText text={errors.email} /> : ""}
                      error={touched.email && Boolean(errors.email)}
                      type="email"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <InputField
                      size="medium"
                      name="hsrpNumber"
                      label="HSRP Number*"
                      disabled={isEditableForm}
                      InputProps={{ disableUnderline: true }}
                      value={values.hsrpNumber}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.hsrpNumber ? <ErrorText text={errors.hsrpNumber} /> : ""}
                      error={touched.hsrpNumber && Boolean(errors.hsrpNumber)}
                      type="text"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sx={styles.bikeBox}>
                    <div style={{ width: "3.3rem" }}>
                      <Typography sx={styles?.span}>Bike</Typography>
                    </div>
                    <Box sx={styles.formInputBox}>
                      <InputField
                        size="medium"
                        name="maufacturer"
                        label="Manufacturer"
                        InputProps={{ disableUnderline: true }}
                        value={values.maufacturer}
                        variant="filled"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText={
                          touched.maufacturer ? <ErrorText text={errors.maufacturer} /> : ""
                        }
                        error={touched.maufacturer && Boolean(errors.maufacturer)}
                        type="text"
                        fullWidth
                        margin="normal"
                      />
                    </Box>
                    <Box sx={styles.formInputBox}>
                      <InputField
                        size="medium"
                        name="modal"
                        label="Model"
                        InputProps={{ disableUnderline: true }}
                        value={values.modal}
                        variant="filled"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText={touched.modal ? <ErrorText text={errors.modal} /> : ""}
                        error={touched.modal && Boolean(errors.modal)}
                        type="text"
                        fullWidth
                        margin="normal"
                      />
                    </Box>
                  </Grid>
                  <PrimaryButton
                    type="submit"
                    disabled={!isValid || !values?.name || !values?.hsrpNumber}
                    variant="contained"
                    // sx={style.submitBtn}
                    sx={styles?.btns}
                    size="large"
                    onClick={handleSubmit}
                    // loadingPosition="start"
                  >
                    {isAbandoned ? (
                      "Update Customer Info"
                    ) : (
                      <>
                        Generate QR Code <img src={Arrow} style={styles?.image} alt="" />
                      </>
                    )}
                  </PrimaryButton>
                </Grid>
              </form>
            </>
          )}
        </Formik>
      </Box>
    </Box>
  )
}

export default DetailsForm
