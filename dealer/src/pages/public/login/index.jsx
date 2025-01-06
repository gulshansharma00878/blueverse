import React, { useState, useEffect } from "react"
import { Typography, Grid, Box, InputAdornment, IconButton, Stack } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { Formik, Field } from "formik"
import { useStyles } from "../commonStyles"
import { useCookies } from "react-cookie"
import { useNavigate, Link } from "react-router-dom"
import { LoginValidator } from "helpers/validators/login"
import { CookieKeys, CookieOptions } from "constants/cookieKeys"
import { AuthService } from "network/authService"
import LogoContainer from "./LogoContainer"
import Toast from "components/utitlities-components/Toast/Toast"
import InputField from "components/utitlities-components/InputField/InputField"
import PrimaryButton from "components/utitlities-components/Button/CommonButton"
import PopupModal from "components/PopupModal"
import AppLoader from "components/Loader/AppLoader"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import VerifyMobile from "components/Login/VerifyMobile"
import { decodeToken } from "react-jwt"
import "./login.scss"
import ErrorText from "components/utitlities-components/InputField/ErrorText"
const Login = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  //All useStates ======>
  const [showPassword, setShowPassword] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(false)

  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie] = useCookies(["auth-token"])

  const navigate = useNavigate()
  // All use Effects=======>
  useEffect(() => {
    handlePopUpClose()
  }, [])
  const togglePasswordVisiblity = () => {
    setShowPassword((prev) => !prev)
  }
  // All API calls========>
  const userLogin = async (values) => {
    setLoading(true)
    const payLoad = {
      email: values.email,
      password: values.password,
      app: "DEALER"
    }
    setShowLoader(true)
    setEmail(values?.email)
    const response = await AuthService.loginByEmail(payLoad)
    setShowLoader(false)
    if (response.success) {
      requestNotificationPermission()
      response?.data?.user?.isKycDone
        ? directLogin(response)
        : dispatch(coreAppActions?.updatePopupModal(true))
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
    setLoading(false)
  }

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      dispatch(coreAppActions.setToken(true))
    } else {
      dispatch(coreAppActions.setToken(false))
    }
  }
  const directLogin = (response) => {
    let token = response?.data?.user?.token
    setCookie(CookieKeys.Auth, token.split(" ")[1], CookieOptions)
    const decodedUser = decodeToken(token)
    dispatch(
      coreAppActions.login({
        user: decodedUser,
        authToken: token,
        detail: response?.data?.user
      })
    )
    Toast.showInfoToast(`${response?.message}`)
  }

  const handlePopUpClose = () => {
    dispatch(coreAppActions?.updatePopupModal(false))
  }
  return (
    <Box sx={styles.container}>
      <LogoContainer label="Enter Your Login Credentials" />
      <Stack sx={styles.form} spacing={2}>
        <Formik
          validateOnMount
          initialValues={LoginValidator.initialValues}
          validationSchema={LoginValidator.validationSchema}
          onSubmit={userLogin}>
          {({ isValid, handleSubmit, values, handleChange, handleBlur, touched, errors }) => (
            <>
              <form style={styles.formField}>
                <Grid item xs={12}>
                  <InputField
                    size="medium"
                    sx={{ marginTop: "0rem" }}
                    name="email"
                    label="Email Id"
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
                </Grid>

                <Grid item xs={12}>
                  <InputField
                    size="medium"
                    sx={styles.textField1}
                    name="password"
                    value={values.password}
                    label="Password"
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
                            className="visibilityIcon"
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
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid container xs={12} justifyContent={"flex-end"}>
                  <Typography
                    onClick={() => navigate("/auth/forgot-password")}
                    sx={styles.forgotPassword}
                    variant="p1"
                    color="primary">
                    Forgot your password?
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <div style={styles.subTitle}>
                    <label className="termsAcceptance">
                      <Box className="checkboxContainer">
                        <Field
                          type="checkbox"
                          name="acceptTerms"
                          className={
                            "form-check-input" +
                            (errors.acceptTerms && touched.acceptTerms ? " is-invalid" : "")
                          }
                          label="Accept Terms and Conditions"
                          onBlur={handleBlur}
                          helpertext={touched.password ? errors.password : ""}
                          error={touched.acceptTerms && Boolean(errors.acceptTerms)}
                          onChange={handleChange}
                        />
                      </Box>
                      <Typography variant="p2">
                        By logging in, you agree to Blueverse{" "}
                        <Link to={"/terms"}>Terms of Use</Link> and{" "}
                        <Link to={"/privacy-policy"}>Privacy Policy</Link>
                      </Typography>
                      {/* &nbsp; {" "} */}{" "}
                    </label>
                    {touched.acceptTerms && errors.acceptTerms && (
                      <ErrorText text={errors.acceptTerms} />
                    )}
                  </div>
                </Grid>
                <PrimaryButton
                  type="submit"
                  disabled={!isValid || showLoader || !values?.acceptTerms}
                  variant="contained"
                  sx={styles.submitBtn}
                  size="large"
                  onClick={handleSubmit}
                  loading={showLoader}
                  loadingPosition="start">
                  Login
                </PrimaryButton>
              </form>
            </>
          )}
        </Formik>
      </Stack>
      <PopupModal handleClose={handlePopUpClose}>
        <VerifyMobile email={email} />
      </PopupModal>
      {loading && <AppLoader />}
    </Box>
  )
}

export default Login
