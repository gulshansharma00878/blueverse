/*eslint-disable no-unused-vars */
/*eslint-disable no-console */
import React, { useEffect, useState } from "react"
import { useTheme } from "@emotion/react"
import { Box, Grid, Paper, Typography, useMediaQuery } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import EmptyState from "components/utilities-components/EmptyState"
import SearchBar from "components/utilities-components/Search"
import Company from "assets/images/Agent/company.webp"
import ListingTable from "components/utilities-components/ListingTable"
import PaginationComponent from "components/utilities-components/Pagination"
import { useStyles } from "pages/private/admin/ManageSubAdmin/subAdminStyles"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { OEMManagerService } from "network/services/oemManagerService"
import Toast from "components/utilities-components/Toast/Toast"
import { createOemManagerData, sortOEMManagerData } from "./oemManagerUtility"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import { useDispatch } from "react-redux"
import { coreAppActions, oemMnagerActions } from "redux/store"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeactivatePopUp from "assets/images/placeholders/DeactivatePopUp.webp"
import DeleteSubAdmin from "assets/images/placeholders/deleteDealer.webp"
import PopupModal from "components/PopupModal"
import { getPermissionJson } from "helpers/Functions/roleFunction"

const OemManager = () => {
  const theme = useTheme()
  const styles = useStyles()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const [totalLength, setTotalLength] = useState(0)
  const [isEmpty, setIsEmpty] = useState(false)
  const [oemManagers, setOemManagers] = useState(null)
  const [loading, setLoading] = useState(false)
  const [popUp, setPopUp] = useState(null)
  const [oemManager, setOEMManager] = useState(null)
  const [refetch, setRefetch] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getOEMManagerList()
  }, [currentPage, searchQuery, itemsPerPage, refetch])

  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "oem manager")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const navigateToCreate = () => {
    navigate(`/${user?.role}/oem-manager/create-oem-manager`)
  }
  const setQuery = (val) => {
    setSearchQuery(val)
  }
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const columns = [
    { id: "id", label: "OEM Manager ID", minWidth: 120 },
    {
      id: "name",
      label: "Name"
    },
    {
      id: "mail",
      label: "Email"
    },
    {
      id: "number",
      label: "Phone Number"
    },

    {
      id: "region",
      label: "Region"
    },
    {
      id: "state",
      label: "State",
      minWidth: 120
    },
    {
      id: "city",
      label: "City"
    },
    {
      id: "oem",
      label: "OEM"
    },
    {
      id: "dealerShip",
      label: "Dealership"
    },
    {
      id: "status",
      label: "Status"
    },
    { id: "action", label: "Action" }
  ]
  const getOEMManagerList = async () => {
    setLoading(true)
    const params = [`?offset=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`]
    const response = await OEMManagerService.getOemManager(params)
    if (response?.success && response?.code === 200) {
      const requiredtableData = sortOEMManagerData(response?.data?.records)
      requiredtableData?.length === 0 ? setIsEmpty(true) : setIsEmpty(false)
      setOemManagers(requiredtableData)
      setTotalRecord(response?.data?.pagination?.totalItems)
      if (response?.data?.pagination?.totalItems != 0) {
        // length of the list
        setTotalLength(response?.data?.pagination?.totalItems)
      } else {
        if (response?.data?.pagination?.totalItems == 0 && searchQuery != "") {
          // when we are searching in list
          setTotalLength(1)
        } else {
          // when we are not searching
          setTotalLength(0)
        }
      }
      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const handleDeleteOEMManager = async () => {
    const response = await OEMManagerService.deleteOEMManager(oemManager?.oemManagerId)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      setLoading(false)
      setRefetch((prev) => !prev)
      handleClose()
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const deactivateOEMManager = async () => {
    const updatePayLoad = {
      isActive: oemManager?.isActive ? false : true
    }
    const subAdminID = oemManager?.oemManagerId
    const response = await OEMManagerService.updateOEMManager(updatePayLoad, subAdminID)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      handleClose()
      setRefetch((prev) => !prev)
    } else {
      Toast.showErrorToast(response?.message)
    }
  }
  const handleActivatePopUp = (item) => {
    setPopUp("deactivate")
    dispatch(coreAppActions.updatePopupModal(true))
    setOEMManager(item)
  }
  const handleEdit = (list) => {
    dispatch(oemMnagerActions.setEditOemManager(true))
    navigate(`/${user?.role}/oem-manager/edit-oem-manager/${list?.oemManagerId}`)
  }
  const createRow =
    oemManagers &&
    oemManagers?.map((list) => {
      return createOemManagerData(
        list?.id,
        list?.name,
        list?.mail,
        list?.contact,
        list?.region,
        list?.state,
        list?.city,
        list?.oem,
        list?.dealers,
        list?.isActive ? (
          <Typography sx={[styles.status, styles.activeStatus]}>Active</Typography>
        ) : (
          <Typography sx={[styles.status, styles.inActiveStatus]}>InActive</Typography>
        ),
        <KebabMenu
          deactivateItem={() => {
            handleActivatePopUp(list)
          }}
          editItem={() => {
            handleEdit(list)
          }}
          deleteItem={() => {
            handleDeletePopup(list)
          }}
          list={list}
          hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
          // hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
        />
      )
    })
  const handleDeletePopup = (item) => {
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
    setOEMManager(item)
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  let popupMap = {
    deactivate: (
      <PopUpChild
        heading={`${oemManager?.isActive ? "Deactivate" : "Activate"} This OEM Manager ?`}
        subHeading={`Do you want to ${oemManager?.isActive ? "Deactivate" : "Activate"} ${
          oemManager?.id
        } - ${oemManager?.name} ?`}
        handleClose={handleClose}
        src={DeactivatePopUp}
        handleClick={deactivateOEMManager}
      />
    ),
    delete: (
      <PopUpChild
        height={506}
        subHeading={`Do you want to delete ${oemManager?.id}- ${oemManager?.name} ?`}
        heading={`Remove this OEM Manager?`}
        handleClose={handleClose}
        src={DeleteSubAdmin}
        handleClick={handleDeleteOEMManager}
      />
    )
  }

  return (
    <div>
      <Box>
        {loading && <AppLoader />}
        <CommonHeader
          handleClick={navigateToCreate}
          heading="OEM Manager Mangement"
          btnTxt="Create OEM Managers"
          btnType="normal"
          badgeData={totalRecord}
          isButtonVisible={
            !isEmpty
              ? user.role === "subadmin"
                ? subAdminPermission?.createPermission
                : user?.role === "admin" && true
              : false
          }
          isMobile={isMobile}
        />
        {totalLength !== 0 && (
          <Grid container my="1.6rem" alignItems="center">
            <Grid item xs={6}>
              <Typography sx={styles?.count}>
                {totalRecord ? `${totalRecord} Records` : "0 Records"}
              </Typography>
            </Grid>
            <Grid item xs={6} display="flex" justifyContent="flex-end" alignItems="center">
              <SearchBar setQuery={setQuery} searchQuery={searchQuery} />
            </Grid>
          </Grid>
        )}

        {isEmpty && totalLength === 0 ? (
          <Paper mt={2} style={styles?.tableContainer}>
            <EmptyState
              titleText={"Manage OEM Managers"}
              imgSrc={Company}
              clickHandler={navigateToCreate}
              btnLabel={"Add OEM Managers"}
            />{" "}
          </Paper>
        ) : (
          <ListingTable tableData={createRow} columns={columns} rowNavigate={false} />
        )}
        {!isEmpty && (
          <Grid container mt={2}>
            <Grid item xs={12} sx={styles?.topMargin}>
              <PaginationComponent
                onPageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={Math.ceil(totalRecord / itemsPerPage)}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPage={itemsPerPage}
                title={"OEM Managers"}
                totalRecord={totalRecord}
              />
            </Grid>
          </Grid>
        )}
        <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
      </Box>
    </div>
  )
}

export default OemManager
