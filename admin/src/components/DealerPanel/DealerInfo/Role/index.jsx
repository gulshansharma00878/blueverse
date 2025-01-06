import { Grid, Typography } from "@mui/material"
import Toast from "components/utilities-components/Toast/Toast"
import { DealerService } from "network/dealerService"
import React, { useEffect, useState } from "react"
import { useStyles } from "./RoleListStyles"
import moment from "moment"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import ListingTable from "components/utilities-components/ListingTable"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import PaginationComponent from "components/utilities-components/Pagination"
import { coreAppActions } from "redux/store"
import { useDispatch } from "react-redux"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeactivatePopUp from "assets/images/placeholders/DeactivatePopUp.webp"
import DeleteRole from "assets/images/placeholders/deleteDealer.webp"
import PopupModal from "components/PopupModal"
import SearchBar from "components/utilities-components/Search"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"

function createData(srno, roles, count, description, status, lastupdate, action, subRoleId) {
  return {
    srno,
    roles,
    count,
    description,
    status,
    lastupdate,
    action,
    subRoleId
  }
}

const columns = [
  {
    id: "srno",
    label: "Sr No"
  },
  {
    id: "roles",
    label: "Roles"
  },
  {
    id: "count",
    label: "Count"
  },
  {
    id: "description",
    label: "Description"
  },
  {
    id: "status",
    label: "Status"
  },

  {
    id: "lastupdate",
    label: "Last Update"
  },
  {
    id: "action",
    label: "Action"
  }
]

const RoleList = ({ dealerId, disableDelete, isDisableDelete }) => {
  const dispatch = useDispatch()
  const user = userDetail()
  const styles = useStyles()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [listData, setListData] = useState()
  const [totalRecord, setTotalRecord] = useState(0)
  const [loader, setLoader] = useState(false)
  const [popUp, setPopUp] = useState(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [item, setItem] = useState()
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getRoleList()
  }, [searchQuery, itemsPerPage, currentPage])

  useEffect(() => {
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "dealer")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const showTextColor = (key) => {
    switch (key) {
      case true:
        return styles.active
      case false:
        return styles.inactive
      default:
        break
    }
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

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleDeactivate = async () => {
    setLoader(true)
    let userID = [item?.subRoleId]
    if (item?.userCount == 0) {
      const payload = {
        isActive: !item?.isActive,
        name: item?.name,
        permissions: [],
        description: item?.description
      }
      const response = await DealerService.deactivateRole(payload, userID)

      if (response.success && response.code === 200) {
        Toast.showInfoToast(response?.message)
        dispatch(coreAppActions.updatePopupModal(false))
        getRoleList()
      } else {
        Toast.showErrorToast(response?.message)
      }
    } else {
      Toast.showErrorToast(`This role is associated with ${item?.userCount} Employee`)
    }
    setLoader(false)
  }

  const handleDeleteRole = async () => {
    setLoader(true)
    let userID = [item?.subRoleId]
    if (item?.userCount == 0) {
      const response = await DealerService.deleteRole(userID)

      if (response.success && response.code === 200) {
        Toast.showInfoToast(response?.message)
        dispatch(coreAppActions.updatePopupModal(false))
        getRoleList()
      } else {
        Toast.showErrorToast(response?.message)
      }
    } else {
      Toast.showErrorToast(`This role is associated with ${item?.userCount} Employee`)
    }

    setLoader(false)
  }

  const editRole = (item) => {
    navigate(`/${user?.role}/edit-dealer-role/${item?.subRoleId}`, {
      state: { dealerId: dealerId }
    })
  }

  const deleteRole = (item) => {
    disableDelete(true)
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  const deactivateRole = (item) => {
    disableDelete(true)
    setPopUp("deactivate")
    dispatch(coreAppActions.updatePopupModal(true))
    setItem(item)
  }

  const handleNavigate = (row) => {
    navigate(`/${user?.role}/view-role/${row?.subRoleId}`, {
      state: { dealerId: dealerId }
    })
  }

  // get role list

  const getRoleList = async () => {
    setLoader(true)
    const params = {
      dealerId: dealerId,
      sort: "NEW",
      search: searchQuery,
      offset: currentPage,
      limit: itemsPerPage
    }

    const response = await DealerService.getRoleList(params)
    if (response.success && response.code === 200) {
      setListData(response?.data?.subRoles)
      setTotalRecord(response?.data?.pagination?.totalItems)
    } else {
      Toast.showErrorToast(response?.message)
    }
    setLoader(false)
  }

  let creatRow = listData?.map((list, i) => {
    return createData(
      i + 1,
      list?.name,
      list?.userCount || "0",
      list?.description,
      <Typography sx={showTextColor(list?.isActive)}>
        {list?.isActive ? "Active" : "Inactive"}
      </Typography>,
      moment(list?.update).format("DD/MM/YY"),
      <KebabMenu
        editItem={() => {
          editRole(list)
        }}
        deleteItem={() => {
          deleteRole(list)
        }}
        deactivateItem={() => {
          deactivateRole(list)
        }}
        list={list}
        hideActivate={false}
        hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
        hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
      />,
      list?.subRoleId
    )
  })

  let popupMap = {
    deactivate: (
      <PopUpChild
        heading={`${item?.isActive ? "Deactivate" : "Activate"} This Role ?`}
        subHeading={`Do you want to ${item?.isActive ? "Deactivate" : "Activate"} ${item?.name} ?`}
        handleClose={handleClose}
        src={DeactivatePopUp}
        handleClick={handleDeactivate}
      />
    ),
    delete: (
      <PopUpChild
        height={506}
        subHeading={`Are you sure you want to delete this Role ?`}
        heading={`Remove Role ?`}
        handleClose={handleClose}
        src={DeleteRole}
        handleClick={handleDeleteRole}
      />
    )
  }

  return (
    <Grid sx={styles.roleBox} container>
      <Grid item xs={12}>
        <CommonHeader
          buttonStyle={{ marginLeft: "20px" }}
          width="261px"
          innerTableHeader={true}
          heading="Roles"
          handleClick={() => navigate(`/${user.role}/create-role/${dealerId}`)}
          btnTxt={"Create Role"}
          isButtonVisible={user.role === "subadmin" ? subAdminPermission?.createPermission : true}
          noPlusBtn={false}
        />
      </Grid>
      <Grid alignItems="center" justifyContent="space-between" container sx={styles.searchBox}>
        <Grid item>
          <Typography variant="p2" sx={styles.records}>
            {totalRecord} Records
          </Typography>
        </Grid>
        <Grid item>
          <SearchBar setQuery={setQuery} searchQuery={searchQuery} />
        </Grid>
      </Grid>
      <Grid sx={styles.tableBox} xs={12} item>
        <ListingTable tableData={creatRow} columns={columns} navigate={handleNavigate} />
        <Grid sx={styles.topMargin}>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil(totalRecord / itemsPerPage)}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalRecord={totalRecord}
            title={"Records"}
          />
        </Grid>
        {isDisableDelete && <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>}
      </Grid>
      {loader && <AppLoader />}
    </Grid>
  )
}

export default RoleList
