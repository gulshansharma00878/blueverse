import React, { useEffect, useState } from "react"
import { Box, Checkbox, Grid, Paper, Typography, useMediaQuery, useTheme } from "@mui/material"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import Filter from "components/WashPanel/WashDashboard/Filter"
// import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined"
import { useStyles } from "./feedBackStyles"
import { createData, sortData } from "./feedBackUtility"
import { coreAppActions, washActions } from "redux/store"
import { useDispatch } from "react-redux"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import FilterDrawer from "components/FeedbackPanel/FeedbackListing/Drawer"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import PopupModal from "components/PopupModal"
import RemoveForm from "assets/images/placeholders/remove_form.webp"
import { FeedBackService } from "network/feedbackService"
import PopUpChild from "components/utilities-components/PopUpChild"
import { sortAbandonedListing } from "./feedBackUtility"
import EmptyState from "components/FeedbackPanel/FeedbackListing/EmptyState"
import DetailsForm from "components/WashPanel/CustomerDetailsForm/DetailsForm"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import CommonFooter from "components/utilities-components/CommonFooter"

const AbandonedFeedbacks = () => {
  const user = userDetail()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [selectedCells, setSelectedCells] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDrawer, setOpenDrawer] = useState(false)
  const [abandonedList, setAbandonedList] = useState(null)
  const [popUp, setPopUp] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [fetcher, setFetcher] = useState(0)
  const [filterOptions, setFilterOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()

  const styles = useStyles()
  const dispatch = useDispatch()
  useEffect(() => {
    getWashTypes()
    getAllpermission()
  }, [])
  useEffect(() => {
    getAbandonedListing()
  }, [itemsPerPage, currentPage, searchQuery, fetcher])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "abandoned feedbacks")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const getChecked = () => {
    const listWithMobileNumbers = abandonedList && abandonedList.filter((item) => item?.mobile)
    const filteredArray =
      listWithMobileNumbers && listWithMobileNumbers.filter((item) => item?.status === "Abandoned")
    return (
      filteredArray && selectedCells?.size !== 0 && selectedCells?.size === filteredArray.length
    )
  }
  const setQuery = (val) => {
    setSearchQuery(val)
  }
  const handleDrawer = () => {
    setOpenDrawer((prev) => !prev)
  }
  const columns = [
    {
      id: "checkbox",
      label: (
        <Box>
          <Checkbox checked={getChecked()} onChange={() => selectAll()} />
        </Box>
      ),
      minWidth: 200
    },
    {
      id: "sku",
      label: "SKU Number",
      minWidth: 200
    },
    {
      id: "type",
      label: "Wash Type",
      minWidth: 200
    },
    {
      id: "status",
      label: "Status",
      minWidth: 200
    },
    {
      id: "washTime",
      label: "Wash Time",
      minWidth: 200
    },
    {
      id: "hsrp",
      label: "Hsrp",
      minWidth: 200
    },
    {
      id: "name",
      label: "Owner Name",
      minWidth: 200
    },

    {
      id: "mobile",
      label: "Mobile",
      minWidth: 200
    },
    {
      id: "action",
      label: "Action",
      minWidth: 100,
      align: "left"
    }
  ]
  const getAbandonedListing = async () => {
    setLoading(true)
    const washTypeString = selectedOptions.join(",")
    const params = [
      `?offset=${currentPage}&limit=${itemsPerPage}&skuNumber=${searchQuery}&washTypeIds=${washTypeString}`
    ]
    const response = await FeedBackService.getAbandonedList(params)
    if (response?.success && response?.code === 200) {
      const sortedListing = sortAbandonedListing(response?.data?.feedbackList)
      setAbandonedList(sortedListing)
      setTotalRecord(response?.data?.pagination?.totalItems)
      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const getWashTypes = async () => {
    setLoading(true)
    let param = {
      isAbandoned: true
    }
    const response = await FeedBackService.getWashTypes(param)
    if (response?.success && response?.code === 200) {
      const labelKey = `Name`
      const key = `Guid`
      const sortResponse = sortData(labelKey, key, response?.data?.records)
      setFilterOptions(sortResponse)
      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const sendWhatsAppNotification = async () => {
    setLoading(true)
    const payLoad = {
      skuNumbers: Array.from(selectedCells)
    }
    const response = await FeedBackService.sendWhatsAppNotification(payLoad)
    if (response?.success && response?.code === 200) {
      setFetcher((prev) => prev + 1)
      Toast?.showInfoToast(response?.message)
      setLoading(false)
      setSelectedCells(new Set())
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
    setTotalRecord(0) // TODO: Remove this
  }
  const selectCells = (id) => {
    const idSet = new Set(selectedCells)
    if (idSet.has(id)) {
      idSet.delete(id)
    } else {
      idSet.add(id)
    }
    setSelectedCells(idSet)
  }
  const selectAll = () => {
    let idSet = new Set(selectedCells)
    const listWithMobileNumbers = abandonedList && abandonedList.filter((item) => item?.mobile)
    const filteredArray =
      listWithMobileNumbers && listWithMobileNumbers.filter((item) => item?.status === "Abandoned")
    if (idSet.size === filteredArray?.length) {
      idSet = new Set()
    } else {
      const listWithMobileNumbers = abandonedList && abandonedList.filter((item) => item?.mobile)
      const filteredArray =
        listWithMobileNumbers &&
        listWithMobileNumbers.filter((item) => item?.status === "Abandoned")
      let idsMap = filteredArray.map((item) => item?.sku)
      idSet = new Set(idsMap)
    }
    setSelectedCells(idSet)
  }

  const showTextColor = (key) => {
    return key === "Abandoned"
      ? [styles.redText, styles.tableText]
      : [styles?.greenText, styles?.tableText]
  }
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    abandonedList &&
    abandonedList.map((list) => {
      return createData(
        <Box>
          {list?.mobile && (
            <Checkbox
              checked={selectedCells.has(list?.sku)}
              disabled={list?.status !== "Abandoned"}
              onChange={() => selectCells(list?.sku)}
            />
          )}
        </Box>,
        list?.sku,
        list?.type,
        <Typography sx={showTextColor(list?.status)}>{list?.status}</Typography>,
        list?.washTime,
        list?.hsrp,
        list?.name,
        list?.mobile,
        <Box>
          <KebabMenu
            hideActivate
            editItem={() => {
              editForm(list)
            }}
            // deleteItem={() => {
            //   deleteForm()
            // }}
            hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
            hideDelete={true}
          />
        </Box>
      )
    })

  // const deleteForm = () => {
  //   setPopUp("delete")
  //   dispatch(coreAppActions.updatePopupModal(true))
  // }
  const editForm = (list) => {
    const reduxObject = {
      name: list?.name,
      phone: list?.mobile,
      emailId: list?.emailId,
      status: list?.status,
      hsrpNumber: list?.hsrp,
      manufacturer: list?.manufacturer,
      bikeModel: list?.bike,
      transactionFeedbackId: list?.transactionFeedbackId,
      skuNumber: list?.sku
    }
    setPopUp("edit")
    dispatch(coreAppActions.updatePopupModal(true))
    dispatch(washActions?.setIsEditable(true))
    dispatch(washActions.setUserDetails(reduxObject))
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  let popupMap = {
    edit: (
      <DetailsForm
        handleClose={handleClose}
        isAbandoned
        getAbandonedListing={getAbandonedListing}
      />
    ),
    delete: (
      <PopUpChild
        heading={`Remove Form ?`}
        subHeading={`Are you sure you want to delete this form ?`}
        handleClose={handleClose}
        src={RemoveForm}
        // handleClick={handleDeleteAgent}
      />
    )
  }
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedOptions(filterOptions.map((option) => option.value))
      setFetcher((prev) => prev + 1)
    } else {
      setSelectedOptions([])
      setFetcher(0)
    }
  }

  const handleSelectOption = (event) => {
    const value = event.target.value
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value))
      setFetcher((prev) => prev + 1)
    } else {
      setSelectedOptions([...selectedOptions, value])
      setFetcher((prev) => prev + 1)
    }
  }
  return (
    <Box sx={{ maxWidth: "92vw" }}>
      {loading && <AppLoader />}
      <Grid container sx={[styles?.searchContainer]}>
        <Grid item xs={12} sx={[styles?.display, styles?.alignCenter]}>
          <CommonHeader
            heading="Abandoned Feedbacks"
            badgeData={totalRecord}
            setQuery={setQuery}
            searchQuery={searchQuery}
            searchEnabled
            handleDrawer={handleDrawer}
          />
          <Filter
            filterOptions={filterOptions}
            handleSelectAll={handleSelectAll}
            handleSelectOption={handleSelectOption}
            selectedOptions={selectedOptions}
            abandoned={true}
          />
        </Grid>
      </Grid>
      <Grid container sx={[styles?.display, styles?.alignCenter, styles?.smallMarginTop]}>
        <Grid item xs={6}>
          <Typography sx={styles?.count}>{`${totalRecord ? totalRecord : 0} Results`}</Typography>
        </Grid>
        <Grid item xs={6} sx={[styles?.display, styles?.alignCenter, styles.justifyEnd]}>
          {!isMobile && selectedCells?.size > 0 && (
            <PrimaryButton sx={styles?.whatsAppButton} onClick={sendWhatsAppNotification}>
              <WhatsAppIcon />
              &nbsp;&nbsp;&nbsp;&nbsp; Send to WhatsApp
            </PrimaryButton>
          )}
        </Grid>
      </Grid>
      <Paper sx={{ mt: "20px", maxWidth: "92vw", marginBottom: "32px" }}>
        {abandonedList ? (
          <ListingTable columns={columns} tableData={creatRow} rowNavigate={false} />
        ) : (
          <EmptyState hideCreate />
        )}
      </Paper>
      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalRecord / itemsPerPage)}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalRecord={totalRecord}
        title={"Feedbacks"}
      />
      <Grid item xs={12} sx={[styles?.display, styles?.alignCenter, styles.justifyCenter]}>
        {isMobile && selectedCells?.size > 0 && (
          <CommonFooter>
            <PrimaryButton sx={styles?.mobilewhatsAppButton} onClick={sendWhatsAppNotification}>
              <WhatsAppIcon />
              &nbsp;&nbsp;&nbsp;&nbsp; Send to WhatsApp
            </PrimaryButton>{" "}
          </CommonFooter>
        )}
      </Grid>
      {openDrawer && <FilterDrawer open={openDrawer} handleDrawer={handleDrawer} />}
      <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
    </Box>
  )
}
export default AbandonedFeedbacks
