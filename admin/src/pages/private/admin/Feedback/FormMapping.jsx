import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useTheme,
  useMediaQuery
} from "@mui/material"
import Toast from "components/utilities-components/Toast/Toast"
import CloseIcon from "@mui/icons-material/Close"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { useStyles } from "./feedBackStyles"
import DropDown from "components/utilities-components/DropDown/DropDown"
import MultiSelect from "components/utilities-components/Mulit-Select/MultiSelect"
import { FeedBackService } from "network/feedbackService"
import { sortData, sortOutletData, getTotalAgentsCount, getDealers } from "./feedBackUtility"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { PageHeader } from "components/FeedbackPanel/FeedbackListing/PageHeader"
import PopupModal from "components/PopupModal"
import { useDispatch, useSelector } from "react-redux"
import { coreAppActions, feedBackActions } from "redux/store"
import ConfirmAgent from "components/FeedbackPanel/Form/ConfirmAgent"
import { useNavigate, useParams } from "react-router-dom"
import { AgentService } from "network/agentService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import CommonFooter from "components/utilities-components/CommonFooter"
const FormMapping = () => {
  const styles = useStyles()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const params = useParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const formDetails = useSelector((state) => state.feedBack.formDetails)
  const isEdit = useSelector((state) => state.feedBack.isEdit)
  const isViewOnly = useSelector((state) => state.feedBack.isViewOnly)
  const subTitle = `${formDetails?.createdAt} | ${formDetails?.questions} Questions`
  const formId = params.id
  const [regions, setRegions] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [oems, setOems] = useState([])
  const [dealers, setDealers] = useState([])
  const [agents, setAgents] = useState([])
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedOem, setSelectedOem] = useState("")
  const [selectedDealers, setSelectedDealer] = useState([])
  const [outlets, setOutlets] = useState(null)
  const [totalAgents, setTotalAgents] = useState(0)
  const [changeAgentsCount, setChangeAgentsCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dontFetch, setDontFetch] = useState(false)
  useEffect(() => {
    getRegion()
    getAgents()
  }, [])
  useEffect(() => {
    !dontFetch && formId && getMapDetails(formId)
  }, [dealers?.length])
  useEffect(() => {
    selectedRegion && getState()
  }, [selectedRegion])
  useEffect(() => {
    selectedState && getCity()
  }, [selectedState])
  useEffect(() => {
    selectedCity && getOEMS()
  }, [selectedCity])
  useEffect(() => {
    selectedOem && getDealer()
  }, [selectedOem])
  useEffect(() => {
    selectedDealers?.length > 0 ? getOutletMachines() : setOutlets([])
  }, [selectedDealers?.length])
  useEffect(() => {
    outlets && outlets?.length > 0 && getAgentsCount()
  }, [outlets?.length, changeAgentsCount])
  const handleRegion = (id) => {
    setSelectedRegion(id)
    setSelectedState("")
    setSelectedCity("")
    setSelectedOem("")
    setSelectedDealer([])
  }
  const handleState = (id) => {
    setSelectedState(id)
    setSelectedCity("")
    setSelectedOem("")
    setSelectedDealer([])
  }
  const handleCity = (id) => {
    setSelectedCity(id)
    setSelectedOem("")
    setSelectedDealer([])
  }
  const handleOem = (id) => {
    setSelectedOem(id)
    setSelectedDealer([])
    setDontFetch(true)
  }

  const handleDealersSelect = (val) => {
    setSelectedDealer(val)
    setDontFetch(false)
  }

  const handleAgentsAssign = (parentIndex, childIndex, key, value) => {
    const copyObj = [...outlets]
    let parentTarget = copyObj[parentIndex]
    let target = copyObj[parentIndex]["machines"][childIndex]
    if (key === "remove") {
      target["agents"] = []
    } else if (key === "removeSelected") {
      target["agents"] = target["agents"].filter((agent) => agent?.value !== value)
    } else if (key === "agents") {
      target["agents"] = value
    }
    parentTarget["totalAgentsCount"] = getTotalAgentsCount(parentTarget["machines"])
    setChangeAgentsCount((prev) => !prev)
    setOutlets(copyObj)
  }
  const getAgentsCount = () => {
    const machineArray = outlets.map((outlet) => outlet.machines)
    const flatMachineArray = machineArray.flat()
    const AgentsArray = flatMachineArray.map((machine) => machine?.agents)
    const flatAgentArray = AgentsArray.flat()
    setTotalAgents(flatAgentArray?.length)
  }
  const enableAll = () => {
    dispatch(feedBackActions.setIsViewOnly(false))
    dispatch(feedBackActions.setIsEdit(true))
  }

  const getRegion = async () => {
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
  const getState = async () => {
    let key = `filters[regionId]`
    const params = { [key]: selectedRegion }
    setLoading(true)
    const response = await FeedBackService.getState(params)
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
  const getCity = async () => {
    let key = `filters[stateId]`
    let params = { [key]: selectedState }
    setLoading(true)
    const response = await FeedBackService.getCity(params)
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
      // [cityFilter]: selectedCitys,
      [statusFilter]: 1
    }
    resetDealer()
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
  const getAgents = async () => {
    setLoading(true)
    //Passing Static Value to bring upto 10000 Agents
    // need to discuss with rajat so that BE creates amaster agent list API that can be used here.
    const param = [`?offset=${1}&limit=${10000}`]

    const response = await AgentService.getAgentList(param)
    if (response.success && response.code === 200) {
      const labelKey = "username"
      const key = "userId"
      const filteredAgents = response?.data?.records.filter((item) => item?.isActive === true)
      const sortedData = sortData(labelKey, key, filteredAgents)
      setAgents(sortedData)
      setLoading(false)
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
      setLoading(false)
    }
  }
  const resetDealer = () => {
    setSelectedDealer([])
    setOutlets([])
  }

  const getDealer = async () => {
    setLoading(true)
    let key = `oemIds`
    let cityFilter = `cityId`

    const response = await FeedBackService.getDealer(key, selectedOem, cityFilter, selectedCity)
    if (response.success && response.code === 200) {
      if (response?.data?.records[0]?.users?.length > 0) {
        const labelKey = "username"
        const key = "userId"
        const sortedData = sortData(labelKey, key, response?.data?.records[0]?.users)
        setDealers(sortedData)
        setLoading(false)
        resetDealer()
      } else {
        setDealers(response?.data?.records?.users)
        setLoading(false)
        resetDealer()
      }
    } else {
      Toast.showErrorToast(`Something Went Wrong!`)
    }
  }
  const getOutletMachines = async () => {
    setLoading(true)
    const key = `dealerIds`
    const idArray = selectedDealers.map((dealer) => dealer?.value)
    const idString = idArray.join(",")
    const formID = formId ? formId : formDetails?.formId
    const response = await FeedBackService.getOutletsWithMachines(key, idString, formID)
    if (response?.success && response?.code === 200) {
      const sortedOutletData = sortOutletData(response?.data?.outlets, selectedDealers, agents)
      setOutlets(sortedOutletData)
      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const getMapDetails = async (id) => {
    setLoading(true)
    const response = await FeedBackService.getMapDetails(id)
    if (response?.success && response?.code === 200) {
      setSelectedRegion(response?.data?.regionId)
      setSelectedState(response?.data?.stateId)
      setSelectedCity(response?.data?.cityId)
      setSelectedOem(response?.data?.oemId)
      if (selectedOem) {
        const getDealer = getDealers(response?.data?.dealers, dealers)
        setSelectedDealer(getDealer) // const labelKey = "name"
        setLoading(false)
      }
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const getStylesHere = (length) => {
    return length === 0
      ? [styles?.redText, styles?.commonText]
      : [styles?.normalText, styles?.commonText]
  }
  const getTextHere = (length) => {
    return (
      <>
        &#x2022; &nbsp;{" "}
        {length > 0
          ? length === 1
            ? `${length} Agent`
            : `${length} Agents`
          : `No Agents Selected `}
      </>
    )
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  const openPopup = () => {
    dispatch(coreAppActions.updatePopupModal(true))
  }
  const handleBack = () => {
    navigate(-1)
  }

  const handleCancel = () => {
    if (isEdit) {
      // getForm(formID)
      dispatch(feedBackActions.setIsViewOnly(true))
      dispatch(feedBackActions.setIsEdit(false))
    } else {
      handleBack()
      dispatch(feedBackActions.setIsViewOnly(false))
      dispatch(feedBackActions.setIsEdit(false))
    }
  }
  const getSummaryStyles = () => {
    return !isMobile ? styles?.display : { ...styles?.display, ...styles?.column }
  }
  return (
    <Paper
      sx={isMobile ? styles?.papperWrapper : { ...styles?.papperWrapper, marginBottom: "90rem" }}>
      {loading && <AppLoader />}
      <Grid container sx={styles?.whitebackGround}>
        <Grid item xs={8}>
          <PageHeader
            title={formDetails?.formName}
            subTitle={subTitle}
            goBack={handleBack}
            hideFilters
          />
        </Grid>
        {!isMobile && !isEdit && !isViewOnly && (
          <Grid item xs={4} style={{ ...styles?.display, ...styles?.justifyEnd }}>
            <PrimaryButton style={styles?.saveBtn} onClick={openPopup} disabled={totalAgents === 0}>
              Save
            </PrimaryButton>
          </Grid>
        )}
        {!isMobile && (isEdit || isViewOnly) && (
          <Grid item xs={4} style={{ ...styles?.display, ...styles?.alignCenter }}>
            <SecondaryButton
              style={{ ...styles?.btn, ...styles?.marginLeft }}
              onClick={handleCancel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              style={{ ...styles?.btn, ...styles?.marginLeft }}
              onClick={isViewOnly ? enableAll : openPopup}
              disabled={totalAgents === 0}>
              {isViewOnly ? "Edit" : "Update"}
            </PrimaryButton>
          </Grid>
        )}
      </Grid>{" "}
      <Paper sx={styles?.smallWrapper}>
        <Grid container sx={styles?.dropDownGrid} spacing={1}>
          <Grid item xs={12}>
            <Typography style={styles?.subTitle}>Select Area for this feedback*</Typography>
          </Grid>

          <Grid item xs={isMobile ? 12 : 4} sx={styles?.dropDownWidth}>
            <DropDown
              label="Region"
              value={selectedRegion}
              items={regions}
              handleChange={({ target: { value } }) => handleRegion(value)}
              disabled={isViewOnly}
            />
          </Grid>
          <Grid item xs={isMobile ? 12 : 4} sx={styles?.dropDownWidth}>
            <DropDown
              label="State"
              value={selectedState}
              items={states}
              handleChange={({ target: { value } }) => handleState(value)}
              disabled={!selectedRegion || isViewOnly}
            />
          </Grid>
          <Grid item xs={isMobile ? 12 : 4} sx={styles?.dropDownWidth}>
            <DropDown
              label="City"
              value={selectedCity}
              items={cities}
              handleChange={({ target: { value } }) => handleCity(value)}
              disabled={!selectedState || isViewOnly}
            />
          </Grid>
          <Grid item xs={isMobile ? 12 : 4} sx={styles?.dropDownWidth}>
            <DropDown
              label="OEM"
              value={selectedOem}
              items={oems}
              handleChange={({ target: { value } }) => handleOem(value)}
              disabled={!selectedCity || isViewOnly}
            />
          </Grid>
          <Grid item xs={isMobile ? 12 : 4} sx={styles?.dropDownWidth}>
            <MultiSelect
              items={dealers}
              label="Dealers"
              selectAllLabel="Select all"
              selectAll
              onSelect={(value) => handleDealersSelect(value)}
              selectedItems={selectedDealers}
              style={isMobile ? styles?.fullWidth : styles?.multiSelectWidth}
              disabled={!selectedOem || isViewOnly}
            />
          </Grid>
        </Grid>
      </Paper>
      {outlets && (
        <Paper
          sx={isMobile ? { ...styles?.smallWrapper, marginBottom: "90rem" } : styles?.smallWrapper}>
          <Grid container sx={styles?.accordionGrid} marginBottom={"10rem"} spacing={1}>
            <Grid item xs={12} style={{ marginBottom: "70rem" }}>
              {outlets.map((dealer, parentIndex) => {
                return (
                  <>
                    <Grid item xs={12}>
                      <Typography style={styles?.subTitle}>Assign Feedback Agents</Typography>
                    </Grid>
                    <Accordion sx={styles?.accordion} key={parentIndex}>
                      <AccordionSummary
                        sx={styles?.summary}
                        expandIcon={
                          <div
                            style={{
                              ...styles?.expandDiv,
                              ...styles?.display,
                              ...styles?.alignCenter,
                              ...styles?.justifyCenter
                            }}>
                            <ExpandMoreIcon fontSize="large" />
                          </div>
                        }>
                        <Box sx={getSummaryStyles()}>
                          <Box sx={{ paddingRight: "1.5rem" }}>
                            <Typography sx={styles?.whiteText}>{dealer?.name}</Typography>
                            <Typography sx={styles?.smallWhiteText}>
                              {dealer?.dealerName}
                            </Typography>
                            <Typography sx={styles?.smallWhiteText}>{dealer?.address}</Typography>
                          </Box>
                          <Box sx={[styles?.display, styles?.alignCenter]}>
                            <Box
                              sx={[
                                styles?.display,
                                styles?.alignCenter,
                                !isMobile ? styles?.marLef : styles?.marTop,
                                styles.machineBox
                              ]}>
                              {dealer?.machines.map((machine, index) => {
                                return (
                                  <Box
                                    key={index}
                                    sx={[
                                      styles?.display,
                                      styles?.alignCenter,
                                      styles?.justifyCenter,
                                      styles?.machines,
                                      styles?.rect
                                    ]}>
                                    <Typography sx={styles?.whiteText}>{machine?.name}</Typography>
                                  </Box>
                                )
                              })}
                            </Box>
                            {isMobile && (
                              <Box sx={[styles?.display, styles?.alignCenter, styles?.marginL]}>
                                <Typography variant="h7">
                                  {getTextHere(dealer?.totalAgentsCount)}{" "}
                                </Typography>{" "}
                              </Box>
                            )}
                          </Box>
                        </Box>
                        {!isMobile && (
                          <Box sx={[styles?.display, styles?.alignCenter, styles?.marLef]}>
                            <Typography variant="h7">
                              {getTextHere(dealer?.totalAgentsCount)}{" "}
                            </Typography>{" "}
                          </Box>
                        )}
                      </AccordionSummary>
                      <AccordionDetails sx={{ padding: "2rem" }}>
                        {dealer?.machines?.length > 0 ? (
                          dealer?.machines.map((machine, childIndex) => {
                            return (
                              <div style={styles?.detailsWrapper} key={childIndex}>
                                <div
                                  style={
                                    !isMobile
                                      ? styles?.oemDet
                                      : { ...styles?.display, ...styles?.column }
                                  }>
                                  <div style={{ ...styles?.display, ...styles?.alignCenter }}>
                                    <Typography sx={[styles?.commonText, styles?.normalText]}>
                                      Machine:
                                    </Typography>
                                    <Box
                                      sx={[
                                        styles?.display,
                                        styles?.alignCenter,
                                        styles?.justifyCenter,
                                        styles?.machines,
                                        styles?.square,
                                        styles?.marLef
                                      ]}>
                                      <Typography variant="s1" color="text.white">
                                        {machine?.name}
                                      </Typography>
                                    </Box>
                                    <Typography sx={getStylesHere(machine?.agents?.length)}>
                                      {getTextHere(machine?.agents?.length)}
                                    </Typography>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center"
                                    }}>
                                    <MultiSelect
                                      label="Add Agents"
                                      selectedItems={machine?.agents}
                                      items={agents}
                                      onSelect={(value) =>
                                        handleAgentsAssign(parentIndex, childIndex, "agents", value)
                                      }
                                      id="Agents"
                                      selectAll
                                      selectAllLabel="Select all"
                                      searchEnabled
                                      style={styles?.multiSelectWidth}
                                      disabled={isViewOnly}
                                    />
                                  </div>
                                </div>
                                <div
                                  style={{
                                    ...styles?.display,
                                    ...styles?.agentWrapper,
                                    ...styles?.alignCenter
                                  }}>
                                  {machine?.agents?.length > 0 &&
                                    machine?.agents.map((agent, index) => {
                                      return (
                                        <div
                                          key={index}
                                          style={{
                                            ...styles?.display,
                                            ...styles?.justifyAround,
                                            ...styles?.alignCenter,
                                            ...styles?.agentDiv
                                          }}>
                                          <Typography
                                            variant="p2"
                                            color="text.gray"
                                            sx={{ overflow: "hidden" }}>
                                            {agent?.label}
                                          </Typography>
                                          {!isViewOnly && (
                                            <CloseIcon
                                              onClick={handleAgentsAssign.bind(
                                                null,
                                                parentIndex,
                                                childIndex,
                                                "removeSelected",
                                                agent?.value
                                              )}
                                              sx={styles?.pointer}
                                              fontSize="large"
                                              color="disable"
                                            />
                                          )}
                                        </div>
                                      )
                                    })}
                                  {!isMobile && !isViewOnly && machine?.agents?.length > 0 && (
                                    <Typography
                                      onClick={handleAgentsAssign.bind(
                                        null,
                                        parentIndex,
                                        childIndex,
                                        "remove"
                                      )}
                                      sx={[styles?.commonText, styles?.clearAll, styles?.pointer]}>
                                      Clear Agents
                                    </Typography>
                                  )}
                                </div>
                                {isMobile && !isViewOnly && machine?.agents?.length > 0 && (
                                  <Typography
                                    onClick={handleAgentsAssign.bind(
                                      null,
                                      parentIndex,
                                      childIndex,
                                      "remove"
                                    )}
                                    sx={[styles?.commonText, styles?.clearAll, styles?.pointer]}>
                                    Clear Agents
                                  </Typography>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <Typography sx={[styles?.redText, styles?.commonText]}>
                            No Machines
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </>
                )
              })}
            </Grid>
          </Grid>
          {isMobile && (
            <CommonFooter>
              {isMobile && !isEdit && !isViewOnly && (
                <Grid item xs={12} style={{ ...styles?.display, ...styles?.justifyEnd }}>
                  <PrimaryButton
                    style={styles?.saveBtn}
                    onClick={openPopup}
                    disabled={totalAgents === 0}>
                    Save
                  </PrimaryButton>
                </Grid>
              )}
              {isMobile && (isEdit || isViewOnly) && (
                <Grid item xs={12} style={{ ...styles?.display, ...styles?.alignCenter }}>
                  <SecondaryButton
                    style={{ ...styles?.btn, ...styles?.marginLeft }}
                    onClick={handleCancel}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    style={{ ...styles?.btn, ...styles?.marginLeft }}
                    onClick={isViewOnly ? enableAll : openPopup}
                    disabled={totalAgents === 0}>
                    {isViewOnly ? "Edit" : "Update"}
                  </PrimaryButton>
                </Grid>
              )}
            </CommonFooter>
          )}
        </Paper>
      )}
      <PopupModal handleClose={handleClose}>
        <ConfirmAgent
          handleClose={handleClose}
          data={outlets}
          dropDownData={{
            selectedCity,
            selectedDealers,
            selectedOem,
            selectedRegion,
            selectedState,
            formId: formDetails?.formId
          }}
        />
      </PopupModal>
    </Paper>
  )
}

export default FormMapping
