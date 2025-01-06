import React, { useRef } from "react"
import { Box, Divider, useMediaQuery, useTheme } from "@mui/material"
import CreateRoleForm from "components/Roles/CreateRoleForm"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { dealerActions } from "redux/store"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"

function CreateRole({ roleType = "ADMIN", dealerId = "" }) {
  const formikRef = useRef(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleBackNavigate = () => {
    dispatch(dealerActions.setDealerTabActive(2))
    navigate(-1)
  }

  const handleClick = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit()
    }
  }

  return (
    <Box sx={{ marginBottom: "25rem" }}>
      <CommonHeader
        heading="Create Role"
        backBtnHandler={handleBackNavigate}
        backBtn={true}
        btnTxt="Create"
        noPlusBtn={true}
        isMobile={isMobile}
        handleClick={handleClick}
        buttonStyle={{ width: isMobile ? "100%" : "22.2rem" }}
      />
      <Divider sx={{ backgroundColor: "background.blue1" }} />
      <CreateRoleForm roleType={roleType} ref={formikRef} dealerId={dealerId} />
    </Box>
  )
}

export default CreateRole
