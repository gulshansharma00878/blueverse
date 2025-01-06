import { Popper, IconButton, MenuItem } from "@mui/material"
import React, { useState } from "react"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import "./feedbackAction.scss"
import { Box } from "@mui/system"
const FeedbackAction = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const handlePopper = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }
  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        className="filtericonBox"
        // style={{ marginLeft: "24px" }}
        onClick={handlePopper}>
        <MoreVertIcon color="primary" />
      </IconButton>
      <Popper
        id={"0"}
        open={anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "right",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "right",
          horizontal: "right"
        }}
        sx={{ top: "0.5rem" }}>
        <Box className="filter_container">
          <Box className="menu_container">
            <MenuItem className={"select_item"}>Edit</MenuItem>
            <MenuItem className={"select_item"}>Delete</MenuItem>
          </Box>
        </Box>
      </Popper>
    </>
  )
}

export default FeedbackAction
