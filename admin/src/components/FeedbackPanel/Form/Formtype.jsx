import { Box, Typography } from "@mui/material"
import React from "react"
import Star from "assets/images/placeholders/star.webp"
import Comment from "assets/images/placeholders/comment.webp"
import Multi from "assets/images/placeholders/multiple.webp"
import { useStyles } from "../feedbackStyles"
const Formtype = ({ index, handleChange, isMobile }) => {
  const styles = useStyles()

  const handleSelector = (value) => {
    handleChange(index, value, "type")
  }
  const getStyles = () => {
    return !isMobile
      ? { ...styles?.normalScreenFormTypeWidth, ...styles?.formTypeContainer }
      : {
          ...styles?.display,
          ...styles?.column,
          ...styles?.justify,
          ...styles?.mobileScreenFormTypeWidth,
          ...styles?.formTypeContainer,
          ...styles?.align
        }
  }
  const selectStyles = () => {
    return !isMobile
      ? { ...styles?.formTypeSelect, ...styles?.typeSelect, ...styles?.justify }
      : { ...styles?.smallScreenSelect, ...styles?.typeSelect }
  }
  return (
    <Box style={getStyles()}>
      <Box style={selectStyles()} onClick={handleSelector.bind(null, "MULTIPLE_CHOICE")}>
        <img src={Multi} alt="" style={styles?.formTypeImage} />
        <Typography sx={styles?.formTypeText}> Multiple Choice</Typography>
      </Box>
      <Box style={selectStyles()} onClick={handleSelector.bind(null, "COMMENT")}>
        <img src={Comment} alt="" style={styles?.formTypeImage} />
        <Typography sx={styles?.formTypeText}> Comment</Typography>
      </Box>
      <Box style={selectStyles()} onClick={handleSelector.bind(null, "RATING")}>
        <div>
          <img src={Star} alt="" style={styles?.formTypeImage} />
        </div>
        <Typography sx={styles?.formTypeText}> Star Rating</Typography>
      </Box>
    </Box>
  )
}

export default Formtype
