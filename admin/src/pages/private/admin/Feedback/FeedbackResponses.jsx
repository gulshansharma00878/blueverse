import React, { useEffect, useState } from "react"
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material"
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom"
import { useStyles } from "./feedBackStyles"
import EmptyState from "components/FeedbackPanel/FeedbackListing/EmptyState"
import FeedbackTableHeader from "components/FeedbackPanel/FeedbackListing/FeedbackTableHeader"
import { useNavigate } from "react-router-dom"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { FeedBackService } from "network/feedbackService"
import { sortMappedForms, getNames, apiParams } from "./feedBackUtility"
import { feedBackActions } from "redux/store"
import { useDispatch } from "react-redux"
import { userDetail } from "hooks/state"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { getPermissionJson } from "helpers/Functions/roleFunction"

const FeedbackResponses = () => {
  const styles = useStyles()
  const user = userDetail()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [responseListing, setResponseListing] = useState([])
  const [machineIds, setMachineIds] = useState([])
  const [oemId, setOemIds] = useState([])
  const [cityId, setCityIds] = useState([])
  const [isFilterUsed, setIsFiterUsed] = useState(false)
  const [stateId, setStateIds] = useState([])
  const [regionId, setRegionIds] = useState([])
  const [dealerId, setDealerIds] = useState([])
  const [filterUpdates, setFilterUpdate] = useState(0)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [sorts, setSort] = useState("NEW")
  const [subAdminPermission, setSubadminPermission] = useState()

  // const [exportURL, setExportURL] = useState("")
  const handleSort = (changeSort) => {
    changeSort === "NEW" ? setSort("OLD") : setSort("NEW")
  }
  const navigate = useNavigate()
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  useEffect(() => {
    getAllpermission()
  }, [])

  useEffect(() => {
    getResponseListing()
  }, [filterUpdates, sorts, searchQuery])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "feedback response")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const setQuery = (val) => {
    setSearchQuery(val)
  }

  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  const handleFilter = (
    startDate,
    endDate,
    washType,
    selectedRegion,
    selectedState,
    selectedCity,
    selectedOEM,
    selectedDealer,
    selectedMachine
  ) => {
    setStartDate(startDate)
    setEndDate(endDate)
    setRegionIds(selectedRegion)
    setOemIds(selectedOEM)
    setCityIds(selectedCity)
    setStateIds(selectedState)
    setDealerIds(selectedDealer)
    setMachineIds(selectedMachine)
    setFilterUpdate(filterUpdates + 1)
    handleDrawer()
  }

  const getResponseListing = async () => {
    setIsLoading(true)
    const getParams = apiParams(
      startDate,
      endDate,
      regionId,
      stateId,
      cityId,
      oemId,
      dealerId,
      machineIds,
      sorts,
      searchQuery
    )
    const response = await FeedBackService.getFormsList(getParams)
    if (response?.success && response?.code === 200) {
      const filteredListing = response?.data?.feedbacks.filter((item) => item.region)
      const sortedData = sortMappedForms(filteredListing)
      setResponseListing(sortedData)
      setIsLoading(false)
    } else {
      setIsLoading(false)
      Toast.showErrorToast(response?.message)
      // ooo
    }
  }

  const handleStatus = (item) => {
    dispatch(feedBackActions.setFormDetails(item))
    navigate(`/${user?.role}/feedback/feedback-response/` + item?.formId)
  }
  const downloadReport = async (id) => {
    setIsLoading(true)
    const exportResponse = await FeedBackService.getExportURL(id)
    // Response Handling for Export Response
    if (exportResponse?.success && exportResponse?.code === 200) {
      const link = document.createElement("a")
      link.href = exportResponse?.data?.records
      link.setAttribute("download", "Feedback Response.csv")
      document.body.appendChild(link)
      link.click()
      Toast.showInfoToast(exportResponse?.message)
      setIsLoading(false)
    } else {
      Toast.showErrorToast(exportResponse?.message)
      setIsLoading(false)
    }
  }

  const checkPermission = () => {
    if (user.role === "subadmin") {
      if (subAdminPermission?.exportPermission) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  const getRows = (items) => {
    return (
      <>
        {items?.map((item, index) => {
          return (
            <>
              {item?.region && item?.state && item?.city && item?.oem && (
                <TableRow
                  // key={index}
                  sx={{ cursor: "pointer" }}
                  key={index}>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    {" "}
                    <Typography sx={styles?.tableInformationText}>{item?.serial}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    {" "}
                    <Typography sx={styles?.tableInformationText}>{item?.formName}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>{item?.questions}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>{item?.responses}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>{item?.createdAt}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>{item?.region?.name}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>{item?.state?.name}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>{item?.city?.name}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>{item?.oem?.name}</Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>
                      {getNames(item?.dealer)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={styles?.cellWidth}
                    onClick={() => {
                      handleStatus(item)
                    }}>
                    <Typography sx={styles?.tableInformationText}>
                      {getNames(item?.machines)}
                    </Typography>
                  </TableCell>
                  <TableCell style={{ ...styles?.cellWidth, textAlign: "center" }}>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      className="filtericonBox left-margin"
                      disabled={
                        user.role === "subadmin" ? !subAdminPermission?.exportPermission : false
                      }
                      // style={{ marginLeft: "24px" }}
                      onClick={downloadReport.bind(null, item?.formId)}>
                      <VerticalAlignBottomIcon
                        color={checkPermission() ? "" : "primary"}
                        fontSize="large"
                      />{" "}
                    </IconButton>
                  </TableCell>
                </TableRow>
              )}
            </>
          )
        })}
      </>
    )
  }
  return (
    <>
      <CommonHeader
        heading="Feedbacks Responses"
        badgeData={responseListing?.length}
        setQuery={setQuery}
        searchQuery={searchQuery}
        searchEnabled
        filterEnabled
        handleDrawer={handleDrawer}
        isFilterUsed={isFilterUsed}
        isMobile={isMobile}
      />
      {responseListing?.length === 0 ? (
        <EmptyState hideCreate />
      ) : (
        <Paper style={styles?.tableContainer}>
          <Box>
            <TableContainer sx={styles?.smallMarginTop}>
              <Table>
                <FeedbackTableHeader sort={sorts} handleSort={handleSort} showResponseCount />
                <TableBody>{getRows(responseListing)}</TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}
      <FilterDrawer
        open={openDrawer}
        handleDrawer={handleDrawer}
        handleFilter={handleFilter}
        showUsedFilter={showUsedFilter}
      />
      {isLoading ? <AppLoader /> : null}
    </>
  )
}

export default FeedbackResponses
