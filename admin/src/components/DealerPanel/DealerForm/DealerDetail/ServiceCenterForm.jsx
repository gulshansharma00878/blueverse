import { Box, CircularProgress, Grid, InputAdornment, Typography } from "@mui/material"
import InputField from "components/utilities-components/InputField/InputField"
import React, { useEffect, useState } from "react"
import { useStyles } from "./DealerDetailStyles"
import PlacesAutocomplete from "react-places-autocomplete"
// import { Search } from "@mui/icons-material"
import SearchIcon from "../../../../assets/images/icons/searchIcon.svg"
import { DealerService } from "network/dealerService"
import Toast from "components/utilities-components/Toast/Toast"
import DropDown from "components/utilities-components/DropDown/DropDown"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import IconWrapper from "components/utilities-components/IconWrapper"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import { getLatLng, geocodeByAddress } from "react-places-autocomplete"

function ServiceCenterForm({ values, index, touched, errors, setFieldValue, setFieldTouched }) {
  const styles = useStyles()
  const [regionData, setRegionData] = useState()
  const [stateData, setStateData] = useState()
  const [cityData, setCityData] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (values.outlet[index]?.state) {
      getCity(values.outlet[index]?.state)
    }
  }, [values.outlet[index]?.state])

  useEffect(() => {
    if (values.outlet[index]?.region) {
      getState(values.outlet[index]?.region)
    }
  }, [values.outlet[index]?.region])

  useEffect(() => {
    getRegionList()
  }, [])

  const getRegionList = async () => {
    setLoading(true)
    const region = await DealerService.getRegionList()

    if (region.success && region.code === 200) {
      setRegionData(region?.data)
    } else {
      Toast.showErrorToast(region?.message)
    }
    setLoading(false)
  }

  let regionList = regionData?.map((item) => {
    return { value: item?.regionId, label: item.name }
  })

  let stateList = stateData?.map((item) => {
    return { value: item?.stateId, label: item.name }
  })

  let cityList = cityData?.map((item) => {
    return { value: item?.cityId, label: item.name }
  })

  const options = {
    componentRestrictions: { country: "in" }
  }

  const getState = async (id) => {
    setLoading(true)
    let key = {
      "filters[regionId]": id
    }
    const response = await DealerService.getStateList(key)
    if (response.success && response.code === 200) {
      setStateData(response?.data)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoading(false)
  }

  const getCity = async (id) => {
    setLoading(true)
    let key = {
      "filters[stateId]": id
    }

    const response = await DealerService.getCityList(key)

    if (response.success && response.code === 200) {
      setCityData(response?.data)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoading(false)
  }

  const onError = (status, clearSuggestions) => {
    clearSuggestions()
  }

  return (
    <Grid
      key={index}
      xs={12}
      container
      style={{
        marginTop: "2.4rem",
        padding: "0rem 0rem 2.4rem 0rem",
        borderBottom: "0.1rem solid #C9D8EF"
      }}>
      {loading && <AppLoader />}
      <Grid
        style={{
          display: "flex",
          alignItems: "center"
        }}>
        <Typography variant="s1">Add Service Centre Info</Typography>
      </Grid>
      <Grid spacing={2} container>
        <Grid item xs={12} sm={4}>
          <InputField
            sx={styles.inputBox}
            size="medium"
            name={`outlet[${index}].outletName`}
            value={values?.outlet[index]?.outletName}
            label="Service Center Name*"
            InputLabelProps={{
              shrink: values?.outletName
            }}
            InputProps={{ disableUnderline: true }}
            variant="filled"
            onChange={(e) => {
              setFieldValue(`outlet[${index}].outletName`, e.target.value)
            }}
            onBlur={() => setFieldTouched(`outlet[${index}].outletName`, true)}
            helperText={
              touched?.outlet?.[index]?.outletName ? (
                <ErrorText text={errors?.outlet?.[index]?.outletName} />
              ) : (
                ""
              )
            }
            error={
              touched.outlet?.[index]?.outletName && Boolean(errors?.outlet?.[index]?.outletName)
            }
            type="text"
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <InputField
            sx={styles.inputBox}
            size="medium"
            name="gstin"
            label="GSTIN*"
            InputLabelProps={{
              shrink: values?.gstin
            }}
            inputProps={{ maxLength: 15 }}
            InputProps={{ disableUnderline: true }}
            value={values?.outlet[index]?.gstin}
            variant="filled"
            onChange={(e) => {
              setFieldValue(`outlet[${index}].gstin`, e.target.value)
            }}
            onBlur={() => setFieldTouched(`outlet[${index}].gstin`, true)}
            helperText={
              touched.outlet?.[index]?.gstin ? (
                <ErrorText text={errors?.outlet?.[index]?.gstin} />
              ) : (
                ""
              )
            }
            error={touched.outlet?.[index]?.gstin && Boolean(errors?.outlet?.[index]?.gstin)}
            type="text"
            fullWidth
            margin="normal"
          />
        </Grid>
      </Grid>
      <Grid spacing={2} container>
        <Grid item xs={12} sm={4}>
          <DropDown
            onBlur={() => setFieldTouched(`outlet[${index}].region`, true)}
            showError={touched?.outlet?.[index]?.region && Boolean(errors?.outlet?.[index]?.region)}
            helperText={touched?.outlet?.[index]?.region ? errors?.outlet?.[index]?.region : ""}
            fieldName="region"
            style={styles.inputBox}
            value={values?.outlet[index]?.region}
            items={regionList}
            handleChange={(e) => {
              setFieldValue(`outlet[${index}].state`, "")
              setFieldValue(`outlet[${index}].city`, "")
              setFieldValue(`outlet[${index}].region`, e.target.value)
            }}
            label="Region*"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DropDown
            onBlur={() => setFieldTouched(`outlet[${index}].state`, true)}
            showError={touched.outlet?.[index]?.state && Boolean(errors.outlet?.[index]?.state)}
            helperText={touched.outlet?.[index]?.state ? errors.outlet?.[index]?.state : ""}
            fieldName="state"
            style={styles.inputBox}
            value={values?.outlet[index]?.state}
            items={stateList}
            handleChange={(e) => {
              setFieldValue(`outlet[${index}].city`, "")
              setFieldValue(`outlet[${index}].state`, e.target.value)
            }}
            disabled={!values?.outlet[index]?.region}
            label="State*"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DropDown
            onBlur={() => setFieldTouched(`outlet[${index}].city`, true)}
            showError={touched.outlet?.[index]?.city && Boolean(errors.outlet?.[index]?.city)}
            helperText={touched.outlet?.[index]?.city ? errors.outlet?.[index]?.city : ""}
            fieldName="city"
            style={styles.inputBox}
            value={values?.outlet[index]?.city}
            items={cityList}
            disabled={!values?.outlet[index]?.state}
            handleChange={(e) => setFieldValue(`outlet[${index}].city`, e.target.value)}
            label="City*"
          />
        </Grid>
        <Grid style={{ marginTop: "1.5rem" }} item xs={12} sm={8}>
          {window.google && (
            <PlacesAutocomplete
              value={values?.outlet[index]?.address}
              // onChange={setAddress}
              onChange={(address) => {
                setFieldValue(`outlet[${index}].address`, address)
              }}
              searchOptions={options}
              onSelect={async (value) => {
                const result = await geocodeByAddress(value)
                const ll = await getLatLng(result[0])
                setFieldValue(`outlet[${index}].latitude`, ll?.lat)
                setFieldValue(`outlet[${index}].longitude`, ll?.lng)
                setFieldValue(`outlet[${index}].address`, value)
              }}
              onError={onError}>
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "auto"
                  }}>
                  <InputField
                    variant="filled"
                    label="Full Address"
                    value={values?.outlet[index]?.address}
                    id="address"
                    helperText={
                      touched.outlet?.[index]?.address ? errors?.outlet?.[index]?.address : ""
                    }
                    error={
                      touched.outlet?.[index]?.address && Boolean(errors?.outlet?.[index]?.address)
                    }
                    onBlur={() => setFieldTouched(`outlet[${index}].address`, true)}
                    style={{ width: "100%" }}
                    InputProps={{
                      disableUnderline: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconWrapper imgSrc={SearchIcon} />
                        </InputAdornment>
                      )
                    }}
                    {...getInputProps({
                      placeholder: "Type Full Address",
                      className: "location-search-input"
                    })}
                  />
                  <div className={styles.loadingBox}>
                    {loading && (
                      <div className={styles.loader}>
                        <CircularProgress height={10} />
                      </div>
                    )}
                    <Box sx={styles.suggestionsBox}>
                      {suggestions.map((suggestion, index) => {
                        const style = suggestion.active
                          ? styles.suggestionItemHover
                          : styles.suggestionItem

                        return (
                          <div
                            key={index}
                            {...getSuggestionItemProps(suggestion, {
                              style
                            })}>
                            <span>{suggestion.description}</span>
                          </div>
                        )
                      })}
                    </Box>
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ServiceCenterForm
