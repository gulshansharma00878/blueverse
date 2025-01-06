import React, { useRef, useEffect, useState } from "react"
import { Box, Divider, useMediaQuery, useTheme } from "@mui/material"
import EditRoleForm from "components/Roles/EditRoleForm"
import { useParams } from "react-router-dom"
import { RoleService } from "network/roleService"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useNavigate } from "react-router-dom"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { dealerActions } from "redux/store"
import { useDispatch } from "react-redux"

function EditRole({ dealerId = "" }) {
  const formikRef = useRef(null)
  const params = useParams()
  const dispatch = useDispatch()
  const user = userDetail()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [subRoleDetail, setSubRoleDetail] = useState()
  const [loader, setLoader] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()

  useEffect(() => {
    getAllpermission()
    getSubRoleById()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "roles & permission")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
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

  const handleBtnOneClick = () => {
    if (dealerId != "") {
      navigate(`/${user.role}/dealer-detail/${dealerId}`)
    } else {
      navigate(`/${user.role}/roles/`)
    }
  }
  const handleBtnTwoClick = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit()
    }
  }

  const handleBackNavigate = () => {
    dispatch(dealerActions.setDealerTabActive(2))
    navigate(-1)
  }
  return (
    <Box sx={{ marginBottom: "25rem" }}>
      <CommonHeader
        heading="Role Details"
        backBtn
        backBtnHandler={handleBackNavigate}
        headerStyle={{ paddingLeft: 0 }}
        isMobile={isMobile}
        twoBtn={[
          {
            heading: "Cancel",
            btnDissable: false,
            handleClick: handleBtnOneClick
          },
          {
            heading: "Update",
            btnDissable: user.role === "subadmin" ? !subAdminPermission?.updatePermission : false,
            handleClick: handleBtnTwoClick
          }
        ]}
      />
      <Divider />
      {loader ? <AppLoader /> : <EditRoleForm subRoleDetail={subRoleDetail} ref={formikRef} />}
    </Box>
  )
}

export default EditRole
