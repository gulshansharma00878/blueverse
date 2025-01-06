import React, { useEffect, useState } from "react"
import "../Cms.scss"
import {
  Box,
  Typography,
  OutlinedInput,
  Divider,
  Button,
  useMediaQuery,
  useTheme
} from "@mui/material"
import { Formik, Form, Field } from "formik"
import SelectDropdown from "components/utilities-components/SelectDropdown"
import { CityFormValidator } from "helpers/validators/cityForm"
import { useNavigate } from "react-router-dom"
import { useRegionList } from "hooks/cmsHook"
import { slectDropDownData } from "helpers/Functions/slectDropDownData"
import { CmsService } from "network/cmsService"
import Toast from "components/utilities-components/Toast/Toast"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility"
import { cmsActions } from "redux/store"
import { useDispatch } from "react-redux"
import CommonFooter from "components/utilities-components/CommonFooter"

function CitiesForm({ isEdit, citiesData = {} }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const regionData = useRegionList()
  const [regionOptionData, setRegionOptionData] = useState([])
  const [stateData, setStateData] = useState([])
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  let intialEditableValue = {
    city: "",
    state: "",
    region: ""
  }

  useEffect(() => {
    if (isEdit) {
      intialEditableValue.city = citiesData?.name ? citiesData?.name : ""
      intialEditableValue.region = citiesData?.state?.region?.regionId
        ? citiesData?.state?.region?.regionId
        : ""
      intialEditableValue.state = citiesData?.state?.stateId ? citiesData?.state?.stateId : ""
    }
  }, [isEdit])

  useEffect(() => {
    convertRegionOption()
  }, [regionData?.data])

  useEffect(() => {
    handleRegionChange(citiesData?.state?.regionId)
  }, [citiesData?.state?.regionId])

  function convertRegionOption() {
    const regionArray = slectDropDownData(regionData?.data)
    setRegionOptionData(regionArray)
  }

  const handleSubmit = async (data) => {
    let payLoad = {
      name: data?.city,
      stateId: data?.state
    }
    if (isEdit) {
      let param = [citiesData?.cityId]
      let cityUpdateResponse = await CmsService.editCity(payLoad, param)
      if (cityUpdateResponse.code === 200 && cityUpdateResponse.success) {
        Toast.showInfoToast(`${cityUpdateResponse?.message}`)
      } else {
        Toast.showErrorToast(`${cityUpdateResponse?.message}`)
      }
    } else {
      payLoad.regionId = data?.region
      let cityResponse = await CmsService.addCity(payLoad)
      if (cityResponse.code === 200 && cityResponse.success) {
        Toast.showInfoToast(`${cityResponse?.message}`)
      } else {
        Toast.showErrorToast(`${cityResponse?.message}`)
      }
    }
    dispatch(cmsActions.setTabActive(2))
    navigate(-1)
  }

  const handleCancel = () => {
    dispatch(cmsActions.setTabActive(2))
    navigate(-1)
  }

  const handleRegionChange = async (regionId) => {
    let key = `filters[regionId]`
    const response = await CmsService.getStateByRegion(key, regionId)
    if (response.code === 200 && response.success) {
      const key = "stateId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setStateData(sortedData)
    } else {
      setStateData([])
    }
  }

  const ActionButtons = ({ isFormValid }) => {
    return (
      <Box className="cms_btn_box">
        <Button variant="outlined" onClick={handleCancel} className="cancel_btn">
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
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
          initialValues={isEdit ? intialEditableValue : CityFormValidator.initialValues}
          validationSchema={CityFormValidator.validationSchema}
          onSubmit={handleSubmit}>
          {(formik) => {
            const isFormValid = formik.isValid && Object.keys(formik.touched).length > 0
            return (
              <Form onSubmit={formik.handleSubmit}>
                <Box className="form_container">
                  <Box className="input_box">
                    <Typography variant="s1">City Name</Typography>
                    <Field
                      as={OutlinedInput}
                      placeholder="City Name"
                      name="city"
                      className="cms_input_field"
                      sx={{ borderColor: "#C9D8EF", fontSize: "1.6rem" }}
                    />
                  </Box>
                  <Box className="input_box">
                    <Typography variant="s1">Select Region for this city</Typography>

                    <SelectDropdown
                      name={"region"}
                      options={regionOptionData}
                      placeholder={"Select Region"}
                      onChange={handleRegionChange}
                      sx={{ fontSize: "1.6rem" }}
                    />
                  </Box>
                  <Box className="input_box">
                    <Typography variant="s1">Select State for this city</Typography>

                    <SelectDropdown
                      name={"state"}
                      options={stateData}
                      placeholder={"Select State"}
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

export default CitiesForm
