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
import styles from "./UpdatePassword.module.scss"
import { Formik, Form, Field } from "formik"
import { PasswordFormValidator } from "helpers/validators/updatePasswordForm"
import { AuthService } from "network/authService"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import Toast from "components/utitlities-components/Toast/Toast"
import ErrorText from "components/utitlities-components/InputField/ErrorText"

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
      <Box className={styles.password_box_container}>
        <Box className={styles.name_container}>Password</Box>
        <Formik
          initialValues={PasswordFormValidator.initialValues}
          validationSchema={PasswordFormValidator.validationSchema}
          onSubmit={handleSubmit}>
          {(formik) => {
            const isFormValid = formik.isValid && Object.keys(formik.touched).length > 0
            return (
              <Form onSubmit={formik.handleSubmit}>
                {console.log(formik)}
                {editable && (
                  <>
                    <Box className={styles.password_form_container}>
                      <Box className={styles.profile_wrapper}>
                        <Box className={styles.inner_wrapper}>
                          <Box className={styles.input_box}>
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
                            {formik.errors.currentpassword && (
                              <ErrorText text={formik.errors.currentpassword} />
                            )}
                          </Box>
                        </Box>
                        <Box className={styles.inner_wrapper}>
                          <Box className={styles.input_box}>
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
                            {formik?.touched?.newpassword && formik.errors.newpassword && (
                              <ErrorText text={formik.errors.newpassword} />
                            )}
                          </Box>
                          <Box className={styles.input_box}>
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
                            {formik?.touched?.repassword && formik.errors.repassword && (
                              <ErrorText text={formik.errors.repassword} />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box className={styles.divider_container}>
                      <Divider light />
                    </Box>
                  </>
                )}
                <Box className={styles.button_container}>
                  {!editable ? (
                    <Button
                      variant="outlined"
                      className={styles.profile_editBtn}
                      onClick={() => setEditable(true)}>
                      Change Password
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        className={styles.profile_editBtn}
                        onClick={() => handleCancel(formik)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        className={styles.profile_editBtn}
                        color="primary"
                        type="submit"
                        disabled={!isFormValid}>
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
