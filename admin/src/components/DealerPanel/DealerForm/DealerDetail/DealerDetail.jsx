/*eslint-disable no-unused-vars */
import { Box, Grid, InputAdornment, Typography, useMediaQuery } from "@mui/material"
import DropDown from "components/utilities-components/DropDown/DropDown"
import { FieldArray, Form, Formik } from "formik"
import { DealerDetailValidator } from "helpers/validators/dealerDetailForm"
import React, { useEffect, useState } from "react"
import { useStyles } from "./DealerDetailStyles"
import InputField from "components/utilities-components/InputField/InputField"
import AddIcon from "@mui/icons-material/Add"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { useDispatch } from "react-redux"
import { dealerActions } from "redux/store"
import DocumentUpload from "components/utilities-components/DocumentUpload/DocumentUpload"
import { DealerService } from "network/dealerService"
import Toast from "components/utilities-components/Toast/Toast"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import AspectRatioIcon from "@mui/icons-material/AspectRatio"
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import NoteIcon from "@mui/icons-material/Note"
import { useSelector } from "react-redux"
import {
  prepareCreateDealerPayload,
  prepareEditDealerPayload
} from "components/DealerPanel/dealerUtilities"
import LightTooltip from "components/utilities-components/LightTooltip"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import ServiceCenterForm from "./ServiceCenterForm"
import CommonFooter from "components/utilities-components/CommonFooter"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import InfoIcon from "@mui/icons-material/Info"

