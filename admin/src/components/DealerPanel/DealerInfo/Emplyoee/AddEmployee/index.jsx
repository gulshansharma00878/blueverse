import React, { useEffect, useState } from "react"
import { Grid, Switch, Typography, useMediaQuery } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { useStyles } from "./AddEmployee.js"
import InputField from "components/utilities-components/InputField/InputField.js"
import { employeeValidator } from "helpers/validators/employeeForm.js"
import { Formik } from "formik"
import DropDown from "components/utilities-components/DropDown/DropDown.jsx"
import PrimaryButton from "components/utilities-components/Button/CommonButton.jsx"
import { DealerService } from "network/dealerService.js"
import Toast from "components/utilities-components/Toast/Toast.js"
import { useNavigate, useParams } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader.js"
import { userDetail } from "hooks/state"
import ErrorText from "components/utilities-components/InputField/ErrorText.jsx"
import CommonFooter from "components/utilities-components/CommonFooter/index.jsx"
import { dealerActions } from "redux/store.js"
import { useDispatch } from "react-redux"

const label = { inputProps: { "aria-label": "Switch demo" } }

function AddEmployee() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isResponsive = useMediaQuery("(max-width:900px)")
  const isMobile = useMediaQuery("(max-width:600px)")
  const user = userDetail()
  const styles = useStyles()
  const params = useParams()
  const [subRole, setSubRole] = useState()
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getRoleList()
  }, [])

  const getRoleList = async () => {
    setLoader(true)
    const response = await DealerService.getRoleList([`?dealerId=${params.dealerId}`])
    if (response.success && response.code === 200) {
      setSubRole(
        response?.data?.subRoles?.map((item) => {
          return { value: item?.subRoleId, label: item.name }
        })
      )
    }
    setLoader(false)
  }

  const handleSubmit = async (values) => {
    const payload = {
      username: values?.name,
      email: values?.email,
      ...(values.contact != "" && { phone: values?.contact }),
      parentUserId: params.dealerId,
      subRoleId: values?.role,
      isActive: values?.isActive
    }

    const response = await DealerService.addEmployee(payload)
    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(dealerActions.setDealerTabActive(1))
      navigate(`/${user.role}/dealer-detail/` + params?.dealerId)
    } else {
      Toast.showErrorToast(response?.message)
    }
  }

  const SubmitButton = ({ disabled, onClick }) => {
    return (
      <PrimaryButton
        onClick={onClick}
        disabled={disabled}
        type="submit"
        sx={{ width: { xs: "100%", sm: "22.9rem", height: "48px" } }}>
        Create
      </PrimaryButton>
    )
  }

  const handleBackNavigate = () => {
    dispatch(dealerActions.setDealerTabActive(1))
    navigate(-1)
  }
  return (
    <Grid container>
      <CommonHeader
        backBtn
        heading="Create Dealership’s Employee Profile"
        backBtnHandler={handleBackNavigate}
      />
      <Grid item container xs={12} sx={styles.outerBox}>
        <Formik
          validateOnMount
          initialValues={employeeValidator.initialValues}
          validationSchema={employeeValidator.validationSchema}
          enableReinitialize
          onSubmit={(values) => {
            handleSubmit(values)
          }}>
          {({ handleSubmit, isValid, values, handleChange, handleBlur, touched, errors }) => (
            <React.Fragment>
              <form
                style={{
                  width: "100%"
                }}>
                <Grid item gap={1} container>
                  <Grid item xs={12} md={5}>
                    <InputField
                      size="medium"
                      name="name"
                      label="Name*"
                      InputProps={{ disableUnderline: true }}
                      value={values.name}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="text"
                      fullWidth
                      margin="normal"
                    />
                    {touched.name && Boolean(errors.name) ? (
                      <ErrorText text={touched.name ? errors.name : ""} />
                    ) : null}
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <InputField
                      size="medium"
                      name="contact"
                      style={!isResponsive ? { marginLeft: "12px" } : null}
                      label="Phone Number"
                      InputProps={{ disableUnderline: true }}
                      value={values.contact}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="text"
                      fullWidth
                      margin="normal"
                    />
                    {touched.contact && Boolean(errors.contact) ? (
                      <ErrorText text={touched.contact ? errors.contact : ""} />
                    ) : null}
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <InputField
                      size="medium"
                      name="email"
                      label="Email ID*"
                      InputProps={{ disableUnderline: true }}
                      value={values.email}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="email"
                      fullWidth
                      margin="normal"
                    />
                    {touched.email && Boolean(errors.email) ? (
                      <ErrorText text={touched.email ? errors.email : ""} />
                    ) : null}
                  </Grid>
                  <Grid style={{ marginTop: "20px" }} item xs={12} md={12}>
                    <Typography sx={styles.status}>Status</Typography>
                    <Typography sx={styles.activeText}>
                      Active
                      <Switch
                        name="isActive"
                        checked={values?.isActive}
                        onChange={handleChange}
                        {...label}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={5} sx={styles.roleBox}>
                    <DropDown
                      label="Select Role"
                      fieldName="role"
                      onBlur={handleBlur}
                      showError={touched.role && Boolean(errors.role)}
                      helperText={touched.role ? errors?.role : ""}
                      value={values.role}
                      items={subRole}
                      handleChange={handleChange}
                    />
                  </Grid>
                  {isMobile ? (
                    <CommonFooter>
                      <SubmitButton onClick={handleSubmit} disabled={!isValid} />
                    </CommonFooter>
                  ) : (
                    <Grid justifyContent="flex-start" container item xs={12}>
                      <PrimaryButton
                        style={{ marginTop: "20px" }}
                        type="submit"
                        disabled={!isValid}
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}>
                        Create
                      </PrimaryButton>
                    </Grid>
                  )}
                </Grid>
              </form>
            </React.Fragment>
          )}
        </Formik>
      </Grid>
      {loader && <AppLoader />}
    </Grid>
  )
}

export default AddEmployee
