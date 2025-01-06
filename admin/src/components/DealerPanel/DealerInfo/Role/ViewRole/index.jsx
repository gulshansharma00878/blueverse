import React, { useEffect, useState } from "react"
import { Box, Divider } from "@mui/material"
import ViewRoleForm from "components/Roles/ViewRoleForm"
import { useLocation, useParams } from "react-router-dom"
import { RoleService } from "network/roleService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeleteRole from "assets/images/placeholders/role_delete.webp"
import { useDispatch } from "react-redux"
import { coreAppActions, dealerActions } from "redux/store"
import Toast from "components/utilities-components/Toast/Toast"
import BackHeader from "components/utilities-components/BackHeader"
import { getPermissionJson } from "helpers/Functions/roleFunction"

function ViewDealerRole() {
  const location = useLocation()
  const params = useParams()
  const user = userDetail()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loader, setLoader] = useState(false)
  const [subRoleDetail, setSubRoleDetail] = useState()
  const [subAdminPermission, setSubadminPermission] = useState()

  const { dealerId } = location.state

  useEffect(() => {
    getSubRoleById()
  }, [])

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

  const handleBtnOneClick = () => {
    dispatch(coreAppActions.updatePopupModal(true))
  }
  const handleBtnTwoClick = () => {
    if (dealerId == "") {
      navigate(`/${user.role}/roles/edit-role/${params?.subRoleId}`)
    } else {
      navigate(`/${user?.role}/edit-dealer-role/${params?.subRoleId}`, {
        state: { dealerId: dealerId }
      })
    }
  }

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }

  const handleDeleteRole = async () => {
    let param = [params?.subRoleId]
    let deleteRole = await RoleService.deleteSubRole(param)
    if (deleteRole.code === 200 && deleteRole.success) {
      navigate(`/${user.role}/dealer-detail/${dealerId}`)
      Toast.showInfoToast(`${deleteRole?.message}`)
    } else {
      Toast.showErrorToast(`${deleteRole?.message}`)
    }
    handleClose()
  }

  const getSubRoleById = async () => {
    setLoader(true)
    let param = [params?.subRoleId]
    let subRoleResponse = await RoleService.getSubRoleById(param)
    if (subRoleResponse.code === 200 && subRoleResponse.success) {
      setLoader(false)
      setSubRoleDetail(subRoleResponse?.data?.subRole)
    } else {
      setSubRoleDetail()
      setLoader(false)
    }
  }

  const handleBackNavigate = () => {
    dispatch(dealerActions.setDealerTabActive(2))
    navigate(-1)
  }

  return (
    <>
      <Box>
        <BackHeader
          title={"Role Details"}
          backBtnHandler={handleBackNavigate}
          endTwoButton={true}
          buttonOneText={"Delete"}
          buttonTwoText={"Edit"}
          handleBtnOneClick={handleBtnOneClick}
          handleBtnTwoClick={handleBtnTwoClick}
          btnOneDissable={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
          btnTwoDissable={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
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

export default ViewDealerRole
