import React from "react"
import {
  Box,
  Typography,
  OutlinedInput,
  Divider,
  Button,
  Switch,
  useTheme,
  useMediaQuery
} from "@mui/material"
import "../Cms.scss"
import { Formik, Form, Field } from "formik"
import { OemFormValidator } from "helpers/validators/oemForm"
import { useNavigate } from "react-router-dom"
import { CmsService } from "network/cmsService"
import Toast from "components/utilities-components/Toast/Toast"
import { cmsActions } from "redux/store"
import { useDispatch } from "react-redux"
import CommonFooter from "components/utilities-components/CommonFooter"

function OemForm({ isEdit, oemData = {} }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  let intialEditableValue = {
    oem: oemData?.name ? oemData?.name : "",
    oemCheck: oemData?.status ? oemStatus(oemData?.status) : false
  }

  function oemStatus(status) {
    if (status === 1) {
      return true
    } else {
      return false
    }
  }
  const handleSubmit = async (data) => {
    let payLoad = {
      name: data?.oem,
      status: data?.oemCheck === true ? 1 : 0
    }
    if (isEdit) {
      let param = [oemData?.oemId]
      let oemUpdateResponse = await CmsService.editOem(payLoad, param)
      if (oemUpdateResponse.code === 200 && oemUpdateResponse.success) {
        Toast.showInfoToast(`${oemUpdateResponse?.message}`)
      } else {
        Toast.showErrorToast(`${oemUpdateResponse?.message}`)
      }
    } else {
      let oemResponse = await CmsService.addOem(payLoad)
      if (oemResponse.code === 200 && oemResponse.success) {
        Toast.showInfoToast(`${oemResponse?.message}`)
      } else {
        Toast.showErrorToast(`${oemResponse?.message}`)
      }
    }
    dispatch(cmsActions.setTabActive(3))
    navigate(-1)
  }

  const handleCancel = () => {
    dispatch(cmsActions.setTabActive(3))
    navigate(-1)
  }

  const ActionButtons = ({ isFormValid }) => {
    return (
      <Box className="cms_btn_box">
        <Button variant="outlined" className="cancel_btn" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          className={
            !isEdit ? (isFormValid ? "save_button" : "save_button disable") : "save_button"
          }>
          {isEdit ? "Update" : "Save"}
        </Button>
      </Box>
    )
  }

  return (
    <>
      <Box className="container_box">
        <Formik
          initialValues={isEdit ? intialEditableValue : OemFormValidator.initialValues}
          validationSchema={OemFormValidator.validationSchema}
          onSubmit={handleSubmit}>
          {(formik) => {
            const isFormValid = formik.isValid && Object.keys(formik.touched).length > 0
            return (
              <Form onSubmit={formik.handleSubmit}>
                <Box className="form_container">
                  <Box className="input_box">
                    <Typography variant="s1">OEM Name</Typography>
                    <Field
                      as={OutlinedInput}
                      placeholder="OEM Name"
                      name="oem"
                      className="cms_input_field"
                      sx={{ borderColor: "#C9D8EF", fontSize: "1.6rem" }}
                    />
                  </Box>
                  <Box className="input_box">
                    <Typography variant="p1" className="status_lable">
                      Status
                    </Typography>
                    <Box>
                      <Typography variant="s1">Active</Typography>
                      <Switch
                        color="primary"
                        checked={formik.values.oemCheck}
                        onChange={formik.handleChange}
                        name={"oemCheck"}
                      />
                    </Box>
                  </Box>

                  {!isMobile && <Divider />}
                  {isMobile ? (
                    <CommonFooter>
                      <ActionButtons isFormValid={isFormValid} />
                    </CommonFooter>
                  ) : (
                    <ActionButtons />
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

export default OemForm
