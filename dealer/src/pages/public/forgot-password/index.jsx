import React, { useState, useEffect } from "react"
import { Typography, Grid, Box, InputLabel, InputAdornment } from "@mui/material"
import Stack from "@mui/material/Stack"
import { Formik } from "formik"
import { useStyles } from "../commonStyles"
import { FPValidator } from "helpers/validators/forgotPassword"
import InputField from "components/utitlities-components/InputField/InputField"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { coreAppActions } from "redux/store"
import { AuthService } from "network/authService"
import Toast from "components/utitlities-components/Toast/Toast"
import ErrorText from "components/utitlities-components/InputField/ErrorText"
import LogoContainer from "../login/LogoContainer"
import AppLoader from "components/Loader/AppLoader"

function ForgotPassword() {
  const styles = useStyles()
  const [showInputBox, setShowInputBox] = useState(false) // added state variable for input box
  const [disableButton, setDisableButton] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [initialValues, setInitalValues] = useState(null)
  const [reloadFlag, setReloadFlag] = useState(false)
  const dispatch = useDispatch()
  useEffect(() => {
    setInitalValues(FPValidator.initialValues)
  }, [reloadFlag])

  const navigate = useNavigate()
  const emailPayload = useSelector((state) => state?.app?.resetPassword)

  const handleTimerClosure = () => {
    let timer
    return () => {
      // clear any old time intervals
      clearInterval(timer)
      setResendDisabled(true)
      setSeconds(30)
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1)
      }, 1000)

      setTimeout(() => {
        clearInterval(timer)
        setResendDisabled(false)
        setSeconds(0)
      }, 30000)
    }
  }
  const handleTimer = handleTimerClosure()

  const handleOnSubmit = async (values) => {
    const payLoad = { email: values.email, app: "DEALER" }
    setResendDisabled(true)
    dispatch(coreAppActions.setResetPassword(values))
    if (values.verificationCode) {
      payLoad.verificationCode = values.verificationCode
      await otpVerify(payLoad)
    } else {
      await sentOtpCode(payLoad)
    }
  }

  const handleResend = async () => {
    if (emailPayload?.email) {
      handleTimer()
      const payLoad = {
        email: emailPayload?.email,
        app: "DEALER"
      }
      await sentOtpCode(payLoad)
    }
  }

  const sentOtpCode = async (payLoad) => {
    setLoading(true)
    const response = await AuthService.forgetPassword(payLoad)
    if (response.success && response.code === 200) {
      handleTimer()
      Toast.showInfoToast(`${response?.message}`)
      setShowInputBox(true)
      setDisableButton(true)
      setLoading(false)
    } else {
      Toast.showErrorToast(`${response?.message}`)
      setLoading(false)
    }
  }
  const otpVerify = async (data) => {
    setLoading(true)
    try {
      const payLoad = {
        email: data.email,
        verification_code: data.verificationCode
      }
      const response = await AuthService.resetotpVerification(payLoad)
      if (response.success && response.code === 200) {
        payLoad.verification_code = response?.data?.code
        dispatch(coreAppActions.setResetPassword(payLoad))
        Toast.showInfoToast(`${response?.message}`)

        navigate("/auth/reset-password")
        setLoading(false)
      } else {
        Toast.showErrorToast(`${response?.message}`)
        setLoading(false)
      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error("error", error)
    }
  }

  const handleLoginNavigate = () => {
    navigate("/auth/login")
  }
  return (
    <Box sx={styles.container}>
      <LogoContainer label="Forgot Password" />
      <Stack sx={styles.form} spacing={2}>
        {initialValues && (
          <Formik
            validateOnMount
            initialValues={initialValues}
            validationSchema={FPValidator.validationSchema}
            enableReinitialize
            onSubmit={handleOnSubmit}>
            {({ isValid, handleSubmit, values, handleChange, handleBlur, touched, errors }) => (
              <React.Fragment>
                <form style={styles.formField}>
                  {!showInputBox && (
                    <Grid item xs={12}>
                      <InputLabel sx={styles.label} htmlFor="email">
                        Enter your email id to reset your password{" "}
                      </InputLabel>
                      <InputField
                        size="medium"
                        sx={styles.formField}
                        name="email"
                        label="Enter Email ID"
                        inputProps={{ style: { height: 25 } }}
                        InputLabelProps={{
                          style: { marginLeft: 4, marginBottom: 8 },
                          shrink: values.email
                        }}
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
                  )}
                  {showInputBox && (
                    <Grid item xs={12}>
                      <Grid
                        item
                        xs={12}
                        sx={{
                          display: "flex",
                          padding: "0.5rem"
                        }}>
                        <Typography sx={styles.otpmailText1}>We have send OTP to &nbsp;</Typography>
                        <Typography sx={styles.otpmailText}> {values.email}</Typography>
                      </Grid>
                      <Grid
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignContent: "space-around"
                        }}>
                        <InputField
                          size="medium"
                          sx={styles.formField}
                          name="verificationCode"
                          label="Enter OTP"
                          inputProps={{ style: { height: 25 } }}
                          value={values.verificationCode}
                          variant="filled"
                          onChange={(value) => {
                            handleChange(value)
                            setDisableButton(false)
                          }}
                          onBlur={handleBlur}
                          helperText={touched.verificationCode ? errors.verificationCode : ""}
                          error={touched.verificationCode && Boolean(errors.verificationCode)}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography
                                  sx={[
                                    { cursor: "pointer" },
                                    resendDisabled ? styles.disabled : ""
                                  ]}
                                  onClick={handleResend}
                                  color="primary"
                                  variant="p1">
                                  {seconds > 0 ? `Resend OTP (${seconds})` : "Resend"}
                                </Typography>
                              </InputAdornment>
                            ),
                            disableUnderline: true
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}
                  <Grid sx={styles.buttonContainer} item xs={12}>
                    <PrimaryButton
                      type="submit"
                      disabled={!isValid || disableButton}
                      variant="contained"
                      sx={styles.submitBtn}
                      size="large"
                      onClick={handleSubmit}>
                      Submit
                    </PrimaryButton>
                  </Grid>
                  {showInputBox && (
                    <Grid item xs={12} display={"flex"} justifyContent={"center"}>
                      <Typography
                        onClick={() => {
                          setShowInputBox(false)
                          setDisableButton(false)
                          setInitalValues({
                            email: ""
                          })
                          setReloadFlag((prev) => !prev)
                        }}
                        sx={styles.tryOtherEmailText}
                        color="primary"
                        variant="p1">
                        Try Another Email
                      </Typography>
                    </Grid>
                  )}
                </form>
              </React.Fragment>
            )}
          </Formik>
        )}
        <PrimaryButton
          type="submit"
          variant="contained"
          sx={styles.submitBtn}
          size="large"
          onClick={handleLoginNavigate}>
          Back To Login
        </PrimaryButton>
      </Stack>
      {loading && <AppLoader />}
    </Box>
  )
}

export default ForgotPassword
