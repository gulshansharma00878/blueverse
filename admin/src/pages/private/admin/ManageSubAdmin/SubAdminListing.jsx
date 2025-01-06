import React, { useEffect, useState } from "react"
import { Box, Grid, Typography, Paper, IconButton, useTheme, useMediaQuery } from "@mui/material"
import { useStyles } from "./subAdminStyles"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import EmptyState from "components/utilities-components/EmptyState"
import Company from "assets/images/Agent/company.webp"
import ListingTable from "components/utilities-components/ListingTable"
import { ArrowDownward } from "@mui/icons-material"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { createSubAdminData, sortResponseData } from "./subAdminUtility"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import PaginationComponent from "components/utilities-components/Pagination"
import SearchBar from "components/utilities-components/Search"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import { useDispatch } from "react-redux"
import DeactivatePopUp from "assets/images/placeholders/DeactivatePopUp.webp"
import DeleteSubAdmin from "assets/images/placeholders/deleteDealer.webp"
import { useNavigate } from "react-router-dom"
import { subAdminActions, coreAppActions } from "redux/store"
import { SubAdminService } from "network/services/subAdminService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import Toast from "components/utilities-components/Toast/Toast"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"

const SubAdminListing = () => {
  const styles = useStyles()
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [subAdmins, setSubAdmins] = useState(null)
  const [isEmpty, setIsEmpty] = useState(false)
  const [sort, setSort] = useState("NEW")
  const [totalRecord, setTotalRecord] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [popUp, setPopUp] = useState(null)
  const [subAdmin, setSubAdmin] = useState()
  const [loading, setLoading] = useState(false)
  const [refetch, setRefetch] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()
  const [totalLength, setTotalLength] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  //========USEEFFECTS==========>
  useEffect(() => {
    getSubAdminList()
    getAllpermission()
    dispatch(subAdminActions.setEditSubAdmin(false))
    dispatch(coreAppActions.updatePopupModal(false))
  }, [searchQuery, currentPage, itemsPerPage, sort, refetch])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "sub admin")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  //============API'S=========>
  const getSubAdminList = async () => {
    setLoading(true)
    const params = [
      `?offset=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&sort=${sort}`
    ]
    const response = await SubAdminService.getSubAdminList(params)
    if (response?.success && response?.code === 200) {
      const requiredtableData = sortResponseData(response?.data?.employees)
      requiredtableData?.length === 0 ? setIsEmpty(true) : setIsEmpty(false)
      setSubAdmins(requiredtableData)
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
  const handleDeleteSubAdmin = async () => {
    setLoading(true)
    if (user?.role === "subadmin") {
      if (subAdmin?.id === user?.userId) {
        setLoading(false)
        handleClose()
        Toast.showErrorToast("No Permission to delete your own account")
      } else {
        deleteSubadmin()
      }
    } else {
      deleteSubadmin()
    }
  }

  const deleteSubadmin = async () => {
    const response = await SubAdminService.deleteSubAdmin(subAdmin?.id)
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
  const handleSort = (changeSort) => {
    changeSort === "NEW" ? setSort("OLD") : setSort("NEW")
  }
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }
  const deactivateSubAdmin = async () => {
    const updatePayLoad = {
      isActive: subAdmin?.isActive ? false : true
    }
    const subAdminID = subAdmin?.id
    const response = await SubAdminService.updateSubAdmin(updatePayLoad, subAdminID)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      handleClose()
      setRefetch((prev) => !prev)
    } else {
      Toast.showErrorToast(response?.message)
    }
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  const columns = [
    {
      id: "id",
      label: "ID"
    },
    {
      id: "name",
      label: "Name"
    },
    {
      id: "type",
      label: "Role Type"
    },
    {
      id: "mailId",
      label: "Email Id"
    },
    {
      id: "number",
      label: "Phone Number"
    },
    {
      id: "isActive",
      label: "Status"
    },
    {
      id: "addedOn",
      // minWidth: "18rem",
      label: (
        <>
          Added On
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            className="filtericonBox"
            sx={[styles?.marginLeft, styles?.IconButton]}
            onClick={handleSort.bind(null, sort)}>
            {sort === "NEW" ? (
              <ArrowUpwardIcon color="primary" sx={styles?.IconButton} />
            ) : (
              <ArrowDownward color="primary" sx={styles?.IconButton} />
            )}
          </IconButton>
        </>
      )
    },
    {
      id: "action",
      label: "Action"
    }
  ]
  let popupMap = {
    deactivate: (
      <PopUpChild
        heading={`${subAdmin?.isActive ? "Deactivate" : "Activate"} This Sub-Admin ?`}
        subHeading={`Do you want to ${subAdmin?.isActive ? "Deactivate" : "Activate"} ${
          subAdmin?.uniqueId
        } - ${subAdmin?.name} ?`}
        handleClose={handleClose}
        src={DeactivatePopUp}
        handleClick={deactivateSubAdmin}
      />
    ),
    delete: (
      <PopUpChild
        height={506}
        subHeading={`Do you want to delete ${subAdmin?.uniqueId}- ${subAdmin?.name} ?`}
        heading={`Remove this Sub-Admin?`}
        handleClose={handleClose}
        src={DeleteSubAdmin}
        handleClick={handleDeleteSubAdmin}
      />
    )
  }
  const createRow =
    subAdmins &&
    subAdmins?.map((list) => {
      return createSubAdminData(
        list?.uniqueId,
        list?.name,
        list?.type,
        list?.mailId,
        list?.number ? list?.number : "No Data",
        list?.isActive ? (
          <Typography sx={[styles.status, styles.activeStatus]}>Active</Typography>
        ) : (
          <Typography sx={[styles.status, styles.inActiveStatus]}>InActive</Typography>
        ),
        list?.addedOn,
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
          hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
        />
      )
    })
  const handleEdit = (list) => {
    dispatch(subAdminActions.setEditSubAdmin(true))
    navigate(`/${user?.role}/edit-subAdmin/${list?.id}`)
  }
  const handleActivatePopUp = (item) => {
    setPopUp("deactivate")
    dispatch(coreAppActions.updatePopupModal(true))
    setSubAdmin(item)
  }
  const handleDeletePopup = (item) => {
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
    setSubAdmin(item)
  }
  const setQuery = (val) => {
    setSearchQuery(val)
  }
  const navigateToCreate = () => {
    navigate(`/${user?.role}/add-subAdmin`)
    dispatch(subAdminActions.setEditSubAdmin(false))
  }
  const navigateToDetails = (row) => {
    navigate(`/${user?.role}/subAdmin-details/${row?.action?.props?.list?.id}`)
  }

  return (
    <Box>
      {loading && <AppLoader />}
      <CommonHeader
        handleClick={navigateToCreate}
        heading="Sub-Admin Management"
        btnTxt="Create SubAdmin"
        btnType="normal"
        isMobile={isMobile}
        badgeData={totalRecord}
        buttonStyle={styles?.createBtn}
        isButtonVisible={
          !isEmpty
            ? user.role === "subadmin"
              ? subAdminPermission?.createPermission
              : user?.role === "admin" && true
            : false
        }
      />
      {totalLength !== 0 && (
        <Grid container sx={[styles?.marginBottom, styles?.topMargin]} alignItems="center">
          <Grid item xs={6}>
            <Typography sx={styles?.count}>{`${
              subAdmins && subAdmins?.length
            } Results`}</Typography>
          </Grid>
          <Grid item xs={6} display="flex" justifyContent="flex-end" alignItems="center">
            <SearchBar setQuery={setQuery} searchQuery={searchQuery} />
          </Grid>
        </Grid>
      )}

      {isEmpty && totalLength === 0 ? (
        <Paper style={styles?.tableContainer}>
          <EmptyState
            titleText={"Manage Sub-Admins"}
            btnLabel={"Create SubAdmin"}
            imgSrc={Company}
            clickHandler={navigateToCreate}
          />{" "}
        </Paper>
      ) : (
        <ListingTable columns={columns} tableData={createRow} navigate={navigateToDetails} />
      )}
      {!isEmpty && (
        <Grid container>
          <Grid item xs={12} sx={styles?.topMargin}>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecord={totalRecord}
              title={"Sub Admins"}
            />
          </Grid>
        </Grid>
      )}
      <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
    </Box>
  )
}

export default SubAdminListing
