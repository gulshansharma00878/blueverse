import React, { useEffect, useState } from "react"
import { Box, Grid, Paper, Typography, useMediaQuery, useTheme } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import EmptyState from "components/utilities-components/EmptyState"
import ListingTable from "components/utilities-components/ListingTable"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import PaginationComponent from "components/utilities-components/Pagination"
import SearchBar from "components/utilities-components/Search"
import { userDetail } from "hooks/state"
import Company from "assets/images/Agent/company.webp"
import { useNavigate } from "react-router-dom"
import { AreaManagerService } from "network/services/areaManagerService"
import { createAreaManagerData, sortAreaManagerData } from "./areaManagerUtilities"
import Toast from "components/utilities-components/Toast/Toast"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import { useDispatch } from "react-redux"
import { areaManagerAction, coreAppActions } from "redux/store"
import DeactivatePopUp from "assets/images/placeholders/DeactivatePopUp.webp"
import DeleteSubAdmin from "assets/images/placeholders/deleteDealer.webp"
import PopUpChild from "components/utilities-components/PopUpChild"
import PopupModal from "components/PopupModal"
import { useStyles } from "pages/private/admin/ManageSubAdmin/subAdminStyles"
import { getPermissionJson } from "helpers/Functions/roleFunction"

const AreaManager = () => {
  const user = userDetail()
  const styles = useStyles()
  const navigate = useNavigate()
  const theme = useTheme()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [totalRecord, setTotalRecord] = useState(0)
  const [isEmpty, setIsEmpty] = useState(false)
  const [totalLength, setTotalLength] = useState(0)
  const [areaManagers, setAreaManagers] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [popUp, setPopUp] = useState(null)
  const [areaManager, setAreaManager] = useState(null)
  const [reFetch, setReFecteh] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  useEffect(() => {
    getAreaManagerList()
    handleClose()
  }, [reFetch, searchQuery, currentPage, itemsPerPage])

  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "area manager")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const setQuery = (val) => {
    setSearchQuery(val)
  }
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  const navigateToCreate = () => {
    dispatch(areaManagerAction.setEditAreaManager(false))
    navigate(`/${user?.role}/area-manager/create-area-manager`)
  }
  const getAreaManagerList = async () => {
    setLoading(true)
    const params = [`?offset=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`]
    const response = await AreaManagerService.getAreaManager(params)
    if (response?.success && response?.code === 200) {
      const requiredtableData = sortAreaManagerData(response?.data?.records)
      requiredtableData?.length === 0 ? setIsEmpty(true) : setIsEmpty(false)
      setAreaManagers(requiredtableData)
      setTotalRecord(response?.data?.pagination?.totalItems)
      response?.data?.pagination?.totalItems === 0 ? setIsEmpty(true) : setIsEmpty(false)
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
  const columns = [
    { id: "id", label: "Area Manager ID", minWidth: 120 },
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
      label: "State"
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
      id: "dealers",
      label: "Dealers"
    },
    {
      id: "status",
      label: "Status"
    },
    { id: "action", label: "Action" }
  ]
  const createRow =
    areaManagers &&
    areaManagers?.map((list) => {
      return createAreaManagerData(
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
  const handleEdit = (list) => {
    dispatch(areaManagerAction.setEditAreaManager(true))
    navigate(`/${user?.role}/area-manager/edit-area-manager/${list?.areaMangerID}`)
  }
  const handleActivatePopUp = (item) => {
    setPopUp("deactivate")
    dispatch(coreAppActions.updatePopupModal(true))
    setAreaManager(item)
  }
  const handleDeletePopup = (item) => {
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
    setAreaManager(item)
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  const deactivateAreaManager = async () => {
    const payLoad = {
      isActive: areaManager?.isActive ? false : true
    }
    const response = await AreaManagerService.updateAreaManager(payLoad, areaManager?.areaMangerID)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(`${response?.message}`)
      setReFecteh((prev) => !prev)
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  const handleDeleteAreaManager = async () => {
    const response = await AreaManagerService.deleteAreaManager(areaManager?.areaMangerID)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(`${response?.message}`)
      setReFecteh((prev) => !prev)
    } else {
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  let popupMap = {
    deactivate: (
      <PopUpChild
        subHeading={`Do you want to ${areaManager?.isActive ? "Deactivate" : "Activate"} ${
          areaManager?.id
        } - ${areaManager?.name} ?`}
        heading={`${areaManager?.isActive ? "Deactivate" : "Activate"} This Area Manager ?`}
        handleClose={handleClose}
        handleClick={deactivateAreaManager}
        src={DeactivatePopUp}
      />
    ),
    delete: (
      <PopUpChild
        subHeading={`Do you want to delete ${areaManager?.id}- ${areaManager?.name} ?`}
        height={506}
        handleClose={handleClose}
        heading={`Remove this Area Manager?`}
        handleClick={handleDeleteAreaManager}
        src={DeleteSubAdmin}
      />
    )
  }

  const navigateToDetails = () => {}
  return (
    <Box>
      {loading && <AppLoader />}
      <CommonHeader
        heading="Manage Area Manager"
        handleClick={navigateToCreate}
        btnType="normal"
        btnTxt="Create Area Manager"
        buttonStyle={styles?.createBtn}
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
            <SearchBar searchQuery={searchQuery} setQuery={setQuery} />
          </Grid>
        </Grid>
      )}

      {isEmpty && totalLength === 0 ? (
        <Paper mt={2} style={styles?.tableContainer}>
          <EmptyState
            titleText={"Manage Area Managers"}
            btnLabel={"Create Manager"}
            imgSrc={Company}
            clickHandler={navigateToCreate}
          />{" "}
        </Paper>
      ) : (
        <ListingTable
          columns={columns}
          tableData={createRow}
          navigate={navigateToDetails}
          rowNavigate={false}
        />
      )}
      {!isEmpty && (
        <Grid container mt={2}>
          <Grid item xs={12} sx={styles?.topMargin}>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecord={totalRecord}
              title={"Area Managers"}
            />
          </Grid>
        </Grid>
      )}
      <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
    </Box>
  )
}

export default AreaManager
