import React, { useEffect, useState } from "react"
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme
} from "@mui/material"
// import Edit from "assets/images/Common/edit.webp"
import { useStyles } from "./feedBackStyles"
import EmptyState from "components/FeedbackPanel/FeedbackListing/EmptyState"
import FeedbackTableHeader from "components/FeedbackPanel/FeedbackListing/FeedbackTableHeader"
import { useNavigate } from "react-router-dom"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { FeedBackService } from "network/feedbackService"
import { sortMappedForms, getNames, apiParams } from "./feedBackUtility"
// import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import { feedBackActions } from "redux/store"
import { useDispatch } from "react-redux"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import EditIcon from "@mui/icons-material/Edit"
const MappedForms = () => {
  const styles = useStyles()
  const user = userDetail()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [searchQuery, setSearchQuery] = useState("")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [mappedListing, setMappedListing] = useState([])
  const [machinesIds, setMachineIds] = useState([])
  const [oemsIds, setOemIds] = useState([])
  const [citysIds, setCityIds] = useState([])
  const [statesIds, setStateIds] = useState([])
  const [regionsIds, setRegionIds] = useState([])
  const [dealersIds, setDealerIds] = useState([])
  const [filtersUpdate, setFilterUpdate] = useState(0)
  const [startDates, setStartDate] = useState(null)
  const [endDates, setEndDate] = useState(null)
  const [sorts, setSort] = useState("NEW")
  const [loading, setLoading] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()
  const [isFilterUsed, setIsFiterUsed] = useState(false)

  const handleSort = (changeSort) => {
    changeSort === "NEW" ? setSort("OLD") : setSort("NEW")
  }

  useEffect(() => {
    getAllpermission()
  }, [])

  useEffect(() => {
    getMappedListing()
  }, [filtersUpdate, sorts, searchQuery]) //eslint-disable-next-line no-console

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "form mapping")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const setQuery = (val) => {
    setSearchQuery(val)
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
    setFilterUpdate(filtersUpdate + 1)
    handleDrawer()
  }

  const navigateToMap = (item) => {
    navigate(`/${user?.role}/feedback/create-form-map`)
    dispatch(feedBackActions.setFormDetails(item))
    dispatch(feedBackActions.setIsEdit(false))
    dispatch(feedBackActions.setIsViewOnly(false))
  }
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  const getMappedListing = async () => {
    setLoading(true)
    const getParams = apiParams(
      startDates,
      endDates,
      regionsIds,
      statesIds,
      citysIds,
      oemsIds,
      dealersIds,
      machinesIds,
      sorts,
      searchQuery
    )
    const response = await FeedBackService.getFormsList(getParams)
    if (response?.success && response?.code === 200) {
      const sortedData = sortMappedForms(response?.data?.feedbacks)
      setMappedListing(sortedData)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }
  const handleEdit = (item) => {
    navigate(`/${user?.role}/feedback/edit-form-map/${item?.formId}`)
    dispatch(feedBackActions.setFormDetails(item))
    dispatch(feedBackActions.setIsEdit(true))
    dispatch(feedBackActions.setIsViewOnly(false))
  }
  const handleDetails = (id, item) => {
    navigate(`/${user?.role}/feedback/edit-form-map/${id}`)
    dispatch(feedBackActions.setFormDetails(item))
    dispatch(feedBackActions.setIsViewOnly(true))
  }

  const checkPermission = () => {
    if (user.role === "subadmin") {
      if (subAdminPermission?.updatePermission) {
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
        {items?.map((item) => {
          return (
            <>
              <TableRow>
                <TableCell
                  style={styles?.cellWidth}
                  onClick={handleDetails.bind(null, item?.formId, item)}>
                  {" "}
                  <Typography sx={styles?.tableInformationText}>{item?.serial}</Typography>
                </TableCell>
                <TableCell
                  style={styles?.cellWidth}
                  onClick={handleDetails.bind(null, item?.formId, item)}>
                  {" "}
                  <Typography sx={styles?.tableInformationText}>{item?.formName}</Typography>
                </TableCell>
                <TableCell
                  style={styles?.cellWidth}
                  onClick={handleDetails.bind(null, item?.formId, item)}>
                  <Typography sx={styles?.tableInformationText}>{item?.questions}</Typography>
                </TableCell>
                <TableCell
                  style={styles?.cellWidth}
                  onClick={handleDetails.bind(null, item?.formId, item)}>
                  <Typography sx={styles?.tableInformationText}>{item?.createdAt}</Typography>
                </TableCell>
                {item?.region && item?.state && item?.city && item?.oem ? (
                  <>
                    <TableCell
                      style={styles?.cellWidth}
                      onClick={handleDetails.bind(null, item?.formId, item)}>
                      <Typography sx={styles?.tableInformationText}>
                        {item?.region?.name}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={styles?.cellWidth}
                      onClick={handleDetails.bind(null, item?.formId)}>
                      <Typography sx={styles?.tableInformationText}>{item?.state?.name}</Typography>
                    </TableCell>
                    <TableCell
                      style={styles?.cellWidth}
                      onClick={handleDetails.bind(null, item?.formId, item)}>
                      <Typography sx={styles?.tableInformationText}>{item?.city?.name}</Typography>
                    </TableCell>
                    <TableCell
                      style={styles?.cellWidth}
                      onClick={handleDetails.bind(null, item?.formId, item)}>
                      <Typography sx={styles?.tableInformationText}>{item?.oem?.name}</Typography>
                    </TableCell>
                    <TableCell
                      style={styles?.cellWidth}
                      onClick={handleDetails.bind(null, item?.formId, item)}>
                      <Typography sx={styles?.tableInformationText}>
                        {getNames(item?.dealer)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={styles?.cellWidth}
                      onClick={handleDetails.bind(null, item?.formId, item)}>
                      <Typography sx={styles?.tableInformationText}>
                        {getNames(item?.machines)}
                      </Typography>
                    </TableCell>
                  </>
                ) : (
                  <TableCell colSpan={6}>
                    <Box
                      sx={[
                        styles?.parameter,
                        styles?.fullWidth,
                        styles?.display,
                        styles?.justifyCenter,
                        styles?.alignCenter
                      ]}
                      onClick={navigateToMap.bind(null, item)}>
                      <Typography sx={styles?.parameterText}> + Add Parameters</Typography>
                    </Box>
                  </TableCell>
                )}
                <TableCell style={styles?.cellWidth}>
                  {item?.region && item?.state && item?.city && item?.oem && (
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      className="filtericonBox margin-left"
                      disabled={
                        user.role === "subadmin" ? !subAdminPermission?.updatePermission : false
                      }
                      // style={{ marginLeft: "24px" }}
                      onClick={item?.questions > 0 && handleEdit.bind(null, item)}>
                      <EditIcon color={checkPermission() ? "" : "primary"} />
                      {/* <img src={Edit} /> */}
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            </>
          )
        })}
      </>
    )
  }
  const showUsedFilter = (value) => {
    setIsFiterUsed(value)
  }
  return (
    <>
      <CommonHeader
        heading="Form Mapping"
        badgeData={mappedListing?.length}
        setQuery={setQuery}
        searchQuery={searchQuery}
        searchEnabled
        filterEnabled
        handleDrawer={handleDrawer}
        isFilterUsed={isFilterUsed}
        isMobile={isMobile}
      />
      {loading && <AppLoader />}
      {mappedListing?.length === 0 ? (
        <EmptyState hideCreate />
      ) : (
        <Paper style={styles?.tableContainer}>
          <Box>
            <TableContainer sx={styles?.smallMarginTop}>
              <Table>
                <FeedbackTableHeader sort={sorts} handleSort={handleSort} />
                <TableBody>{getRows(mappedListing)}</TableBody>
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
    </>
  )
}

export default MappedForms
