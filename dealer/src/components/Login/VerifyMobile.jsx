import React, { useState } from "react"
import { Box, Grid, IconButton, Typography } from "@mui/material"
import Logo from "assets/images/Logo/Logo.webp"
import { coreAppActions } from "redux/store"
import { Formik } from "formik"
import { PhoneValidator } from "helpers/validators/phoneValidator"
import InputField from "components/utitlities-components/InputField/InputField"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import { useStyles } from "./verifyMobileStyles"
import { AuthService } from "network/authService"
import { useCookies } from "react-cookie"
import { CookieKeys, CookieOptions } from "constants/cookieKeys"
import Toast from "components/utitlities-components/Toast/Toast"
import { decodeToken } from "react-jwt"
import { useDispatch } from "react-redux"
import CloseIcon from "@mui/icons-material/Close"

const VerifyMobile = (props) => {
  const { email } = props

  const dispatch = useDispatch()
  const [mobileSent, setMobileSent] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [mobileNumber, setMobileNumber] = useState()
  const styles = useStyles()

  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie] = useCookies(["auth-token"])

  const verifyMObile = (values) => {
    !mobileSent ? sendOtp(values) : handleLogin(values)
  }
  const handleOtp = (values) => {
    const data = { mobile: values }
    sendOtp(data)
  }

  const sendOtp = async (values) => {
    const payLoad = {
      email: email,
      phone: values.mobile
    }
    setMobileNumber(values.mobile)
    const response = await AuthService.sendOtp(payLoad)
    if (response.success && response.code === 200) {
      setMobileSent(true)
      handleTimer()
      Toast.showInfoToast(`${response?.message}`)
    } else {
      setMobileSent(false)
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  const handleLogin = async (values) => {
    if (!values.verificationCode) {
      Toast.showErrorToast(`OTP is required`)
    } else {
      const payLoad = {
        email: email,
        otp: values.verificationCode,
        app: "DEALER"
      }
      const response = await AuthService.otpVerification(payLoad)
      if (response.success && response.code === 200) {
        setMobileSent(false)
        let token = response?.data?.user?.token
        setCookie(CookieKeys.Auth, token?.split(" ")[1], CookieOptions)
        const decodedUser = decodeToken(token)
        dispatch(
          coreAppActions.login({
            user: decodedUser,
            authToken: token
          })
        )
        dispatch(coreAppActions.updatePopupModal(false))
        Toast.showInfoToast(`${response?.message}`)
      } else {
        Toast.showErrorToast(`${response?.message}`)
      }
    }
  }
  const tryAnother = (resetForm) => {
    resetForm()
    setMobileSent(false)
  }

  const handleResend = async () => {
    handleTimer()
    const payLoad = {
      email: email,
      phone: mobileNumber
    }
    const response = await AuthService.sendOtp(payLoad)
    if (response.success && response.code === 200) {
      Toast.showInfoToast(`${response?.message}`)
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }

  const handleTimer = () => {
    setDisabled(true)
    setSeconds(30)
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1)
    }, 1000)

    setTimeout(() => {
      clearInterval(timer)
      setDisabled(false)
      setSeconds(0)
    }, 30000)
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  return (
    <>
      <Box className="close_header">
        <IconButton onClick={handleClose}>
          <CloseIcon color="primary" />
        </IconButton>
      </Box>
      <Grid container sx={[styles.container]}>
        <Grid item xs={12} sx={[styles.display, styles.alignCenter, styles.justifyCenter]}>
          <img src={Logo} width={100} />
        </Grid>
        <Grid sx={[styles.commonMarginTop, styles.textAlignCenter]} item xs={12}>
          <Typography variant="s1" className={"line_div"} component="div">
            User Verification
          </Typography>
        </Grid>
        <Grid sx={[styles.commonMarginTop, styles.textAlignCenter]} item xs={12}>
          <Typography variant="s1" component="div" style={styles?.grayText}>
            {!mobileSent
              ? "Please Enter Your Mobile No To Receive OTP"
              : "We have Sent OTP to Your Mobile Number"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Formik
            initialValues={PhoneValidator?.initialValues}
            validationSchema={PhoneValidator.validationSchema}
            onSubmit={verifyMObile}>
            {({
              isValid,
              handleSubmit,
              values,
              handleChange,
              handleBlur,
              touched,
              errors,
              resetForm
            }) => {
              return (
                <>
                  <form>
                    <Grid item xs={12} sx={[styles.commonMarginTop, styles.textAlignCenter]}>
                      {!mobileSent && (
                        <InputField
                          size="medium"
                          name="mobile"
                          label="Enter Mobile Number"
                          InputProps={{ disableUnderline: true }}
                          value={values.mobile}
                          variant="filled"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          helperText={touched.mobile ? errors.mobile : ""}
                          error={touched.mobile && Boolean(errors.mobile)}
                          type="tel"
                          fullWidth
                          margin="normal"
                        />
                      )}
                      {mobileSent && (
                        <InputField
                          size="medium"
                          name="verificationCode"
                          label="Enter OTP"
                          value={values.verificationCode}
                          variant="filled"
                          onChange={(value) => handleChange(value)}
                          onBlur={handleBlur}
                          helperText={touched.verificationCode ? errors.verificationCode : ""}
                          error={touched.verificationCode && Boolean(errors.verificationCode)}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            disableUnderline: true
                          }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={mobileSent ? 6 : 12} md={mobileSent ? 6 : 12}>
                          {mobileSent ? (
                            <PrimaryButton
                              type="submit"
                              onClick={handleSubmit}
                              disabled={!isValid}
                              style={{ ...styles.fullWidth, ...styles.commonMarginTop }}>
                              {" "}
                              {"Confirm OTP"}
                            </PrimaryButton>
                          ) : (
                            <PrimaryButton
                              onClick={() => handleOtp(values?.mobile)}
                              disabled={errors.mobile}
                              style={{ ...styles.fullWidth, ...styles.commonMarginTop }}>
                              {" "}
                              {"Send OTP"}
                            </PrimaryButton>
                          )}
                        </Grid>
                        {mobileSent && (
                          <Grid item xs={6} md={6}>
                            <PrimaryButton
                              type="submit"
                              onClick={handleResend}
                              disabled={disabled}
                              style={{ ...styles.fullWidth, ...styles.commonMarginTop }}>
                              {" "}
                              {seconds > 0 ? `Resend OTP (${seconds})` : "Resend OTP"}
                            </PrimaryButton>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                    {mobileSent && (
                      <Grid
                        item
                        xs={12}
                        sx={[styles.display, styles.alignCenter, styles.justifyCenter]}>
                        <Typography
                          onClick={() => tryAnother(resetForm)}
                          style={{ ...styles.tryAnotherText, ...styles.commonMarginTop }}>
                          Try Another Mobile Number
                        </Typography>
                      </Grid>
                    )}
                  </form>
                </>
              )
            }}
          </Formik>
        </Grid>
      </Grid>
    </>
  )
}

export default VerifyMobile
