import React from "react"
import { Box, Button, Typography } from "@mui/material"
import BackButtonIcon from "assets/images/icons/backButtonIcon.svg"
import IconWrapper from "../IconWrapper"
import "./BackHeader.scss"
import { useNavigate } from "react-router-dom"
function BackHeader({
  title,
  endButton = false,
  endTwoButton = false,
  endButtonText,
  handleClick,
  buttonOneText,
  buttonTwoText,
  handleBtnOneClick,
  handleBtnTwoClick,
  btnOneDissable = false,
  btnTwoDissable = false
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }
  return (
    <Box className="header_container">
      <Box className="back_header_box">
        {/* <IconButton
          color="inherit"
          aria-label="back icon"
          onClick={handleBack}
          className="backIconBox">
          <ArrowBackIcon color="primary" fontSize="large" />
        </IconButton> */}
        <IconWrapper
          imgSrc={BackButtonIcon}
          clickHandler={handleBack}
          wrapperStyle={{ marginRight: "2.4rem" }}
        />
        <Box className="header_box">
          <Typography variant="h6">{title}</Typography>
        </Box>
      </Box>
      <Box className="header_btn_box">
        {endButton && (
          <Button
            variant="contained"
            type="submit"
            className="header_btn_text"
            onClick={handleClick}>
            {endButtonText}
          </Button>
        )}
        {endTwoButton ? (
          <>
            <Button
              variant="outlined"
              className="header_btn_text"
              disabled={btnOneDissable}
              onClick={handleBtnOneClick}>
              {buttonOneText}
            </Button>
            <Button
              variant="contained"
              className="header_btn_text"
              disabled={btnTwoDissable}
              onClick={handleBtnTwoClick}>
              {buttonTwoText}
            </Button>
          </>
        ) : null}
      </Box>
    </Box>
  )
}

export default BackHeader
