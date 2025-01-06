import React, { useState } from "react"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { Formik, Field } from "formik"
import { useStyles } from "../commonStyles"
import { useCookies } from "react-cookie"
import { useNavigate, Link } from "react-router-dom"
import { LoginValidator } from "helpers/validators/login"
import { CookieKeys, CookieOptions } from "constants/cookieKeys"
import { AuthService } from "network/authService"
import Toast from "components/utilities-components/Toast/Toast"
import InputField from "components/utilities-components/InputField/InputField"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { decodeToken } from "react-jwt"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import "./login.scss"
import LogoContainer from "./LogoContainer"
import ErrorText from "components/utilities-components/InputField/ErrorText"

const Login = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  //All useStates ======>
  const [showPassword, setShowPassword] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [cookies, setCookie] = useCookies(["auth-token"])

  const navigate = useNavigate()
  // All use Effects=======>

  const togglePasswordVisiblity = () => {
    setShowPassword((prev) => !prev)
  }
  // All API calls========>
  const userLogin = async (values) => {
    setLoading(true)
    const payLoad = {
      email: values.email,
      password: values.password,
      app: "ADMIN"
    }
    setShowLoader(true)
    const response = await AuthService.loginByEmail(payLoad)
    setShowLoader(false)

    if (response.success) {
      let userData = {}
      let token = response?.data?.user?.token
      setCookie(CookieKeys.Auth, token.split(" ")[1], CookieOptions)
      const decodedUser = decodeToken(token)
      userData = response?.data?.user
      userData.email = decodedUser?.email
      userData.userId = decodedUser?.userId
      dispatch(
        coreAppActions.login({
          user: userData,
          authToken: token
        })
      )
      notificationEnable()

      Toast.showInfoToast(`${response?.message}`)
      setLoading(false)
    } else {
      Toast.showErrorToast(`${response?.message}`)
      setLoading(false)
    }
  }
  const notificationEnable = async () => {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      dispatch(coreAppActions.setToken(true))
    } else {
      dispatch(coreAppActions.setToken(false))
    }
  }

  return (
    <Box sx={styles.container}>
      <LogoContainer label="Enter Your Login Credentials" />
      <Stack sx={styles.form} container spacing={2}>
        {loading && <AppLoader />}
        <Formik
          validateOnMount
          initialValues={LoginValidator.initialValues}
          validationSchema={LoginValidator.validationSchema}
          onSubmit={userLogin}>
          {({ isValid, handleSubmit, values, handleChange, handleBlur, touched, errors }) => (
            <>
              <form style={styles.formField}>
                <InputField
                  size="medium"
                  sx={{ marginTop: "0rem" }}
                  name="email"
                  label="Email Id"
                  InputProps={{ disableUnderline: true, style: { fontSize: "1.6rem" } }}
                  // InputLabelProps={{ fontSize: "1.6rem", style:{pa} }}
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

                <InputField
                  size="medium"
                  name="password"
                  value={values.password}
                  label="Password"
                  variant="filled"
                  onBlur={handleBlur}
                  helperText={touched.password ? <ErrorText text={errors.password} /> : null}
                  error={touched.password && Boolean(errors.password)}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          className="visibilityIcon"
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
                          sx={{ cursor: "pointer" }}
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
    </Box>
  )
}

export default Login
