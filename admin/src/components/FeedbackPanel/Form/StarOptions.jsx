import React from "react"
import { IconButton, Typography } from "@mui/material"

import InputField from "components/utilities-components/InputField/InputField"
import { useStyles } from "../feedbackStyles"
import ErrorText from "components/utilities-components/InputField/ErrorText"
const StarOptions = (props) => {
  const { item, handleStarOption, parentIndex, isViewOnly } = props
  // returns MCQ Input  and options
  const styles = useStyles()
  return (
    <>
      {item?.star_options?.map((option, mcqIndex) => {
        return (
          <div key={mcqIndex} style={styles?.mcqWrapper}>
            <div key={mcqIndex} style={styles?.mcqDel}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                className="filtericonBox"
                sx={[styles?.marginRight8, styles?.button]}>
                <Typography sx={{ fontSize: "1.6rem" }}>{option?.id}</Typography>
              </IconButton>{" "}
              <InputField
                value={option?.value}
                onChange={({ target: { value } }) => handleStarOption(mcqIndex, parentIndex, value)}
                placeholder={`Option${mcqIndex + 1}`}
                inputProps={{ maxLength: 50, style: { fontSize: "1.6rem" } }}
                disabled={isViewOnly}
                error={option?.error}
                helperText={<ErrorText text={option?.errorText} />}
              />
            </div>
          </div>
        )
      })}
    </>
  )
}
export default StarOptions
