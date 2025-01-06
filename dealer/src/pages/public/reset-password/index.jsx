/* eslint-disable no-console */
import React, { useState } from "react"
import { Typography, Grid, Box, InputAdornment, IconButton, Stack } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { Formik } from "formik"
import { useStyles } from "../commonStyles"
import { ConfirmPasswordValidator } from "helpers/validators/confirmPassword"
import logo from "assets/images/Logo/Logo.webp"
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useNavigate } from "react-router-dom"
import InputField from "components/utitlities-components/InputField/InputField"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import { useDispatch, useSelector } from "react-redux"
import { coreAppActions } from "redux/store"
import { AuthService } from "network/authService"
import Toast from "components/utitlities-components/Toast/Toast"
import LogoContainer from "../login/LogoContainer"
import ErrorText from "components/utitlities-components/InputField/ErrorText"

const ResetPassword = () => {
  const styles = useStyles()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const resetPasswordState = useSelector((state) => state.app.resetPassword)
  const [showPassword, setShowPassword] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [resetPasswordDone, setResetPasswordDone] = useState(false)
  const togglePasswordVisiblity = () => {
    setShowPassword((prev) => !prev)
  }

  const checkPassword = async (value) => {
    const { email, verification_code } = resetPasswordState
    const payLoad = {
      new_password: value.password,
      email: email,
      verification_code: verification_code
    }
    setShowLoader(true)
    const response = await AuthService.resetPassword(payLoad)
    if (response.success) {
      Toast.showInfoToast(`${response?.message}`)
      setResetPasswordDone(true)
      setShowLoader(false)
      dispatch(
        coreAppActions.setResetPassword({
          email: "",
          verification_code: ""
        })
      )
    } else {
      setShowLoader(false)
      Toast.showErrorToast(`${response?.message}`)
      navigate("/auth/forgot-password")
      dispatch(
        coreAppActions.setResetPassword({
          email: "",
          verification_code: ""
        })
      )
    }
  }

  function handleNavigate() {
    navigate("/auth/login")
  }

  return (
    <Box>
      {!resetPasswordDone && (
        <Box sx={styles.container}>
          <LogoContainer label="Reset Password" />
          <Stack sx={styles.form} container spacing={2}>
            <Formik
              validateOnMount
              initialValues={ConfirmPasswordValidator.initialValues}
              validationSchema={ConfirmPasswordValidator.validationSchema}
              onSubmit={checkPassword}>
              {({ isValid, values, handleChange, handleBlur, touched, errors, handleSubmit }) => (
                <React.Fragment>
                  <InputField
                    size="medium"
                    sx={{ marginTop: "0rem" }}
                    name="password"
                    value={values.password}
                    label="Enter new password"
                    variant="filled"
                    onBlur={handleBlur}
                    helperText={touched.password ? <ErrorText text={errors.password} /> : ""}
                    error={touched.password && Boolean(errors.password)}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            sx={styles.visibilityIcon}
                            onClick={togglePasswordVisiblity}>
                            {showPassword ? (
                              <Visibility fontSize="large" color="primary" />
                            ) : (
                              <VisibilityOff fontSize="large" color="primary" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                      disableUnderline: true
                    }}
                    fullWidth
                    margin="normal"
                  />

                  <InputField
                    size="medium"
                    sx={{ marginTop: "0rem" }}
                    name="confirmPassword"
                    value={values.confirmPassword}
                    label="Re enter Password"
                    variant="filled"
                    onBlur={handleBlur}
                    helperText={
                      touched.confirmPassword ? <ErrorText text={errors.confirmPassword} /> : ""
                    }
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            sx={styles.visibilityIcon}
                            onClick={togglePasswordVisiblity}>
                            {showPassword ? (
                              <Visibility fontSize="large" color="primary" />
                            ) : (
                              <VisibilityOff fontSize="large" color="primary" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                      disableUnderline: true
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <Box sx={styles.bannerContainer}>
                    {!isValid ? (
                      <ErrorRoundedIcon fontSize="large" color="primary" />
                    ) : (
                      <CheckCircleRoundedIcon fontSize="large" color="primary" />
                    )}
                    <Typography sx={styles.bannerText}>
                      A valid password must contain atleast one uppercase character, one special
                      character and one digit(0-9). Password length should be of minimum 8
                      characters and maximum 32 characters.{" "}
                    </Typography>
                  </Box>

                  <PrimaryButton
                    type="submit"
                    disabled={!isValid || showLoader}
                    variant="contained"
                    onClick={handleSubmit}
                    sx={styles.submitBtn}>
                    Reset
                  </PrimaryButton>
                </React.Fragment>
              )}
            </Formik>
          </Stack>
        </Box>
      )}
      {resetPasswordDone && (
        <Box sx={styles.container}>
          <Grid sx={styles.logoContainer}>
            <div style={styles.display}>
              <img src={logo} alt="blueverse" style={styles.logo} />
            </div>
            <Grid item xs={12}>
              <Grid item xs={12} sx={styles.gridResetPasswordContainer}>
                <CheckCircleIcon sx={styles.checkCircleIcon} />
              </Grid>
              <Grid item xs={12} sx={styles.gridResetPasswordContainer}>
                <Typography sx={styles.textReset}>Your password has been reset</Typography>
              </Grid>
              <Grid item xs={12} sx={styles.gridResetPasswordContainer}>
                <PrimaryButton sx={styles.submitBtn} onClick={handleNavigate}>
                  Login
                </PrimaryButton>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default ResetPassword