const defaultInitialData = {
  oem: "",
  email: "",
  phone: "",
  pan: "",
  dealerName: "",
  documents: [],
  outlet: [
    {
      outletName: "",
      region: "",
      gstin: "",
      city: "",
      state: "",
      address: "",
      latitude: "",
      longitude: ""
    }
  ]
}
const fileTypes = [
  "PDF (Portable Document Format)",
  "DOC or DOCX (Microsoft Word Document or OpenOffice Writer Document)",
  "XLS or XLSX (Microsoft Excel Spreadsheet or OpenOffice Calc Spreadsheet)",
  "PPT or PPTX (Microsoft PowerPoint Presentation or OpenOffice Impress Presentation)",
  "TXT (Plain Text) RTF (Rich Text Format)",
  "CSV (Comma Separated Values) JPEG"
]
function DealerDetail() {
  const dispatch = useDispatch()
  const dealerFormDetails = useSelector((state) => state.dealer.dealerFormDetails)
  const dealerFullDetails = useSelector((state) => state.dealer.dealerDetails)
  const dealerId = useSelector((state) => state.dealer.dealerID)
  // const dealer
  const [oemData, setOemData] = useState()

  const [isLoading, setIsLoading] = useState(false)
  const [deleteDocument, setDeleteDocument] = useState([])
  const [loading, setLoading] = useState(false)
  const isMobile = useMediaQuery("(max-width:600px)")

  useEffect(() => {
    getAllList()
  }, [])
  let oemlist = oemData?.map((item) => {
    return { value: item?.oemId, label: item.name }
  })

  const styles = useStyles()

  const getAllList = async () => {
    setLoading(true)
    let param = [`?filters[status]=${1}`]
    const response = await DealerService.getOemList(param)

    if (response.success && response.code === 200) {
      setOemData(response.data)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
    }
    setLoading(false)
  }

  const submitDetail = async (value) => {
    setIsLoading(true)
    let response

    if (Object.keys(dealerFormDetails).length) {
      // if true, means we need to edit dealer
      let payload = prepareEditDealerPayload(value, dealerFullDetails, deleteDocument)
      response = await DealerService.updateDealerDetails(payload, dealerId)
    } else {
      // If true, means we need to create dealer
      let payload = prepareCreateDealerPayload(value)

      response = await DealerService.addDealer(payload)
    }

    if (response.success && response.code === 200) {
      Toast.showInfoToast(response?.message)
      setIsLoading(false)
      dispatch(dealerActions.setActiveStep(1))
      dispatch(dealerActions.setDealerId(dealerId ? dealerId : response?.data?.dealer?.dealer_id))
    } else {
      Toast.showErrorToast(response?.message)
      setIsLoading(false)
    }
  }

  const SubmitButton = (props) => {
    return (
      <PrimaryButton
        disabled={!props.valid}
        type="submit"
        sx={{ width: { xs: "100%", sm: "22.9rem" } }}>
        Next
      </PrimaryButton>
    )
  }

  return (
    <Grid container>
      {loading && <AppLoader />}
      <Formik
        initialValues={
          Object.keys(dealerFormDetails).length ? dealerFormDetails : defaultInitialData
        }
        validationSchema={DealerDetailValidator}
        onSubmit={(values) => submitDetail(values)}>
        {({ isValid, values, errors, touched, setFieldTouched, setFieldValue }) => (
          <Form style={styles.formBox}>
            <Grid container>
              <Typography variant="s1" component="p" sx={styles.subTitle}>
                Select OEM
              </Typography>
              <Grid item xs={12} sm={6}>
                <DropDown
                  label="OEM*"
                  onBlur={() => setFieldTouched(`oem`, true)}
                  showError={touched.oem && Boolean(errors.oem)}
                  helperText={touched.oem ? errors?.oem : ""}
                  value={values.oem}
                  items={oemlist}
                  handleChange={(e) => setFieldValue("oem", e.target.value)}
                />
              </Grid>
              <Grid
                xs={12}
                style={{
                  borderBottom: "0.1rem solid #C9D8EF",
                  borderTop: "0.1rem solid #C9D8EF",
                  marginTop: "2.4rem",
                  padding: "2.4rem 0rem 2.4rem 0rem"
                }}>
                <Typography variant="s1">Add Dealership details</Typography>
                <Grid item xs={12} sm={8}>
                  <InputField
                    sx={styles.inputBox}
                    size="medium"
                    name="dealerName"
                    label="Dealership Name*"
                    InputLabelProps={{
                      shrink: values.dealerName
                    }}
                    InputProps={{ disableUnderline: true }}
                    value={values.dealerName}
                    variant="filled"
                    onChange={(e) => {
                      setFieldValue("dealerName", e.target.value)
                    }}
                    onBlur={() => setFieldTouched("dealerName", true)}
                    helperText={touched.dealerName ? <ErrorText text={errors?.dealerName} /> : ""}
                    error={touched.dealerName && Boolean(errors.dealerName)}
                    type="text"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <InputField
                    sx={styles.inputBox}
                    size="medium"
                    name="email"
                    label="Email Address*"
                    InputLabelProps={{
                      shrink: values.email
                    }}
                    InputProps={{ disableUnderline: true }}
                    value={values.email}
                    variant="filled"
                    onChange={(e) => {
                      setFieldValue("email", e.target.value)
                    }}
                    onBlur={() => setFieldTouched("email", true)}
                    helperText={touched.email ? <ErrorText text={errors?.email} /> : ""}
                    error={touched.email && Boolean(errors.email)}
                    type="email"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <InputField
                    sx={styles.inputBox}
                    size="medium"
                    name="phone"
                    label="Phone Number*"
                    InputLabelProps={{
                      shrink: values.phone
                    }}
                    value={values.phone}
                    variant="filled"
                    onChange={(e) => {
                      setFieldValue("phone", e.target.value)
                    }}
                    InputProps={
                      values.phone
                        ? {
                            disableUnderline: true,
                            startAdornment: (
                              <InputAdornment
                                position="start"
                                sx={{
                                  marginTop: { xs: "0.6rem !important", sm: "0.2rem !important" }
                                }}>
                                <Typography variant="p1" color="text.main">
                                  +91
                                </Typography>{" "}
                              </InputAdornment>
                            )
                          }
                        : {
                            disableUnderline: true
                          }
                    }
                    onBlur={() => setFieldTouched("phone", true)}
                    helperText={touched.phone ? <ErrorText text={errors?.phone} /> : ""}
                    error={touched.phone && Boolean(errors.phone)}
                    type="text"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <InputField
                    sx={styles.inputBox}
                    size="medium"
                    name="pan"
                    label="PAN No.*"
                    InputLabelProps={{
                      shrink: values.pan
                    }}
                    inputProps={{ maxLength: 10 }}
                    InputProps={{ disableUnderline: true }}
                    value={values.pan}
                    variant="filled"
                    onChange={(e) => {
                      setFieldValue("pan", e.target.value)
                    }}
                    onBlur={() => setFieldTouched("pan", true)}
                    helperText={touched.pan ? <ErrorText text={errors?.pan} /> : ""}
                    error={touched.pan && Boolean(errors.pan)}
                    type="text"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid
                  sx={{
                    padding: "2rem",
                    borderBottom: "0.1rem solid #C9D8EF",
                    marginBottom: "2rem"
                  }}
                />
                <Grid item xs={12}>
                  <Typography variant="s1" sx={{ marginRight: "2rem" }}>
                    Upload Documents
                  </Typography>
                  <LightTooltip
                    title={
                      <div>
                        <Typography variant="s1" color="text.main">
                          Allowed File Types:{" "}
                        </Typography>
                        {fileTypes.map((item, i) => (
                          <ul key={i}>
                            <li>
                              <Typography variant="s1" color="text.main">
                                {item}
                              </Typography>
                            </li>
                          </ul>
                        ))}
                        <Typography variant="s1" color="text.main">
                          Max File Size Allowed: 5MB
                        </Typography>
                      </div>
                    }>
                    <InfoIcon color="primary" sx={styles.infoBox} />
                  </LightTooltip>
                </Grid>
                <Grid item container xs={12} sx={styles.documentBox}>
                  {[
                    {
                      icon: <CreditCardIcon sx={styles.documentIcon} />,
                      title: "Aadhaar Card"
                    },
                    {
                      icon: <AspectRatioIcon sx={styles.documentIcon} />,
                      title: "PAN Card"
                    },

                    {
                      icon: <WorkspacePremiumIcon sx={styles.documentIcon} />,
                      title: "GST Certificate"
                    },
                    {
                      icon: <AccountBalanceIcon sx={styles.documentIcon} />,
                      title: "Bank A/c details"
                    },
                    {
                      icon: <NoteIcon sx={styles.documentIcon} />,
                      title: "Cancelled Cheque"
                    }
                  ]?.map((item, key) => (
                    <Grid
                      item
                      key={key}
                      md={2}
                      sm={3}
                      sx={{
                        border: "2px solid #CCD2DA"
                      }}>
                      <DocumentUpload
                        title={item?.title}
                        icon={item?.icon}
                        values={dealerFormDetails?.documents}
                        setValues={(value) => {
                          // Check if the "documents" field exists in the state and is an array
                          const currentDocuments = values?.documents || []

                          // Make a copy of the current "documents" array and add the new value to it
                          const updatedDocuments = currentDocuments?.concat(value)

                          // Call the setFieldValue function to update the state with the updated "documents" array
                          setFieldValue("documents", updatedDocuments)
                        }}
                        deleteValues={(file) => {
                          setDeleteDocument([...deleteDocument, file])
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid style={{ width: "100%" }}>
                <FieldArray
                  name="outlet"
                  render={(arrayHelper) => (
                    <>
                      {values?.outlet?.map((item, index) => (
                        <ServiceCenterForm
                          key={index}
                          values={values}
                          index={index}
                          touched={touched}
                          errors={errors}
                          setFieldValue={setFieldValue}
                          setFieldTouched={setFieldTouched}
                        />
                      ))}

                      <Grid
                        style={{ borderBottom: "0.1rem solid #C9D8EF" }}
                        item
                        xs={12}
                        variant="text">
                        <PrimaryButton
                          style={{ margin: "2.4rem 0rem 2.4rem 0rem" }}
                          sx={{ width: { sm: "fit-content", xs: "100%" } }}
                          onClick={() => {
                            arrayHelper.push({
                              outletName: "",
                              gstin: "",
                              region: "",
                              state: "",
                              city: "",
                              address: ""
                            })
                          }}
                          // height={56}
                          // width={283}
                          // fontSize={16}
                          // fontWeight={600}
                        >
                          <AddIcon
                            style={{ height: "2.4rem", width: "2.4rem", marginRight: "1.3rem" }}
                          />
                          Add another Service Centre
                        </PrimaryButton>
                      </Grid>
                    </>
                  )}
                />
              </Grid>

              {isMobile ? (
                <CommonFooter>
                  <SubmitButton valid={isValid} />
                </CommonFooter>
              ) : (
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  width="100%"
                  style={{ gap: "1.6rem", margin: "4.4rem 2rem 4rem 0rem" }}>
                  <SubmitButton valid={isValid} />
                </Box>
              )}
            </Grid>
          </Form>
        )}
      </Formik>
      {isLoading && <AppLoader />}
    </Grid>
  )
}

export default DealerDetail
