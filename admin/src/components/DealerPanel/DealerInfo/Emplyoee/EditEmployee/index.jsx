import React, { useEffect, useState } from "react"
import { Grid, Switch, Typography, useMediaQuery } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { useStyles } from "../AddEmployee/AddEmployee"
import InputField from "components/utilities-components/InputField/InputField.js"
import { employeeValidator } from "helpers/validators/employeeForm.js"
import { Formik } from "formik"
import DropDown from "components/utilities-components/DropDown/DropDown.jsx"
import PrimaryButton from "components/utilities-components/Button/CommonButton.jsx"
import { useLocation, useNavigate } from "react-router-dom"
import { DealerService } from "network/dealerService"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import CommonFooter from "components/utilities-components/CommonFooter"
import { dealerActions } from "redux/store"
import { useDispatch } from "react-redux"

const label = { inputProps: { "aria-label": "Switch demo" } }

function EditEmployee() {
  const styles = useStyles()
  const user = userDetail()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, dealerId } = location.state
  const isMobile = useMediaQuery("(max-width:600px)")
  const isResponsive = useMediaQuery("(max-width:900px)")

  const [subRole, setSubRole] = useState()
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    getRoleList()
  }, [])

  const initialValues = {
    name: data?.username || "",
    email: data?.email || "",
    contact: data?.phone || "",
    isActive: data?.isActive || false, // default to false if not set
    role: data?.subRoleId || ""
  }

  const getRoleList = async () => {
    setLoader(true)
    const response = await DealerService.getRoleList([`?dealerId=${dealerId}`])
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
      phone: values?.contact || null,
      subRoleId: values?.role,
      isActive: values?.isActive
    }

    const response = await DealerService.editEmployee(payload, [data?.userId])
    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      navigate(`/${user.role}/dealer-detail/` + dealerId)
    } else {
      Toast.showErrorToast(response?.message)
    }
  }

  const handleBackNavigate = () => {
    dispatch(dealerActions.setDealerTabActive(1))
    navigate(-1)
  }

  const SubmitButton = ({ onClick, disabled }) => {
    return (
      <PrimaryButton
        onClick={onClick}
        disabled={disabled}
        type="submit"
        sx={{ width: { xs: "100%", sm: "22.9rem", height: "48px" } }}>
        Update
      </PrimaryButton>
    )
  }

  return (
    <Grid container>
      <CommonHeader
        backBtn
        backBtnHandler={handleBackNavigate}
        heading="Update Dealership’s Employee Profile"
      />
      <Grid item container xs={12} sx={styles.outerBox}>
        <Formik
          validateOnMount
          initialValues={initialValues}
          validationSchema={employeeValidator.validationSchema}
          enableReinitialize
          onSubmit={(values) => {
            handleSubmit(values)
          }}>
          {({ handleChange, handleSubmit, values, handleBlur, touched, errors }) => (
            <React.Fragment>
              <form
                style={{
                  width: "100%"
                }}>
                <Grid item container>
                  <Grid item xs={12} md={5}>
                    <InputField
                      size="medium"
                      label="Name*"
                      name="name"
                      InputProps={{ disableUnderline: true }}
                      value={values.name}
                      variant="filled"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.name ? errors.name : ""}
                      error={touched.name && Boolean(errors.name)}
                      type="text"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <InputField
                      style={!isResponsive ? { marginLeft: "19px" } : null}
                      size="medium"
                      name="contact"
                      label="Phone Number"
                      value={values.contact}
                      onBlur={handleBlur}
                      variant="filled"
                      onChange={handleChange}
                      error={touched.contact && Boolean(errors.contact)}
                      helperText={!touched.contact ? "" : errors.contact}
                      type="text"
                      fullWidth
                      InputProps={{ disableUnderline: true }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <InputField
                      size="medium"
                      name="email"
                      label="Email ID*"
                      InputProps={{ disableUnderline: true }}
                      value={values.email}
                      onBlur={handleBlur}
                      variant="filled"
                      onChange={handleChange}
                      error={touched.email && Boolean(errors.email)}
                      helperText={!touched.email ? "" : errors.email}
                      type="email"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid style={{ marginTop: "20px" }} item xs={12} md={12}>
                    <Typography sx={styles.status}>Status</Typography>
                    <Typography sx={styles.activeText}>
                      Active
                      <Switch
                        name="isActive"
                        onChange={handleChange}
                        {...label}
                        checked={values.isActive}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={12} container sx={styles.roleBox}>
                    <Grid item xs={12} md={5}>
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
                  </Grid>
                  {isMobile ? (
                    <CommonFooter>
                      <SubmitButton
                        onClick={handleSubmit}
                        disabled={!values?.email || !values?.name || !values?.role}
                      />
                    </CommonFooter>
                  ) : (
                    <Grid justifyContent="flex-start" container item xs={12}>
                      <PrimaryButton
                        type="submit"
                        style={{ marginTop: "20px" }}
                        variant="contained"
                        size="large"
                        disabled={!values?.email || !values?.name || !values?.role}
                        onClick={handleSubmit}>
                        Update
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

export default EditEmployee
