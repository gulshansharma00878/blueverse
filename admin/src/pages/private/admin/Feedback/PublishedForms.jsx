import React, { useEffect, useState } from "react"
import { Box, Grid, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material"
import { useStyles } from "./feedBackStyles"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import EmptyState from "components/FeedbackPanel/FeedbackListing/EmptyState"
import { useNavigate } from "react-router-dom"
import { FeedBackService } from "network/feedbackService"
import { createPublishedData, sortPublishedForms } from "./feedBackUtility"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import Toast from "components/utilities-components/Toast/Toast"
import KebabMenu from "components/utilities-components/KebabMenu/KebabMenu"
import { useDispatch } from "react-redux"
import { coreAppActions, feedBackActions } from "redux/store"
import PopupModal from "components/PopupModal"
import RemoveForm from "assets/images/placeholders/remove_form.webp"
import PopUpChild from "components/utilities-components/PopUpChild"
import ListingTable from "components/utilities-components/ListingTable"
import { ArrowDownward } from "@mui/icons-material"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"

const Publishedforms = () => {
  const navigate = useNavigate()
  const user = userDetail()
  const styles = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const dispatch = useDispatch()
  const [publishedForms, setPublishedForms] = useState(null)
  const [popUp, setPopUp] = useState(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [formId, setFormId] = useState(null)
  const [refetchList, setRefetchList] = useState(null)
  const [sort, setSort] = useState("NEW")
  const [loading, setLoading] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()

  const handleSort = (changeSort) => {
    changeSort === "NEW" ? setSort("OLD") : setSort("NEW")
  }

  useEffect(() => {
    getAllpermission()
  }, [])
  //eslint-disable-next-line no-unused-vars
  const columns = [
    {
      id: "serial",
      label: "Sr no."
    },
    {
      id: "formName",
      label: "Form Name"
    },
    {
      id: "questions",
      label: "Questions"
    },
    {
      id: "createdOn",
      label: (
        <>
          {" "}
          Created On
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
  useEffect(() => {
    getPublishedForms()
  }, [refetchList, sort])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "published form")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const createForm = () => {
    navigate(`/${user?.role}/feedback/create-feedback`)
    dispatch(feedBackActions.setIsEdit(false))
    dispatch(feedBackActions.setIsViewOnly(false))
  }
  const handleEdit = (list) => {
    dispatch(feedBackActions.setIsEdit(true))
    navigate(`/${user?.role}/feedback/edit-feedback/${list?.formId}`)
    dispatch(feedBackActions.setFormDetails(list))
  }
  const handleDelete = async () => {
    setLoading(true)
    const response = await FeedBackService.deleteForm(formId)
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(coreAppActions.updatePopupModal(false))
      setRefetchList((prev) => !prev)
      setLoading(false)
    } else {
      Toast.showErrorToast(`${response?.message}`)
      setLoading(false)
    }
  }
  const deleteForm = (id) => {
    setPopUp("delete")
    setFormId(id)
    dispatch(coreAppActions.updatePopupModal(true))
  }
  const getPublishedForms = async () => {
    setLoading(true)

    const params = [`?sort=${sort}`]
    const response = await FeedBackService.getFormsList(params)
    if (response?.success && response.code === 200) {
      const sortedData = sortPublishedForms(response?.data?.feedbacks)
      sortedData?.length > 0 ? setIsEmpty(false) : setIsEmpty(true)
      setPublishedForms(sortedData)
      setLoading(false)
    } else {
      setIsEmpty(true)
      setLoading(false)
      Toast.showErrorToast(`${response?.message}`)
    }
  }
  //eslint-disable-next-line no-unused-vars
  const creatRow = publishedForms?.map((list) => {
    return createPublishedData(
      list?.serial,
      list?.formName,
      list?.questions,
      list?.createdAt,
      <KebabMenu
        hideActivate
        editItem={() => {
          handleEdit(list)
        }}
        deleteItem={() => {
          deleteForm(list?.formId)
        }}
        list={list}
        hideEdit={user.role === "subadmin" ? !subAdminPermission?.updatePermission : false}
        hideDelete={user.role === "subadmin" ? !subAdminPermission?.deletePermission : false}
      />
    )
  })
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  let popupMap = {
    delete: (
      <PopUpChild
        heading={`Remove Form ?`}
        subHeading={`Are you sure you want to delete this form ?`}
        handleClose={handleClose}
        src={RemoveForm}
        handleClick={handleDelete}
      />
    )
  }
  const navigateToDetails = (list) => {
    dispatch(feedBackActions.setIsViewOnly(true))
    navigate(`/${user?.role}/feedback/edit-feedback/${list?.action?.props?.list?.formId}`)
  }
  return (
    <Box>
      <CommonHeader
        handleClick={createForm}
        heading="Published Forms"
        btnTxt="Create feedback form"
        btnType="normal"
        badgeData={publishedForms?.length}
        buttonStyle={styles?.createBtn}
        isButtonVisible={!isEmpty}
        btnDissable={user.role === "subadmin" ? !subAdminPermission?.createPermission : false}
        isMobile={isMobile}
      />
      {!isEmpty && (
        <Grid container sx={styles?.commonMarginBottom}>
          <Grid item xs={12}>
            <Typography sx={styles?.count}>{`${publishedForms && publishedForms?.length} ${
              publishedForms?.length === 1 ? "Result" : "Results"
            }`}</Typography>
          </Grid>
        </Grid>
      )}
      {/* <Paper style={isMobile ? styles?.mobileContainer : styles?.tableContainer}> */}
      {loading && <AppLoader />}
      {!isEmpty && publishedForms ? (
        <Box marginBottom={"12rem"} paddingBottom={"5rem"}>
          <ListingTable columns={columns} tableData={creatRow} navigate={navigateToDetails} />
        </Box>
      ) : (
        <EmptyState />
      )}
      {/* </Paper> */}
      <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
    </Box>
  )
}

export default Publishedforms
