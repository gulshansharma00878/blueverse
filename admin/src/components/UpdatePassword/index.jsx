import React, { useState } from "react"
import {
  Box,
  Typography,
  OutlinedInput,
  Divider,
  Button,
  InputAdornment,
  IconButton
} from "@mui/material"
import "./UpdatePassword.scss"
import { Formik, Form, Field } from "formik"
import { PasswordFormValidator } from "helpers/validators/updatePasswordForm"
import { AuthService } from "network/authService"
import Toast from "components/utilities-components/Toast/Toast"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded"
import ErrorText from "components/utilities-components/InputField/ErrorText"
function UpdatePassword() {
  const [editable, setEditable] = useState(false)
  const [showOldPassword, setshowOldPassword] = useState(false)
  const [showNewPassword, setshowNewPassword] = useState(false)
  const [showConfPassword, setshowConfPassword] = useState(false)

  const handleOldPassword = () => {
    setshowOldPassword(!showOldPassword)
  }
  const handleNewPassword = () => {
    setshowNewPassword(!showNewPassword)
  }
  const handleConfPassword = () => {
    setshowConfPassword(!showConfPassword)
  }

  const handleMouseDownOldPassword = (event) => {
    event.preventDefault()
    setshowOldPassword(!showOldPassword)
  }
  const handleMouseDownNewPassword = (event) => {
    event.preventDefault()
    setshowNewPassword(!showNewPassword)
  }
  const handleMouseDownConfPassword = (event) => {
    event.preventDefault()
    setshowConfPassword(!showConfPassword)
  }

  const handleSubmit = async (data, { resetForm }) => {
    const payload = {
      old_password: data.currentpassword,
      new_password: data.newpassword
    }
    let updatePassword = await AuthService.updatePassword(payload)
    if (updatePassword.code === 200 && updatePassword.success === true) {
      Toast.showInfoToast(`${updatePassword?.message}`)
      resetForm()
    } else {
      Toast.showErrorToast(`${updatePassword?.message}`)
    }
    setEditable(false)
  }

  function handleCancel(formik) {
    formik.resetForm()
    setEditable(false)
  }
  return (
    <>
      <Box className="password_box_container">
        <Box className="name_container">Password</Box>
        <Formik
          initialValues={PasswordFormValidator.initialValues}
          validationSchema={PasswordFormValidator.validationSchema}
          onSubmit={handleSubmit}>
          {(formik) => {
            return (
              <Form onSubmit={formik.handleSubmit}>
                {editable && (
                  <>
                    <Box className="password_form_container">
                      <Box className="profile_wrapper">
                        <Box className="inner_wrapper">
                          <Box className="input_box">
                            <Typography variant="s1">Current Password</Typography>
                            <Field
                              as={OutlinedInput}
                              placeholder="Current Password"
                              name="currentpassword"
                              type={showOldPassword ? "text" : "password"}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleOldPassword}
                                    onMouseDown={handleMouseDownOldPassword}
                                    edge="end">
                                    {showOldPassword ? <Visibility /> : <VisibilityOff />}
                                  </IconButton>
                                </InputAdornment>
                              }
                            />
                            {formik.touched.currentpassword && formik.errors.currentpassword && (
                              <ErrorText text={formik.errors.currentpassword} />
                            )}
                          </Box>
                        </Box>
                        <Box className="inner_wrapper">
                          <Box className="input_box">
                            <Typography variant="s1">New Password</Typography>
                            <Field
                              as={OutlinedInput}
                              placeholder="New Password"
                              name="newpassword"
                              type={showNewPassword ? "text" : "password"}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleNewPassword}
                                    onMouseDown={handleMouseDownNewPassword}
                                    edge="end">
                                    {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                  </IconButton>
                                </InputAdornment>
                              }
                            />
                            {formik.touched.newpassword && formik.errors.newpassword && (
                              <ErrorText text={formik.errors.newpassword} />
                            )}
                          </Box>
                          <Box className="input_box">
                            <Typography variant="s1">Confirm Password</Typography>
                            <Field
                              as={OutlinedInput}
                              placeholder="Confirm Password"
                              name="repassword"
                              type={showConfPassword ? "text" : "password"}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleConfPassword}
                                    onMouseDown={handleMouseDownConfPassword}
                                    edge="end">
                                    {showConfPassword ? <Visibility /> : <VisibilityOff />}
                                  </IconButton>
                                </InputAdornment>
                              }
                            />
                            {formik.touched.repassword && formik.errors.repassword && (
                              <ErrorText text={formik.errors.repassword} />
                            )}
                          </Box>
                        </Box>
                        <Box className="inner_wrapper">
                          <Box className="inner_box">
                            <ErrorRoundedIcon color="primary" />
                            <Typography variant="p3" className="linediv">
                              A valid password must contain atleast one uppercase character, one
                              special character and one digit(0-9). Password length should be of
                              minimum 8 characters and maximum 32 characters.{" "}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box className="divider_container">
                      <Divider light />
                    </Box>
                  </>
                )}
                <Box className="button_container">
                  {!editable ? (
                    <Button
                      variant="outlined"
                      className="profile_editBtn"
                      onClick={() => setEditable(true)}>
                      Change Password
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        className="profile_editBtn"
                        onClick={() => handleCancel(formik)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        className="profile_editBtn"
                        color="primary"
                        type="submit">
                        Save Changes
                      </Button>
                    </>
                  )}
                </Box>
              </Form>
            )
          }}
        </Formik>
      </Box>
    </>
  )
}

export default UpdatePassword
