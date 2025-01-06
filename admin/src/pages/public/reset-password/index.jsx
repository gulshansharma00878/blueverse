/* eslint-disable no-console */
import React, { useState } from "react"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { Formik } from "formik"
import { useStyles } from "../commonStyles"
import { ConfirmPasswordValidator } from "helpers/validators/confirmPassword"
import InputField from "components/utilities-components/InputField/InputField"
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import Toast from "components/utilities-components/Toast/Toast"
import { AuthService } from "network/authService"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { coreAppActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import LogoContainer from "../login/LogoContainer"
import ErrorText from "components/utilities-components/InputField/ErrorText"

const ResetPassword = () => {
  const styles = useStyles()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)

  const [showLoader, setShowLoader] = useState(false)
  const resetPasswordState = useSelector((state) => state.app.resetPassword)
  const [resetPasswordDone, setResetPasswordDone] = useState(false)
  const [resetPasswordScreen, setResetPasswordScreen] = useState(true)

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
    if (response.success && response.code === 200) {
      Toast.showInfoToast(`${response?.message}`)
      setResetPasswordDone(true)
      setResetPasswordScreen(false)
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
      dispatch(
        coreAppActions.setResetPassword({
          email: email,
          verification_code: verification_code
        })
      )
    }
  }

  function handleNavigate() {
    navigate("/auth/login")
  }
  return (
    <Box>
      {showLoader && <AppLoader />}
      {resetPasswordScreen && (
        <Box sx={styles.container}>
          <LogoContainer label="Reset Password" />
          <Stack sx={styles.form} spacing={2}>
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={styles.visibilityIcon}
                            aria-label="toggle password visibility"
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
                    value={values.password}
                    inputProps={{ style: { padding: "0rem 1rem" } }}
                    helperText={touched.password ? <ErrorText text={errors.password} /> : ""}
                    onPaste={(e) => {
                      e.preventDefault()
                      return false
                    }}
                    variant="filled"
                    onBlur={handleBlur}
                    placeholder="Enter new password"
                    error={touched.password && Boolean(errors.password)}
                    onChange={handleChange}
                    onCopy={(e) => {
                      e.preventDefault()
                      return false
                    }}
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                  />

                  <InputField
                    size="medium"
                    sx={styles.textField1}
                    name="confirmPassword"
                    inputProps={{ style: { padding: "0px 1rem" } }}
                    value={values.confirmPassword}
                    placeholder="Re enter Password"
                    variant="filled"
                    onBlur={handleBlur}
                    helperText={
                      touched.confirmPassword ? <ErrorText text={errors.confirmPassword} /> : ""
                    }
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    onChange={handleChange}
                    onPaste={(e) => {
                      e.preventDefault()
                      return false
                    }}
                    onCopy={(e) => {
                      e.preventDefault()
                      return false
                    }}
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
          <Stack sx={styles.logoContainer}>
            <LogoContainer label="" />
            <CheckCircleIcon sx={styles.checkCircleIcon} />
            <Typography variant="h6" color="text.main" sx={styles.textReset}>
              Your password has been reset
            </Typography>
            <PrimaryButton sx={styles.submitBtn} onClick={handleNavigate}>
              Login
            </PrimaryButton>
          </Stack>
        </Box>
      )}
    </Box>
  )
}

export default ResetPassword
