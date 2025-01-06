import { Grid, Divider, Typography, useTheme, useMediaQuery } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useStyles } from "./subAdminStyles"
import { useDispatch } from "react-redux"
import { subAdminActions, coreAppActions } from "redux/store"
import { useNavigate, useParams } from "react-router-dom"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import DeleteSubAdmin from "assets/images/placeholders/deleteDealer.webp"
import { SubAdminService } from "network/services/subAdminService"
import Toast from "components/utilities-components/Toast/Toast"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { sortSubAdminData } from "./subAdminUtility"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"

const SubAdminDetails = () => {
  const styles = useStyles()
  const user = userDetail()
  // const subAdminDetail = useSelector((state) => state.subAdmin.subAdminDetails)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const formID = params?.subAdminId
  const [popUp, setPopUp] = useState(null)
  const [loading, setLoading] = useState(false)
  const [subAdminDetail, setSubAdminDetail] = useState()
  const [subAdminPermission, setSubadminPermission] = useState()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    getSubAdminDetails()
    getAllpermission()
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "sub admin")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const getSubAdminDetails = async () => {
    setLoading(true)
    const resp = await SubAdminService.getSubAdmin(formID)
    if (resp?.success && resp?.code === 200) {
      const requiredData = sortSubAdminData(resp?.data?.employee)
      setSubAdminDetail(requiredData)
      setLoading(false)
    } else {
      Toast.showErrorToast(resp?.message)
      setLoading(false)
    }
  }
  const handleDeleteDealer = async () => {
    setLoading(true)
    if (user?.role === "subadmin") {
      if (subAdminDetail?.id === user?.userId) {
        Toast.showErrorToast("No Permission to delete your own account")
        setLoading(false)
      } else {
        deleteSubadmin()
      }
    } else {
      deleteSubadmin()
    }
  }

  const deleteSubadmin = async () => {
    const response = await SubAdminService.deleteSubAdmin(subAdminDetail?.id)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      setLoading(false)
      handleClose()
      navigate(-1)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const navigateToEdit = () => {
    dispatch(subAdminActions.setEditSubAdmin(true))
    navigate(`/${user?.role}/edit-subAdmin/${subAdminDetail?.id}`)
  }
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  let popupMap = {
    delete: (
      <PopUpChild
        height={506}
        subHeading={`Do you want to delete ${subAdminDetail?.id}- ${subAdminDetail?.name} ?`}
        heading={`Remove this Sub-Admin?`}
        handleClose={handleClose}
        src={DeleteSubAdmin}
        handleClick={handleDeleteDealer}
      />
    )
  }
  const handleDelete = () => {
    setPopUp("delete")
    dispatch(coreAppActions.updatePopupModal(true))
  }
  return (
    <>
      {loading && <AppLoader />}
      <CommonHeader
        backBtn
        heading="Sub-Admin Details"
        // isButtonVisible
        // noPlusBtn
        isMobile={isMobile}
        twoBtn={[
          {
            heading: "Delete",
            btnDissable: user.role === "subadmin" ? !subAdminPermission?.deletePermission : false,
            handleClick: handleDelete
          },
          {
            heading: "Edit",
            btnDissable: user.role === "subadmin" ? !subAdminPermission?.updatePermission : false,
            handleClick: navigateToEdit
          }
        ]}
      />
      <Divider />
      <Grid container spacing={2} sx={styles.topMargin}>
        <Grid item xs={4} sx={styles.topMargin}>
          <Typography sx={[styles?.detailsHeadingText]}>Name</Typography>
          <Typography sx={[styles?.detailsInfoText]}>{subAdminDetail?.name}</Typography>
        </Grid>
        <Grid item xs={4} sx={styles.topMargin}>
          <Typography sx={[styles?.detailsHeadingText]}>Created At</Typography>
          <Typography sx={[styles?.detailsInfoText]}>{subAdminDetail?.createdAt}</Typography>
        </Grid>
        <Grid item xs={4} sx={styles.topMargin}>
          <Typography sx={[styles?.detailsHeadingText]}>Role Type</Typography>
          <Typography sx={[styles?.detailsInfoText]}>{subAdminDetail?.role}</Typography>
        </Grid>
        <Grid item xs={4} sx={styles.topMargin}>
          <Typography sx={[styles?.detailsHeadingText]}>Email Id</Typography>
          <Typography sx={[styles?.detailsInfoText]}>{subAdminDetail?.email}</Typography>
        </Grid>
        <Grid item xs={4} sx={styles.topMargin}>
          <Typography sx={[styles?.detailsHeadingText]}>Phone Number</Typography>
          <Typography sx={[styles?.detailsInfoText]}>
            {subAdminDetail?.contact ? subAdminDetail?.contact : "No Data"}
          </Typography>
        </Grid>
        <Grid item xs={4} sx={styles.topMargin}>
          <Typography sx={[styles?.detailsHeadingText]}>Status</Typography>
          <Typography sx={[styles?.detailsInfoText]}> {subAdminDetail?.status}</Typography>
        </Grid>
      </Grid>
      <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
    </>
  )
}

export default SubAdminDetails
