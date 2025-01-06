/* eslint-disable no-unused-vars*/
import React, { useEffect, useState } from "react"
import { Paper, Typography, useMediaQuery, Stack, Divider } from "@mui/material"
import { Box } from "@mui/system"
import BackHeader from "components/utilities-components/BackHeader"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import CommonFooter from "components/utilities-components/CommonFooter"
import DropDown from "components/utilities-components/DropDown/DropDown"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import InputField from "components/utilities-components/InputField/InputField"
import CustomSwitch from "components/utilities-components/Switch/CustomSwitch"
import { Formik } from "formik"
import { useStyles } from "pages/private/admin/ManageSubAdmin/subAdminStyles"
import { useNavigate, useParams } from "react-router-dom"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import { useTheme } from "@emotion/react"
import { oemManagerValidator } from "helpers/validators/oemManager"
import MultiSelect from "components/utilities-components/Mulit-Select/MultiSelect"
import { sortData } from "pages/private/admin/Feedback/feedBackUtility"
import { FeedBackService } from "network/feedbackService"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { OEMManagerService } from "network/services/oemManagerService"
import { AreaManagerService } from "network/services/areaManagerService"
import {
  getCityData,
  getDealerData,
  getRegionData,
  getStateData
} from "helpers/Functions/areaOemManagerLogic"

