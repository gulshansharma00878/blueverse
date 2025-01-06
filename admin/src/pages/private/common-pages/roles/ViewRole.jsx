import React, { useEffect, useState } from "react"
import { Box, Divider, useMediaQuery, useTheme } from "@mui/material"
import ViewRoleForm from "components/Roles/ViewRoleForm"
import { useParams } from "react-router-dom"
import { RoleService } from "network/roleService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeleteRole from "assets/images/placeholders/role_delete.webp"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import Toast from "components/utilities-components/Toast/Toast"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"

function ViewRole() {
  const params = useParams()
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [loader, setLoader] = useState(false)
  const [subRoleDetail, setSubRoleDetail] = useState()
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getSubRoleById()
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "roles & permission")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleBtnOneClick = () => {
    dispatch(coreAppActions.updatePopupModal(true))
  }
  const handleBtnTwoClick = () => {
    navigate(`/${user.role}/roles/edit-role/${params?.subRoleId}`)
  }

  const getSubRoleById = async () => {
    setLoader(true)
    let param = [params?.subRoleId]
    let subRoleResponse = await RoleService.getSubRoleById(param)
    if (subRoleResponse.code === 200 && subRoleResponse.success) {
      setSubRoleDetail(subRoleResponse?.data?.subRole)
      setLoader(false)
    } else {
      setLoader(false)
      setSubRoleDetail()
    }
  }

  const handleDeleteRole = async () => {
    let param = [params?.subRoleId]
    let deleteRole = await RoleService.deleteSubRole(param)
    if (deleteRole.code === 200 && deleteRole.success) {
      navigate(`/${user.role}/roles`)
      Toast.showInfoToast(`${deleteRole?.message}`)
    } else {
      Toast.showErrorToast(`${deleteRole?.message}`)
    }
    handleClose()
  }

  return (
    <>
      <Box sx={{ marginBottom: "25rem" }}>
        <CommonHeader
          heading="Role Details"
          backBtn
          headerStyle={{ paddingLeft: 0 }}
          isMobile={isMobile}
          twoBtn={[
            {
              heading: "Delete",
              btnDissable: user.role === "subadmin" ? !subAdminPermission?.deletePermission : false,
              handleClick: handleBtnOneClick
            },
            {
              heading: "Edit",
              btnDissable: user.role === "subadmin" ? !subAdminPermission?.updatePermission : false,
              handleClick: handleBtnTwoClick
            }
          ]}
        />
        <Divider />
        {loader ? <AppLoader /> : <ViewRoleForm subRoleDetail={subRoleDetail} />}
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
  )
}

export default ViewRole
