import React, { useEffect, useState } from "react"
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import BackHeader from "components/utilities-components/BackHeader"
import { useStyles } from "./subAdminStyles"
import { Formik } from "formik"
import InputField from "components/utilities-components/InputField/InputField"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { subAdminValidator } from "helpers/validators/subAdminForm"
import CustomSwitch from "components/utilities-components/Switch/CustomSwitch"
import DropDown from "components/utilities-components/DropDown/DropDown"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { SubAdminService } from "network/services/subAdminService"
import { sortData } from "../Feedback/feedBackUtility"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { getPayLoad, sortEditSubAdminData } from "./subAdminUtility"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import CommonFooter from "components/utilities-components/CommonFooter"
import ErrorText from "components/utilities-components/InputField/ErrorText"
// import { getPayLoad } from "./subAdminUtility"
const CreateSubAdmin = () => {
  // =========== All Static Methods ===========>
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isEdit = useSelector((state) => state.subAdmin.editSubAdmin)
  const navigate = useNavigate()
  const params = useParams()
  const formID = params?.subAdminId
  //======All Local States=========>
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  //eslint-disable-next-line no-unused-vars
  const [subAdmin, setSubAdmin] = useState(subAdminValidator.initialValues)
  //===========All API calls=========>
  useEffect(() => {
    getRoleLisiting()
  }, [])
  useEffect(() => {
    formID && getSubAdminDetails()
  }, [roles?.length])

  const createSubAdmin = async (values) => {
    setLoading(true)
    const payLoad = getPayLoad(values)
    const resp = await SubAdminService.createSubAdmin(payLoad)
    if (resp?.success && resp?.code === 200) {
      Toast.showInfoToast(resp?.message)
      setLoading(false)
      navigate(-1)
    } else {
      Toast.showErrorToast(resp?.message)
      setLoading(false)
      const newInitialValues = {
        name: values?.name ?? "",
        email: values?.email ?? "",
        contact: values?.contact ?? "",
        status: values?.status ?? "",
        role: values?.role ?? ""
      }
      setSubAdmin(newInitialValues)
    }
  }
  const updateSubAdmin = async (values) => {
    setLoading(true)
    const payLoad = {
      username: values.name,
      email: values.email,
      phone: values.contact || null,
      isActive: values.status === "Active" ? true : false,
      subRoleId: values?.role
    }
    const resp = await SubAdminService.updateSubAdmin(payLoad, formID)
    if (resp?.success && resp?.code === 200) {
      Toast.showInfoToast(resp?.message)
      setLoading(false)
      navigate(-1)
    } else {
      Toast.showErrorToast(resp?.message)
      setLoading(false)
    }
  }
  const getRoleLisiting = async () => {
    setLoading(true)
    let param = { isActive: true }
    const resp = await SubAdminService.getRoles(param)
    const labelKey = "name"
    const key = "subRoleId"
    if (resp?.success && resp?.code === 200) {
      const sortedData = sortData(labelKey, key, resp?.data?.subRoles)
      setRoles(sortedData)
      setLoading(false)
    } else {
      Toast.showErrorToast(resp?.message)
      setLoading(false)
    }
  }
  const getSubAdminDetails = async () => {
    setLoading(true)
    const resp = await SubAdminService.getSubAdmin(formID)
    if (resp?.success && resp?.code === 200) {
      const requiredData = sortEditSubAdminData(resp?.data?.employee)
      setSubAdmin({ ...requiredData })
      setLoading(false)
    } else {
      Toast.showErrorToast(resp?.message)
      setLoading(false)
    }
  }

  const ActionButtons = ({ isValid, values, handleSubmit }) => {
    return (
      <Box sx={styles.buttonContainer}>
        {isEdit && (
          <SecondaryButton
            onClick={() => {
              navigate(-1)
            }}>
            Cancel
          </SecondaryButton>
        )}

        <PrimaryButton
          type="submit"
          disabled={!isValid || !values?.email || !values?.name || !values?.role}
          variant="contained"
          // fullWidth
          size="large"
          onClick={handleSubmit}>
          {isEdit ? "Update" : "Create"}
        </PrimaryButton>
      </Box>
    )
  }

  return (
    <>
      <BackHeader title={isEdit ? "Edit Sub-Admin" : "Create Sub-Admin"} />
      {loading ? (
        <AppLoader />
      ) : (
        <Formik
          validateOnMount
          initialValues={subAdmin}
          validationSchema={subAdminValidator.validationSchema}
          onSubmit={isEdit ? updateSubAdmin : createSubAdmin}>
          {({
            isValid,
            handleSubmit,
            values,
            handleChange,
            handleBlur,
            touched,
            errors,
            setFieldValue,
            setFieldTouched
          }) => (
            <Stack sx={styles.formContainer} spacing="2rem">
              <Box sx={styles.formFieldGroup}>
                <InputField
                  size="medium"
                  sx={styles.formField}
                  name="name"
                  label="Name*"
                  InputProps={{ disableUnderline: true }}
                  value={values.name}
                  variant="filled"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  helperText={touched.name ? <ErrorText text={errors.name} /> : ""}
                  error={touched.name && Boolean(errors.name)}
                  type="text"
                  fullWidth
                  margin="normal"
                />
                <InputField
                  size="medium"
                  sx={styles.formField}
                  name="contact"
                  value={values?.contact ? values?.contact : ""}
                  label="Phone Number"
                  InputProps={{ disableUnderline: true }}
                  variant="filled"
                  onBlur={handleBlur}
                  helperText={touched.contact ? <ErrorText text={errors.contact} /> : ""}
                  error={touched.contact && Boolean(errors.contact)}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <InputField
                size="medium"
                sx={styles.formField}
                name="email"
                label="Email Id*"
                InputProps={{ disableUnderline: true }}
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
              <Box sx={{ paddingY: "1.2rem" }}>
                <Typography variant="p1" color="text.gray">
                  Status
                </Typography>
                <Box sx={{ width: "2rem" }}>
                  <CustomSwitch
                    label={values.status}
                    value={values.status === "Active"}
                    handleChange={(event, checked) => {
                      setFieldValue("status", checked ? "Active" : "InActive")
                    }}
                  />
                </Box>
              </Box>
              <Divider sx={{ borderColor: "background.blue1" }} />
              <Box sx={styles.formField}>
                <DropDown
                  label="Select Role*"
                  value={values?.role}
                  items={roles}
                  handleChange={(e) => setFieldValue(`role`, e.target.value)}
                  onBlur={() => setFieldTouched(`role`, true)}
                  showError={touched.role && Boolean(errors.role)}
                  helperText={touched.role ? errors?.role : ""}
                />
              </Box>
              {!isMobile && <Divider sx={{ borderColor: "background.blue1" }} />}
              {isMobile ? (
                <CommonFooter>
                  <ActionButtons {...{ isValid, values, handleSubmit }} />
                </CommonFooter>
              ) : (
                <ActionButtons {...{ isValid, values, handleSubmit }} />
              )}
            </Stack>
          )}
        </Formik>
      )}
    </>
  )
}

export default CreateSubAdmin