const AreaOemManagerForm = ({ isAreaManager }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const params = useParams()
  const managerID = isAreaManager ? params?.userId : params?.id
  const navigate = useNavigate()
  const styles = useStyles()
  const [loading, setLoading] = useState()
  const [regions, setRegions] = useState([])
  const [oems, setOems] = useState([])
  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
  const [selectedRegions, setSelectedRegions] = useState([])
  const [selectedStates, setSelectedStates] = useState([])
  const [selectedCitys, setSelectedCitys] = useState([])
  const [selectedOem, setSelectedOem] = useState("")
  const [dealers, setDealers] = useState([])
  const [responseData, setResponseData] = useState()
  const [initialValues, setInitialValues] = useState(null)
  const [multiSelectError, setMultiselectError] = useState(false)
  const [cityMultiSelectError, setCityMultiselectError] = useState(false)
  const [regionMultiSelect, setRegionMultiSelect] = useState(false)
  const [stateError, setStateError] = useState(false)
  const [selectedDealers, setSelectedDealers] = useState([])
  useEffect(() => {
    getRegions()
    getOEMS()
  }, [])
  useEffect(() => {
    selectedRegions?.length > 0 && getStates()
  }, [selectedRegions?.length])
  useEffect(() => {
    selectedStates?.length > 0 && getCitys()
  }, [selectedStates?.length])

  useEffect(() => {
    selectedOem && selectedCitys?.length > 0 && getDealer()
  }, [selectedOem, selectedCitys?.length])
  useEffect(() => {
    getOemManagerDetails()
  }, [])
  useEffect(() => {
    dealers?.length > 0 &&
      regions?.length > 0 &&
      states?.length > 0 &&
      cities?.length > 0 &&
      oems &&
      setInitValues()
  }, [dealers?.length, regions?.length, states?.length, cities?.length, oems, responseData])

  const getOemManagerDetails = async () => {
    if (managerID) {
      setLoading(true)
      const response = isAreaManager
        ? await AreaManagerService.getAreaManagerDetails(managerID)
        : await OEMManagerService.getOEMManagerDetails(managerID)
      if (response?.success && response?.code === 200) {
        getRegionData(response?.data?.records?.userArea, setSelectedRegions)
        getStateData(response?.data?.records?.userArea, setSelectedStates)
        getCityData(response?.data?.records?.userArea, setSelectedCitys)
        isAreaManager
          ? getDealerData(response?.data?.records?.areaManagerDealers, setSelectedDealers)
          : getDealerData(response?.data?.records?.oemManagerDealers, setSelectedDealers)
        setSelectedOem(response?.data?.records?.oem?.oemId)
        setResponseData(response?.data?.records)
        setLoading(false)
      } else {
        Toast.showErrorToast(response?.message)
        setLoading(false)
      }
    } else {
      setResponseData({})
      setInitialValues(oemManagerValidator?.initialValues)
      setLoading(false)
    }
  }

  const getRegions = async () => {
    setLoading(true)
    const response = await FeedBackService.getRegion()
    if (response.success && response.code === 200) {
      const labelKey = "name"
      const key = "regionId"
      const sortedData = sortData(labelKey, key, response?.data)
      setRegions(sortedData)
      setLoading(false)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
      setLoading(false)
    }
  }
  const getStates = async () => {
    let key = `regionIds`
    const regionIds = selectedRegions.map((item) => item?.value)
    const regionIdString = regionIds.toString()
    const params = {
      [key]: regionIdString
    }
    setLoading(true)
    const response = await AreaManagerService.getStates(params)
    if (response.success && response.code === 200) {
      const key = "stateId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setStates(sortedData)
      setLoading(false)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
      setLoading(false)
    }
  }
  const getCitys = async () => {
    let key = `stateIds`
    const stateIds = selectedStates.map((item) => item?.value)
    const stateIdString = stateIds.toString()
    const params = {
      [key]: stateIdString
    }
    setLoading(true)
    const response = await AreaManagerService.getCities(params)
    if (response.success && response.code === 200) {
      const key = "cityId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setCities(sortedData)
      setLoading(false)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
      setLoading(false)
    }
  }
  const getOEMS = async () => {
    let statusFilter = `filters[status]`
    const queryParams = {
      [statusFilter]: 1
    }

    setLoading(true)
    const response = await FeedBackService.getOEM(queryParams)
    if (response.success && response.code === 200) {
      const key = "oemId"
      const labelKey = "name"
      const sortedData = sortData(labelKey, key, response?.data)
      setOems(sortedData)
      setLoading(false)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
      setLoading(false)
    }
  }
  const getDealer = async () => {
    setLoading(true)
    let key = `oemIds`
    let cityFilter = `cityId`
    const selectedCityMap = selectedCitys.map((city) => city?.value)
    const selectedCityString = selectedCityMap.toString()
    const response = await FeedBackService.getDealer(
      key,
      selectedOem,
      cityFilter,
      selectedCityString
    )
    if (response.success && response.code === 200) {
      if (response?.data?.records[0]?.users?.length > 0) {
        const labelKey = "username"
        const key = "userId"
        const sortedData = sortData(labelKey, key, response?.data?.records[0]?.users)
        setDealers(sortedData)
        setLoading(false)
      } else {
        setDealers(response?.data?.records?.users)
        setLoading(false)
      }
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const returnBack = () => {
    navigate(-1)
  }
  const updateOEMManager = async (values) => {
    const payLoad = {
      name: values?.name,
      email: values?.email,
      phone: values?.phone ? values?.phone : null,
      oemId: values?.oem,
      area: getAreaSelected(values),
      isActive: values?.status === "Active" ? true : false,
      dealersId: values?.dealerShip.map((val) => val?.value)
    }
    const response = isAreaManager
      ? await AreaManagerService.updateAreaManager(payLoad, managerID)
      : await OEMManagerService.updateOEMManager(payLoad, managerID)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      returnBack()
    } else {
      Toast.showErrorToast(response?.message)
    }
  }

  const getAreaSelected = (values) => {
    let areaObject = []
    values?.city?.forEach((city) => {
      if (city?.state) {
        areaObject.push({
          regionId: city?.state?.region?.regionId,
          stateId: city?.state?.stateId,
          cityId: city?.value
        })
      } else {
        const cityMap = new Map()
        cities?.forEach((citys) => {
          if (!cityMap.has(citys?.value)) {
            cityMap.set(citys?.value, citys)
          }
        })
        const foundCity = cityMap.get(city?.value)
        areaObject?.push({
          regionId: foundCity?.state?.region?.regionId,
          stateId: foundCity?.state?.stateId,
          cityId: foundCity?.value
        })
      }
    })
    return areaObject
  }

  const postOemManager = async (values) => {
    const payLoad = {
      name: values?.name,
      email: values?.email,
      phone: values?.phone ? values?.phone : null,
      oemId: values?.oem,
      area: getAreaSelected(values),
      isActive: values?.status === "Active" ? true : false,
      dealersId: values?.dealerShip.map((val) => val?.value)
    }
    const response = isAreaManager
      ? await AreaManagerService.createAreaManager(payLoad)
      : await OEMManagerService.createOEMManager(payLoad)
    if (response?.success && response?.code === 200) {
      navigate(-1)
      Toast.showInfoToast(`${response?.message}`)
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }

  const setInitValues = () => {
    if (managerID) {
      setInitialValues({
        name: responseData?.username,
        email: responseData?.email,
        phone: responseData?.phone,
        description: responseData?.description,
        status: responseData?.isActive ? "Active" : "InActive",
        region: selectedRegions,
        state: selectedStates,
        city: selectedCitys,
        oem: responseData?.oem?.oemId,
        dealerShip: selectedDealers
      })
    } else {
      setInitialValues(oemManagerValidator.initialValues)
    }
  }

  const ActionButtons = ({ values, handleSubmit, isValid }) => {
    return (
      <Box sx={styles.buttonContainer}>
        {managerID && <SecondaryButton onClick={returnBack}>Cancel</SecondaryButton>}
        <PrimaryButton
          type="submit"
          disabled={
            !isValid ||
            !values?.email ||
            !values?.name ||
            !values?.region ||
            !values?.state ||
            !values?.city ||
            !values?.oem
          }
          variant="contained"
          size="large"
          onClick={handleSubmit}>
          {managerID ? "Update" : "Create"}
        </PrimaryButton>
      </Box>
    )
  }
  const getFunctions = (values) => {
    managerID ? updateOEMManager(values) : postOemManager(values)
  }
  const getTitle = () => {
    if (isAreaManager) {
      return managerID ? "Edit Area Manager" : "Create Area Manager"
    } else {
      return managerID ? "Edit OEM Manager" : "Create OEM Manager"
    }
  }
  return (
    <>
      {loading && <AppLoader />}
      <BackHeader title={getTitle()} />
      <Paper>
        {!initialValues ? (
          <AppLoader />
        ) : (
          <Formik
            validateOnMount
            initialValues={initialValues}
            validationSchema={oemManagerValidator.validationSchema}
            s
            onSubmit={getFunctions}>
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
                    label="Name*"
                    name="name"
                    value={values.name}
                    sx={styles.formField}
                    InputProps={{ disableUnderline: true }}
                    onChange={handleChange}
                    variant="filled"
                    helperText={touched.name ? <ErrorText text={errors.name} /> : ""}
                    onBlur={handleBlur}
                    type="text"
                    error={touched.name && Boolean(errors.name)}
                    margin="normal"
                    fullWidth
                  />
                  <InputField
                    size="medium"
                    name="phone"
                    sx={styles.formField}
                    label="Phone Number*"
                    value={values?.phone ? values?.phone : ""}
                    variant="filled"
                    InputProps={{ disableUnderline: true }}
                    error={touched.phone && Boolean(errors.phone)}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    fullWidth
                    helperText={touched.phone ? <ErrorText text={errors.phone} /> : ""}
                    margin="normal"
                  />
                </Box>
                <InputField
                  size="medium"
                  name="email"
                  sx={styles.formField}
                  InputProps={{ disableUnderline: true }}
                  value={values.email}
                  label="Email Id*"
                  onChange={handleChange}
                  variant="filled"
                  error={touched.email && Boolean(errors.email)}
                  onBlur={handleBlur}
                  type="email"
                  helperText={touched.email ? <ErrorText text={errors.email} /> : ""}
                  margin="normal"
                  fullWidth
                />
                <Box sx={{ paddingY: "1.2rem" }}>
                  <Typography variant="p1" color="text.gray">
                    Status
                  </Typography>
                  <Box sx={{ width: "2rem" }}>
                    <CustomSwitch
                      value={values.status === "Active"}
                      handleChange={(event, checked) => {
                        setFieldValue("status", checked ? "Active" : "InActive")
                      }}
                      label={values.status}
                    />
                  </Box>
                </Box>
                <Divider sx={{ borderColor: "background.blue1" }} />
                <Box sx={styles.formFieldGroup}>
                  <Box sx={styles.formField}>
                    <DropDown
                      value={values?.oem}
                      label="Select OEM*"
                      items={oems}
                      handleChange={(e) => {
                        setFieldValue(`oem`, e.target.value)
                        setSelectedOem(e.target.value)
                        setSelectedCitys([])
                        setSelectedStates([])
                        setFieldValue(`region`, [])
                        setSelectedRegions([])
                        setFieldValue(`state`, [])
                        setFieldValue(`city`, [])
                        setFieldValue(`dealerShip`, [])
                      }}
                      showError={touched.oem && Boolean(errors.oem)}
                      onBlur={() => setFieldTouched(`oem`, true)}
                      helperText={touched.oem ? errors?.oem : ""}
                    />
                  </Box>
                  <Box sx={styles.formField}>
                    <MultiSelect
                      label="Select Region*"
                      selectedItems={values?.region}
                      items={regions}
                      onSelect={(value) => {
                        setFieldValue(`region`, value)
                        setSelectedRegions(value)
                        setSelectedCitys([])
                        setSelectedStates([])
                        setFieldValue(`state`, [])
                        setFieldValue(`city`, [])
                        setFieldValue(`dealerShip`, [])
                        values?.region?.length > 0 && setRegionMultiSelect(false)
                      }}
                      style={{ width: "100%" }}
                      onBlur={() =>
                        values?.region?.length === 0
                          ? setRegionMultiSelect(true)
                          : setRegionMultiSelect(false)
                      }
                      showError={regionMultiSelect}
                      helperText={"Please Select atLeast one Region"}
                    />
                  </Box>
                  <Box sx={styles.formField}>
                    <MultiSelect
                      label="Select State*"
                      selectedItems={values?.state}
                      items={states}
                      onSelect={(value) => {
                        setFieldValue(`state`, value)
                        setSelectedStates(value)
                        setSelectedCitys([])
                        setFieldValue(`city`, [])
                        setFieldValue(`dealerShip`, [])
                        values?.state?.length > 0 && setStateError(false)
                      }}
                      style={{ width: "100%" }}
                      onBlur={() =>
                        values?.state?.length === 0 ? setStateError(true) : setStateError(false)
                      }
                      showError={stateError}
                      helperText={stateError ? "Please select a State" : ""}
                    />
                  </Box>
                  <Box sx={styles.formField}>
                    <MultiSelect
                      label="Select City*"
                      selectedItems={values?.city}
                      items={cities}
                      style={{ width: "100%" }}
                      onSelect={(value) => {
                        setFieldValue(`city`, value)
                        setSelectedCitys(value)
                        setFieldValue(`dealerShip`, [])
                        values?.city?.length > 0 && setCityMultiselectError(false)
                      }}
                      onBlur={() =>
                        values?.city?.length === 0
                          ? setCityMultiselectError(true)
                          : setCityMultiselectError(false)
                      }
                      showError={cityMultiSelectError}
                      helperText={"Please Select at least one City"}
                    />
                  </Box>

                  <Box sx={styles.formField}>
                    <MultiSelect
                      selectedItems={values?.dealerShip}
                      label="Select Dealership*"
                      items={dealers}
                      style={{ width: "100%" }}
                      onSelect={(value) => {
                        setFieldValue(`dealerShip`, value)
                        values?.dealerShip?.length > 0 && setMultiselectError(false)
                      }}
                      onBlur={() =>
                        values?.dealerShip?.length === 0
                          ? setMultiselectError(true)
                          : setMultiselectError(false)
                      }
                      showError={multiSelectError}
                      helperText={"Please Select at least one Dealer"}
                    />
                  </Box>
                </Box>
                {!isMobile && <Divider sx={{ borderColor: "background.blue1" }} />}
                {isMobile ? (
                  <CommonFooter>
                    <ActionButtons {...{ values, handleSubmit, isValid }} />
                  </CommonFooter>
                ) : (
                  <ActionButtons {...{ values, handleSubmit, isValid }} />
                )}
              </Stack>
            )}
          </Formik>
        )}
      </Paper>
    </>
  )
}

export default AreaOemManagerForm
