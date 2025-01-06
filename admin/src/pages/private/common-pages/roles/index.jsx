import React, { useEffect, useState } from "react"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import ListingTable from "components/utilities-components/ListingTable"
import { useStyles } from "components/utilities-components/ListingTable/TableListStyles"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import { useNavigate } from "react-router-dom"
import PopupModal from "components/PopupModal"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeleteRole from "assets/images/placeholders/role_delete.webp"
import { RoleService } from "network/roleService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { dateMonthFormat } from "helpers/app-dates/dates"
import Toast from "components/utilities-components/Toast/Toast"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import PaginationComponent from "components/utilities-components/Pagination"

const columns = [
  {
    id: "no",
    label: "Sr No",
    minWidth: 100
  },
  {
    id: "roles",
    label: "Roles",
    minWidth: 200
  },
  {
    id: "count",
    label: "Count",
    minWidth: 100
  },
  {
    id: "description",
    label: "Description",
    minWidth: 250
  },
  {
    id: "status",
    label: "Status",
    minWidth: 200
  },
  {
    id: "lastUpdate",
    label: "Last Update",
    minWidth: 200
  },
  {
    id: "action",
    label: "Action",
    minWidth: 100
  }
]

function ManageRoles() {
  const user = userDetail()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [rolesTabelData, setRolesTableData] = useState([])
  const [roleItem, setRoleItem] = useState()
  const [updateCount, setUpdateCount] = useState(0)
  const [loader, setLoader] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalRecord, setTotalRecord] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const styles = useStyles()

  useEffect(() => {
    getSubRoleList()
    getAllpermission()
  }, [])

  useEffect(() => {
    getSubRoleList()
  }, [updateCount, itemsPerPage, currentPage])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "roles & permission")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const getSubRoleList = async () => {
    setLoader(true)
    let param = {
      offset: currentPage,
      limit: itemsPerPage
    }
    let subRoleResponse = await RoleService.listSubRole(param)
    if (subRoleResponse.code === 200 && subRoleResponse.success) {
      setRolesTableData(subRoleResponse?.data?.subRoles)
      setTotalRecord(subRoleResponse?.data?.pagination?.totalItems)
      setLoader(false)
    } else {
      setRolesTableData([])
      setLoader(false)
    }
  }
  const editRole = (list) => {
    navigate(`/${user.role}/roles/edit-role/${list?.subRoleId}`)
  }

  const deleteRole = (list) => {
    setRoleItem(list)
    dispatch(coreAppActions.updatePopupModal(true))
  }

  const handleClick = () => {
    navigate(`/${user.role}/roles/create-role`)
  }

  const handleNavigate = (id) => {
    navigate(`/${user.role}/roles/${id}`)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  let rolesData = []
  // eslint-disable-next-line no-unused-vars
  let creatRow =
    rolesTabelData &&
    rolesTabelData.length > 0 &&
    rolesTabelData.map((list, index) => {
      return rolesData.push(
        createData(
          index + 1,
          <Box sx={{ cursor: "pointer" }} onClick={() => handleNavigate(list?.subRoleId)}>
            {list?.name}
          </Box>,
          list?.userCount.toString(),
          list?.description,
          <Typography sx={list?.isActive ? styles.active : styles.inactive}>
            {list?.isActive ? "Active" : "Inactive"}
          </Typography>,
          dateMonthFormat(list?.updatedAt),
          <KebabMenu
            editItem={(list) => {
              editRole(list)
            }}
            deleteItem={(list) => {
              deleteRole(list)
            }}
            hideActivate={true}
            list={list}
            hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
            hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
          />
        )
      )
    })
  function createData(no, roles, count, description, status, lastUpdate, action) {
    return {
      no,
      roles,
      count,
      description,
      status,
      lastUpdate,
      action
    }
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleDeleteRole = async () => {
    setLoader(true)
    let param = [roleItem?.subRoleId]
    let deleteRole = await RoleService.deleteSubRole(param)
    if (deleteRole.code === 200 && deleteRole.success) {
      setLoader(false)
      setUpdateCount(updateCount + 1)
      Toast.showInfoToast(`${deleteRole?.message}`)
    } else {
      setLoader(false)
      Toast.showErrorToast(`${deleteRole?.message}`)
    }
    handleClose()
  }
  return (
    <>
      {loader ? (
        <AppLoader />
      ) : (
        <>
          <Box>
            <CommonHeader
              handleClick={handleClick}
              heading="Manage Roles"
              btnTxt="Create Role"
              btnType="normal"
              isMobile={isMobile}
              isButtonVisible={
                user.role === "subadmin" ? subAdminPermission?.createPermission : true
              }
            />
            <Box sx={{ mt: "2rem", mb: "2rem" }}>
              <ListingTable columns={columns} tableData={rolesData} />
            </Box>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecord / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecord={totalRecord}
              title={"Roles"}
            />
          </Box>
          <PopupModal handleClose={handleClose}>
            <PopUpChild
              subHeading={`Are you sure you want to delete this Role?`}
              heading={`Remove Role ?`}
              handleClose={handleClose}
              src={DeleteRole}
              handleClick={handleDeleteRole}
            />
          </PopupModal>
        </>
      )}
    </>
  )
}

export default ManageRoles
