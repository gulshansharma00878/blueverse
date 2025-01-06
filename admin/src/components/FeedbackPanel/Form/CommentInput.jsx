import React from "react"
// import InputField from "components/utilities-components/InputField/InputField"
import { Box, Typography } from "@mui/material"
import { useStyles } from "../feedbackStyles"
import { preventNonNumericalInput } from "helpers/Functions/preventNumericalInput"
import InputField from "components/utilities-components/InputField/InputField"
import ErrorText from "components/utilities-components/InputField/ErrorText"
const CommentInput = (props) => {
  const { item, parentIndex, handleCommentValue, isViewOnly } = props
  // returns comment Input
  const styles = useStyles()
  return (
    <Box sx={[styles?.display, styles?.align]}>
      <Typography sx={[styles?.maxChar, styles?.textColor]}>Max Count:</Typography>

      <InputField
        value={item?.comment?.maxChar}
        onChange={({ target: { value } }) => handleCommentValue(parentIndex, value, "maxChar")}
        style={styles?.commentInput}
        inputProps={{ maxLength: 5 }}
        InputProps={{
          style: { fontSize: "1.6rem" },
          disableUnderline: true
        }}
        onKeyPress={(e) => preventNonNumericalInput(e)}
        error={item?.charError}
        helperText={<ErrorText text={item?.charErrorText} />}
        disabled={isViewOnly}
      />
      <Typography sx={[styles?.maxChar, styles?.textColor]}>&nbsp;Character</Typography>
    </Box>
  )
}

export default CommentInput
