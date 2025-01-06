import React from "react"
import { Box, Typography } from "@mui/material"
import NoFeedBacks from "assets/images/placeholders/feedbackEmptyState.webp"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { feedBackActions } from "redux/store"
import { userDetail } from "hooks/state"

const EmptyState = ({ hideCreate }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = userDetail()

  const createForm = () => {
    navigate(`/${user.role}/feedback/create-feedback`)
    dispatch(feedBackActions.setIsEdit(false))
  }
  return (
    <Box>
      <Box
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "40px 0"
        }}>
        <img src={NoFeedBacks} alt="" />
        <Typography
          style={{ fontWeight: 500, fontSize: "18px", color: "#181A1E", padding: "16px 0" }}>
          {!hideCreate ? "Build your first feedback form for your customers" : "No Records Found"}
        </Typography>
        {!hideCreate && (
          <PrimaryButton style={{ height: "6.4rem", width: "24.9rem" }} onClick={createForm}>
            Create feedback form
          </PrimaryButton>
        )}
      </Box>
    </Box>
  )
}

export default EmptyState
