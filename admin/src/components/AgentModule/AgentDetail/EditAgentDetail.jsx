import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useStyles } from "./AgentDetailStyles"
import { agentValidator } from "helpers/validators/agentForm.js"
import { AgentService } from "network/agentService.js"
import Toast from "components/utilities-components/Toast/Toast"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { Grid } from "@mui/material"
import { Formik } from "formik"
import InputField from "components/utilities-components/InputField/InputField"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import { userDetail } from "hooks/state"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material"
import CommonFooter from "components/utilities-components/CommonFooter/index.jsx"

function EditAgentDetail() {
  const navigate = useNavigate()
  const styles = useStyles()
  const user = userDetail()
  const agentDetail = useSelector((state) => state.agent.agentDetail)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const initialValues = {
    name: "",
    email: "",
    contact: "",
    is_active: null
  }

  const editAgentDetail = async (payload) => {
    const params = [agentDetail?.userId]

    if (Object.keys(payload)?.length != 0) {
      const response = await AgentService.editAgent(payload, params)
      if (response.success && response.code === 200) {
        Toast.showInfoToast(response?.message)
        navigate(`/${user.role}/agent/list`)
      } else {
        Toast.showErrorToast(response?.message)
      }
    } else {
      Toast.showErrorToast("Please update at least one field before saving the form.")
    }
  }

  useEffect(() => {
    initialValues.name = agentDetail?.username
    initialValues.email = agentDetail?.email
    initialValues.contact = agentDetail?.phone || ""
    initialValues.is_active = agentDetail?.is_active
  }, [agentDetail])

  const ActionButtons = ({ values, handleSubmit }) => {
    return (
      <Grid sx={styles.editButtonBox} container item xs={12}>
        <SecondaryButton
          onClick={() => {
            navigate(`/${user.role}/agent/list`)
          }}
          type="cancel"
          variant="contained"
          // sx={styles.submitBtn}
          size="large">
          Cancel
        </SecondaryButton>
        <Grid style={{ marginLeft: "20px" }}>
          <PrimaryButton
            type="submit"
            disabled={!values?.email || !values?.name}
            variant="contained"
            // sx={styles.submitBtn}
            size="large"
            onClick={handleSubmit}>
            Update
          </PrimaryButton>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container>
      <CommonHeader backBtn heading="Create Agent Profile " />
      <Grid style={{ height: "calc(100vh - 164px)" }} sx={styles.inputBox} xs={12}>
        <Grid sx={styles.detailBox}>
          <Formik
            validateOnMount
            initialValues={initialValues}
            validationSchema={agentValidator.validationSchema}
            enableReinitialize
            onSubmit={(values) => {
              const payload = {
                ...(values.name != initialValues?.name && { username: values.name }),
                ...(values.email != initialValues?.email && { email: values.email }),
                ...(values.contact != initialValues?.contact && { phone: values.contact })
              }
              editAgentDetail(payload)
            }}>
            {({ handleSubmit, values, handleChange, handleBlur, touched, errors }) => (
              <React.Fragment>
                <form>
                  <Grid sx={styles.formikBox}>
                    <Grid item xs={12}>
                      <InputField
                        size="medium"
                        // sx={styles.formField}
                        name="name"
                        label="Agent Name*"
                        InputProps={{ disableUnderline: true }}
                        value={values.name}
                        variant="filled"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText={touched.name ? errors.name : ""}
                        error={touched.name && Boolean(errors.name)}
                        type="email"
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InputField
                        size="medium"
                        // sx={styles.formField}
                        name="email"
                        label="Email Address*"
                        InputProps={{ disableUnderline: true }}
                        value={values.email}
                        variant="filled"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText={touched.email ? errors.email : ""}
                        error={touched.email && Boolean(errors.email)}
                        type="email"
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InputField
                        size="medium"
                        // sx={styles.formField}
                        name="contact"
                        label="Phone Number"
                        InputProps={{ disableUnderline: true }}
                        value={values.contact}
                        variant="filled"
                        onChange={handleChange}
                        helperText={touched.contact ? errors.contact : ""}
                        error={touched.contact && Boolean(errors.contact)}
                        onBlur={handleBlur}
                        type="contact"
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                  {isMobile ? (
                    <CommonFooter>
                      <ActionButtons handleSubmit={handleSubmit} values={values} />
                    </CommonFooter>
                  ) : (
                    <ActionButtons handleSubmit={handleSubmit} values={values} />
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

export default EditAgentDetail
