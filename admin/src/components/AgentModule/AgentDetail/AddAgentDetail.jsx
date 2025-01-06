import { Grid } from "@mui/material"
import PrimaryButton from "components/utilities-components/Button/CommonButton.jsx"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader.jsx"
import InputField from "components/utilities-components/InputField/InputField.js"
import Toast from "components/utilities-components/Toast/Toast.js"
import { Formik } from "formik"
import { agentValidator } from "helpers/validators/agentForm.js"
import { AgentService } from "network/agentService.js"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useStyles } from "./AgentDetailStyles.js"
import { userDetail } from "hooks/state"
import useMediaQuery from "@mui/material/useMediaQuery"
import CommonFooter from "components/utilities-components/CommonFooter/index.jsx"
import ErrorText from "components/utilities-components/InputField/ErrorText.jsx"

function AddAgentDetail() {
  const navigate = useNavigate()
  const styles = useStyles()
  const user = userDetail()
  const isMobile = useMediaQuery("(max-width:600px)")

  const addAgentDetail = async (payload) => {
    const response = await AgentService.addAgent(payload)
    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      navigate(`/${user.role}/agent/list`)
    } else {
      Toast.showErrorToast(response?.message)
    }
  }

  return (
    <Grid container>
      <CommonHeader heading="Create Agent Profile " backBtn />
      <Grid sx={styles.inputBox} xs={12}>
        <Grid sx={styles.detailBox}>
          <Formik
            initialValues={agentValidator.initialValues}
            validationSchema={agentValidator.validationSchema}
            validateOnMount
            enableReinitialize
            onSubmit={(values) => {
              const payload = {
                username: values?.name,
                email: values.email,
                ...(values.contact != "" && { phone: values?.contact }),
                is_active: true
              }
              addAgentDetail(payload)
            }}>
            {({ isValid, handleSubmit, values, handleChange, handleBlur, touched, errors }) => (
              <React.Fragment>
                <form>
                  <Grid sx={styles.formikBox}>
                    <Grid item xs={12}>
                      <InputField
                        size="medium"
                        name="name"
                        label="Agent Name*"
                        InputProps={{ disableUnderline: true }}
                        variant="filled"
                        value={values.name}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name ? <ErrorText text={errors.name} /> : ""}
                        fullWidth
                        type="text"
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InputField
                        name="email"
                        size="medium"
                        label="Email Address*"
                        value={values.email}
                        InputProps={{ disableUnderline: true }}
                        onChange={handleChange}
                        variant="filled"
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        type="email"
                        helperText={touched.email ? <ErrorText text={errors.email} /> : ""}
                        margin="normal"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InputField
                        size="medium"
                        name="contact"
                        label="Phone Number"
                        value={values.contact}
                        InputProps={{ disableUnderline: true }}
                        onChange={handleChange}
                        variant="filled"
                        error={touched.contact && Boolean(errors.contact)}
                        onBlur={handleBlur}
                        helperText={touched.contact ? <ErrorText text={errors.contact} /> : ""}
                        fullWidth
                        margin="normal"
                        type="contact"
                      />
                    </Grid>
                  </Grid>
                  {isMobile ? (
                    <CommonFooter>
                      <PrimaryButton
                        disabled={!isValid}
                        size="large"
                        variant="contained"
                        type="submit"
                        sx={{ width: "100%" }}
                        onClick={handleSubmit}>
                        Create Agent Profile
                      </PrimaryButton>
                    </CommonFooter>
                  ) : (
                    <Grid sx={styles.editButtonBox} item xs={12} container>
                      <Grid sx={styles.btnMobile} justifyContent="center" container item xs={12}>
                        <PrimaryButton
                          disabled={!isValid}
                          size="large"
                          variant="contained"
                          type="submit"
                          onClick={handleSubmit}>
                          Create Agent Profile
                        </PrimaryButton>
                      </Grid>
                    </Grid>
                  )}
                </form>
              </React.Fragment>
            )}
          </Formik>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default AddAgentDetail
