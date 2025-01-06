import React, { useEffect, useState } from "react"
import {
  Box,
  Typography,
  OutlinedInput,
  Divider,
  Button,
  useTheme,
  useMediaQuery
} from "@mui/material"
import "../Cms.scss"
import { Formik, Form, Field } from "formik"
import { StateFormValidator } from "helpers/validators/stateForm"
import SelectDropdown from "components/utilities-components/SelectDropdown"
import { useNavigate } from "react-router-dom"
import { useRegionList } from "hooks/cmsHook"
import { CmsService } from "network/cmsService"
import Toast from "components/utilities-components/Toast/Toast"
import { cmsActions } from "redux/store"
import { useDispatch } from "react-redux"
import CommonFooter from "components/utilities-components/CommonFooter"

function StateForm({ isEdit, stateData = {} }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const regionData = useRegionList()
  const [regionOptionData, setRegionOptionData] = useState([])
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  let intialEditableValue = {
    state: "",
    region: "",
    stateGstNo: "",
    blueverseAddress: ""
  }

  useEffect(() => {
    if (isEdit) {
      intialEditableValue.state = stateData?.name ? stateData?.name : ""
      intialEditableValue.region = stateData?.region?.regionId ? stateData?.region?.regionId : ""
      intialEditableValue.stateGstNo = stateData?.stateGstNo ? stateData?.stateGstNo : ""
      intialEditableValue.blueverseAddress = stateData?.blueverseAddress
        ? stateData?.blueverseAddress
        : ""
    }
  }, [isEdit])

  useEffect(() => {
    convertRegionOption()
  }, [regionData?.data])

  function convertRegionOption() {
    const newArray = []
    regionData?.data.forEach((item) => {
      const newItem = {
        label: item.name,
        value: item.regionId
      }
      newArray.push(newItem)
    })
    setRegionOptionData(newArray)
  }

  const handleSubmit = async (data) => {
    let payLoad = {
      name: data?.state,
      regionId: data?.region,
      stateGstNo: data?.stateGstNo,
      blueverseAddress: data?.blueverseAddress
    }
    if (isEdit) {
      let param = [stateData?.stateId]
      let stateUpdateResponse = await CmsService.editState(payLoad, param)
      if (stateUpdateResponse.code === 200 && stateUpdateResponse.success) {
        Toast.showInfoToast(`${stateUpdateResponse?.message}`)
      } else {
        Toast.showErrorToast(`${stateUpdateResponse?.message}`)
      }
    } else {
      let stateResponse = await CmsService.addState(payLoad)
      if (stateResponse.code === 200 && stateResponse.success) {
        Toast.showInfoToast(`${stateResponse?.message}`)
      } else {
        Toast.showErrorToast(`${stateResponse?.message}`)
      }
    }
    dispatch(cmsActions.setTabActive(1))
    navigate(-1)
  }

  const handleCancel = () => {
    dispatch(cmsActions.setTabActive(1))
    navigate(-1)
  }

  const ActionButtons = ({ isFormValid }) => {
    return (
      <Box className="cms_btn_box">
        <Button className="cancel_btn" onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          className={
            !isEdit ? (isFormValid ? "save_button" : "save_button disable") : "save_button"
          }
          variant="contained">
          {isEdit ? "Update" : "Save"}
        </Button>
      </Box>
    )
  }
  return (
    <>
      <Box className="container_box">
        <Formik
          initialValues={isEdit ? intialEditableValue : StateFormValidator.initialValues}
          validationSchema={StateFormValidator.validationSchema}
          onSubmit={handleSubmit}>
          {(formik) => {
            const isFormValid = formik.isValid && Object.keys(formik.touched).length > 0
            return (
              <Form onSubmit={formik.handleSubmit}>
                <Box className="form_container">
                  <Box className="input_box">
                    <Typography variant="s1">New State</Typography>
                    <Field
                      as={OutlinedInput}
                      placeholder="State Name"
                      name="state"
                      className="cms_input_field"
                      sx={{ borderColor: "#C9D8EF", fontSize: "1.6rem" }}
                    />
                  </Box>
                  <Box className="input_box">
                    <Typography variant="s1">Select Region for this state</Typography>

                    <SelectDropdown
                      name={"region"}
                      options={regionOptionData}
                      placeholder={"Select Region"}
                    />
                  </Box>
                  <Box className="input_box">
                    <Typography variant="s1">GST No</Typography>
                    <Field
                      as={OutlinedInput}
                      placeholder="GST No"
                      name="stateGstNo"
                      className="cms_input_field"
                      sx={{ borderColor: "#C9D8EF", fontSize: "1.6rem" }}
                    />
                  </Box>
                  <Box className="input_box">
                    <Typography variant="s1">Blueverse Address</Typography>
                    <Field
                      as={OutlinedInput}
                      placeholder="Blueverse Address"
                      name="blueverseAddress"
                      className="cms_input_field"
                      sx={{ borderColor: "#C9D8EF", fontSize: "1.6rem" }}
                    />
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

export default StateForm
