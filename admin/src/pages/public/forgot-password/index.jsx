import React, { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import InputAdornment from "@mui/material/InputAdornment"
import InputLabel from "@mui/material/InputLabel"
import Stack from "@mui/material/Stack"
import { Formik } from "formik"
import { useStyles } from "../commonStyles"
import { useNavigate } from "react-router-dom"
import { FPValidator } from "helpers/validators/forgotPassword"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { AuthService } from "network/authService"
import Toast from "components/utilities-components/Toast/Toast"
import { useDispatch, useSelector } from "react-redux"
import { coreAppActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { preventNonNumericalInput } from "helpers/Functions/preventNumericalInput"
import InputField from "components/utilities-components/InputField/InputField"
import LogoContainer from "../login/LogoContainer"
import ErrorText from "components/utilities-components/InputField/ErrorText"

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
    const payLoad = { email: values.email, app: "ADMIN" }
    setResendDisabled(true)
    dispatch(coreAppActions.setResetPassword(values))
    // handleTimer()
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
        app: "ADMIN"
      }
      await sentOtpCode(payLoad)
    }
  }

  const sentOtpCode = async (payLoad) => {
    setLoading(true)
    const response = await AuthService.forgetPassword(payLoad)
    if (response.success && response.code === 200) {
      handleTimer()
      Toast.showWarnToast(`${response?.message}`)
      setShowInputBox(true)
      setDisableButton(true)
      setLoading(false)
    } else {
      Toast.showErrorToast(`${response?.message}`)
      setLoading(false)
    }
  }
  const otpVerify = async (data) => {
    try {
      setLoading(true)
      const payLoad = {
        email: data.email,
        verification_code: data.verificationCode
      }
      const response = await AuthService.otpVerification(payLoad)
      if (response.success && response.code === 200) {
        payLoad.verification_code = response?.data?.code
        dispatch(coreAppActions.setResetPassword(payLoad))
        Toast.showInfoToast(`${response?.message}`)
        navigate("/auth/reset-password")
      } else {
        Toast.showErrorToast(`${response?.message}`)
        setResendDisabled(false)
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
        {loading && <AppLoader />}
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
                    <>
                      <InputLabel sx={styles.labelName} htmlFor="email">
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
                        InputProps={{
                          disableUnderline: true
                        }}
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
                    </>
                  )}
                  {showInputBox && (
                    <React.Fragment>
                      <Box sx={styles.label_box}>
                        <Typography sx={styles.otpmailText1}>We have send OTP to &nbsp;</Typography>
                        <Typography sx={styles.otpmailText}> {values.email}</Typography>
                      </Box>
                      <InputField
                        sx={styles.formField}
                        name="verificationCode"
                        placeholder="Enter OTP"
                        inputProps={{ style: { height: 25, padding: "0rem 1rem" }, maxLength: 6 }}
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
                        onKeyPress={(e) => preventNonNumericalInput(e)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography
                                sx={[{ cursor: "pointer" }, resendDisabled ? styles.disabled : ""]}
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
                    </React.Fragment>
                  )}
                  <Box sx={styles.buttonContainer}>
                    <PrimaryButton
                      type="submit"
                      disabled={
                        !showInputBox ? !isValid || disableButton : !values.verificationCode
                      }
                      variant="contained"
                      sx={styles.submitBtn}
                      size="large"
                      onClick={handleSubmit}>
                      Submit
                    </PrimaryButton>
                  </Box>
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
    </Box>
  )
}

export default ForgotPassword
